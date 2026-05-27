import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MSDC — My Soul Desire Church',
  description: 'Ministry Management System for My Soul Desire Church. Manage attendance, announcements, and members.',
  keywords: ['MSDC', 'My Soul Desire Church', 'church management', 'ministry', 'attendance'],
  openGraph: {
    title: 'MSDC — My Soul Desire Church',
    description: 'Ministry Management System for My Soul Desire Church',
    type: 'website',
  },
}

import { ThemeProvider } from '@/components/ThemeProvider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-msdc-charcoal-light text-gray-900 dark:bg-msdc-charcoal dark:text-gray-100 transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
