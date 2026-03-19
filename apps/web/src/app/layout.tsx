import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import AppShell from '@/components/AppShell';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OvoSfera – Avicultura Inteligente',
  description: 'Hub de gestión avícola: capones, huevos, sanidad, genética IA, nutrición',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        <Script
          src="https://seedy-api.neofarm.io/dashboard/ovosfera-inject.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
