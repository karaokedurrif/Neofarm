'use client';

import EmptyState from '@/components/tenant/EmptyState';
import { Dna } from 'lucide-react';

export default function TenantGeneticsPage() {
  return (
    <div className="nf-content">
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 20 }}>🧬 Cruces IA</h1>
      <EmptyState
        icon={Dna}
        emoji="🧬"
        title="Genética no iniciada"
        description="Simula cruces genéticos entre tus aves, predice fenotipos de descendencia y planifica programas de mejora."
        hint="Registra al menos un gallo y una gallina con su raza para empezar a simular cruces."
        example={{
          title: 'Posibilidades de genética IA',
          items: [
            'Predicción de color de plumaje en descendencia',
            'Score de compatibilidad entre reproductores',
            'Árbol genealógico con padre y madre',
            'Recomendaciones de cruce para diversidad genética',
          ],
        }}
      />
    </div>
  );
}
