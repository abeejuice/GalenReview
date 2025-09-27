import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware(req: NextRequest) {
    // Add request ID header
    const requestId = crypto.randomUUID()
    const response = NextResponse.next()
    response.headers.set('X-Request-ID', requestId)
    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth routes, health check, and static assets
        const { pathname } = req.nextUrl
        
        if (
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/sign-in') ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/favicon.ico') ||
          pathname.startsWith('/api/health')
        ) {
          return true
        }
        
        // For all other routes, require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/((?!api/auth|sign-in|_next/static|_next/image|favicon.ico|api/health).*)'],
}