'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_LABELS: Record<string, string> = {
  NEEDS_REVIEW: 'Needs Review',
  CHANGES_REQUESTED: 'Changes Requested',
  PUBLISHED: 'Published',
}

type ItemActionsProps = {
  itemId: string
  status: keyof typeof STATUS_LABELS | string
}

const ACTIONS: Array<{ label: string; status: keyof typeof STATUS_LABELS; variant: 'primary' | 'outline' | 'ghost' }> = [
  { label: 'Approve & Publish', status: 'PUBLISHED', variant: 'primary' },
  { label: 'Request Changes', status: 'CHANGES_REQUESTED', variant: 'outline' },
  { label: 'Send Back to Review', status: 'NEEDS_REVIEW', variant: 'ghost' },
]

export default function ItemActions({ itemId, status }: ItemActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpdate = (nextStatus: keyof typeof STATUS_LABELS) => {
    if (nextStatus === status) {
      return
    }

    setMessage(null)
    setError(null)

    startTransition(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/items/${itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          setError(data.error ?? 'Failed to update status')
          return
        }

        setMessage(`Status updated to ${STATUS_LABELS[nextStatus]}.`)
        router.refresh()
      } catch (err) {
        console.error('Item status update error:', err)
        setError('Unexpected error. Please try again.')
      }
    })
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Reviewer Actions</h2>
      <div className="flex flex-wrap gap-3">
        {ACTIONS.map(({ label, status: nextStatus, variant }) => {
          const isActive = status === nextStatus
          const baseClasses =
            'px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          const variantClasses =
            variant === 'primary'
              ? 'bg-primary text-background hover:shadow-glow'
              : variant === 'outline'
                ? 'border border-borderMuted text-text-secondary hover:border-primary/50 hover:text-text-primary'
                : 'border border-transparent text-text-muted hover:text-text-primary hover:bg-surfaceMuted'

          return (
            <button
              key={nextStatus}
              type="button"
              onClick={() => handleUpdate(nextStatus)}
              disabled={isPending || isActive}
              className={`${baseClasses} ${variantClasses}`}
            >
              {label}
            </button>
          )
      })}
      </div>
      <p className="text-sm text-text-muted mt-3">
        Current status:{' '}
        <span className="font-medium text-text-primary">{STATUS_LABELS[status] ?? status}</span>
      </p>
      {message && <p className="text-sm text-emerald-300 mt-2">{message}</p>}
      {error && <p className="text-sm text-rose-300 mt-2">{error}</p>}
    </div>
  )
}
