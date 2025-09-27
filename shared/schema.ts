import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, pgEnum, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum('role', ['CONTRIBUTOR', 'REVIEWER']);
export const itemTypeEnum = pgEnum('item_type', ['FLASHCARD', 'MCQ']);
export const statusEnum = pgEnum('status', ['DRAFT', 'NEEDS_REVIEW', 'CHANGES_REQUESTED', 'PUBLISHED']);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: roleEnum("role").default('REVIEWER'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const competencies = pgTable("competencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  code: text("code"),
  title: text("title").notNull(),
  domain: text("domain"),
  level: text("level"),
});

export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: itemTypeEnum("type").notNull(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  competencyId: varchar("competency_id"),
  bloom: text("bloom"),
  difficulty: text("difficulty"),
  status: statusEnum("status").default('NEEDS_REVIEW'),
  createdById: varchar("created_by_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const flashcards = pgTable("flashcards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").notNull(),
  frontText: text("front_text").notNull(),
  backText: text("back_text").notNull(),
  notes: text("notes"),
});

export const mcqs = pgTable("mcqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").notNull(),
  stem: text("stem").notNull(),
  options: jsonb("options").notNull(),
  correctIndex: integer("correct_index").notNull(),
  explanation: jsonb("explanation").notNull(),
});

export const references = pgTable("references", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").notNull(),
  source: text("source").notNull(),
  page: text("page"),
});

export const autoChecks = pgTable("auto_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").notNull(),
  groundednessScore: integer("groundedness_score"),
  faithfulnessScore: integer("faithfulness_score"),
  taxonomyMatch: boolean("taxonomy_match"),
  referenceCoverage: text("reference_coverage"),
  possibleDuplicates: jsonb("possible_duplicates"),
  claimsWithNumbers: jsonb("claims_with_numbers"),
});

export const journalNotes = pgTable("journal_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull(),
  date: timestamp("date").defaultNow(),
  text: text("text").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  items: many(items),
  notes: many(journalNotes),
}));

export const competenciesRelations = relations(competencies, ({ many }) => ({
  items: many(items),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [items.createdById],
    references: [users.id],
  }),
  competency: one(competencies, {
    fields: [items.competencyId],
    references: [competencies.id],
  }),
  flashcard: one(flashcards),
  mcq: one(mcqs),
  autoChecks: one(autoChecks),
  references: many(references),
}));

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  item: one(items, {
    fields: [flashcards.itemId],
    references: [items.id],
  }),
}));

export const mcqsRelations = relations(mcqs, ({ one }) => ({
  item: one(items, {
    fields: [mcqs.itemId],
    references: [items.id],
  }),
}));

export const referencesRelations = relations(references, ({ one }) => ({
  item: one(items, {
    fields: [references.itemId],
    references: [items.id],
  }),
}));

export const autoChecksRelations = relations(autoChecks, ({ one }) => ({
  item: one(items, {
    fields: [autoChecks.itemId],
    references: [items.id],
  }),
}));

export const journalNotesRelations = relations(journalNotes, ({ one }) => ({
  author: one(users, {
    fields: [journalNotes.authorId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  role: true,
});

export const insertItemSchema = createInsertSchema(items).pick({
  type: true,
  subject: true,
  topic: true,
  competencyId: true,
  bloom: true,
  difficulty: true,
});

export const insertFlashcardSchema = createInsertSchema(flashcards).pick({
  frontText: true,
  backText: true,
  notes: true,
});

export const insertMcqSchema = createInsertSchema(mcqs).pick({
  stem: true,
  options: true,
  correctIndex: true,
  explanation: true,
});

export const insertReferenceSchema = createInsertSchema(references).pick({
  source: true,
  page: true,
});

export const insertJournalNoteSchema = createInsertSchema(journalNotes).pick({
  text: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type MCQ = typeof mcqs.$inferSelect;
export type InsertMCQ = z.infer<typeof insertMcqSchema>;
export type Reference = typeof references.$inferSelect;
export type InsertReference = z.infer<typeof insertReferenceSchema>;
export type AutoChecks = typeof autoChecks.$inferSelect;
export type JournalNote = typeof journalNotes.$inferSelect;
export type InsertJournalNote = z.infer<typeof insertJournalNoteSchema>;
