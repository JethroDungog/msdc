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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
