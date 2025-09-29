'use client'

import { useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const STATUS_LABELS: Record<string, string> = {
  NEEDS_REVIEW: 'Needs Review',
  CHANGES_REQUESTED: 'Changes Requested',
  PUBLISHED: 'Published',
}

const SUMMARY_VARIANTS: Record<string, string> = {
  NEEDS_REVIEW:
    'bg-blue-500/10 text-text-primary border border-blue-500/20 hover:border-blue-400/40 hover:bg-blue-500/15 focus-visible:ring-blue-400/40',
  CHANGES_REQUESTED:
    'bg-amber-500/10 text-text-primary border border-amber-500/20 hover:border-amber-400/40 hover:bg-amber-500/15 focus-visible:ring-amber-400/40',
  PUBLISHED:
    'bg-emerald-500/10 text-text-primary border border-emerald-500/20 hover:border-emerald-400/40 hover:bg-emerald-500/15 focus-visible:ring-emerald-400/40',
  QUALITY:
    'bg-rose-500/10 text-text-primary border border-rose-500/20 hover:border-rose-400/40 hover:bg-rose-500/15 focus-visible:ring-rose-400/40',
}

type QueueSummaryProps = {
  statusCounts: Record<'NEEDS_REVIEW' | 'CHANGES_REQUESTED' | 'PUBLISHED', number>
  qualityCount: number
  currentStatus?: string
  currentFlag?: string
}

export default function QueueSummary({
  statusCounts,
  qualityCount,
  currentStatus,
  currentFlag,
}: QueueSummaryProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const setFilter = (nextStatus?: string, nextFlag?: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (nextStatus) {
      params.set('status', nextStatus)
    } else {
      params.delete('status')
    }

    if (nextFlag) {
      params.set('flag', nextFlag)
    } else {
      params.delete('flag')
    }

    startTransition(() => {
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname)
    })
  }

  const summaryItems: Array<{
    key: string
    label: string
    value: number
    onClick: () => void
    isActive: boolean
    variant: string
  }> = [
    {
      key: 'NEEDS_REVIEW',
      label: STATUS_LABELS.NEEDS_REVIEW,
      value: statusCounts.NEEDS_REVIEW,
      onClick: () => setFilter('NEEDS_REVIEW', undefined),
      isActive: currentStatus === 'NEEDS_REVIEW',
      variant: SUMMARY_VARIANTS.NEEDS_REVIEW,
    },
    {
      key: 'CHANGES_REQUESTED',
      label: STATUS_LABELS.CHANGES_REQUESTED,
      value: statusCounts.CHANGES_REQUESTED,
      onClick: () => setFilter('CHANGES_REQUESTED', undefined),
      isActive: currentStatus === 'CHANGES_REQUESTED',
      variant: SUMMARY_VARIANTS.CHANGES_REQUESTED,
    },
    {
      key: 'PUBLISHED',
      label: STATUS_LABELS.PUBLISHED,
      value: statusCounts.PUBLISHED,
      onClick: () => setFilter('PUBLISHED', undefined),
      isActive: currentStatus === 'PUBLISHED',
      variant: SUMMARY_VARIANTS.PUBLISHED,
    },
    {
      key: 'QUALITY',
      label: 'Quality Issues',
      value: qualityCount,
      onClick: () => setFilter(undefined, 'quality'),
      isActive: currentFlag === 'quality',
      variant: SUMMARY_VARIANTS.QUALITY,
    },
  ]

  return (
    <div
      className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-8"
      role="group"
      aria-label="Review queue summary"
    >
      {summaryItems.map(({ key, label, value, onClick, isActive, variant }) => (
        <button
          key={key}
          type="button"
          onClick={onClick}
          disabled={isPending || value === 0}
          className={`group rounded-2xl px-5 py-5 text-left transition-all focus-visible:outline-none ${variant} ${
            isActive ? 'shadow-glow ring-2 ring-primary/40' : 'ring-1 ring-transparent shadow-card'
          } ${value === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
          aria-pressed={isActive}
          aria-label={`${label}: ${value}`}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-3xl font-semibold tracking-tight text-text-primary">{value}</span>
            <span
              className={`inline-flex h-7 min-w-[3.25rem] items-center justify-center rounded-full border text-xs font-medium transition-all ${
                isActive
                  ? 'border-primary/60 bg-primary/20 text-primary'
                  : 'border-borderMuted bg-surfaceMuted text-text-secondary group-hover:border-primary/40'
              }`}
            >
              View
            </span>
          </div>
          <div className="mt-3 text-sm font-medium leading-5 text-text-secondary">{label}</div>
        </button>
      ))}
    </div>
  )
}
