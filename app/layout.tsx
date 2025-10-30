import { Analytics } from '@vercel/analytics/next'
import { Inter } from 'next/font/google'
import './globals.css'
import type { Metadata } from 'next'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
})

export const metadata: Metadata = {
  title: 'TamaMali - AI',
  description: 'An AI-powered quiz web application for teachers and students!',
  keywords: ['Next.js', 'React', 'Web App', 'Inter Font'],
  authors: [
    {
      name: 'Andre Victoria, Karl Rosales, Brave Osio, Christian Jasareno, Blessed Ydel',
      url: 'https://tamamali-ai.vercel.app'
    }
  ],
  openGraph: {
    title: 'TamaMali - AI',
    description: 'An AI-powered quiz web application for teachers and students!',
    url: 'https://tamamali-ai.vercel.app/',
    siteName: 'TamaMali - AI',
    locale: 'en_US',
    type: 'website'
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
