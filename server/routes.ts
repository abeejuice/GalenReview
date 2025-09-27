import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { runAutoChecks } from "../client/src/lib/autochecks/run";

// Validation schemas
const FlashcardIntakeSchema = z.object({
  subject: z.string().min(1),
  topic: z.string().min(1),
  competency_tag: z.string().optional(),
  bloom: z.string().optional(),
  difficulty: z.string().optional(),
  front_text: z.string().min(10),
  back_text: z.string().min(10),
  references: z.array(z.object({
    source: z.string(),
    page: z.string().optional(),
  })),
});

const McqIntakeSchema = z.object({
  subject: z.string().min(1),
  topic: z.string().min(1),
  competency_tag: z.string().optional(),
  bloom: z.string().optional(),
  difficulty: z.string().optional(),
  stem: z.string().min(1),
  options: z.array(z.string()).min(4),
  correct_index: z.number().min(0),
  explanation: z.object({
    summary: z.string().min(1),
    references: z.array(z.object({
      source: z.string(),
      page: z.string().optional(),
    })),
  }),
});

// Mock session for development
const mockSession = { user: { id: 'user-1', email: 'dev@example.com', role: 'REVIEWER' } };

function getSession(req: any) {
  // In production this would use proper session management
  return mockSession;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ ok: true, time: new Date().toISOString(), env: process.env.NODE_ENV });
  });

  // Auth check middleware
  const requireAuth = (req: any, res: any, next: any) => {
    const session = getSession(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = session.user;
    next();
  };

  // Flashcard intake
  app.post("/api/intake/flashcard", requireAuth, async (req, res) => {
    try {
      const data = FlashcardIntakeSchema.parse(req.body);
      
      // Create item
      const item = await storage.createItem({
        type: 'FLASHCARD',
        subject: data.subject,
        topic: data.topic,
        competencyId: data.competency_tag,
        bloom: data.bloom,
        difficulty: data.difficulty,
        status: 'NEEDS_REVIEW',
        createdById: req.user.id,
      });

      // Create flashcard
      await storage.createFlashcard({
        itemId: item.id,
        frontText: data.front_text,
        backText: data.back_text,
      });

      // Create references
      await storage.createReferences(item.id, data.references);

      // Run auto-checks
      const autoChecks = await runAutoChecks(item.id, data);
      await storage.createAutoChecks(item.id, autoChecks);

      res.json({ itemId: item.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          issues: error.issues,
        });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // MCQ intake
  app.post("/api/intake/mcq", requireAuth, async (req, res) => {
    try {
      const data = McqIntakeSchema.parse(req.body);
      
      // Create item
      const item = await storage.createItem({
        type: 'MCQ',
        subject: data.subject,
        topic: data.topic,
        competencyId: data.competency_tag,
        bloom: data.bloom,
        difficulty: data.difficulty,
        status: 'NEEDS_REVIEW',
        createdById: req.user.id,
      });

      // Create MCQ
      await storage.createMcq({
        itemId: item.id,
        stem: data.stem,
        options: data.options,
        correctIndex: data.correct_index,
        explanation: data.explanation,
      });

      // Create references
      await storage.createReferences(item.id, data.explanation.references);

      // Run auto-checks
      const autoChecks = await runAutoChecks(item.id, data);
      await storage.createAutoChecks(item.id, autoChecks);

      res.json({ itemId: item.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          issues: error.issues,
        });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get items (queue)
  app.get("/api/items", requireAuth, async (req, res) => {
    try {
      const { subject, type, status, flag, limit } = req.query;
      const items = await storage.getItems({
        subject: subject as string,
        type: type as string,
        status: status as string,
        flag: flag as string,
        limit: limit ? parseInt(limit as string) : 50,
      });

      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get single item
  app.get("/api/items/:id", requireAuth, async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update item
  app.patch("/api/items/:id", requireAuth, async (req, res) => {
    try {
      const { action, ...data } = req.body;
      const itemId = req.params.id;

      switch (action) {
        case 'request_changes':
          await storage.updateItem(itemId, {
            status: 'CHANGES_REQUESTED',
            notes: data.note,
          });
          break;

        case 'publish':
          await storage.updateItem(itemId, {
            status: 'PUBLISHED',
          });
          break;

        case 'edit':
          const { patch } = data;
          if (patch.frontText || patch.backText) {
            await storage.updateFlashcard(itemId, patch);
          }
          if (patch.stem || patch.options || patch.explanation) {
            await storage.updateMcq(itemId, patch);
          }
          if (patch.references) {
            await storage.updateReferences(itemId, patch.references);
          }
          
          // Re-run auto-checks
          const item = await storage.getItem(itemId);
          const autoChecks = await runAutoChecks(itemId, item);
          await storage.updateAutoChecks(itemId, autoChecks);
          break;

        case 'remap_competency':
          await storage.updateItem(itemId, {
            competencyId: data.competencyId,
          });
          break;

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      const updatedItem = await storage.getItem(itemId);
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Journal endpoints
  app.get("/api/journal", requireAuth, async (req, res) => {
    try {
      const notes = await storage.getJournalNotes(req.user.id);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/journal", requireAuth, async (req, res) => {
    try {
      const { text } = req.body;
      const note = await storage.createJournalNote({
        authorId: req.user.id,
        text,
      });
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Analytics
  app.get("/api/analytics", requireAuth, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
