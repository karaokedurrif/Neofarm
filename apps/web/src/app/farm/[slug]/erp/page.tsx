'use client';

import EmptyState from '@/components/tenant/EmptyState';
import { ClipboardList } from 'lucide-react';

export default function TenantErpPage() {
  return (
    <div className="nf-content">
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 20 }}>📊 ERP</h1>
      <EmptyState
        icon={ClipboardList}
        emoji="📊"
        title="ERP sin datos"
        description="Gestión económica de tu granja: costes de alimentación, ingresos por venta de huevos/carne, rentabilidad por ave."
        hint="Registra producción y nutrición para que el ERP calcule automáticamente la rentabilidad."
        example={{
          title: 'Métricas del ERP',
          items: [
            'Coste por huevo producido',
            'Coste por kg de capón engordado',
            'Ingresos por venta (huevos, carne, aves)',
            'Margen de beneficio por gallinero',
          ],
        }}
      />
    </div>
  );
}
