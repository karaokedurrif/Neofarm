'use client';

import { Calendar as CalendarIcon } from 'lucide-react';

const TIMELINE_LOTE1 = [
  { mes: 'FEB', fase: 'INCUBACIÓN', dias: '21 días', color: 'var(--primary-300)' },
  { mes: 'MAR', fase: 'ECLOSIÓN + CRÍA', dias: '0-4 sem', color: 'var(--primary-400)' },
  { mes: 'MAY', fase: 'CAPONIZACIÓN', dias: '8-10 sem', color: 'var(--primary-500)' },
  { mes: 'JUN-NOV', fase: 'ENGORDE', dias: '5-6 meses', color: 'var(--primary-600)' },
  { mes: 'DIC', fase: 'VENTA NAVIDAD', dias: '—', color: 'var(--ok)' },
];

const TIMELINE_LOTE2 = [
  { mes: 'AGO', fase: 'INCUBACIÓN', dias: '21 días', color: 'var(--primary-300)' },
  { mes: 'SEP', fase: 'ECLOSIÓN + CRÍA', dias: '0-4 sem', color: 'var(--primary-400)' },
  { mes: 'NOV', fase: 'CAPONIZACIÓN', dias: '8-10 sem', color: 'var(--primary-500)' },
  { mes: 'DIC-MAR', fase: 'ENGORDE', dias: '4-5 meses', color: 'var(--primary-600)' },
  { mes: 'ABR', fase: 'VENTA PASCUA', dias: '—', color: 'var(--ok)' },
];

export default function CalendarPage() {
  return (
    <div className="nf-content">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
        <CalendarIcon size={24} style={{ display: 'inline', marginRight: 8 }} />
        Calendario de Producción
      </h1>
      <p style={{ color: 'var(--neutral-500)', marginBottom: 24 }}>
        Planificación de incubación, cría, caponización y venta de capones
      </p>

      {/* Lote 1 - Navidad */}
      <div className="nf-card" style={{ marginBottom: 24 }}>
        <div className="nf-card-hd">
          <div className="nf-card-title">🎄 Lote 1 — Navidad</div>
          <div className="nf-card-meta">Inicio febrero → Venta diciembre</div>
        </div>
        <div className="nf-card-pad">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TIMELINE_LOTE1.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 80, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--neutral-600)' }}>
                  {t.mes}
                </div>
                <div style={{ flex: 1, padding: 12, background: t.color, color: 'white', borderRadius: 8, fontWeight: 600 }}>
                  {t.fase}
                </div>
                <div style={{ width: 100, fontSize: 12, color: 'var(--neutral-500)', textAlign: 'right' }}>
                  {t.dias}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lote 2 - Pascua */}
      <div className="nf-card" style={{ marginBottom: 24 }}>
        <div className="nf-card-hd">
          <div className="nf-card-title">🐣 Lote 2 — Pascua</div>
          <div className="nf-card-meta">Inicio agosto → Venta abril</div>
        </div>
        <div className="nf-card-pad">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TIMELINE_LOTE2.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 80, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--neutral-600)' }}>
                  {t.mes}
                </div>
                <div style={{ flex: 1, padding: 12, background: t.color, color: 'white', borderRadius: 8, fontWeight: 600 }}>
                  {t.fase}
                </div>
                <div style={{ width: 100, fontSize: 12, color: 'var(--neutral-500)', textAlign: 'right' }}>
                  {t.dias}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ponedoras continuo */}
      <div className="nf-card" style={{ background: 'var(--primary-50)' }}>
        <div className="nf-card-pad">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 32 }}>🥚</div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Ponedoras — Producción Continua</div>
              <div style={{ fontSize: 13, color: 'var(--neutral-600)' }}>
                300+ días/año de postura. Ciclo completo: ~18 meses activo → renovación
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
