'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  if (status === 'loading') {
    return <div className="h-16 bg-white border-b border-gray-200" />
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
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/queue" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Galen Reviewer</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <div className="text-gray-900 font-medium" data-testid="user-email">
                {session.user?.email}
              </div>
              <div className="text-gray-500 text-xs uppercase">
                {session.user?.role || 'REVIEWER'}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/sign-in' })}
              className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium text-gray-700 transition-colors"
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