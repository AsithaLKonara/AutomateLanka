import type { Metadata } from 'next'
import '../globals.css'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="marketing-layout">
      {children}
    </div>
  )
}

