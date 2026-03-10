'use client';

import { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import {
  Bird, ChevronRight, ArrowLeft, Heart, Shield, Target,
  TrendingUp, Activity, Calendar, Weight, Ruler, FileText,
  Star, AlertTriangle, Dna, Layers, BarChart2, Eye
} from 'lucide-react';
import { loadProgram, getMeasurements, getEvents, getEvaluation, getOffspring, getParents, getBird } from '@/lib/genetics/store';
import type { SelectionProgram, Bird as BirdType } from '@/lib/genetics/types';
import { calculateSelectionScore, scoreColor } from '@/lib/genetics/services/scoring.service';
import { calculateCOI, classifyInbreedingRisk, coiColor, coiLabel } from '@/lib/genetics/services/inbreeding.service';
import { gompertzCurve, gompertzWeight, predictWeight } from '@/lib/genetics/services/gompertz.service';
import { getPedigree, calculateBreedContribution } from '@/lib/genetics/services/pedigree.service';
import { getBreedGompertz } from '@/lib/genetics/breeds';

/* ── Growth mini chart (SVG) ── */
function GrowthChart({ measurements, breed, sex }: { measurements: { day: number; peso: number }[]; breed: string; sex: string }) {
  const params = getBreedGompertz(breed, sex as 'M' | 'F');
  const curve = params ? gompertzCurve(params, 300) : [];
  const w = 300, h = 120, pad = 20;
  const maxDay = Math.max(300, ...measurements.map(m => m.day));
  const maxW = Math.max(...curve.map(p => p.w), ...measurements.map(m => m.peso), 1);
  const sx = (d: number) => pad + (d / maxDay) * (w - pad * 2);
  const sy = (v: number) => h - pad - (v / maxW) * (h - pad * 2);

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ borderRadius: 6 }}>
      {/* Axes */}
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="var(--neutral-700)" strokeWidth={0.5} />
      <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="var(--neutral-700)" strokeWidth={0.5} />
      {/* Gompertz curve */}
      {curve.length > 1 && (
        <polyline fill="none" stroke="var(--primary)" strokeWidth={1.5} strokeDasharray="4 2" opacity={0.5}
          points={curve.filter((_, i) => i % 5 === 0).map(p => `${sx(p.t)},${sy(p.w)}`).join(' ')} />
      )}
      {/* Real measurements */}
      {measurements.map((m, i) => (
        <g key={i}>
          <circle cx={sx(m.day)} cy={sy(m.peso)} r={4} fill="#3B82F6" stroke="#fff" strokeWidth={1} />
          <text x={sx(m.day)} y={sy(m.peso) - 8} textAnchor="middle" fontSize={8} fill="var(--neutral-300)">
            {m.peso.toFixed(1)}
          </text>
        </g>
      ))}
      {/* Labels */}
      <text x={w / 2} y={h - 2} textAnchor="middle" fontSize={8} fill="var(--neutral-500)">Días</text>
      <text x={4} y={pad - 4} fontSize={8} fill="var(--neutral-500)">kg</text>
      {curve.length === 0 && (
        <text x={w / 2} y={h / 2} textAnchor="middle" fontSize={10} fill="var(--neutral-500)">
          Sin curva Gompertz de referencia
        </text>
      )}
    </svg>
  );
}

