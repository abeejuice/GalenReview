'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={label}
      className="ml-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-borderMuted bg-surface shadow-card transition hover:border-primary/60 hover:text-primary"
    >
      <span className="text-base">{isDark ? '☀️' : '🌙'}</span>
    </button>
  )
}
