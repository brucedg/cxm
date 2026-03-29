import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { ConditionalNav } from '@/components/ConditionalNav'
import { AuthProvider } from '@/components/AuthProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'CXM.NZ — Digital Consultancy',
  description: 'CX strategy, UI engineering, analytics architecture, and CMS platform work. Expert thinking, without the overhead.',
  icons: { icon: '/images/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ConditionalNav />
          {children}
        </AuthProvider>
        <GoogleAnalytics gaId="G-J5D0J882DM" />
      </body>
    </html>
  )
}
