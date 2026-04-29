import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Natural Core — ค้นหาเมนูเพื่อสุขภาพ',
  description: 'ค้นหาเมนูอาหารเพื่อสุขภาพด้วย AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
