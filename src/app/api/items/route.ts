export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { db, isDatabaseConfigured } from '@/lib/db'
import { getDevStore } from '@/lib/dev-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const flag = searchParams.get('flag')
    const limitParam = searchParams.get('limit')
    const limit = Math.min(parseInt(limitParam ?? '50', 10) || 50, 100)

    if (isDatabaseConfigured && db) {
      const where: Record<string, unknown> = {}
      if (subject && subject !== 'all') where.subject = subject
      if (type && type !== 'all') where.type = type
      if (status && status !== 'all') where.status = status

      const items = await db.item.findMany({
        where,
        include: {
          flashcard: true,
          mcq: true,
          references: true,
          autoChecks: true,
          competency: true,
          user: { select: { email: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })

      return NextResponse.json(filterByFlag(items, flag))
    }

    const devItems = getDevStore().items.filter((item) => {
      if (subject && subject !== 'all' && item.subject !== subject) return false
      if (type && type !== 'all' && item.type !== type) return false
      if (status && status !== 'all' && item.status !== status) return false
      return true
    })

    return NextResponse.json(filterByFlag(devItems, flag))
  } catch (error) {
    console.error('Items API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 },
    )
  }
}

function filterByFlag(items: any[], flag: string | null) {
  if (!flag || flag === 'all') return items
  return items.filter((item) => {
    const checks = item.autoChecks
    if (!checks) return false
    switch (flag) {
      case 'duplicate':
        return checks.duplicates.length > 0
      case 'conflict':
        return checks.conflicts.length > 0
      case 'lowcoverage':
        return checks.coverage < 0.8
      case 'quality':
        return (
          checks.duplicates.length > 0 ||
          checks.conflicts.length > 0 ||
          checks.coverage < 0.8
        )
      default:
        return true
    }
  })
}
