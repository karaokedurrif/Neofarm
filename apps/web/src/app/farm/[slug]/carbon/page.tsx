'use client';

import EmptyState from '@/components/tenant/EmptyState';
import { Leaf } from 'lucide-react';

export default function TenantCarbonPage() {
  return (
    <div className="nf-content">
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 20 }}>🌱 Carbono</h1>
      <EmptyState
        icon={Leaf}
        emoji="🌱"
        title="Huella de carbono"
        description="Calcula la huella de carbono de tu granja y genera informes de sostenibilidad."
        hint="Se necesitan datos de consumo (pienso, energía, transporte) para calcular emisiones."
        example={{
          title: 'Métricas de sostenibilidad',
          items: [
            'kg CO₂ por huevo producido',
            'kg CO₂ por kg de carne',
            'Absorción de carbono por parcela (NDVI)',
            'Certificación de granja sostenible',
          ],
        }}
      />
    </div>
  );
}
