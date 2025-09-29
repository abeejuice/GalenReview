'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JournalForm() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!content.trim()) {
      setError('Please enter a note before submitting.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to add note' }))
        setError(data.error ?? 'Failed to add note')
        return
      }

      setContent('')
      router.refresh()
    } catch (err) {
      setError('Unexpected error. Please try again.')
      console.error('Journal submit error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 mb-6 space-y-4">
      <div>
        <label htmlFor="journal-content" className="block text-sm font-medium text-text-secondary mb-2">
          Add Journal Note
        </label>
        <textarea
          id="journal-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="w-full h-32 border border-borderMuted bg-surface rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="What did you review or notice?"
          disabled={isSubmitting}
        />
      </div>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setContent('')}
          disabled={isSubmitting}
          className="rounded-xl border border-borderMuted px-4 py-2 text-sm text-text-secondary hover:border-primary/40 hover:text-text-primary disabled:opacity-50"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-background shadow-glow transition disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </form>
  )
}
