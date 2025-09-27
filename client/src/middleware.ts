// Mock middleware for development
// In production, this would be handled by NextAuth or similar
export function middleware() {
  return null;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
