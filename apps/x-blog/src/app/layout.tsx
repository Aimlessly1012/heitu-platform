import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'HeiTu | 信息茧房',
  description: '聚合 X (Twitter) 文章，自动翻译和总结',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} style={{ backgroundColor: '#030712' }}>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: '#030712', color: '#f3f4f6' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
