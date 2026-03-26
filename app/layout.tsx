import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CXM',
  description: 'CXM.NZ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
