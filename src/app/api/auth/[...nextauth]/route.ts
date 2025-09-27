import NextAuth, { type NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db, isDatabaseConfigured } from '@/lib/db'
import { findDevUserByEmail, registerDevUser } from '@/lib/dev-store'

const resolvedSecret =
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV !== 'production' ? 'development-secret' : undefined)

if (!resolvedSecret) {
  throw new Error('NEXTAUTH_SECRET must be set when NODE_ENV=production')
}

const emailServer = process.env.EMAIL_SERVER?.trim()
const emailFrom = process.env.EMAIL_FROM?.trim()
const enableCredentialsProvider =
  process.env.ALLOW_DEV_CREDENTIALS === 'true' ||
  process.env.NEXT_PUBLIC_USE_DEV_CREDENTIALS === 'true' ||
  process.env.NODE_ENV !== 'production'

if (emailServer && !emailFrom) {
  console.warn('EMAIL_SERVER is set but EMAIL_FROM is missing; email provider disabled.')
}

if (!emailServer && process.env.EMAIL_FROM) {
  console.warn('EMAIL_FROM is set but EMAIL_SERVER is missing; email provider disabled.')
}

if (!enableCredentialsProvider && !(emailServer && emailFrom)) {
  throw new Error(
    'No authentication providers configured. Enable EMAIL_SERVER/EMAIL_FROM or ALLOW_DEV_CREDENTIALS=true.'
  )
}

export const authOptions: NextAuthOptions = {
  secret: resolvedSecret,
  trustHost: process.env.NODE_ENV !== 'production' || Boolean(process.env.NEXTAUTH_URL),
  debug: process.env.NODE_ENV !== 'production',
  providers: [
    ...(emailServer && emailFrom
      ? [
          EmailProvider({
            server: emailServer,
            from: emailFrom,
          }),
        ]
      : []),
    ...(enableCredentialsProvider
      ? [
          CredentialsProvider({
            name: 'credentials',
            credentials: {
              email: { label: 'Email', type: 'email' },
            },
            async authorize(credentials) {
              if (!credentials?.email) return null
              
              if (!isDatabaseConfigured || !db) {
                const existingUser = findDevUserByEmail(credentials.email)
                if (existingUser) {
                  return existingUser
                }

                const inMemoryUser = {
                  id: `dev-${Date.now()}`,
                  email: credentials.email,
                  name: credentials.email.split('@')[0],
                  role: 'REVIEWER' as const,
                }

                registerDevUser(inMemoryUser)
                return inMemoryUser
              }

              const user = await db.user.upsert({
                where: { email: credentials.email },
                update: {},
                create: {
                  email: credentials.email,
                  name: credentials.email.split('@')[0],
                  role: 'REVIEWER',
                },
              })

              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              }
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
