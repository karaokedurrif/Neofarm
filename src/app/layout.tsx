import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NeoFarm - Ganadería Inteligente Multi-Especie',
  description:
    'IoT LoRa/Mesh, visión IA y ganadería multi-especie en una sola plataforma conectada. GPS, genética, carbono MRV, trazabilidad oficial.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
