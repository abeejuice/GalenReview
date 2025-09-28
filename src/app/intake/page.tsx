'use client'

import { useState } from 'react'

type IntakePayload = Record<string, unknown>

type NormalizedFlashcardBody = {
  type: 'FLASHCARD'
  subject: string
  topic: string
  competencyId: string
  flashcard: {
    question: string
    answer: string
  }
  references: Array<{ title: string; page?: string; url?: string }>
}

type NormalizedMCQBody = {
  type: 'MCQ'
  subject: string
  topic: string
  competencyId: string
  mcq: {
    question: string
    options: string[]
    correctIndex: number
    explanation?: string | null
  }
  references: Array<{ title: string; page?: string; url?: string }>
  autoChecks?: {
    duplicates?: string[]
    conflicts?: string[]
    coverage?: number
    bloomLevel?: string
    suggestedComps?: string[]
  }
}

type NormalizedIntake =
  | {
      type: 'FLASHCARD'
      body: NormalizedFlashcardBody
      label: string
    }
  | {
      type: 'MCQ'
      body: NormalizedMCQBody
      label: string
    }

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'general'

const normalizeReferences = (
  primary: unknown,
  fallback: Array<{ title?: unknown; page?: unknown; url?: unknown }> | undefined
) => {
  const refs: Array<{ title: string; page?: string; url?: string }> = []

  if (Array.isArray(primary)) {
    for (const candidate of primary) {
      if (typeof candidate === 'string') {
        refs.push({ title: candidate })
      } else if (candidate && typeof candidate === 'object' && 'source' in candidate) {
        const title = String((candidate as { source: unknown }).source || 'Reference')
        const page =
          'page' in candidate && typeof candidate.page === 'string' ? candidate.page : undefined
        const url =
          'url' in candidate && typeof candidate.url === 'string' ? candidate.url : undefined
        refs.push({ title, page, url })
      }
    }
  }

  if (Array.isArray(fallback) && refs.length === 0) {
    refs.push(
      ...fallback.map((ref) =>
        typeof ref === 'string'
          ? { title: ref }
          : {
              title: typeof ref.title === 'string' ? ref.title : 'Reference',
              page: typeof ref.page === 'string' ? ref.page : undefined,
              url: typeof ref.url === 'string' ? ref.url : undefined,
            }
      )
    )
  }

  if (refs.length === 0) {
    refs.push({ title: 'Reference needed' })
  }

  return refs
}

const fallbackLabel = (questionId: unknown, question: string, suffix: string) => {
  if (typeof questionId === 'string' && questionId.trim().length > 0) {
    return `${suffix} ${questionId.trim()}`
  }
  const snippet = question.replace(/\s+/g, ' ').slice(0, 60)
  return `${suffix} “${snippet}${question.length > 60 ? '…' : ''}`
}

