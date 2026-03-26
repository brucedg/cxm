import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CXM.NZ — Senior Digital Consultancy',
  description: 'CX strategy, UI engineering, analytics architecture, and CMS platform work. Senior thinking, without the senior overhead.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
