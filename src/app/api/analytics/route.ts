export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db, isDatabaseConfigured } from '@/lib/db'
import { getDevStore } from '@/lib/dev-store'

const LOW_COVERAGE_THRESHOLD = 0.8

export async function GET() {
  try {
    // Skip authentication in development mode
    if (process.env.NODE_ENV === 'production') {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const items = isDatabaseConfigured && db
      ? await db.item.findMany({
          include: {
            autoChecks: true,
          },
        })
      : getDevStore().items

    const totals = {
      total: items.length,
      needsReview: 0,
      changesRequested: 0,
      published: 0,
    }

    const typeCounts: Record<string, number> = {}
    const subjectCounts: Record<string, number> = {}

    const quality = {
      duplicates: 0,
      conflicts: 0,
      lowCoverage: 0,
    }

    for (const item of items) {
      switch (item.status) {
        case 'NEEDS_REVIEW':
          totals.needsReview += 1
          break
        case 'CHANGES_REQUESTED':
          totals.changesRequested += 1
          break
        case 'PUBLISHED':
          totals.published += 1
          break
        default:
          break
      }

      typeCounts[item.type] = (typeCounts[item.type] ?? 0) + 1
      const subjectKey = item.subject ?? 'Unassigned'
      subjectCounts[subjectKey] = (subjectCounts[subjectKey] ?? 0) + 1

      const checks = item.autoChecks as
        | {
            duplicates?: string[]
            conflicts?: string[]
            coverage?: number
          }
        | undefined

      if (checks) {
        if (Array.isArray(checks.duplicates) && checks.duplicates.length > 0) {
          quality.duplicates += 1
        }
        if (Array.isArray(checks.conflicts) && checks.conflicts.length > 0) {
          quality.conflicts += 1
        }
        if (typeof checks.coverage === 'number' && checks.coverage < LOW_COVERAGE_THRESHOLD) {
          quality.lowCoverage += 1
        }
      }
    }

    const topSubjects = Object.entries(subjectCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([subject, count]) => ({ subject, count }))

    const response = {
      totals,
      typeDistribution: Object.entries(typeCounts).map(([type, count]) => ({ type, count })),
      topSubjects,
      quality,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
