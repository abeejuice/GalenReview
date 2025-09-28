'use client'

import { useTransition, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type FilterOption = {
  label: string
  value: string
}

type FilterBarProps = {
  subjects: string[]
  types: string[]
  statuses: string[]
  flags: { label: string; value: string }[]
}

const buildOptions = (items: string[], labelMap?: Record<string, string>): FilterOption[] => {
  const unique = Array.from(new Set(items.filter(Boolean)))
  return [{ label: 'All', value: 'all' }].concat(
    unique.map((value) => ({
      value,
      label: labelMap?.[value] ?? value,
    }))
  )
}

export default function FilterBar({ subjects, types, statuses, flags }: FilterBarProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const subjectOptions = useMemo(() => buildOptions(subjects), [subjects])
  const typeOptions = useMemo(() => buildOptions(types), [types])
  const statusOptions = useMemo(
    () =>
      buildOptions(statuses, {
        DRAFT: 'Draft',
        NEEDS_REVIEW: 'Needs Review',
        CHANGES_REQUESTED: 'Changes Requested',
        PUBLISHED: 'Published',
      }),
    [statuses]
  )
  const flagOptions = useMemo(() => [{ label: 'All Flags', value: 'all' }].concat(flags), [flags])

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    startTransition(() => {
      const queryString = params.toString()
      const next = queryString ? `${pathname}?${queryString}` : pathname
      router.replace(next)
    })
  }

  const getValue = (key: string, fallback = 'all') => searchParams.get(key) ?? fallback

  return (
    <section className="glass-card p-6 mb-6">
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        role="group"
        aria-label="Queue filters"
      >
        <Select
          label="Subject"
          options={subjectOptions}
          value={getValue('subject') ?? 'all'}
          onChange={(value) => updateParam('subject', value)}
          isPending={isPending}
        />
        <Select
          label="Type"
          options={typeOptions}
          value={getValue('type') ?? 'all'}
          onChange={(value) => updateParam('type', value)}
          isPending={isPending}
        />
        <Select
          label="Status"
          options={statusOptions}
          value={getValue('status') ?? 'all'}
          onChange={(value) => updateParam('status', value)}
          isPending={isPending}
        />
        <Select
          label="Flag"
          options={flagOptions}
          value={getValue('flag', 'all')}
          onChange={(value) => updateParam('flag', value)}
          isPending={isPending}
        />
      </div>
    </section>
  )
}

type SelectProps = {
  label: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
  isPending: boolean
}

function Select({ label, options, value, onChange, isPending }: SelectProps) {
  return (
    <label className="group relative flex flex-col text-sm text-text-secondary">
      <span className="mb-2 font-medium leading-5 tracking-wide text-text-secondary">{label}</span>
      <div className="relative">
        <select
          className="h-11 w-full appearance-none rounded-lg border border-borderMuted bg-surface px-3 pr-10 text-sm text-text-primary shadow-sm transition focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={isPending}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-text-muted transition group-hover:text-text-secondary"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </label>
  )
}
