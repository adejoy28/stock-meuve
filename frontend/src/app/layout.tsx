import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { StockProvider } from '@/context/StockContext'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { ToastProvider } from '@/components/ui/Toast'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Charly HB',
  description: 'Stock and inventory management',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        {/* AuthProvider must be outermost — StockProvider uses useAuth() internally */}
        <AuthProvider>
          <StockProvider>
            <ToastProvider>
              <ErrorBoundary>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </ErrorBoundary>
            </ToastProvider>
          </StockProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
