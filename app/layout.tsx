import type { Metadata } from 'next'
import { Nav } from './Nav'
import './globals.css'

export const metadata: Metadata = {
  title: 'CXM.NZ — Senior Digital Consultancy',
  description: 'CX strategy, UI engineering, analytics architecture, and CMS platform work. Senior thinking, without the senior overhead.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  )
}
