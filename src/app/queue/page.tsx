export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import FilterBar from '@/components/FilterBar'
import QueueCard from '@/components/QueueCard'
import QueueSummary from '@/components/QueueSummary'

async function fetchItems(searchParams: Record<string, string | undefined>) {
  const entries = Object.entries(searchParams).filter(([, value]) => Boolean(value)) as Array<
    [string, string]
  >
  const qs = new URLSearchParams(entries)
  const queryString = qs.toString()
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/items${queryString ? `?${queryString}` : ''}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Failed to load items')
  }

  if (res.headers.get('content-type')?.includes('text/html')) {
    throw new Error('Received HTML instead of JSON from /api/items')
  }

  return res.json()
}

export default async function QueuePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const normalizedParams = Object.fromEntries(
    Object.entries(searchParams ?? {}).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ])
  ) as Record<string, string | undefined>

  const items = await fetchItems(normalizedParams)
  const subjects = items.map((item: any) => item.subject).filter(Boolean)
  const types = items.map((item: any) => item.type).filter(Boolean)
  const statuses = items.map((item: any) => item.status ?? 'NEEDS_REVIEW').filter(Boolean)
  const flags = [
    { label: 'Duplicates', value: 'duplicate' },
    { label: 'Conflicts', value: 'conflict' },
    { label: 'Low Coverage', value: 'lowcoverage' },
    { label: 'Quality Issues', value: 'quality' },
  ]

  const statusCounts = items.reduce(
    (
      acc: Record<'NEEDS_REVIEW' | 'CHANGES_REQUESTED' | 'PUBLISHED', number>,
      item: any,
    ) => {
      if (item.status && acc[item.status as keyof typeof acc] !== undefined) {
        acc[item.status as keyof typeof acc] += 1
      }
      return acc
    },
    {
      NEEDS_REVIEW: 0,
      CHANGES_REQUESTED: 0,
      PUBLISHED: 0,
    }
  )

  const qualityCount = items.filter((item: any) => {
    const checks = item.autoChecks
    if (!checks) return false
    return (
      (Array.isArray(checks.duplicates) && checks.duplicates.length > 0) ||
      (Array.isArray(checks.conflicts) && checks.conflicts.length > 0) ||
      (typeof checks.coverage === 'number' && checks.coverage < 0.8)
    )
  }).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <header className="space-y-3">
        <span className="accent-pill text-xs uppercase tracking-[0.2em]">Pipeline</span>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold text-text-primary tracking-tight">Review Queue</h1>
          <p className="text-sm text-text-secondary max-w-2xl">
            Track incoming MCQs and flashcards, surface automated quality signals, and move items through
            review with confidence.
          </p>
        </div>
      </header>

      <QueueSummary
        statusCounts={statusCounts}
        qualityCount={qualityCount}
        currentStatus={normalizedParams.status}
        currentFlag={normalizedParams.flag}
      />

      <FilterBar
        subjects={subjects}
        types={types}
        statuses={statuses}
        flags={flags}
      />

      {/* Items Grid */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item: any) => (
          <QueueCard key={item.id} item={item} />
        ))}
      </section>

      {items.length === 0 && (
        <div className="text-center py-12 border border-dashed border-borderMuted rounded-2xl bg-surface">
          <div className="w-24 h-24 mx-auto bg-surfaceMuted rounded-full flex items-center justify-center mb-4 border border-borderMuted">
            <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No items in queue</h3>
          <p className="text-sm text-text-muted">
            Items will appear here once they're submitted for review.
          </p>
        </div>
      )}

    </div>
  )
}
