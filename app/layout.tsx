import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dexter Lead Tracker',
  description: 'Track your leads with Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}
