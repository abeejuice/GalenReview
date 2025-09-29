import { headers } from 'next/headers'
import { auth } from './auth'

export async function getServerSession() {
  try {
    const headersList = await headers()
    const cookie = headersList.get('cookie')
    
    if (!cookie) {
      return null
    }

    // In development, we'll allow API calls without authentication
    if (process.env.NODE_ENV === 'development') {
      return {
        user: {
          id: 'dev-user-1',
          email: 'reviewer@example.com',
          name: 'Reviewer One',
          role: 'REVIEWER'
        }
      }
    }

    // For production, validate the session properly
    const session = await auth.api.getSession({
      headers: {
        cookie
      }
    })

    return session
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}