/* ── Pedigree mini tree ── */
function MiniPedigree({ bird, prog }: { bird: BirdType; prog: SelectionProgram }) {
  const { padre, madre } = getParents(prog, bird.id);
  const abueloP = padre ? getParents(prog, padre.id) : {};
  const abueloM = madre ? getParents(prog, madre.id) : {};

  const Box = ({ b, label }: { b?: BirdType; label: string }) => (
    <div style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(var(--primary-rgb,180,130,50),0.05)',
      border: `1px solid ${b ? 'var(--neutral-700)' : 'var(--neutral-800)'}`, fontSize: 10, minWidth: 80 }}>
      <div style={{ color: 'var(--neutral-500)', fontSize: 9 }}>{label}</div>
      {b ? (
        <Link href={`/genetics/birds/${b.id}`} style={{ color: 'var(--neutral-200)', fontWeight: 600, textDecoration: 'none' }}>
          {b.sexo === 'M' ? '♂' : '♀'} {b.nombre || b.anilla}
        </Link>
      ) : (
        <span style={{ color: 'var(--neutral-600)' }}>Desconocido</span>
      )}
      {b && <div style={{ color: 'var(--neutral-500)', fontSize: 9 }}>{b.raza}</div>}
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box b={abueloP.padre} label="Abuelo ♂" />
        <Box b={abueloP.madre} label="Abuela ♀" />
      </div>
      <ChevronRight size={12} style={{ color: 'var(--neutral-600)', flexShrink: 0 }} />
      <Box b={padre} label="Padre ♂" />
      <ChevronRight size={12} style={{ color: 'var(--neutral-600)', flexShrink: 0 }} />
      <div style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 11, textAlign: 'center' }}>
        {bird.sexo === 'M' ? '♂' : '♀'} {bird.nombre || bird.anilla}
      </div>
      <ChevronRight size={12} style={{ color: 'var(--neutral-600)', flexShrink: 0 }} />
      <Box b={madre} label="Madre ♀" />
      <ChevronRight size={12} style={{ color: 'var(--neutral-600)', flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box b={abueloM.padre} label="Abuelo ♂" />
        <Box b={abueloM.madre} label="Abuela ♀" />
      </div>
    </div>
  );
}

