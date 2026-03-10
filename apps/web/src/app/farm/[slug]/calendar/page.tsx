'use client';

import EmptyState from '@/components/tenant/EmptyState';
import { Calendar } from 'lucide-react';

export default function TenantCalendarPage() {
  return (
    <div className="nf-content">
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 20 }}>📅 Calendario</h1>
      <EmptyState
        icon={Calendar}
        emoji="📅"
        title="Calendario vacío"
        description="Visualiza vacunaciones, pesajes, recogidas y eventos sanitarios en un calendario integrado."
        hint="Los eventos se crean automáticamente al registrar vacunas, pesajes o recogidas de huevos."
        example={{
          title: 'Eventos del calendario',
          items: [
            'Próxima vacunación programada',
            'Recordatorio de pesaje semanal capones',
            'Fecha estimada de sacrificio por lote',
            'Visita veterinaria periódica',
          ],
        }}
      />
    </div>
  );
}