const normalizeIntake = (payload: IntakePayload, index: number): NormalizedIntake => {
  if (!payload || typeof payload !== 'object') {
    throw new Error(`Item ${index}: Payload must be a JSON object`)
  }

  if ('type' in payload && (payload.type === 'FLASHCARD' || payload.type === 'MCQ')) {
    const label =
      payload.type === 'MCQ'
        ? fallbackLabel((payload as any).question_id, (payload as any).mcq?.question ?? '', 'MCQ')
        : fallbackLabel((payload as any).question_id, (payload as any).flashcard?.question ?? '', 'Flashcard')
    return { type: payload.type, body: payload as any, label }
  }

  const subject = typeof payload.subject === 'string' ? payload.subject : 'General'
  const topic = typeof payload.topic === 'string' ? payload.topic : 'General Topic'
  const competencyTag =
    typeof payload.competency_tag === 'string'
      ? payload.competency_tag
      : typeof payload.competencyId === 'string'
        ? (payload.competencyId as string)
        : 'general'
  const competencyId = toSlug(competencyTag)

  if ('stem' in payload && Array.isArray(payload.options)) {
    const rawOptions = payload.options as unknown[]
    const cleanedOptions = rawOptions.map((option) =>
      typeof option === 'string' ? option.replace(/^\s*\d+\.?\s*/, '') : String(option)
    )

    const correctIndex =
      typeof payload.correct_index === 'number'
        ? payload.correct_index
        : typeof payload.correctIndex === 'number'
          ? payload.correctIndex
          : 0

    const boundedCorrectIndex = Math.min(
      Math.max(correctIndex, 0),
      Math.max(cleanedOptions.length - 1, 0)
    )

    let explanationText: string | undefined
    if (typeof payload.explanation === 'string') {
      explanationText = payload.explanation
    } else if (
      payload.explanation &&
      typeof payload.explanation === 'object' &&
      'summary' in payload.explanation &&
      typeof payload.explanation.summary === 'string'
    ) {
      explanationText = payload.explanation.summary
    }

    const references = normalizeReferences(
      payload.explanation && typeof payload.explanation === 'object'
        ? (payload.explanation as Record<string, unknown>).references
        : undefined,
      Array.isArray(payload.references) ? (payload.references as any) : undefined
    )

    const duplicates = payload.duplicate_of
      ? Array.isArray(payload.duplicate_of)
        ? payload.duplicate_of.map(String)
        : [String(payload.duplicate_of)]
      : undefined
    const conflicts = Array.isArray(payload.issues)
      ? payload.issues.map(String)
      : undefined
    const coverage =
      typeof payload.groundedness_score === 'number'
        ? Math.min(Math.max(payload.groundedness_score / 5, 0), 1)
        : undefined
    const bloomLevel =
      typeof payload.cognitive_level_bloom === 'string'
        ? payload.cognitive_level_bloom
        : undefined

    const suggestedComps = competencyTag ? [competencyTag] : []

    const autoChecks: NormalizedMCQBody['autoChecks'] = {}
    if (duplicates && duplicates.length) autoChecks.duplicates = duplicates
    if (conflicts && conflicts.length) autoChecks.conflicts = conflicts
    if (coverage !== undefined) autoChecks.coverage = coverage
    if (bloomLevel) autoChecks.bloomLevel = bloomLevel
    if (suggestedComps.length) autoChecks.suggestedComps = suggestedComps

    const label = fallbackLabel(payload.question_id, String(payload.stem ?? ''), 'MCQ')

    return {
      type: 'MCQ',
      body: {
        type: 'MCQ',
        subject,
        topic,
        competencyId,
        mcq: {
          question: typeof payload.stem === 'string' ? payload.stem : 'Question text',
          options: cleanedOptions,
          correctIndex: boundedCorrectIndex,
          explanation: explanationText ?? null,
        },
        references,
        autoChecks: Object.keys(autoChecks).length ? autoChecks : undefined,
      },
      label,
    }
  }

  if ('question' in payload && 'answer' in payload) {
    const references = normalizeReferences(
      undefined,
      Array.isArray(payload.references) ? (payload.references as any) : undefined
    )

    const label = fallbackLabel(payload.question_id, String(payload.question ?? ''), 'Flashcard')

    return {
      type: 'FLASHCARD',
      body: {
        type: 'FLASHCARD',
        subject,
        topic,
        competencyId,
        flashcard: {
          question: typeof payload.question === 'string' ? payload.question : 'Question',
          answer: typeof payload.answer === 'string' ? payload.answer : 'Answer',
        },
        references,
      },
      label,
    }
  }

  throw new Error(`Item ${index}: Unable to determine item type. Provide flashcard or MCQ fields.`)
}

const exampleFlashcard = {
  type: 'FLASHCARD',
  subject: 'Cardiology',
  topic: 'Heart Rate',
  competencyId: 'physiology',
  flashcard: {
    question: 'What is the normal resting heart rate range?',
    answer: 'The normal resting heart rate for adults is typically 60-100 beats per minute.',
  },
  references: [
    {
      title: "Harrison's Principles of Internal Medicine",
      page: '234',
    },
  ],
}

