import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AutomateLanka - N8N Workflows',
  description: 'Browse and download 2,057+ N8N automation workflows',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

