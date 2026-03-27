import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Nav } from './Nav'
import './globals.css'

export const metadata: Metadata = {
  title: 'CXM.NZ — Senior Digital Consultancy',
  description: 'CX strategy, UI engineering, analytics architecture, and CMS platform work. Senior thinking, without the senior overhead.',
  icons: { icon: '/images/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <GoogleAnalytics gaId="G-J5D0J882DM" />
      </body>
    </html>
  )
}
