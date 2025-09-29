import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/SessionProvider'
import Header from '@/components/Header'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-text-primary">
        <ThemeProvider>
          <SessionProvider session={session}>
            <Header />
            <main>{children}</main>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
