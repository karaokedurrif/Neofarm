import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NeoFarm — The Intelligence Layer for European Livestock',
  description:
    'Sensores, genética, clima, IA y modelos financieros unificados en una infraestructura abierta. Para ganaderos, integradoras y developers.',
  openGraph: {
    title: 'NeoFarm — Open AgTech Infrastructure',
    description: 'La capa de inteligencia para la ganadería europea.',
    url: 'https://neofarm.io',
    siteName: 'NeoFarm',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeoFarm — Open AgTech Infrastructure',
    description: 'The intelligence layer for European livestock.',
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
