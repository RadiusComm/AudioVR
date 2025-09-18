import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AudioVR - Voice-Driven Detective Mystery Platform',
  description: 'Experience the future of accessible gaming with voice-controlled detective mysteries and immersive spatial audio.',
  keywords: 'accessible gaming, voice control, detective mystery, audio games, spatial audio, WCAG compliance',
  authors: [{ name: 'AudioVR Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'AudioVR - Voice-Driven Detective Mystery Platform',
    description: 'Experience the future of accessible gaming with voice-controlled detective mysteries.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AudioVR - Voice-Driven Detective Mystery Platform',
    description: 'Experience the future of accessible gaming with voice-controlled detective mysteries.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
}