/* ── Score Radar (simple bars) ── */
function ScoreBreakdown({ breakdown }: { breakdown: { criterio: string; valor: number; pesado: number }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {breakdown.filter(b => b.pesado !== 0).map(b => (
        <div key={b.criterio} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
          <span style={{ width: 100, color: 'var(--neutral-400)', textTransform: 'capitalize' }}>{b.criterio.replace(/_/g, ' ')}</span>
          <div style={{ flex: 1, background: 'var(--neutral-800)', borderRadius: 3, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(0, Math.min(100, b.valor))}%`, height: '100%', borderRadius: 3,
              background: b.pesado < 0 ? '#DC2626' : b.valor >= 70 ? '#16A34A' : b.valor >= 40 ? '#F59E0B' : '#DC2626' }} />
          </div>
          <span style={{ width: 35, textAlign: 'right', fontWeight: 600, color: 'var(--neutral-300)' }}>{b.pesado.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
 *  MAIN — Digital Twin
 * ══════════════════════════════════════════════════════════════════ */

export default function DigitalTwinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [prog, setProg] = useState<SelectionProgram | null>(null);
  const [tab, setTab] = useState<'overview' | 'growth' | 'pedigree' | 'events'>('overview');

  useEffect(() => { setProg(loadProgram()); }, []);

  const bird = useMemo(() => prog?.birds.find(b => b.id === id), [prog, id]);
  const measurements = useMemo(() => prog ? getMeasurements(prog, id) : [], [prog, id]);
  const events = useMemo(() => prog ? getEvents(prog, id) : [], [prog, id]);
  const evaluation = useMemo(() => prog ? getEvaluation(prog, id) : undefined, [prog, id]);
  const offspring = useMemo(() => prog ? getOffspring(prog, id) : [], [prog, id]);
  const parents = useMemo(() => prog ? getParents(prog, id) : {}, [prog, id]);

  const score = useMemo(() => {
    if (!bird || !prog) return null;
    return calculateSelectionScore(bird, prog.birds, prog.measurements, prog.evaluations, prog.selectionWeights);
  }, [bird, prog]);

  const coi = useMemo(() => {
    if (!bird || !prog) return 0;
    return calculateCOI(bird.id, prog.birds);
  }, [bird, prog]);

  const breedContrib = useMemo(() => {
    if (!bird || !prog) return {};
    return calculateBreedContribution(bird.id, prog.birds);
  }, [bird, prog]);

  const ageInDays = useMemo(() => {
    if (!bird) return 0;
    return Math.floor((Date.now() - new Date(bird.fechaNacimiento).getTime()) / 86400000);
  }, [bird]);

  /* Growth data for chart */
  const growthData = useMemo(() => {
    if (!bird) return [];
    const birthMs = new Date(bird.fechaNacimiento).getTime();
    return measurements.filter(m => m.tipo === 'peso').map(m => ({
      day: Math.floor((new Date(m.fecha).getTime() - birthMs) / 86400000),
      peso: m.valor,
    }));
  }, [bird, measurements]);

  if (!prog || !bird) {
    return (
      <div style={{ padding: 32, color: 'var(--neutral-400)' }}>
        {!prog ? 'Cargando…' : `Ave no encontrada: ${id}`}
        <br /><Link href="/genetics/birds" style={{ color: 'var(--primary)' }}>← Volver al registro</Link>
      </div>
    );
  }

  const destEmoji: Record<string, string> = {
    reproductor: '🧬', capon_grande: '🍗', capon_medio: '🐔', pollo_gourmet: '🍽️',
    ponedora: '🥚', picanton: '🐣', descarte: '❌',
  };
  const destLabel: Record<string, string> = {
    reproductor: 'Reproductor', capon_grande: 'Capón Grande', capon_medio: 'Capón Medio',
    pollo_gourmet: 'Pollo Gourmet', ponedora: 'Ponedora', picanton: 'Picantón', descarte: 'Descarte',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 4 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--neutral-400)' }}>
        <Link href="/genetics" style={{ color: 'var(--neutral-400)', textDecoration: 'none' }}>Programa</Link>
        <ChevronRight size={12} />
        <Link href="/genetics/birds" style={{ color: 'var(--neutral-400)', textDecoration: 'none' }}>Registro</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--neutral-200)' }}>{bird.anilla}</span>
      </div>

      {/* Hero Header */}
      <div className="nf-card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Bird avatar */}
        <div style={{ width: 80, height: 80, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${bird.sexo === 'M' ? '#3B82F6' : '#EC4899'}33, ${bird.sexo === 'M' ? '#3B82F6' : '#EC4899'}11)`,
          border: `2px solid ${bird.sexo === 'M' ? '#3B82F6' : '#EC4899'}44`, fontSize: 36, flexShrink: 0 }}>
          {bird.sexo === 'M' ? '♂' : '♀'}
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--neutral-100)' }}>
              {bird.nombre || bird.anilla}
            </h1>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--neutral-400)', background: 'var(--neutral-800)', padding: '2px 8px', borderRadius: 4 }}>
              {bird.anilla}
            </span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 700,
              background: bird.generacion === 'F0' ? '#16A34A22' : bird.generacion === 'F1' ? '#3B82F622' : '#8B5CF622',
              color: bird.generacion === 'F0' ? '#16A34A' : bird.generacion === 'F1' ? '#3B82F6' : '#8B5CF6' }}>
              {bird.generacion}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--neutral-400)', marginTop: 4 }}>
            {bird.raza} · Línea {bird.linea} · {ageInDays} días ({Math.round(ageInDays / 7)} semanas)
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            {bird.pesoActual && (
              <span style={{ fontSize: 11, color: 'var(--neutral-300)' }}>⚖️ {bird.pesoActual} kg</span>
            )}
            {bird.colorPlumaje && (
              <span style={{ fontSize: 11, color: 'var(--neutral-300)' }}>🎨 {bird.colorPlumaje}</span>
            )}
            {bird.cincoDedos && <span style={{ fontSize: 11, color: '#F59E0B' }}>🖐️ 5 dedos</span>}
            {bird.autoSexing && <span style={{ fontSize: 11, color: '#8B5CF6' }}>♻️ Auto-sexing</span>}
            {bird.destinoRecomendado && (
              <span style={{ fontSize: 11 }}>
                {destEmoji[bird.destinoRecomendado] || '📋'} {destLabel[bird.destinoRecomendado] || bird.destinoRecomendado}
              </span>
            )}
          </div>
        </div>

        {/* Score circle */}
        {score && (
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `conic-gradient(${scoreColor(score.total)} ${score.total * 3.6}deg, var(--neutral-800) 0deg)`, position: 'relative' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--neutral-900)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: scoreColor(score.total) }}>
                {score.total.toFixed(0)}
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--neutral-500)', marginTop: 4 }}>Score Selección</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--neutral-800)' }}>
        {(['overview', 'growth', 'pedigree', 'events'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 16px', fontSize: 12, fontWeight: tab === t ? 600 : 400, border: 'none', cursor: 'pointer',
              background: 'transparent', color: tab === t ? 'var(--primary)' : 'var(--neutral-400)',
              borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent' }}>
            {t === 'overview' ? '📊 General' : t === 'growth' ? '📈 Crecimiento' : t === 'pedigree' ? '🧬 Pedigrí' : '📋 Eventos'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Score Breakdown */}
          {score && (
            <div className="nf-card">
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-200)' }}>
                <Target size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Desglose de Score
              </div>
              <ScoreBreakdown breakdown={score.breakdown} />
            </div>
          )}

          {/* Conformación */}
          <div className="nf-card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-200)' }}>
              <Star size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Conformación
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Pecho', val: bird.conformacionPecho },
                { label: 'Muslo', val: bird.conformacionMuslo },
                { label: 'Docilidad', val: bird.docilidad },
              ].map(attr => (
                <div key={attr.label} style={{ padding: '6px 8px', borderRadius: 6, background: 'rgba(var(--primary-rgb,180,130,50),0.03)' }}>
                  <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>{attr.label}</div>
                  <div style={{ fontSize: 14, color: '#F59E0B' }}>
                    {attr.val ? '★'.repeat(attr.val) + '☆'.repeat(5 - attr.val) : '—'}
                  </div>
                </div>
              ))}

              {/* COI */}
              <div style={{ padding: '6px 8px', borderRadius: 6, background: 'rgba(var(--primary-rgb,180,130,50),0.03)' }}>
                <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>COI</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: coiColor(coi) }}>
                  {(coi * 100).toFixed(2)}%
                </div>
                <div style={{ fontSize: 9, color: coiColor(coi) }}>{coiLabel(coi)}</div>
              </div>
            </div>
          </div>

          {/* Breed Contribution */}
          <div className="nf-card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-200)' }}>
              <Dna size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Contribución Racial
            </div>
            {Object.keys(breedContrib).length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--neutral-500)' }}>Fundador — 100% {bird.raza}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {Object.entries(breedContrib).sort((a, b) => b[1] - a[1]).map(([breed, pct]) => (
                  <div key={breed} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                    <span style={{ width: 100, color: 'var(--neutral-400)' }}>{breed}</span>
                    <div style={{ flex: 1, background: 'var(--neutral-800)', borderRadius: 3, height: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
                    </div>
                    <span style={{ width: 35, textAlign: 'right', color: 'var(--neutral-300)', fontWeight: 600 }}>{pct.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Offspring */}
          <div className="nf-card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-200)' }}>
              <Layers size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Descendencia ({offspring.length})
            </div>
            {offspring.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--neutral-500)' }}>Sin descendencia registrada</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 160, overflowY: 'auto' }}>
                {offspring.slice(0, 20).map(o => (
                  <Link key={o.id} href={`/genetics/birds/${o.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 6px', borderRadius: 4, textDecoration: 'none', fontSize: 11 }}>
                    <span style={{ color: o.sexo === 'M' ? '#3B82F6' : '#EC4899' }}>{o.sexo === 'M' ? '♂' : '♀'}</span>
                    <span style={{ color: 'var(--neutral-200)' }}>{o.anilla}</span>
                    <span style={{ color: 'var(--neutral-500)' }}>{o.generacion}</span>
                    {o.pesoActual && <span style={{ marginLeft: 'auto', color: 'var(--neutral-400)' }}>{o.pesoActual}kg</span>}
                  </Link>
                ))}
                {offspring.length > 20 && (
                  <div style={{ fontSize: 10, color: 'var(--neutral-500)', textAlign: 'center' }}>
                    +{offspring.length - 20} más
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Canal evaluation */}
          {evaluation && (
            <div className="nf-card" style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-200)' }}>
                <Target size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Evaluación de Canal
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                <div className="nf-kbox">
                  <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>Peso vivo</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--neutral-100)' }}>{evaluation.pesoVivo} kg</div>
                </div>
                <div className="nf-kbox">
                  <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>Peso canal</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--neutral-100)' }}>{evaluation.pesoCanal} kg</div>
                </div>
                <div className="nf-kbox">
                  <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>Rendimiento</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{evaluation.rendimientoCanal}%</div>
                </div>
                <div className="nf-kbox">
                  <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>Grasa infiltr.</div>
                  <div style={{ fontSize: 14, color: '#F59E0B' }}>{'★'.repeat(evaluation.grasaInfiltrada)}{'☆'.repeat(5 - evaluation.grasaInfiltrada)}</div>
                </div>
                <div className="nf-kbox">
                  <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>Sabor</div>
                  <div style={{ fontSize: 14, color: '#F59E0B' }}>{'★'.repeat(evaluation.sabor || 0)}{'☆'.repeat(5 - (evaluation.sabor || 0))}</div>
                </div>
              </div>
              {evaluation.notasOrganolepticas && (
                <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 6, background: 'rgba(var(--primary-rgb,180,130,50),0.03)', fontSize: 12, color: 'var(--neutral-300)', fontStyle: 'italic' }}>
                  {evaluation.notasOrganolepticas}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'growth' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="nf-card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-200)' }}>
              <TrendingUp size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Curva de Crecimiento
            </div>
            <GrowthChart measurements={growthData} breed={bird.raza} sex={bird.sexo} />
            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10, color: 'var(--neutral-400)' }}>
              <span>— Curva Gompertz referencia</span>
              <span>● Pesajes reales</span>
            </div>
          </div>

          <div className="nf-card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-200)' }}>
              Historial de Pesajes
            </div>
            {measurements.filter(m => m.tipo === 'peso').length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--neutral-500)' }}>Sin pesajes registrados</div>
            ) : (
              <table className="nf-table" style={{ width: '100%', fontSize: 11 }}>
                <thead>
                  <tr><th>Fecha</th><th>Día</th><th>Peso (kg)</th></tr>
                </thead>
                <tbody>
                  {measurements.filter(m => m.tipo === 'peso').map(m => {
                    const day = Math.floor((new Date(m.fecha).getTime() - new Date(bird.fechaNacimiento).getTime()) / 86400000);
                    return (
                      <tr key={m.id}>
                        <td style={{ color: 'var(--neutral-300)' }}>{m.fecha}</td>
                        <td style={{ color: 'var(--neutral-500)' }}>d{day}</td>
                        <td style={{ fontWeight: 600, color: 'var(--neutral-200)' }}>{m.valor.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'pedigree' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="nf-card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--neutral-200)' }}>
              <Dna size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Árbol Genealógico
            </div>
            <div style={{ overflowX: 'auto' }}>
              <MiniPedigree bird={bird} prog={prog} />
            </div>
          </div>

          <div className="nf-card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-200)' }}>
              <Shield size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Análisis de Consanguinidad
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="nf-kbox">
                <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>COI</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: coiColor(coi) }}>{(coi * 100).toFixed(2)}%</div>
                <div style={{ fontSize: 10, color: coiColor(coi) }}>{coiLabel(coi)}</div>
              </div>
              <div className="nf-kbox">
                <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>Riesgo</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: coiColor(coi) }}>
                  {classifyInbreedingRisk(coi).toUpperCase()}
                </div>
              </div>
              <div className="nf-kbox">
                <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>Generación</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-100)' }}>{bird.generacion}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'events' && (
        <div className="nf-card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-200)' }}>
            <Calendar size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Historial de Eventos
          </div>
          {events.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--neutral-500)' }}>Sin eventos registrados</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {events.map((e, i) => (
                <div key={e.id} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < events.length - 1 ? '1px solid var(--neutral-800)' : 'none' }}>
                  <div style={{ width: 30, textAlign: 'center' }}>
                    <span style={{ fontSize: 16 }}>
                      {e.tipo === 'nacimiento' ? '🐣' : e.tipo === 'caponizacion' ? '✂️' : e.tipo === 'sacrificio' ? '🔴' : e.tipo === 'vacunacion' ? '💉' : e.tipo === 'pesada' ? '⚖️' : '📋'}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--neutral-200)', textTransform: 'capitalize' }}>
                      {e.tipo.replace(/_/g, ' ')}
                    </div>
                    {e.descripcion && <div style={{ fontSize: 11, color: 'var(--neutral-400)', marginTop: 2 }}>{e.descripcion}</div>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--neutral-500)', whiteSpace: 'nowrap' }}>{e.fecha}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
