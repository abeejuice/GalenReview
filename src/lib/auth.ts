import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Define specific users with their roles
const users = {
  'arunbiju3010@gmail.com': {
    id: '1',
    name: 'Arun Biju',
    role: 'REVIEWER',
    password: 'reviewer123'
  },
  'akhil.p@vcentric.in': {
    id: '2', 
    name: 'Akhil P',
    role: 'CONTRIBUTOR',
    password: 'contributor123'
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = users[credentials.email as keyof typeof users]
        
        if (user && user.password === credentials.password) {
          return {
            id: user.id,
            email: credentials.email,
            name: user.name,
            role: user.role
          }
        }

        // Development fallback - accept any email/password
        if (process.env.NODE_ENV === 'development') {
          return {
            id: 'dev',
            email: credentials.email,
            name: 'Dev User',
            role: 'REVIEWER'
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/sign-in'
  },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-key-for-testing-only"
}