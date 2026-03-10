'use client';

import EmptyState, { HoverGuide } from '@/components/tenant/EmptyState';
import { Heart, Plus } from 'lucide-react';

export default function TenantHealthPage() {
  return (
    <div className="nf-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)' }}>💉 Sanidad</h1>
        <HoverGuide tip="Registra aves para gestionar su plan sanitario">
          <button className="nf-btn primary" disabled style={{ opacity: 0.5 }}><Plus size={16} /> Añadir evento</button>
        </HoverGuide>
      </div>
      <EmptyState
        icon={Heart}
        emoji="💉"
        title="Plan sanitario vacío"
        description="Gestiona vacunaciones, desparasitaciones, tratamientos y revisiones veterinarias de tu rebaño."
        hint="Primero registra aves. Luego podrás asignar eventos sanitarios a cada ave o lote."
        example={{
          title: 'Eventos sanitarios típicos',
          items: [
            'Vacuna Newcastle — cada 3 meses',
            'Desparasitación interna — semestral',
            'Revisión veterinaria pre-sacrificio',
            'Tratamiento antibiótico + periodo de espera',
          ],
        }}
      />
    </div>
  );
}
