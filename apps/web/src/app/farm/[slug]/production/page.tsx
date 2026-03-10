'use client';

import { useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import EmptyState, { HoverGuide } from '@/components/tenant/EmptyState';
import { Egg, Plus, Calendar, TrendingUp } from 'lucide-react';

export default function TenantProductionPage() {
  const { farm } = useTenant();

  return (
    <div className="nf-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)' }}>🥚 Producción</h1>
          <p style={{ fontSize: 13, color: 'var(--neutral-500)', marginTop: 4 }}>
            Registro de huevos, pesajes y control de lotes
          </p>
        </div>
        <HoverGuide tip="Primero registra gallineros y aves para poder anotar producción">
          <button className="nf-btn primary" disabled style={{ opacity: 0.5 }}>
            <Plus size={16} /> Anotar recogida
          </button>
        </HoverGuide>
      </div>

      <EmptyState
        icon={Egg}
        emoji="🥚"
        title="Sin registros de producción"
        description="Aquí podrás registrar la recogida diaria de huevos, pesajes de aves de engorde y controlar los lotes de producción."
        hint="Registra primero al menos un gallinero y un ave para empezar a anotar producción."
        example={{
          title: 'Datos que podrás registrar',
          items: [
            'Recogida diaria de huevos por gallinero',
            'Pesajes periódicos de aves de engorde (capones)',
            'Tasa de postura automática (huevos/gallina)',
            'Gráficas de evolución semanales y mensuales',
          ],
        }}
      />
    </div>
  );
}
