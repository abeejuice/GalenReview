import Link from 'next/link'

interface QueueCardProps {
  item: any
}

const STATUS_STYLES: Record<string, string> = {
  NEEDS_REVIEW: 'bg-blue-500/15 text-blue-200 border border-blue-500/30',
  CHANGES_REQUESTED: 'bg-amber-500/15 text-amber-200 border border-amber-500/25',
  PUBLISHED: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/25',
}

export default function QueueCard({ item }: QueueCardProps) {
  const statusBadge =
    STATUS_STYLES[item.status] ?? 'bg-surfaceMuted text-text-secondary border border-borderMuted'

  const getContent = () => {
    if (item.flashcard) {
      return {
        title: item.flashcard.question,
        preview: item.flashcard.answer,
      }
    }
    if (item.mcq) {
      return {
        title: item.mcq.question,
        preview: item.mcq.options.slice(0, 3).join(' • '),
      }
    }
    return { title: 'Untitled', preview: '' }
  }

  const { title, preview } = getContent()

  const showDuplicates = Array.isArray(item.autoChecks?.duplicates) && item.autoChecks.duplicates.length > 0
  const showConflicts = Array.isArray(item.autoChecks?.conflicts) && item.autoChecks.conflicts.length > 0
  const showCoverage = typeof item.autoChecks?.coverage === 'number' && item.autoChecks.coverage < 0.8

  return (
    <Link href={`/item/${item.id}`} className="block group h-full">
      <article className="h-full rounded-2xl border border-borderMuted bg-surface p-6 shadow-card transition-all group-hover:shadow-glow group-hover:border-primary/50">
        <header className="flex items-start justify-between gap-3 mb-5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusBadge}`}
          >
            {item.status.replace('_', ' ')}
          </span>
          <span className="text-[11px] font-medium text-text-secondary bg-surfaceMuted border border-borderMuted px-2.5 py-1 rounded-full">
            {item.type}
          </span>
        </header>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary leading-6 line-clamp-2 group-hover:text-primary">
            {title}
          </h3>
          {preview && (
            <p className="text-sm text-text-secondary leading-5 line-clamp-2">
              {preview}
            </p>
          )}
        </div>

        <dl className="mt-5 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-text-muted">
          <div className="flex items-center gap-1">
            <dt className="font-medium text-text-secondary">Subject</dt>
            <dd>{item.subject ?? '—'}</dd>
          </div>
          <div className="flex items-center gap-1">
            <dt className="font-medium text-text-secondary">Topic</dt>
            <dd>{item.topic ?? '—'}</dd>
          </div>
          {item.competency?.name && (
            <div className="flex items-center gap-1">
              <dt className="font-medium text-text-secondary">Competency</dt>
              <dd>{item.competency.name}</dd>
            </div>
          )}
        </dl>

        {(showDuplicates || showConflicts || showCoverage) && (
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-medium">
            {showDuplicates && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-rose-300">
                Duplicates
                <span className="font-semibold">{item.autoChecks.duplicates.length}</span>
              </span>
            )}
            {showConflicts && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-200">
                Conflicts
                <span className="font-semibold">{item.autoChecks.conflicts.length}</span>
              </span>
            )}
            {showCoverage && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-orange-200">
                Coverage
                <span className="font-semibold">{Math.round(item.autoChecks.coverage * 100)}%</span>
              </span>
            )}
          </div>
        )}
      </article>
    </Link>
  )
}
