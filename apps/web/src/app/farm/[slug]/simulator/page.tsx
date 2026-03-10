'use client';

import EmptyState from '@/components/tenant/EmptyState';
import { Camera } from 'lucide-react';

export default function TenantSimulatorPage() {
  return (
    <div className="nf-content">
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 20 }}>📸 Simulador Fotos</h1>
      <EmptyState
        icon={Camera}
        emoji="📸"
        title="Simulador de fotos"
        description="Sube una foto de un ave y la IA identificará la raza, estimará peso y estado de salud."
        hint="Disponible cuando tengas aves registradas. También puedes probar con fotos de referencia."
        example={{
          title: 'Funciones del simulador',
          items: [
            'Identificación de raza por foto',
            'Estimación de peso visual',
            'Detección de anomalías (plumaje, postura)',
            'Comparativa con estándar de la raza',
          ],
        }}
      />
    </div>
  );
}
