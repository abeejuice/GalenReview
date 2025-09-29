import { z } from 'zod'

// Flashcard intake schema
export const FlashcardIntakeSchema = z.object({
  type: z.literal('FLASHCARD'),
  subject: z.string().min(1),
  topic: z.string().min(1),
  competencyId: z.string(),
  flashcard: z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  }),
  references: z.array(z.object({
    title: z.string().min(1),
    page: z.string().optional(),
    url: z.string().url().optional(),
  })).min(1),
}).refine((data) => {
  // If content has numeric claims, require a reference with page
  const content = `${data.flashcard.question} ${data.flashcard.answer}`
  if (requiresPageReference(content)) {
    return data.references.some(ref => ref.page)
  }
  return true
}, {
  message: 'Numeric claims require a reference with page number',
})

// MCQ intake schema
const AutoChecksInputSchema = z
  .object({
    duplicates: z.array(z.string()).optional(),
    conflicts: z.array(z.string()).optional(),
    coverage: z.number().optional(),
    bloomLevel: z.string().optional(),
    suggestedComps: z.array(z.string()).optional(),
  })
  .partial()

export const McqIntakeSchema = z.object({
  type: z.literal('MCQ'),
  subject: z.string().min(1),
  topic: z.string().min(1),
  competencyId: z.string(),
  mcq: z.object({
    question: z.string().min(1),
    options: z.array(z.string().min(1)).min(4),
    correctIndex: z.number().min(0),
    explanation: z.string().optional(),
  }),
  references: z.array(z.object({
    title: z.string().min(1),
    page: z.string().optional(),
    url: z.string().url().optional(),
  })).min(1),
  autoChecks: AutoChecksInputSchema.optional(),
}).refine((data) => {
  // Ensure correctIndex is within options range
  return data.mcq.correctIndex < data.mcq.options.length
}, {
  message: 'Correct index must be within options range',
}).refine((data) => {
  // Ensure options are unique
  const uniqueOptions = new Set(data.mcq.options)
  return uniqueOptions.size === data.mcq.options.length
}, {
  message: 'All options must be unique',
}).refine((data) => {
  // If content has numeric claims, require a reference with page
  const content = `${data.mcq.question} ${data.mcq.options.join(' ')} ${data.mcq.explanation || ''}`
  if (requiresPageReference(content)) {
    return data.references.some(ref => ref.page)
  }
  return true
}, {
  message: 'Numeric claims require a reference with page number',
})

export type FlashcardIntake = z.infer<typeof FlashcardIntakeSchema>
export type McqIntake = z.infer<typeof McqIntakeSchema>

// Helper functions
export function extractNumericClaims(text: string): string[] {
  const numberPattern = /\b\d+(?:\.\d+)?(?:\s*(?:mg|ml|kg|cm|mm|hours?|minutes?|seconds?|days?|weeks?|months?|years?|%|percent))\b/gi
  return text.match(numberPattern) || []
}

export function requiresPageReference(text: string): boolean {
  const claims = extractNumericClaims(text)
  return claims.length > 0
}
