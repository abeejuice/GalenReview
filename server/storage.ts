import { 
  users, items, flashcards, mcqs, references, autoChecks, journalNotes,
  type User, type InsertUser, type Item, type InsertItem, 
  type Flashcard, type InsertFlashcard, type MCQ, type InsertMCQ,
  type Reference, type InsertReference, type AutoChecks, 
  type JournalNote, type InsertJournalNote
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, ilike, inArray } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Items
  getItem(id: string): Promise<any | undefined>;
  getItems(filters: {
    subject?: string;
    type?: string;
    status?: string;
    flag?: string;
    limit?: number;
  }): Promise<any[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, updates: Partial<Item>): Promise<Item>;

  // Flashcards
  createFlashcard(flashcard: InsertFlashcard & { itemId: string }): Promise<Flashcard>;
  updateFlashcard(itemId: string, updates: Partial<InsertFlashcard>): Promise<Flashcard>;

  // MCQs
  createMcq(mcq: InsertMCQ & { itemId: string }): Promise<MCQ>;
  updateMcq(itemId: string, updates: Partial<InsertMCQ>): Promise<MCQ>;

  // References
  createReferences(itemId: string, refs: InsertReference[]): Promise<Reference[]>;
  updateReferences(itemId: string, refs: InsertReference[]): Promise<Reference[]>;

  // Auto Checks
  createAutoChecks(itemId: string, checks: Partial<AutoChecks>): Promise<AutoChecks>;
  updateAutoChecks(itemId: string, checks: Partial<AutoChecks>): Promise<AutoChecks>;

  // Journal
  getJournalNotes(authorId: string, limit?: number): Promise<JournalNote[]>;
  createJournalNote(note: InsertJournalNote & { authorId: string }): Promise<JournalNote>;

  // Analytics
  getAnalytics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getItem(id: string): Promise<any | undefined> {
    const result = await db
      .select()
      .from(items)
      .leftJoin(flashcards, eq(items.id, flashcards.itemId))
      .leftJoin(mcqs, eq(items.id, mcqs.itemId))
      .leftJoin(autoChecks, eq(items.id, autoChecks.itemId))
      .leftJoin(users, eq(items.createdById, users.id))
      .where(eq(items.id, id))
      .limit(1);

    if (!result.length) return undefined;

    const item = result[0];
    const refs = await db.select().from(references).where(eq(references.itemId, id));

    return {
      ...item.items,
      flashcard: item.flashcards,
      mcq: item.mcqs,
      autoChecks: item.auto_checks,
      createdBy: item.users,
      references: refs,
    };
  }

  async getItems(filters: {
    subject?: string;
    type?: string;
    status?: string;
    flag?: string;
    limit?: number;
  }): Promise<any[]> {
    let query = db
      .select({
        id: items.id,
        type: items.type,
        subject: items.subject,
        topic: items.topic,
        bloom: items.bloom,
        difficulty: items.difficulty,
        status: items.status,
        createdAt: items.createdAt,
        autoChecks: {
          possibleDuplicates: autoChecks.possibleDuplicates,
          referenceCoverage: autoChecks.referenceCoverage,
          groundednessScore: autoChecks.groundednessScore,
        }
      })
      .from(items)
      .leftJoin(autoChecks, eq(items.id, autoChecks.itemId))
      .orderBy(desc(items.createdAt))
      .limit(filters.limit || 50);

    const conditions = [];
    if (filters.subject) {
      conditions.push(ilike(items.subject, `%${filters.subject}%`));
    }
    if (filters.type) {
      conditions.push(eq(items.type, filters.type as any));
    }
    if (filters.status) {
      conditions.push(eq(items.status, filters.status as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [created] = await db.insert(items).values(item).returning();
    return created;
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    const [updated] = await db
      .update(items)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(items.id, id))
      .returning();
    return updated;
  }

  async createFlashcard(flashcard: InsertFlashcard & { itemId: string }): Promise<Flashcard> {
    const [created] = await db.insert(flashcards).values(flashcard).returning();
    return created;
  }

  async updateFlashcard(itemId: string, updates: Partial<InsertFlashcard>): Promise<Flashcard> {
    const [updated] = await db
      .update(flashcards)
      .set(updates)
      .where(eq(flashcards.itemId, itemId))
      .returning();
    return updated;
  }

  async createMcq(mcq: InsertMCQ & { itemId: string }): Promise<MCQ> {
    const [created] = await db.insert(mcqs).values(mcq).returning();
    return created;
  }

  async updateMcq(itemId: string, updates: Partial<InsertMCQ>): Promise<MCQ> {
    const [updated] = await db
      .update(mcqs)
      .set(updates)
      .where(eq(mcqs.itemId, itemId))
      .returning();
    return updated;
  }

  async createReferences(itemId: string, refs: InsertReference[]): Promise<Reference[]> {
    if (!refs.length) return [];
    const refsWithItemId = refs.map(ref => ({ ...ref, itemId }));
    return await db.insert(references).values(refsWithItemId).returning();
  }

  async updateReferences(itemId: string, refs: InsertReference[]): Promise<Reference[]> {
    // Delete existing references
    await db.delete(references).where(eq(references.itemId, itemId));
    // Create new ones
    return await this.createReferences(itemId, refs);
  }

  async createAutoChecks(itemId: string, checks: Partial<AutoChecks>): Promise<AutoChecks> {
    const [created] = await db
      .insert(autoChecks)
      .values({ ...checks, itemId })
      .returning();
    return created;
  }

  async updateAutoChecks(itemId: string, checks: Partial<AutoChecks>): Promise<AutoChecks> {
    const [updated] = await db
      .update(autoChecks)
      .set(checks)
      .where(eq(autoChecks.itemId, itemId))
      .returning();
    return updated;
  }

  async getJournalNotes(authorId: string, limit = 30): Promise<JournalNote[]> {
    return await db
      .select()
      .from(journalNotes)
      .where(eq(journalNotes.authorId, authorId))
      .orderBy(desc(journalNotes.date))
      .limit(limit);
  }

  async createJournalNote(note: InsertJournalNote & { authorId: string }): Promise<JournalNote> {
    const [created] = await db.insert(journalNotes).values(note).returning();
    return created;
  }

  async getAnalytics(): Promise<any> {
    // Get throughput data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [throughputSubmitted] = await db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(and(
        sql`${items.createdAt} >= ${sevenDaysAgo}`,
        inArray(items.status, ['NEEDS_REVIEW', 'DRAFT'])
      ));

    const [throughputPublished] = await db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(and(
        sql`${items.updatedAt} >= ${sevenDaysAgo}`,
        eq(items.status, 'PUBLISHED')
      ));

    const [throughputChanges] = await db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(and(
        sql`${items.updatedAt} >= ${sevenDaysAgo}`,
        eq(items.status, 'CHANGES_REQUESTED')
      ));

    // Quality flags
    const [duplicateItems] = await db
      .select({ count: sql<number>`count(*)` })
      .from(autoChecks)
      .where(sql`jsonb_array_length(${autoChecks.possibleDuplicates}) > 0`);

    const [lowCoverageItems] = await db
      .select({ count: sql<number>`count(*)` })
      .from(autoChecks)
      .where(eq(autoChecks.referenceCoverage, 'low'));

    // Coverage by subject
    const coverageBySubject = await db
      .select({
        subject: items.subject,
        count: sql<number>`count(*)`
      })
      .from(items)
      .groupBy(items.subject)
      .orderBy(desc(sql`count(*)`));

    return {
      throughput: {
        submitted: throughputSubmitted?.count || 0,
        published: throughputPublished?.count || 0,
        changesRequested: throughputChanges?.count || 0,
      },
      qualityFlags: {
        itemsWithDuplicates: duplicateItems?.count || 0,
        itemsWithLowCoverage: lowCoverageItems?.count || 0,
      },
      coverageBySubject,
    };
  }
}

export const storage = new DatabaseStorage();
