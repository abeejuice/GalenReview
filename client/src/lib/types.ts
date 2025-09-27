import { z } from 'zod';

export const FlashcardIntakeSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  competency_tag: z.string().optional(),
  bloom: z.string().optional(),
  difficulty: z.string().optional(),
  front_text: z.string().min(10, 'Front text must be at least 10 characters'),
  back_text: z.string().min(10, 'Back text must be at least 10 characters'),
  references: z.array(z.object({
    source: z.string().min(1, 'Source is required'),
    page: z.string().optional(),
  })).min(1, 'At least one reference is required'),
});

export const McqIntakeSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  competency_tag: z.string().optional(),
  bloom: z.string().optional(),
  difficulty: z.string().optional(),
  stem: z.string().min(1, 'Question stem is required'),
  options: z.array(z.string()).min(4, 'At least 4 options are required'),
  correct_index: z.number().min(0, 'Correct index must be valid'),
  explanation: z.object({
    summary: z.string().min(1, 'Explanation summary is required'),
    references: z.array(z.object({
      source: z.string().min(1, 'Source is required'),
      page: z.string().optional(),
    })).min(1, 'At least one reference is required'),
  }),
});

export type FlashcardIntake = z.infer<typeof FlashcardIntakeSchema>;
export type McqIntake = z.infer<typeof McqIntakeSchema>;

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'CONTRIBUTOR' | 'REVIEWER';
}

export interface Item {
  id: string;
  type: 'FLASHCARD' | 'MCQ';
  subject: string;
  topic: string;
  bloom?: string;
  difficulty?: string;
  status: 'DRAFT' | 'NEEDS_REVIEW' | 'CHANGES_REQUESTED' | 'PUBLISHED';
  createdAt: string;
  autoChecks?: {
    possibleDuplicates?: string[];
    referenceCoverage?: 'high' | 'medium' | 'low';
    groundednessScore?: number;
  };
}

export interface ItemDetail extends Item {
  flashcard?: {
    frontText: string;
    backText: string;
  };
  mcq?: {
    stem: string;
    options: string[];
    correctIndex: number;
    explanation: {
      summary: string;
      references: Array<{
        source: string;
        page?: string;
      }>;
    };
  };
  references: Array<{
    source: string;
    page?: string;
  }>;
  autoChecks?: {
    groundednessScore?: number;
    faithfulnessScore?: number;
    referenceCoverage?: 'high' | 'medium' | 'low';
    possibleDuplicates?: string[];
    claimsWithNumbers?: Array<{
      claim: string;
      supported_by: string[];
      contradicted_by: string[];
    }>;
  };
}
