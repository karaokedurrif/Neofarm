'use client';

import { useState, useMemo } from 'react';
import { Dna, TrendingUp, Camera, ChevronDown, ChevronRight, AlertTriangle, Eye, X } from 'lucide-react';
import Link from 'next/link';

/* ── Types ─────────────────────────────────────────── */
interface Ave {
  id: string;
  nombre: string;
  raza: string;
  sexo: 'M' | 'F';
  edad: string;
  peso: number;
}

interface CruceF1 {
  id: string;
  padre: Ave;
  madres: Ave[];
  tipo: 'puro' | 'cruce';
  huevosEsperados: number;
  fertiles: number;
  pollitos: number;
  heterosis: number;
  caracteres: {
    pesoAdulto: string;
    engorde: string;
    rusticidad: number;
    postura: string;
    calidadCarne: number;
  };
  recomendacion: string;
  seleccion: { hembras: number; machos: number; capones: number; excedente: number };
}

/* ── Plantel data (matches /aves) ─────────────────── */
const GALLOS: Ave[] = [
  { id: 'AVE-0001', nombre: 'Carbón', raza: 'Castellana Negra', sexo: 'M', edad: '3 años', peso: 3.2 },
  { id: 'AVE-0002', nombre: 'Rocky', raza: 'Plymouth Rock', sexo: 'M', edad: '2 años', peso: 3.8 },
];

const GALLINAS: Ave[] = [
  { id: 'G-CN', nombre: '10× Castellana Negra', raza: 'Castellana Negra', sexo: 'F', edad: '1-3 años', peso: 2.5 },
  { id: 'G-PR', nombre: '4× Plymouth Rock', raza: 'Plymouth Rock', sexo: 'F', edad: '1-2 años', peso: 3.0 },
  { id: 'G-PL', nombre: '2× Prat Leonada', raza: 'Prat Leonada', sexo: 'F', edad: '2 años', peso: 2.8 },
  { id: 'G-MX', nombre: '2× Empordanesa', raza: 'Empordanesa', sexo: 'F', edad: '1 año', peso: 2.3 },
];

/* ── Computed crosses ─────────────────────────────── */
const CRUCES: CruceF1[] = [
  {
    id: 'CRUCE-A', padre: GALLOS[0],
    madres: [GALLINAS[0]],
    tipo: 'puro',
    huevosEsperados: 90, fertiles: 72, pollitos: 54,
    heterosis: 0,
    caracteres: {
      pesoAdulto: '2.8 kg', engorde: 'Medio', rusticidad: 5,
      postura: '~70 huevos/año', calidadCarne: 3,
    },
    recomendacion: 'Seleccionar 5♀ + 1♂ para reposición (pureza). Resto → capones.',
    seleccion: { hembras: 5, machos: 1, capones: 25, excedente: 23 },
  },
  {
    id: 'CRUCE-B', padre: GALLOS[0],
    madres: [GALLINAS[1], GALLINAS[2]],
    tipo: 'cruce',
    huevosEsperados: 54, fertiles: 43, pollitos: 32,
    heterosis: 15,
    caracteres: {
      pesoAdulto: '3.4 kg (+15%)', engorde: 'Rápido', rusticidad: 4,
      postura: '~65 huevos/año', calidadCarne: 4,
    },
    recomendacion: 'Todos a engorde/capones. NO reproducir F1 (heterosis se pierde en F2).',
    seleccion: { hembras: 0, machos: 0, capones: 16, excedente: 16 },
  },
  {
    id: 'CRUCE-C', padre: GALLOS[1],
    madres: [GALLINAS[0]],
    tipo: 'cruce',
    huevosEsperados: 90, fertiles: 72, pollitos: 54,
    heterosis: 18,
    caracteres: {
      pesoAdulto: '3.5 kg (+20%)', engorde: 'Muy rápido', rusticidad: 4,
      postura: '~60 huevos/año', calidadCarne: 5,
    },
    recomendacion: 'Excelente para capones gourmet. Plumaje mixto barrado/negro.',
    seleccion: { hembras: 0, machos: 0, capones: 27, excedente: 27 },
  },
];

const SELECCION_CRITERIA = [
  { icon: '✅', text: 'Peso > 1.2 kg a 8 semanas', tipo: 'include' },
  { icon: '✅', text: 'Plumaje uniforme de la raza', tipo: 'include' },
  { icon: '✅', text: 'Sin deformidades ni defectos', tipo: 'include' },
  { icon: '✅', text: 'Carácter dócil, buen forrajeo', tipo: 'include' },
  { icon: '❌', text: 'Peso < 800g a 8 semanas', tipo: 'exclude' },
  { icon: '❌', text: 'Defectos de cresta o patas', tipo: 'exclude' },
  { icon: '❌', text: 'Temperamento agresivo', tipo: 'exclude' },
];

