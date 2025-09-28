export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db, isDatabaseConfigured } from '@/lib/db'
import { addDevJournalNote, getDevJournalNotesForUser } from '@/lib/dev-store'

const MAX_CONTENT_LENGTH = 2000

export async function GET() {
  try {
    // Skip authentication in development mode
    if (process.env.NODE_ENV === 'production') {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    if (isDatabaseConfigured && db) {
      const notes = await db.journalNote.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
      return NextResponse.json(notes)
    }

    // Use a default user ID for development
    const userId = process.env.NODE_ENV === 'production' ? session.user.id : 'dev-user-1'
    const notes = getDevJournalNotesForUser(userId)
    return NextResponse.json(notes)
  } catch (error) {
    console.error('Journal GET error:', error)
    return NextResponse.json({ error: 'Failed to load journal' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Skip authentication in development mode
    if (process.env.NODE_ENV === 'production') {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { content, itemId } = await request.json()

    if (typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json({ error: 'Content too long' }, { status: 400 })
    }

    if (isDatabaseConfigured && db) {
      const note = await db.journalNote.create({
        data: {
          content: content.trim(),
          userId: session.user.id,
          itemId: itemId && typeof itemId === 'string' ? itemId : null,
        },
      })
      return NextResponse.json(note, { status: 201 })
    }

    // Use a default user ID for development
    const userId = process.env.NODE_ENV === 'production' ? session.user.id : 'dev-user-1'
    const note = addDevJournalNote({
      userId: userId,
      content: content.trim(),
      itemId: typeof itemId === 'string' ? itemId : undefined,
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Journal POST error:', error)
    return NextResponse.json({ error: 'Failed to save journal entry' }, { status: 500 })
  }
}
