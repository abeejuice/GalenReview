import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Add request ID header
  const requestId = crypto.randomUUID()
  const response = NextResponse.next()
  response.headers.set('X-Request-ID', requestId)

  // Allow access to auth routes, health check, and static assets
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/health')
  ) {
    return response
  }

  // For API routes, allow them through in development
  if (pathname.startsWith('/api/')) {
    return response
  }

  // Check for authentication token
  const token = await getToken({ req: request })
  
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}