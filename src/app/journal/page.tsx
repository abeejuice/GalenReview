export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import Link from 'next/link'
import { headers, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import JournalForm from '@/components/JournalForm'

type JournalNote = {
  id: string
  content: string
  createdAt: string
  itemId?: string | null
}

async function fetchJournalNotes(): Promise<JournalNote[]> {
  const requestHeaders = headers()
  const origin =
    requestHeaders.get('origin') ??
    process.env.NEXTAUTH_URL ??
    'http://localhost:3000'
  const url = new URL('/api/journal', origin)
  const cookieHeader = cookies()
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ')

  const res = await fetch(url.toString(), {
    cache: 'no-store',
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  })

  if (res.status === 401 || res.status === 403) {
    redirect('/sign-in?callbackUrl=%2Fjournal')
  }

  if (!res.ok) {
    throw new Error('Failed to load journal entries')
  }

  const data = await res.json()
  return Array.isArray(data) ? (data as JournalNote[]) : []
}

export default async function JournalPage() {
  const notes = await fetchJournalNotes()

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const formatDate = (value: string) => dateFormatter.format(new Date(value))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-text-primary">Journal</h1>
        <p className="text-sm text-text-secondary">
          Capture quick notes as you review submissions and collaborate with contributors.
        </p>
      </header>

      <JournalForm />

      {notes.length === 0 ? (
        <div className="glass-card p-6 text-center text-text-muted">
          No journal entries yet. Add your first note to track review progress.
        </div>
      ) : (
        <ul className="space-y-4">
          {notes.map((note) => (
            <li key={note.id} className="glass-card p-5">
              <div className="flex justify-between items-start gap-4">
                <p className="text-text-primary whitespace-pre-wrap text-sm leading-6">
                  {note.content}
                </p>
                <time className="text-xs text-text-muted whitespace-nowrap">
                  {formatDate(note.createdAt)}
                </time>
              </div>
              {note.itemId && (
                <Link
                  href={`/item/${note.itemId}`}
                  className="inline-flex mt-3 text-sm text-primary hover:text-primary/80"
                >
                  View related item
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
