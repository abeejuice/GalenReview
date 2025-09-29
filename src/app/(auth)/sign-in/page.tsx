'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
        return
      }

      if (result?.ok) {
        router.push('/queue')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDevSignIn = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: 'arunbiju3010@gmail.com',
        password: 'reviewer123',
        redirect: false,
      })

      if (result?.error) {
        setError('Dev sign-in failed')
        return
      }

      if (result?.ok) {
        router.push('/queue')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary rounded-xl flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-2xl">G</span>
          </div>
          <h2 className="text-3xl font-bold text-text-primary">Galen Reviewer</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Sign in to your account to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-borderMuted rounded-xl bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-borderMuted rounded-xl bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl text-sm font-medium text-background bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-borderMuted" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-text-muted">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDevSignIn}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-borderMuted rounded-xl text-sm font-medium text-text-secondary bg-surface hover:bg-surfaceMuted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in as Arun (Reviewer)'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Test Credentials</h3>
            <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <div><strong>Reviewer:</strong> arunbiju3010@gmail.com / reviewer123</div>
              <div><strong>Contributor:</strong> akhil.p@vcentric.in / contributor123</div>
            </div>
          </div>
          <p className="text-xs text-text-muted">
            Development mode: Use any email/password or click "Sign in as Reviewer"
          </p>
        </div>
      </div>
    </div>
  )
}