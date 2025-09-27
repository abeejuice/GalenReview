import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const flag = searchParams.get('flag')

    const where: any = {}
    
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
        user: {
          select: { email: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Filter by flags if needed
    let filteredItems = items
    if (flag) {
      filteredItems = items.filter(item => {
        if (!item.autoChecks) return false
        switch (flag) {
          case 'duplicate':
            return item.autoChecks.duplicates.length > 0
          case 'conflict':
            return item.autoChecks.conflicts.length > 0
          case 'lowcoverage':
            return item.autoChecks.coverage < 0.8
          default:
            return true
        }
      })
    }

    return NextResponse.json(filteredItems)
  } catch (error) {
    console.error('Items API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}