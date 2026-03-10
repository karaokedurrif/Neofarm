'use client';

import EmptyState from '@/components/tenant/EmptyState';
import { BookOpen } from 'lucide-react';

export default function TenantLegislationPage() {
  return (
    <div className="nf-content">
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 20 }}>📜 Legislación</h1>
      <EmptyState
        icon={BookOpen}
        emoji="📜"
        title="Legislación avícola"
        description="Consulta la normativa aplicable a tu granja: registro REGA, bienestar animal, etiquetado de huevos, legislación autonómica."
        hint="Se mostrará la normativa relevante según el tipo de granja y comunidad autónoma."
        example={{
          title: 'Normativa relevante',
          items: [
            'RD 3/2002 — Normas mínimas protección gallinas ponedoras',
            'Código REGA — Registro de explotaciones ganaderas',
            'Reglamento CE 589/2008 — Comercialización de huevos',
            'Normativa de bienestar animal en matadero',
          ],
        }}
      />
    </div>
  );
}
