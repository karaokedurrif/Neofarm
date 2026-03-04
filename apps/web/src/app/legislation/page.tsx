'use client';

import { BookOpen, CheckCircle } from 'lucide-react';

const LEGISLACION = [
  { nombre: 'RD 3/2002', descripcion: 'Normas mínimas protección pollos', ambito: 'España' },
  { nombre: 'Reglamento UE 2018/848', descripcion: 'Producción ecológica', ambito: 'UE' },
  { nombre: 'RD 348/2000', descripcion: 'Protección gallinas ponedoras', ambito: 'España' },
  { nombre: 'Ley 32/2007', descripcion: 'Cuidado animales en explotación', ambito: 'España' },
  { nombre: 'Programa IAAP', descripcion: 'Vigilancia Influenza Aviar', ambito: 'Nacional' },
];

const CHECKLIST = [
  { item: 'Acceso exterior diario mín 8h (ecológico)', cumple: true },
  { item: 'Densidad ≤ 6 aves/m² interior (eco) / ≤ 9 (campero)', cumple: true },
  { item: 'Perchas: mín 18 cm por ave', cumple: true },
  { item: 'Nidales: 1 por cada 7 gallinas', cumple: true },
  { item: 'Baño de arena disponible', cumple: true },
  { item: 'Agua y pienso ad libitum', cumple: true },
  { item: 'Luz natural + máx 16h artificial', cumple: true },
];

export default function LegislationPage() {
  return (
    <div className="nf-content">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
        <BookOpen size={24} style={{ display: 'inline', marginRight: 8 }} />
        Legislación y Bienestar Animal
      </h1>
      <p style={{ color: 'var(--neutral-500)', marginBottom: 24 }}>
        Normativa aplicable a avicultura extensiva/ecológica en España
      </p>

      {/* Legislación */}
      <div className="nf-card" style={{ marginBottom: 24 }}>
        <div className="nf-card-hd">
          <div className="nf-card-title">Legislación Aplicable</div>
        </div>
        <div className="nf-card-pad">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {LEGISLACION.map((l) => (
              <div key={l.nombre} style={{ padding: 16, border: 'var(--border-default)', borderRadius: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{l.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--neutral-600)', marginBottom: 8 }}>{l.descripcion}</div>
                <span className="nf-tag">{l.ambito}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checklist Bienestar */}
      <div className="nf-card">
        <div className="nf-card-hd">
          <div className="nf-card-title">
            <CheckCircle size={16} style={{ display: 'inline', marginRight: 6 }} />
            Checklist Bienestar Animal
          </div>
          <div className="nf-card-meta">{CHECKLIST.filter((c) => c.cumple).length}/{CHECKLIST.length} cumplidos</div>
        </div>
        <div className="nf-card-pad">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CHECKLIST.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: c.cumple ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)', borderRadius: 8 }}>
                {c.cumple ? (
                  <CheckCircle size={20} style={{ color: 'var(--ok)', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 20, height: 20, border: '2px solid var(--alert)', borderRadius: '50%', flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 13, color: c.cumple ? 'var(--ok)' : 'var(--alert)', fontWeight: c.cumple ? 600 : 400 }}>
                  {c.item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
