'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'

export default function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  if (status === 'loading') {
    return <div className="h-16" />
  }

  if (!session) {
    return null
  }

  const navItems = [
    { href: '/queue', label: 'Review Queue' },
    { href: '/intake', label: 'Intake' },
    { href: '/journal', label: 'Journal' },
    { href: '/analytics', label: 'Analytics' },
  ]

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/queue" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-primary shadow-glow flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-base">G</span>
              </div>
              <span className="text-lg font-semibold text-text-primary tracking-tight">
                Galen Reviewer
              </span>
            </Link>
            <ThemeToggle />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  pathname === item.href
                    ? 'bg-primary/20 text-text-primary shadow-glow'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surfaceMuted'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <div className="text-text-primary font-medium" data-testid="user-email">
                {session.user?.email}
              </div>
              <div className="text-text-muted text-xs uppercase">
                {session.user?.role || 'REVIEWER'}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/sign-in' })}
              className="rounded-xl border border-borderMuted bg-surfaceMuted px-3 py-2 text-sm font-medium text-text-primary backdrop-blur transition hover:border-primary/50 hover:bg-primary/20"
              data-testid="button-signout"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
