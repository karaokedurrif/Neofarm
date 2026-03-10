'use client';

import { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { FileText, Bird, Dna, Shield, Target, Calendar, ChevronRight, Printer } from 'lucide-react';
import { loadProgram, getBird, getMeasurements, getEvents, getEvaluation, getParents } from '@/lib/genetics/store';
import type { SelectionProgram, Bird as BirdType } from '@/lib/genetics/types';
import { calculateCOI, coiColor, coiLabel } from '@/lib/genetics/services/inbreeding.service';
import { calculateBreedContribution } from '@/lib/genetics/services/pedigree.service';

export default function PassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [prog, setProg] = useState<SelectionProgram | null>(null);

  useEffect(() => { setProg(loadProgram()); }, []);

  const bird = useMemo(() => prog ? getBird(prog, id) : undefined, [prog, id]);
  const parents = useMemo(() => prog ? getParents(prog, id) : {}, [prog, id]);
  const measurements = useMemo(() => prog ? getMeasurements(prog, id) : [], [prog, id]);
  const events = useMemo(() => prog ? getEvents(prog, id) : [], [prog, id]);
  const evaluation = useMemo(() => prog ? getEvaluation(prog, id) : undefined, [prog, id]);
  const breedContrib = useMemo(() => prog && bird ? calculateBreedContribution(id, prog.birds) : {}, [prog, bird, id]);
  const coi = useMemo(() => bird && prog ? calculateCOI(bird.id, prog.birds) : 0, [bird, prog]);

  if (!prog || !bird) {
    return <div style={{ padding: 32, color: 'var(--neutral-400)' }}>
      {!prog ? 'Cargando…' : 'Ave no encontrada'}
      <br /><Link href="/genetics/birds" style={{ color: 'var(--primary)' }}>← Registro</Link>
    </div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 4, maxWidth: 700 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--neutral-400)' }}>
        <Link href="/genetics" style={{ color: 'var(--neutral-400)', textDecoration: 'none' }}>Programa</Link>
        <ChevronRight size={12} />
        <Link href={`/genetics/birds/${id}`} style={{ color: 'var(--neutral-400)', textDecoration: 'none' }}>Digital Twin</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--neutral-200)' }}>Pasaporte</span>
      </div>

      {/* Passport header */}
      <div className="nf-card" style={{ borderTop: '4px solid var(--primary)', textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: 10, color: 'var(--neutral-500)', letterSpacing: 2, textTransform: 'uppercase' }}>Pasaporte de Trazabilidad</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--neutral-100)', marginTop: 4 }}>{bird.anilla}</div>
        <div style={{ fontSize: 14, color: 'var(--neutral-300)' }}>{bird.nombre || 'Sin nombre'}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
          <span className="nf-tag">{bird.generacion}</span>
          <span className="nf-tag">{bird.sexo === 'M' ? '♂ Macho' : '♀ Hembra'}</span>
          <span className="nf-tag">{bird.raza}</span>
          <span className="nf-tag">Línea {bird.linea}</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--neutral-500)', marginTop: 8 }}>
          Nacido: {bird.fechaNacimiento} · Origen: {bird.origen?.replace(/_/g, ' ')}
        </div>
      </div>

      {/* Identidad */}
      <div className="nf-card">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--neutral-200)' }}>
          <Bird size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Identidad
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
          <div><span style={{ color: 'var(--neutral-500)' }}>Plumaje:</span> <span style={{ color: 'var(--neutral-200)' }}>{bird.colorPlumaje || '—'}</span></div>
          <div><span style={{ color: 'var(--neutral-500)' }}>Peso actual:</span> <b style={{ color: 'var(--neutral-100)' }}>{bird.pesoActual} kg</b></div>
          <div><span style={{ color: 'var(--neutral-500)' }}>5 dedos:</span> <span style={{ color: bird.cincoDedos ? '#16A34A' : 'var(--neutral-500)' }}>{bird.cincoDedos ? 'Sí' : 'No'}</span></div>
          <div><span style={{ color: 'var(--neutral-500)' }}>Autosexing:</span> <span style={{ color: bird.autoSexing ? '#8B5CF6' : 'var(--neutral-500)' }}>{bird.autoSexing ? 'Sí' : 'No'}</span></div>
          <div><span style={{ color: 'var(--neutral-500)' }}>Estado:</span> <span style={{ color: 'var(--neutral-200)' }}>{bird.estadoProductivo}</span></div>
          <div><span style={{ color: 'var(--neutral-500)' }}>Destino:</span> <span style={{ color: 'var(--neutral-200)' }}>{bird.destinoRecomendado?.replace(/_/g, ' ') || '—'}</span></div>
        </div>
      </div>

      {/* Pedigrí */}
      <div className="nf-card">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--neutral-200)' }}>
          <Dna size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Pedigrí
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
          <div style={{ padding: '6px 8px', borderRadius: 6, background: '#3B82F608' }}>
            <div style={{ color: 'var(--neutral-500)', fontSize: 10 }}>Padre</div>
            <div style={{ color: 'var(--neutral-200)', fontWeight: 500 }}>{parents.padre ? `${parents.padre.anilla} — ${parents.padre.nombre || parents.padre.raza}` : 'Desconocido'}</div>
          </div>
          <div style={{ padding: '6px 8px', borderRadius: 6, background: '#EC489908' }}>
            <div style={{ color: 'var(--neutral-500)', fontSize: 10 }}>Madre</div>
            <div style={{ color: 'var(--neutral-200)', fontWeight: 500 }}>{parents.madre ? `${parents.madre.anilla} — ${parents.madre.nombre || parents.madre.raza}` : 'Desconocido'}</div>
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--neutral-400)' }}>
          <b>COI:</b> <span style={{ color: coiColor(coi), fontWeight: 700 }}>{(coi * 100).toFixed(2)}%</span> ({coiLabel(coi)})
        </div>
        {Object.keys(breedContrib).length > 0 && (
          <div style={{ marginTop: 6, fontSize: 11 }}>
            <b style={{ color: 'var(--neutral-400)' }}>Composición racial:</b>{' '}
            {Object.entries(breedContrib).sort((a, b) => b[1] - a[1]).map(([breed, pct]) => (
              <span key={breed} style={{ color: 'var(--neutral-300)' }}>{breed} {pct.toFixed(0)}% · </span>
            ))}
          </div>
        )}
      </div>

      {/* Historial */}
      <div className="nf-card">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--neutral-200)' }}>
          <Calendar size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Historial Completo
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {events.map(e => (
            <div key={e.id} style={{ display: 'flex', gap: 8, fontSize: 11, padding: '4px 0', borderBottom: '1px solid var(--neutral-900)' }}>
              <span style={{ color: 'var(--neutral-500)', width: 80, flexShrink: 0 }}>{e.fecha}</span>
              <span style={{ color: 'var(--neutral-300)', fontWeight: 500, textTransform: 'capitalize' }}>{e.tipo.replace(/_/g, ' ')}</span>
              <span style={{ color: 'var(--neutral-400)' }}>{e.descripcion}</span>
            </div>
          ))}
          {measurements.filter(m => m.tipo === 'peso').map(m => (
            <div key={m.id} style={{ display: 'flex', gap: 8, fontSize: 11, padding: '4px 0', borderBottom: '1px solid var(--neutral-900)' }}>
              <span style={{ color: 'var(--neutral-500)', width: 80, flexShrink: 0 }}>{m.fecha}</span>
              <span style={{ color: 'var(--neutral-300)', fontWeight: 500 }}>Pesaje</span>
              <span style={{ color: 'var(--neutral-200)', fontWeight: 600 }}>{m.valor} kg</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canal evaluation if available */}
      {evaluation && (
        <div className="nf-card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--neutral-200)' }}>
            <Target size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Evaluación de Canal
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 12 }}>
            <div><span style={{ color: 'var(--neutral-500)' }}>Peso vivo:</span> <b>{evaluation.pesoVivo} kg</b></div>
            <div><span style={{ color: 'var(--neutral-500)' }}>Peso canal:</span> <b>{evaluation.pesoCanal} kg</b></div>
            <div><span style={{ color: 'var(--neutral-500)' }}>Rendimiento:</span> <b style={{ color: 'var(--primary)' }}>{evaluation.rendimientoCanal}%</b></div>
          </div>
          {evaluation.notasOrganolepticas && (
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--neutral-300)', fontStyle: 'italic', padding: '6px 8px', borderRadius: 4, background: 'rgba(var(--primary-rgb,180,130,50),0.03)' }}>
              {evaluation.notasOrganolepticas}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--neutral-600)', padding: 12 }}>
        Generado por OvoSfera · {prog?.nombre} · {new Date().toLocaleDateString('es-ES')}
      </div>
    </div>
  );
}
