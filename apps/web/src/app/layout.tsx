import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BodegaData Hub',
  description: 'Gestión integral de bodegas y viñedos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
