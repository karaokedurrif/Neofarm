import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NeoFarm IoT Hub — Intelligent Infrastructure for Agriculture',
  description:
    'Plataforma unificada de IoT, gemelos digitales y modelos predictivos para agricultura y ganadería. Integrada con GeoTwin.es.',
  openGraph: {
    title: 'NeoFarm IoT Hub — The Intelligence Layer for Agriculture',
    description: 'IoT, digital twins and predictive models unified in a single platform. Powered by GeoTwin.es.',
    url: 'https://neofarm.io',
    siteName: 'NeoFarm IoT Hub',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeoFarm IoT Hub — Intelligent Infrastructure for Agriculture',
    description: 'Unified IoT, digital twin and predictive modeling platform for next-generation agriculture.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-[#070A0F] text-[#eef1f6]">
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
