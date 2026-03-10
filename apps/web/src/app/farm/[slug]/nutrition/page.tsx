'use client';

import EmptyState from '@/components/tenant/EmptyState';
import { FlaskConical } from 'lucide-react';

export default function TenantNutritionPage() {
  return (
    <div className="nf-content">
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 20 }}>🌾 Nutrición</h1>
      <EmptyState
        icon={FlaskConical}
        emoji="🌾"
        title="Nutrición no configurada"
        description="Configura raciones, stock de pienso, suplementos y control de consumo por gallinero."
        hint="Crea gallineros y asigna aves para gestionar sus raciones de alimentación."
        example={{
          title: 'Funcionalidades de nutrición',
          items: [
            'Raciones por tipo de ave (ponedoras, engorde, cría)',
            'Control de stock y alertas de reposición',
            'Coste por ave/día y por kg de huevo/carne',
          ],
        }}
      />
    </div>
  );
}
