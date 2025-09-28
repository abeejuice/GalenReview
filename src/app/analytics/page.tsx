export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

async function fetchAnalytics() {
  const requestHeaders = headers()
  const origin =
    requestHeaders.get('origin') ??
    process.env.NEXTAUTH_URL ??
    'http://localhost:3000'
  const url = new URL('/api/analytics', origin)
  const cookieHeader = cookies()
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ')

  const res = await fetch(url.toString(), {
    cache: 'no-store',
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  })

  if (res.status === 401 || res.status === 403) {
    redirect('/sign-in?callbackUrl=%2Fanalytics')
  }

  if (!res.ok) {
    throw new Error('Failed to load analytics')
  }

  return res.json()
}

export default async function AnalyticsPage() {
  const data = await fetchAnalytics()
  const { totals, typeDistribution, topSubjects, quality } = data as {
    totals: { total: number; needsReview: number; changesRequested: number; published: number }
    typeDistribution: Array<{ type: string; count: number }>
    topSubjects: Array<{ subject: string; count: number }>
    quality: { duplicates: number; conflicts: number; lowCoverage: number }
  }

  const totalQuality = quality.duplicates + quality.conflicts + quality.lowCoverage
  const maxSubjectCount = topSubjects.reduce((max, item) => Math.max(max, item.count), 0)
  const maxTypeCount = typeDistribution.reduce((max, item) => Math.max(max, item.count), 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <header className="space-y-3">
        <span className="accent-pill text-xs uppercase tracking-[0.2em]">Insights</span>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold text-text-primary tracking-tight">Review Analytics</h1>
          <p className="text-sm text-text-secondary max-w-2xl">
            Monitor reviewer workload, content distribution, and automated quality signals so your team
            can focus on the highest-impact submissions.
          </p>
        </div>
      </header>

      <section
        aria-label="Key metrics"
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryCard
          title="Items in pipeline"
          value={totals.total}
          description="Total submissions pending or completed"
          variant="total"
        />
        <SummaryCard
          title="Needs review"
          value={totals.needsReview}
          description="Awaiting reviewer attention"
          variant="review"
        />
        <SummaryCard
          title="Changes requested"
          value={totals.changesRequested}
          description="Sent back to contributors"
          variant="changes"
        />
        <SummaryCard
          title="Published"
          value={totals.published}
          description="Approved and live"
          variant="published"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2" aria-label="Distribution insights">
        <Card title="Top subjects" subtitle="Where reviewers spend the most time">
          <div className="space-y-3">
            {topSubjects.length === 0 && (
              <EmptyState message="No subject data yet" />
            )}
            {topSubjects.map(({ subject, count }) => (
              <ProgressRow
                key={subject}
                label={subject}
                count={count}
                max={Math.max(maxSubjectCount, 1)}
              />
            ))}
          </div>
        </Card>

        <Card title="By item type" subtitle="Balance of MCQs vs flashcards">
          <div className="space-y-3">
            {typeDistribution.length === 0 && (
              <EmptyState message="No type data yet" />
            )}
            {typeDistribution.map(({ type, count }) => (
              <ProgressRow key={type} label={type} count={count} max={Math.max(maxTypeCount, 1)} />
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2" aria-label="Quality signals">
        <Card
          title="Quality indicators"
          subtitle="Automated checks that flag content for deeper review"
        >
          <dl className="space-y-4 text-sm text-gray-700">
            <QualityRow
              label="Potential duplicates"
              value={quality.duplicates}
              description="Items with overlap or redundancy warnings"
            />
            <QualityRow
              label="Content conflicts"
              value={quality.conflicts}
              description="Items with conflicting references or claims"
            />
            <QualityRow
              label="Low coverage"
              value={quality.lowCoverage}
              description="Items below the coverage threshold"
            />
          </dl>
        </Card>

        <Card
          title="Quality summary"
          subtitle="How many items need follow-up"
        >
          <div className="flex h-full flex-col items-start justify-between gap-4">
            <div>
              <p className="text-4xl font-semibold text-gray-900">{totalQuality}</p>
              <p className="text-sm text-gray-600 mt-1">
                Total items flagged by automated checks across all categories.
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Automated checks highlight risks but do not replace reviewer judgment. Prioritize duplicates
              and conflicts for the strongest signal.
            </p>
          </div>
        </Card>
      </section>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  description,
  variant,
}: {
  title: string
  value: number
  description: string
  variant: 'total' | 'review' | 'changes' | 'published'
}) {
  return (
    <article
      className={`rounded-2xl px-6 py-6 shadow-card transition ${
        variant === 'total' ? 'bg-primary text-background' : 'glass-card text-text-primary'
      }`}
    >
      <h2 className="text-sm font-medium opacity-80">{title}</h2>
      <p className="mt-3 text-4xl font-semibold tracking-tight">{value}</p>
      <p className="mt-3 text-xs opacity-70">{description}</p>
    </article>
  )
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <article className="glass-card p-6">
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {children}
    </article>
  )
}

function ProgressRow({ label, count, max }: { label: string; count: number; max: number }) {
  const width = Math.max(4, Math.round((count / max) * 100))
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm font-medium text-text-secondary">
        <span className="line-clamp-1 text-text-primary" title={label}>
          {label}
        </span>
        <span className="text-text-muted">{count}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surfaceMuted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

function QualityRow({
  label,
  value,
  description,
}: {
  label: string
  value: number
  description: string
}) {
  return (
    <div className="rounded-xl border border-borderMuted bg-surfaceMuted p-4">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-text-primary">{label}</p>
          <p className="text-xs text-text-muted mt-1">{description}</p>
        </div>
        <span className="text-2xl font-semibold text-text-primary">{value}</span>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-borderMuted bg-surfaceMuted text-xs text-text-muted">
      {message}
    </div>
  )
}
