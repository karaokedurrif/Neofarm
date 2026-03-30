import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'

export const metadata: Metadata = {
  title: 'BodegaData Hub',
  description: 'Gemelo Digital para Viticultura + Enología',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
        <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans bg-[var(--bg)] text-[var(--text)] antialiased`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto scroll-smooth">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