const exampleMCQ = {
  type: 'MCQ',
  subject: 'Anatomy',
  topic: 'Heart Chambers',
  competencyId: 'anatomy',
  mcq: {
    question: 'How many chambers does the human heart have?',
    options: ['2', '3', '4', '5'],
    correctIndex: 2,
    explanation: 'The human heart has 4 chambers: 2 atria and 2 ventricles.',
  },
  references: [
    {
      title: "Gray's Anatomy",
      page: '156',
    },
  ],
}

export default function IntakePage() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<
    | null
    | {
        tone: 'success' | 'error' | 'mixed'
        lines: string[]
      }
  >(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      let parsed: unknown
      try {
        parsed = JSON.parse(content)
      } catch (firstError) {
        const wrapped = `[${content.trim().replace(/\s*},\s*{\s*/g, '},{')}]`
        parsed = JSON.parse(wrapped)
      }

      const payloads = Array.isArray(parsed) ? (parsed as IntakePayload[]) : [parsed as IntakePayload]
      const normalizedItems = payloads.map((payload, index) => normalizeIntake(payload, index + 1))

      const results: string[] = []
      let successCount = 0

      for (let index = 0; index < normalizedItems.length; index += 1) {
        const normalized = normalizedItems[index]
        const endpoint = normalized.type === 'FLASHCARD' 
          ? `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/intake/flashcard` 
          : `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/intake/mcq`

        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(normalized.body),
          })

          if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            results.push(`❌ Item ${index + 1}: ${error.error ?? 'Failed to create item'}`)
          } else {
            const result = await response.json().catch(() => ({}))
            successCount += 1
            results.push(
              `✅ Item ${index + 1}: ${normalized.label} (${result.itemId ?? 'id pending'})`
            )
          }
        } catch (error) {
          results.push(`❌ Item ${index + 1}: ${(error as Error).message}`)
        }
      }

      const tone: 'success' | 'mixed' | 'error' =
        successCount === normalizedItems.length
          ? 'success'
          : successCount === 0
            ? 'error'
            : 'mixed'

      setMessage({ tone, lines: results })
      if (tone !== 'error') {
        setContent('')
      }
    } catch (error) {
      setMessage({
        tone: 'error',
        lines: [`❌ Invalid JSON or request failed: ${(error as Error).message}`],
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-text-primary">Content Intake</h1>
        <p className="text-sm text-text-secondary max-w-2xl">
          Paste JSON payloads for MCQs or flashcards. Provide a single object or an array to batch upload
          multiple items. Each entry is validated independently, and you’ll see detailed feedback below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="glass-card p-5 space-y-3">
              <label className="block text-sm font-medium text-text-secondary">
                JSON Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-80 rounded-xl border border-borderMuted bg-surface px-3 py-3 font-mono text-sm text-text-primary shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Paste your JSON content here..."
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                disabled={isLoading || !content.trim()}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-background shadow-glow transition disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
              
              <button
                type="button"
                onClick={() => setContent('')}
                className="rounded-xl border border-borderMuted px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-primary/40 hover:text-text-primary"
              >
                Clear
              </button>
            </div>
            
            {message && (
              <div
                className={`space-y-1 rounded-md p-3 text-sm ${
                  message.tone === 'success'
                    ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/20'
                    : message.tone === 'mixed'
                      ? 'bg-amber-500/10 text-amber-200 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-200 border border-rose-500/20'
                }`}
              >
                {message.lines.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Examples */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              Example Flashcard
            </h3>
            <pre className="glass-card p-4 font-mono text-xs text-text-secondary overflow-x-auto">
              {JSON.stringify(exampleFlashcard, null, 2)}
            </pre>
            <button
              onClick={() => setContent(JSON.stringify(exampleFlashcard, null, 2))}
              className="mt-2 text-sm text-primary hover:text-primary/80"
            >
              Use this example
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              Example MCQ
            </h3>
            <pre className="glass-card p-4 font-mono text-xs text-text-secondary overflow-x-auto">
              {JSON.stringify(exampleMCQ, null, 2)}
            </pre>
            <button
              onClick={() => setContent(JSON.stringify(exampleMCQ, null, 2))}
              className="mt-2 text-sm text-primary hover:text-primary/80"
            >
              Use this example
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
