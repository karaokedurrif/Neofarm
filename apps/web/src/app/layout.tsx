import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'

const inter = Inter({ subsets: ['latin'], variable: '--font-ui', weight: ['400', '500', '600', '700', '800'] })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['500', '700'] })

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
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#0F0F0F] text-[#E5E5E5] antialiased`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
