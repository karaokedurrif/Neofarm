'use client';

import EmptyState from '@/components/tenant/EmptyState';
import { FileText } from 'lucide-react';

export default function TenantTraceabilityPage() {
  return (
    <div className="nf-content">
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 20 }}>📦 Trazabilidad</h1>
      <EmptyState
        icon={FileText}
        emoji="📦"
        title="Trazabilidad no iniciada"
        description="Traza el recorrido completo: desde el huevo fecundado hasta el producto final, con códigos QR y blockchain."
        hint="Registra aves y producción para generar automáticamente la cadena de trazabilidad."
        example={{
          title: 'Cadena de trazabilidad',
          items: [
            'Origen del ave (padre + madre + fecha nacimiento)',
            'Historial sanitario completo',
            'Alimentación recibida (tipo pienso, lote)',
            'Código QR para el consumidor final',
          ],
        }}
      />
    </div>
  );
}
