import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db, isDatabaseConfigured } from '@/lib/db'
import { FlashcardIntakeSchema } from '@/lib/types'
import { runAutoChecks } from '@/lib/autochecks/run'
import { addDevFlashcard } from '@/lib/dev-store'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = FlashcardIntakeSchema.parse(body)

    // Create item with flashcard and references
    if (!isDatabaseConfigured || !db) {
      const item = addDevFlashcard({
        subject: validatedData.subject,
        topic: validatedData.topic,
        competencyId: validatedData.competencyId ?? undefined,
        userId: session.user.id,
        flashcard: {
          question: validatedData.flashcard.question,
          answer: validatedData.flashcard.answer,
        },
        references: validatedData.references,
      })

      return NextResponse.json({ itemId: item.id })
    }

    const item = await db.item.create({
      data: {
        type: 'FLASHCARD',
        subject: validatedData.subject,
        topic: validatedData.topic,
        status: 'NEEDS_REVIEW',
        userId: session.user.id,
        competencyId: validatedData.competencyId,
        flashcard: {
          create: {
            question: validatedData.flashcard.question,
            answer: validatedData.flashcard.answer,
          },
        },
        references: {
          create: validatedData.references,
        },
      },
    })

    // Run auto-checks
    await runAutoChecks(item.id)

    return NextResponse.json({ itemId: item.id })
  } catch (error) {
    console.error('Flashcard intake error:', error)
    return NextResponse.json(
      { error: 'Failed to process flashcard' },
      { status: 400 }
    )
  }
}
