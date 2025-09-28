export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Status as PrismaStatus } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { db, isDatabaseConfigured } from '@/lib/db'
import { getDevItemById, updateDevItemStatus } from '@/lib/dev-store'

const ALLOWED_STATUSES = new Set<PrismaStatus>([
  'NEEDS_REVIEW',
  'CHANGES_REQUESTED',
  'PUBLISHED',
])

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Skip authentication in development mode
    if (process.env.NODE_ENV === 'production') {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    if (isDatabaseConfigured && db) {
      const item = await db.item.findUnique({
        where: { id: params.id },
        include: {
          flashcard: true,
          mcq: true,
          references: true,
          autoChecks: true,
          competency: true,
          user: { select: { email: true, name: true } },
        },
      })

      if (!item) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }

      return NextResponse.json(item)
    }

    const item = getDevItemById(params.id)
    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Item detail GET error:', error)
    return NextResponse.json({ error: 'Failed to load item' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Skip authentication in development mode
    if (process.env.NODE_ENV === 'production') {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { status } = await request.json()
    if (typeof status !== 'string' || !ALLOWED_STATUSES.has(status as PrismaStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    if (isDatabaseConfigured && db) {
      const prismaStatus = status as PrismaStatus
      const updated = await db.item
        .update({
          where: { id: params.id },
          data: { status: prismaStatus },
          include: {
            flashcard: true,
            mcq: true,
            references: true,
            autoChecks: true,
            competency: true,
            user: { select: { email: true, name: true } },
          },
        })
        .catch((error) => {
          console.error('Item status update error:', error)
          return null
        })

      if (!updated) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }

      return NextResponse.json(updated)
    }

    const updated = updateDevItemStatus({ id: params.id, status: status as PrismaStatus })
    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Item detail PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}
