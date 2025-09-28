export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db, isDatabaseConfigured } from '@/lib/db'
import { McqIntakeSchema } from '@/lib/types'
import { addDevMCQ } from '@/lib/dev-store'
import { runAutoChecks } from '@/lib/autochecks/run'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = McqIntakeSchema.parse(body)

    if (!isDatabaseConfigured || !db) {
      const item = addDevMCQ({
        subject: validated.subject,
        topic: validated.topic,
        competencyId: validated.competencyId,
        userId: session.user.id,
        mcq: {
          question: validated.mcq.question,
          options: validated.mcq.options,
          correctIndex: validated.mcq.correctIndex,
          explanation: validated.mcq.explanation ?? null,
        },
        references: validated.references,
        autoChecks: validated.autoChecks,
      })

      return NextResponse.json({ itemId: item.id }, { status: 201 })
    }

    const autoChecksData = validated.autoChecks
      ? (() => {
          const base: Record<string, unknown> = {
            duplicates: validated.autoChecks!.duplicates ?? [],
            conflicts: validated.autoChecks!.conflicts ?? [],
            suggestedComps: validated.autoChecks!.suggestedComps ?? [],
            coverage:
              validated.autoChecks!.coverage !== undefined
                ? validated.autoChecks!.coverage
                : 0.75,
          }

          if (validated.autoChecks!.bloomLevel) {
            base.bloomLevel = validated.autoChecks!.bloomLevel
          }

          return base as {
            duplicates: string[]
            conflicts: string[]
            suggestedComps: string[]
            coverage: number
            bloomLevel?: string
          }
        })()
      : undefined

    const item = await db.item.create({
      data: {
        type: 'MCQ',
        subject: validated.subject,
        topic: validated.topic,
        status: 'NEEDS_REVIEW',
        userId: session.user.id,
        competencyId: validated.competencyId,
        mcq: {
          create: {
            question: validated.mcq.question,
            options: validated.mcq.options,
            correctIndex: validated.mcq.correctIndex,
            explanation: validated.mcq.explanation ?? null,
          },
        },
        references: {
          create: validated.references,
        },
        autoChecks: autoChecksData
          ? {
              create: autoChecksData,
            }
          : undefined,
      },
    })

    await runAutoChecks(item.id)

    return NextResponse.json({ itemId: item.id }, { status: 201 })
  } catch (error) {
    console.error('MCQ intake error:', error)
    return NextResponse.json(
      { error: 'Failed to process MCQ', details: error instanceof Error ? error.message : undefined },
      { status: 400 }
    )
  }
}