/* ══════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════ */
export default function GeneticsPage() {
  const [expandedCruce, setExpandedCruce] = useState<string | null>('CRUCE-A');
  const [showRetrocruce, setShowRetrocruce] = useState(false);

  const totalPollitos = CRUCES.reduce((s, c) => s + c.pollitos, 0);
  const totalCapones = CRUCES.reduce((s, c) => s + c.seleccion.capones, 0);

  /* ── Connector line styles ─────────────────────── */
  const connectorV: React.CSSProperties = {
    width: 2, height: 30, background: 'var(--primary-500)', margin: '0 auto',
  };
  const connectorDot: React.CSSProperties = {
    width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-500)',
    margin: '0 auto', position: 'relative' as const,
  };

  return (
    <div className="nf-content" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          <Dna size={24} style={{ display: 'inline', marginRight: 8 }} />
          Plan Genético — Granja Los Capones
        </h1>
        <p style={{ color: 'var(--neutral-500)', fontSize: 13, margin: 0 }}>
          Basado en tu plantel actual: {GALLOS.length} gallos + {GALLINAS.reduce((s, g) => s + parseInt(g.nombre), 0) || 18} gallinas
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { v: `${GALLOS.length}♂ + 18♀`, l: 'Plantel reproductor', c: 'var(--primary-500)' },
          { v: String(CRUCES.length), l: 'Cruces posibles', c: '#8B5CF6' },
          { v: `~${totalPollitos}`, l: 'Pollitos estimados', c: '#10B981' },
          { v: `~${totalCapones}`, l: 'Capones viables', c: '#F59E0B' },
        ].map(k => (
          <div key={k.l} className="nf-kbox" style={{ textAlign: 'center' }}>
            <div className="nf-kbox-v" style={{ color: k.c, fontSize: 20 }}>{k.v}</div>
            <div className="nf-kbox-label" style={{ fontSize: 11 }}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* ═══ PIPELINE FLOWCHART ═══════════════════════ */}

      {/* ── GENERACIÓN P ─────────────────────────── */}
      <div className="nf-card" style={{ marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        <div className="nf-card-hd" style={{ borderBottom: '2px solid var(--primary-500)' }}>
          <div className="nf-card-title" style={{ color: 'var(--primary-400)' }}>
            GENERACIÓN P — Plantel Actual
          </div>
        </div>
        <div className="nf-card-pad">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 12 }}>
            {/* Gallos */}
            {GALLOS.map(g => (
              <div key={g.id} style={{
                background: 'var(--neutral-50)', borderRadius: 10, padding: 12,
                borderLeft: '3px solid #3B82F6',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>🐓</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{g.nombre}</div>
                    <div style={{ fontSize: 11, color: 'var(--neutral-500)', fontFamily: 'var(--font-mono)' }}>{g.id}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--neutral-600)' }}>
                  {g.raza} · {g.peso}kg · {g.edad}
                </div>
              </div>
            ))}
            {/* Gallinas (grouped) */}
            {GALLINAS.map(g => (
              <div key={g.id} style={{
                background: 'var(--neutral-50)', borderRadius: 10, padding: 12,
                borderLeft: '3px solid #EC4899',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>🐔</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{g.nombre}</div>
                    <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>{g.raza}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--neutral-600)' }}>
                  {g.peso}kg media · {g.edad}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Connector */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
        <svg width="100" height="40" viewBox="0 0 100 40">
          <line x1="50" y1="0" x2="50" y2="40" stroke="var(--primary-500)" strokeWidth="2" />
          <polygon points="44,32 56,32 50,40" fill="var(--primary-500)" />
        </svg>
      </div>

      {/* ── GENERACIÓN F1 — Cruces ──────────────── */}
      <div className="nf-card" style={{ marginBottom: 0, borderRadius: 0 }}>
        <div className="nf-card-hd" style={{ borderBottom: '2px solid #10B981' }}>
          <div className="nf-card-title" style={{ color: '#10B981' }}>
            GENERACIÓN F1 — Predicción de Cruces
          </div>
          <div className="nf-card-meta">{CRUCES.length} combinaciones analizadas</div>
        </div>
        <div className="nf-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {CRUCES.map(cruce => {
            const expanded = expandedCruce === cruce.id;
            return (
              <div key={cruce.id} style={{
                background: 'var(--neutral-50)', borderRadius: 12,
                border: `1px solid ${expanded ? 'var(--primary-500)' : 'var(--neutral-200)'}`,
                color: 'var(--neutral-800)',
                overflow: 'hidden', transition: 'border-color .2s',
              }}>
                {/* Cruce header */}
                <div
                  onClick={() => setExpandedCruce(expanded ? null : cruce.id)}
                  style={{
                    padding: '14px 16px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {cruce.id}: {cruce.padre.nombre} ({cruce.padre.raza})
                        {' × '}
                        {cruce.madres.map(m => m.nombre).join(' + ')}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--neutral-400)' }}>
                        {cruce.tipo === 'puro' ? '🔵 Cruce puro (conservación)' : '🟢 Cruce F1 (heterosis)'}
                        {' · '}~{cruce.pollitos} pollitos estimados
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: 18, fontWeight: 800,
                      color: cruce.heterosis > 0 ? '#10B981' : 'var(--neutral-400)',
                    }}>
                      {cruce.heterosis > 0 ? `+${cruce.heterosis}%` : '0%'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>heterosis</div>
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--neutral-200)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 14 }}>
                      {/* Production */}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: 'var(--neutral-400)', textTransform: 'uppercase' }}>
                          Producción estimada
                        </div>
                        {[
                          { l: 'Huevos fértiles', v: `~${cruce.huevosEsperados}` },
                          { l: 'Eclosión (80%)', v: `~${cruce.fertiles}` },
                          { l: 'Pollitos viables', v: `~${cruce.pollitos}` },
                        ].map(r => (
                          <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                            <span style={{ color: 'var(--neutral-400)' }}>{r.l}</span>
                            <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{r.v}</span>
                          </div>
                        ))}
                      </div>

                      {/* Characters */}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: 'var(--neutral-400)', textTransform: 'uppercase' }}>
                          Caracteres F1
                        </div>
                        {[
                          { l: 'Peso adulto', v: cruce.caracteres.pesoAdulto },
                          { l: 'Engorde', v: cruce.caracteres.engorde },
                          { l: 'Postura', v: cruce.caracteres.postura },
                          { l: 'Rusticidad', v: `${'●'.repeat(cruce.caracteres.rusticidad)}${'○'.repeat(5 - cruce.caracteres.rusticidad)}` },
                          { l: 'Carne', v: `${'★'.repeat(cruce.caracteres.calidadCarne)}${'☆'.repeat(5 - cruce.caracteres.calidadCarne)}` },
                        ].map(r => (
                          <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                            <span style={{ color: 'var(--neutral-400)' }}>{r.l}</span>
                            <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{r.v}</span>
                          </div>
                        ))}
                      </div>

                      {/* Selection */}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: 'var(--neutral-400)', textTransform: 'uppercase' }}>
                          Selección propuesta
                        </div>
                        {[
                          { l: '♀ Reposición', v: cruce.seleccion.hembras, c: '#EC4899' },
                          { l: '♂ Semental futuro', v: cruce.seleccion.machos, c: '#3B82F6' },
                          { l: '🍗 Capones', v: cruce.seleccion.capones, c: '#F59E0B' },
                          { l: 'Excedente/venta', v: cruce.seleccion.excedente, c: 'var(--neutral-400)' },
                        ].map(r => (
                          <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', fontSize: 12 }}>
                            <span style={{ color: 'var(--neutral-400)' }}>{r.l}</span>
                            <span style={{ fontWeight: 700, color: r.c, fontFamily: 'var(--font-mono)' }}>{r.v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div style={{
                      marginTop: 14, padding: 12, borderRadius: 10,
                      background: 'rgba(176,125,43,0.1)', border: '1px solid rgba(176,125,43,0.2)',
                      fontSize: 13, lineHeight: 1.5,
                    }}>
                      <strong>💡 Recomendación:</strong> {cruce.recomendacion}
                    </div>

                    {/* Simulate button */}
                    <Link
                      href={`/simulator?padre=${encodeURIComponent(cruce.padre.raza)}&madre=${encodeURIComponent(cruce.madres[0].raza)}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        marginTop: 12, padding: '8px 16px', borderRadius: 8,
                        background: 'var(--primary-500)', color: '#fff',
                        fontWeight: 600, fontSize: 13, textDecoration: 'none',
                      }}
                    >
                      <Camera size={14} /> Simular aspecto F1
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Connector */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
        <svg width="100" height="40" viewBox="0 0 100 40">
          <line x1="50" y1="0" x2="50" y2="40" stroke="#F59E0B" strokeWidth="2" />
          <polygon points="44,32 56,32 50,40" fill="#F59E0B" />
        </svg>
      </div>

      {/* ── SELECCIÓN Y DESCARTE ─────────────────── */}
      <div className="nf-card" style={{ marginBottom: 0, borderRadius: 0 }}>
        <div className="nf-card-hd" style={{ borderBottom: '2px solid #F59E0B' }}>
          <div className="nf-card-title" style={{ color: '#F59E0B' }}>
            SELECCIÓN Y DESCARTE
          </div>
          <div className="nf-card-meta">Criterios de selección a 8 semanas</div>
        </div>
        <div className="nf-card-pad">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Summary */}
            <div>
              <div style={{ fontSize: 13, lineHeight: 1.8, marginBottom: 16 }}>
                De los <strong>~{totalPollitos} pollitos</strong> F1 estimados:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { l: 'Mejores hembras CN → Reposición', v: '5 (4%)', c: '#EC4899', w: 4 },
                  { l: 'Mejor macho CN → Futuro semental', v: '1 (1%)', c: '#3B82F6', w: 1 },
                  { l: 'Machos → Capones (engorde)', v: `~${totalCapones} (${Math.round(totalCapones/totalPollitos*100)}%)`, c: '#F59E0B', w: 48 },
                  { l: 'Hembras excedentes → Venta/capón', v: `~${totalPollitos - totalCapones - 6} (${Math.round((totalPollitos - totalCapones - 6)/totalPollitos*100)}%)`, c: 'var(--neutral-400)', w: 47 },
                ].map(r => (
                  <div key={r.l}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--neutral-600)' }}>{r.l}</span>
                      <span style={{ fontWeight: 700, color: r.c, fontFamily: 'var(--font-mono)' }}>{r.v}</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--neutral-200)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${r.w}%`, background: r.c, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Criteria */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 10, color: 'var(--neutral-400)', textTransform: 'uppercase' }}>
                Criterios de selección
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SELECCION_CRITERIA.map((c, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                    padding: '6px 10px', borderRadius: 8,
                    background: c.tipo === 'include' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                  }}>
                    <span>{c.icon}</span>
                    <span style={{ color: c.tipo === 'include' ? 'var(--neutral-700)' : 'var(--alert)' }}>{c.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connector */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
        <svg width="100" height="40" viewBox="0 0 100 40">
          <line x1="50" y1="0" x2="50" y2="40" stroke="#8B5CF6" strokeWidth="2" />
          <polygon points="44,32 56,32 50,40" fill="#8B5CF6" />
        </svg>
      </div>

      {/* ── RETROCRUCE (opcional) ──────────────── */}
      <div className="nf-card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        <div
          className="nf-card-hd"
          style={{ borderBottom: '2px solid #8B5CF6', cursor: 'pointer' }}
          onClick={() => setShowRetrocruce(!showRetrocruce)}
        >
          <div className="nf-card-title" style={{ color: '#8B5CF6', display: 'flex', alignItems: 'center', gap: 8 }}>
            {showRetrocruce ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            RETROCRUCE — Generación F2 (opcional)
          </div>
          <div className="nf-card-meta">Click para expandir</div>
        </div>
        {showRetrocruce && (
          <div className="nf-card-pad">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                  Retrocruce recomendado
                </div>
                <div style={{
                  background: 'var(--neutral-50)', borderRadius: 10, padding: 14,
                  border: '1px solid var(--neutral-200)',
                }}>
                  <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                    <div>♀ F1 (CN × PR) seleccionada</div>
                    <div style={{ fontSize: 18, textAlign: 'center', padding: '4px 0' }}>×</div>
                    <div>♂ Castellana Negra (CN-001 Carbón)</div>
                    <div style={{ borderTop: '1px dashed var(--neutral-300)', margin: '10px 0', padding: '10px 0 0' }}>
                      <strong>= 75% CN + 25% PR</strong>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--neutral-400)', marginTop: 6 }}>
                      Mantiene rusticidad CN + algo de masa muscular PR
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                  ⚠️ Vigilar consanguinidad
                </div>
                <div style={{
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: 10, padding: 14, fontSize: 13, lineHeight: 1.6,
                }}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Coeficiente F:</strong> Mantener &lt; 6%
                  </div>
                  <div>Renovar reproductores cada 3-4 generaciones. Incorporar sangre nueva de criadores externos (intercambio de gallos).</div>
                  <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--neutral-50)', borderRadius: 8, fontSize: 12 }}>
                    <strong>Registro genealógico:</strong> Mantener en /aves con códigos de pasaporte para trazabilidad completa.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Consanguinity note */}
      <div className="nf-card" style={{ marginTop: 20, background: 'rgba(59,130,246,0.05)' }}>
        <div className="nf-card-pad">
          <div style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
            <div style={{ fontSize: 20 }}>ℹ️</div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              <strong>Nota sobre el plan genético:</strong> Estas predicciones se basan en promedios de raza y heterosis típica F1.
              Los resultados reales dependerán de la genética individual de los reproductores seleccionados.
              Se recomienda registrar los resultados reales de cada lote en la sección de producción para calibrar
              las predicciones futuras.
              <Link href="/simulator" style={{ color: 'var(--primary-400)', marginLeft: 6 }}>
                Ir al simulador visual →
              </Link>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
