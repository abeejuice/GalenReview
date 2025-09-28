export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import Link from 'next/link'
import { headers, cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import ItemActions from '@/components/ItemActions'

const STATUS_LABELS: Record<string, string> = {
  NEEDS_REVIEW: 'Needs Review',
  CHANGES_REQUESTED: 'Changes Requested',
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
}

async function fetchItem(id: string) {
  const requestHeaders = headers()
  const origin =
    requestHeaders.get('origin') ??
    process.env.NEXTAUTH_URL ??
    'http://localhost:3000'
  const url = new URL(`/api/items/${id}`, origin)
  const cookieHeader = cookies()
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ')

  const res = await fetch(url.toString(), {
    cache: 'no-store',
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  })

  if (res.status === 401 || res.status === 403) {
    redirect(`/sign-in?callbackUrl=%2Fitem%2F${id}`)
  }

  if (res.status === 404) {
    notFound()
  }

  if (!res.ok) {
    throw new Error('Failed to load item')
  }

  return res.json()
}

export default async function ItemPage({ params }: { params: { id: string } }) {
  const item = await fetchItem(params.id)

  const statusLabel = STATUS_LABELS[item.status] ?? item.status
  const createdAt = item.createdAt ? new Date(item.createdAt) : null
  const updatedAt = item.updatedAt ? new Date(item.updatedAt) : null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <Link
          href="/queue"
          className="inline-flex items-center text-sm text-text-secondary hover:text-primary transition"
        >
          ← Back to queue
        </Link>
      </div>

      <div className="glass-card p-6 space-y-6">
        <div className="flex flex-wrap gap-4 justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">{item.subject}</p>
            <h1 className="text-3xl font-semibold text-text-primary mt-2">{item.topic}</h1>
            <p className="text-sm text-text-secondary mt-1">Type: {item.type}</p>
          </div>
          <span className="accent-pill text-xs font-semibold uppercase tracking-wide">
            {statusLabel}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-secondary">
          {createdAt && (
            <div>
              <dt className="font-medium text-text-primary/80">Created</dt>
              <dd>{createdAt.toLocaleString()}</dd>
            </div>
          )}
          {updatedAt && (
            <div>
              <dt className="font-medium text-text-primary/80">Last Updated</dt>
              <dd>{updatedAt.toLocaleString()}</dd>
            </div>
          )}
          <div>
            <dt className="font-medium text-text-primary/80">Reviewer</dt>
            <dd>{item.user?.name ?? 'Unknown'} ({item.user?.email ?? 'N/A'})</dd>
          </div>
          <div>
            <dt className="font-medium text-text-primary/80">Competency</dt>
            <dd>{item.competency?.name ?? item.competencyId ?? '—'}</dd>
          </div>
        </dl>
      </div>

      <div className="glass-card p-6 space-y-5">
        {item.type === 'FLASHCARD' && item.flashcard ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Question</h2>
              <p className="text-text-secondary whitespace-pre-wrap">{item.flashcard.question}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Answer</h2>
              <p className="text-text-secondary whitespace-pre-wrap">{item.flashcard.answer}</p>
            </div>
          </div>
        ) : null}

        {item.type === 'MCQ' && item.mcq ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Question</h2>
              <p className="text-text-secondary whitespace-pre-wrap">{item.mcq.question}</p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Options</h3>
              <ul className="space-y-2">
                {item.mcq.options.map((option: string, index: number) => {
                  const isCorrect = index === item.mcq.correctIndex
                  return (
                    <li
                      key={index}
                      className={`rounded-xl px-3 py-2 text-sm ${
                        isCorrect
                          ? 'border border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                          : 'border border-borderMuted bg-surfaceMuted text-text-secondary'
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                      {isCorrect && <span className="ml-2 font-semibold">(Correct)</span>}
                    </li>
                  )
                })}
              </ul>
            </div>
            {item.mcq.explanation && (
              <div>
                <h3 className="text-base font-semibold text-text-primary">Explanation</h3>
                <p className="text-text-secondary whitespace-pre-wrap">{item.mcq.explanation}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="glass-card p-6 space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">References</h2>
        {item.references?.length ? (
          <ul className="list-disc list-inside text-text-secondary space-y-2">
            {item.references.map((ref: any, index: number) => (
              <li key={index}>
                <span className="font-medium text-text-primary">{ref.title}</span>
                {ref.page ? <span className="text-text-muted"> • Page {ref.page}</span> : null}
                {ref.url ? (
                  <>
                    {' '}
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      Source
                    </a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-muted text-sm">No references provided.</p>
        )}
      </div>

      {item.autoChecks ? (
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Auto Checks</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-secondary">
            <div>
              <dt className="font-medium text-text-primary/80">Coverage</dt>
              <dd>
                {typeof item.autoChecks.coverage === 'number'
                  ? `${(item.autoChecks.coverage > 1
                      ? item.autoChecks.coverage
                      : item.autoChecks.coverage * 100
                    ).toFixed(0)}%`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-text-primary/80">Bloom Level</dt>
              <dd>{item.autoChecks.bloomLevel ?? '—'}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2 text-xs">
            {Array.isArray(item.autoChecks.duplicates) && item.autoChecks.duplicates.length ? (
              <span className="px-2 py-1 rounded-full bg-rose-500/10 text-rose-200">
                Duplicates: {item.autoChecks.duplicates.length}
              </span>
            ) : null}
            {Array.isArray(item.autoChecks.conflicts) && item.autoChecks.conflicts.length ? (
              <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-200">
                Conflicts: {item.autoChecks.conflicts.length}
              </span>
            ) : null}
            {(() => {
              const suggestions =
                (item.autoChecks as any).suggestedComps ??
                (item.autoChecks as any).suggestedCompetencies ??
                []
              return Array.isArray(suggestions) && suggestions.length ? (
                <span className="px-2 py-1 rounded-full bg-sky-500/10 text-sky-200">
                  Suggested comps: {suggestions.join(', ')}
                </span>
              ) : null
            })()}
          </div>
        </div>
      ) : null}

      <ItemActions itemId={item.id} status={item.status} />
    </div>
  )
}
