'use client';

import { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Heart, Shield, Target,
  TrendingUp, Activity, Clock, Award, Dna, Layers,
  FileText, Check, ThumbsUp, ThumbsDown, Minus
} from 'lucide-react';
import { loadProgram, getMeasurements, getEvents, getEvaluation, getOffspring, getParents } from '@/lib/genetics/store';
import type { SelectionProgram, Bird as BirdType } from '@/lib/genetics/types';
import { calculateSelectionScore, scoreColor, rankBirds } from '@/lib/genetics/services/scoring.service';
import { calculateCOI, classifyInbreedingRisk, coiColor, estimateOffspringCOI } from '@/lib/genetics/services/inbreeding.service';
import { gompertzCurve, gompertzWeight, classifyDestination, destinationLabel, destinationEmoji, optimalSlaughterWindow } from '@/lib/genetics/services/gompertz.service';
import { calculateBreedContribution } from '@/lib/genetics/services/pedigree.service';
import { getBreedGompertz, BREED_CATALOG } from '@/lib/genetics/breeds';

/* ══════════════════════════════════════════════════════════════════
 *  ZONE C — SVG Radar Chart (4 axes)
 * ══════════════════════════════════════════════════════════════════ */
function RadarChart({ data }: { data: { label: string; value: number; max: number }[] }) {
  const size = 220, cx = size / 2, cy = size / 2, r = 72;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;

  const point = (i: number, v: number) => {
    const angle = -Math.PI / 2 + i * angleStep;
    return { x: cx + Math.cos(angle) * r * v, y: cy + Math.sin(angle) * r * v };
  };

  const polyPoints = data.map((d, i) => {
    const p = point(i, Math.min(1, d.value / d.max));
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg width="100%" height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(ring => (
        <polygon key={ring} fill="none" stroke="var(--neutral-200)" strokeWidth={0.5}
          points={data.map((_, i) => { const p = point(i, ring); return `${p.x},${p.y}`; }).join(' ')} />
      ))}
      {/* Axes */}
      {data.map((_, i) => {
        const p = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--neutral-200)" strokeWidth={0.5} />;
      })}
      {/* Value polygon */}
      <polygon points={polyPoints} fill="rgba(196,144,53,0.18)" stroke="var(--primary-500)" strokeWidth={2} />
      {/* Value dots */}
      {data.map((d, i) => {
        const p = point(i, Math.min(1, d.value / d.max));
        return <circle key={i} cx={p.x} cy={p.y} r={4.5} fill="var(--primary-500)" stroke="#fff" strokeWidth={1.5} />;
      })}
      {/* Labels */}
      {data.map((d, i) => {
        const p = point(i, 1.28);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            fontSize={10} fontWeight={600} fill="var(--neutral-600)">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════
 *  ZONE C — Interactive Gompertz Chart (large)
 * ══════════════════════════════════════════════════════════════════ */
function GompertzChart({ measurements, breed, sex, currentAge }: {
  measurements: { day: number; peso: number }[];
  breed: string; sex: string; currentAge: number;
}) {
  const params = getBreedGompertz(breed, sex as 'M' | 'F');
  const curve = params ? gompertzCurve(params, 300) : [];
  const w = 480, h = 210, pad = { t: 16, r: 16, b: 28, l: 42 };
  const maxDay = 300;
  const allW = [...curve.map(p => p.w), ...measurements.map(m => m.peso)];
  const maxW = Math.max(...allW, 1);
  const sx = (d: number) => pad.l + (d / maxDay) * (w - pad.l - pad.r);
  const sy = (v: number) => h - pad.b - (v / maxW) * (h - pad.t - pad.b);

  // Slaughter window: target canal weight based on sex
  const targetCanal = sex === 'M' ? 3.5 : 2.0;
  const slaughter = params ? optimalSlaughterWindow(params, targetCanal) : null;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ borderRadius: 8, background: 'var(--neutral-25)' }}>
      {/* Horizontal grid */}
      {[1, 2, 3, 4, 5, 6].map(kg => {
        const yy = sy(kg);
        if (yy < pad.t || yy > h - pad.b) return null;
        return (
          <g key={kg}>
            <line x1={pad.l} y1={yy} x2={w - pad.r} y2={yy} stroke="var(--neutral-100)" strokeWidth={0.5} />
            <text x={pad.l - 4} y={yy + 3} textAnchor="end" fontSize={8} fill="var(--neutral-400)">{kg}kg</text>
          </g>
        );
      })}
      {[0, 50, 100, 150, 200, 250, 300].map(d => (
        <text key={d} x={sx(d)} y={h - pad.b + 14} textAnchor="middle" fontSize={8} fill="var(--neutral-400)">{d}d</text>
      ))}

      {/* Slaughter window band */}
      {slaughter && slaughter.startDay > 0 && (
        <rect x={sx(slaughter.startDay)} y={pad.t}
          width={Math.max(0, sx(slaughter.endDay) - sx(slaughter.startDay))}
          height={h - pad.t - pad.b} fill="#16A34A" opacity={0.06} rx={4} />
      )}

      {/* Gompertz reference curve */}
      {curve.length > 1 && (
        <polyline fill="none" stroke="var(--primary-500)" strokeWidth={2} opacity={0.7}
          points={curve.filter((_, i) => i % 3 === 0).map(p => `${sx(p.t)},${sy(p.w)}`).join(' ')} />
      )}

      {/* Current age marker */}
      {currentAge > 0 && currentAge <= 300 && (
        <>
          <line x1={sx(currentAge)} y1={pad.t} x2={sx(currentAge)} y2={h - pad.b}
            stroke="var(--primary-400)" strokeWidth={1} strokeDasharray="3 3" />
          <text x={sx(currentAge)} y={pad.t - 4} textAnchor="middle" fontSize={8}
            fontWeight={600} fill="var(--primary-600)">HOY</text>
        </>
      )}

      {/* Measurement dots */}
      {measurements.map((m, i) => (
        <g key={i}>
          <circle cx={sx(m.day)} cy={sy(m.peso)} r={5} fill="#3B82F6" stroke="#fff" strokeWidth={1.5} />
          <text x={sx(m.day)} y={sy(m.peso) - 10} textAnchor="middle" fontSize={8}
            fontWeight={600} fill="var(--neutral-700)">
            {m.peso.toFixed(1)}
          </text>
        </g>
      ))}

      {/* Axis labels */}
      <text x={w / 2} y={h - 2} textAnchor="middle" fontSize={9} fill="var(--neutral-500)">Días de vida</text>
      <text x={4} y={pad.t - 4} fontSize={8} fill="var(--neutral-500)">kg</text>

      {curve.length === 0 && (
        <text x={w / 2} y={h / 2} textAnchor="middle" fontSize={11} fill="var(--neutral-400)">
          Sin curva Gompertz de referencia para {breed}
        </text>
      )}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════
 *  ZONE B — Pedigree Tree (3 generations, horizontal)
 * ══════════════════════════════════════════════════════════════════ */
function PedigreeTree({ bird, prog }: { bird: BirdType; prog: SelectionProgram }) {
  const { padre, madre } = getParents(prog, bird.id);
  const abueloP = padre ? getParents(prog, padre.id) : {} as Record<string, undefined>;
  const abueloM = madre ? getParents(prog, madre.id) : {} as Record<string, undefined>;

  const Box = ({ b, label }: { b?: BirdType; label: string }) => (
    <div style={{ padding: '4px 8px', borderRadius: 6, background: 'var(--neutral-50)',
      border: `1px solid ${b ? 'var(--neutral-200)' : 'var(--neutral-100)'}`, fontSize: 10, minWidth: 72 }}>
      <div style={{ color: 'var(--neutral-500)', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      {b ? (
        <Link href={`/genetics/birds/${b.id}`}
          style={{ color: 'var(--neutral-800)', fontWeight: 600, textDecoration: 'none', fontSize: 10 }}>
          {b.sexo === 'M' ? '♂' : '♀'} {b.nombre || b.anilla}
        </Link>
      ) : (
        <span style={{ color: 'var(--neutral-400)' }}>—</span>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', overflowX: 'auto', fontSize: 10, padding: '4px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box b={abueloP.padre} label="Abuelo ♂" />
        <Box b={abueloP.madre} label="Abuela ♀" />
      </div>
      <ChevronRight size={10} style={{ color: 'var(--neutral-400)', flexShrink: 0 }} />
      <Box b={padre} label="Padre ♂" />
      <ChevronRight size={10} style={{ color: 'var(--neutral-400)', flexShrink: 0 }} />
      <div style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--primary-500)',
        color: '#fff', fontWeight: 700, fontSize: 11, textAlign: 'center', whiteSpace: 'nowrap' }}>
        {bird.sexo === 'M' ? '♂' : '♀'} {bird.nombre || bird.anilla}
      </div>
      <ChevronRight size={10} style={{ color: 'var(--neutral-400)', flexShrink: 0 }} />
      <Box b={madre} label="Madre ♀" />
      <ChevronRight size={10} style={{ color: 'var(--neutral-400)', flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box b={abueloM.padre} label="Abuelo ♂" />
        <Box b={abueloM.madre} label="Abuela ♀" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
 *  ZONE E — Life Timeline (horizontal)
 * ══════════════════════════════════════════════════════════════════ */
function LifeTimeline({ events, measurements, birthDate }: {
  events: { fecha: string; tipo: string; descripcion?: string }[];
  measurements: { fecha: string; valor: number }[];
  birthDate: string;
}) {
  const items = [
    { date: birthDate, icon: '🐣', label: 'Nacimiento' },
    ...events.map(e => ({
      date: e.fecha,
      icon: e.tipo === 'caponizacion' ? '✂️' : e.tipo === 'vacunacion' ? '💉'
        : e.tipo === 'sacrificio' ? '🔴' : e.tipo === 'pesada' ? '⚖️' : '📋',
      label: e.tipo.replace(/_/g, ' '),
    })),
    ...measurements.map(m => ({
      date: m.fecha,
      icon: '⚖️',
      label: `${m.valor.toFixed(2)} kg`,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div style={{ display: 'flex', gap: 0, overflowX: 'auto', padding: '8px 0' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 64 }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--neutral-700)', textTransform: 'capitalize',
              textAlign: 'center', maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
            <span style={{ fontSize: 8, color: 'var(--neutral-400)' }}>{item.date}</span>
          </div>
          {i < items.length - 1 && (
            <div style={{ width: 24, height: 1, background: 'var(--neutral-200)', flexShrink: 0 }} />
          )}
        </div>
      ))}
      {items.length === 0 && (
        <div style={{ fontSize: 11, color: 'var(--neutral-400)' }}>Sin eventos registrados</div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
 *  MAIN — Digital Twin (5 Zones)
 *  A: Hero  B: Pedigree/Genetics  C: Cockpit  D: Decisions  E: Timeline
 * ══════════════════════════════════════════════════════════════════ */

export default function DigitalTwinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [prog, setProg] = useState<SelectionProgram | null>(null);

  useEffect(() => { setProg(loadProgram()); }, []);

  /* ── Derived data ── */
  const bird = useMemo(() => prog?.birds.find(b => b.id === id), [prog, id]);
  const measurements = useMemo(() => prog ? getMeasurements(prog, id) : [], [prog, id]);
  const events = useMemo(() => prog ? getEvents(prog, id) : [], [prog, id]);
  const evaluation = useMemo(() => prog ? getEvaluation(prog, id) : undefined, [prog, id]);
  const offspring = useMemo(() => prog ? getOffspring(prog, id) : [], [prog, id]);

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

  const growthData = useMemo(() => {
    if (!bird) return [];
    const birthMs = new Date(bird.fechaNacimiento).getTime();
    return measurements.filter(m => m.tipo === 'peso').map(m => ({
      day: Math.floor((new Date(m.fecha).getTime() - birthMs) / 86400000),
      peso: m.valor,
    }));
  }, [bird, measurements]);

  /* Radar: 4 axes from score breakdown */
  const radarData = useMemo(() => {
    if (!score) return [];
    const get = (c: string) => score.breakdown.find(b => b.criterio === c)?.valor ?? 0;
    return [
      { label: 'Crecimiento', value: get('crecimiento'), max: 100 },
      { label: 'Conformación', value: get('conformacion'), max: 100 },
      { label: 'Rusticidad', value: get('rusticidad'), max: 100 },
      { label: 'Reproductivo', value: get('valor_genetico'), max: 100 },
    ];
  }, [score]);

  /* Gompertz prediction */
  const gompertzPred = useMemo(() => {
    if (!bird) return null;
    const gp = getBreedGompertz(bird.raza, bird.sexo as 'M' | 'F');
    if (!gp) return null;
    const expected = gompertzWeight(gp, ageInDays);
    const deviation = bird.pesoActual ? ((bird.pesoActual - expected) / expected * 100) : null;
    const dest = classifyDestination(gp, bird.sexo as 'M' | 'F', ageInDays);
    return { expected, deviation, dest, params: gp };
  }, [bird, ageInDays]);

  /* Mate recommendations — top compatible partners sorted by score */
  const mateRecs = useMemo(() => {
    if (!bird || !prog) return [];
    const opposites = prog.birds.filter(b =>
      b.sexo !== bird.sexo && b.estadoProductivo === 'activo' && b.id !== bird.id
    );
    return opposites.map(mate => {
      const offCOI = estimateOffspringCOI(
        bird.sexo === 'M' ? bird.id : mate.id,
        bird.sexo === 'F' ? bird.id : mate.id,
        prog.birds,
      );
      const mateScore = calculateSelectionScore(
        mate, prog.birds, prog.measurements, prog.evaluations, prog.selectionWeights,
      ).total;
      return { mate, coi: offCOI, score: mateScore };
    })
    .filter(r => r.coi < 0.0625)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  }, [bird, prog]);

  /* Selection checklist */
  const checklist = useMemo(() => {
    if (!bird || !score) return [];
    return [
      { label: 'Peso en percentil >50', pass: (score.breakdown.find(b => b.criterio === 'crecimiento')?.valor ?? 0) >= 50 },
      { label: 'Conformación ≥3/5', pass: bird.conformacionPecho >= 3 && bird.conformacionMuslo >= 3 },
      { label: 'COI <6.25%', pass: coi < 0.0625 },
      { label: 'Docilidad ≥3/5', pass: bird.docilidad >= 3 },
      { label: 'Score ≥60', pass: score.total >= 60 },
      { label: 'Evaluación canal', pass: !!evaluation },
    ];
  }, [bird, score, coi, evaluation]);

  /* ── Render ── */

  if (!prog || !bird) {
    return (
      <div style={{ padding: 32, color: 'var(--neutral-500)' }}>
        {!prog ? 'Cargando…' : `Ave no encontrada: ${id}`}
        <br />
        <Link href="/genetics/birds" style={{ color: 'var(--primary-500)' }}>← Volver al registro</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 4 }}>

      {/* ═══════ ZONE A — Hero Header ═══════ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--neutral-500)' }}>
        <Link href="/genetics" style={{ color: 'var(--neutral-500)', textDecoration: 'none' }}>Programa</Link>
        <ChevronRight size={12} />
        <Link href="/genetics/birds" style={{ color: 'var(--neutral-500)', textDecoration: 'none' }}>Registro</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--neutral-800)', fontWeight: 600 }}>{bird.anilla}</span>
      </div>

      <div className="nf-card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${bird.sexo === 'M' ? '#3B82F6' : '#EC4899'}22, ${bird.sexo === 'M' ? '#3B82F6' : '#EC4899'}08)`,
          border: `2px solid ${bird.sexo === 'M' ? '#3B82F6' : '#EC4899'}33`, fontSize: 32, flexShrink: 0,
        }}>
          {bird.sexo === 'M' ? '♂' : '♀'}
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--neutral-900)' }}>
              {bird.nombre || bird.anilla}
            </h1>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)', fontSize: 12, color: 'var(--neutral-500)',
              background: 'var(--neutral-50)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--neutral-100)',
            }}>
              {bird.anilla}
            </span>
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 700,
              background: bird.generacion === 'F0' ? '#16A34A15' : bird.generacion === 'F1' ? '#3B82F615' : '#8B5CF615',
              color: bird.generacion === 'F0' ? '#16A34A' : bird.generacion === 'F1' ? '#3B82F6' : '#8B5CF6',
            }}>
              {bird.generacion}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--neutral-500)', marginTop: 4 }}>
            {bird.raza} · Línea {bird.linea} · {ageInDays} días ({Math.round(ageInDays / 7)} sem)
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            {bird.pesoActual && (
              <span style={{ fontSize: 11, color: 'var(--neutral-700)', background: 'var(--neutral-50)', padding: '2px 8px', borderRadius: 4 }}>
                ⚖️ {bird.pesoActual} kg
              </span>
            )}
            {bird.colorPlumaje && (
              <span style={{ fontSize: 11, color: 'var(--neutral-700)', background: 'var(--neutral-50)', padding: '2px 8px', borderRadius: 4 }}>
                🎨 {bird.colorPlumaje}
              </span>
            )}
            {bird.cincoDedos && (
              <span style={{ fontSize: 11, color: '#D97706', background: '#D9770608', padding: '2px 8px', borderRadius: 4 }}>🖐️ 5 dedos</span>
            )}
            {bird.autoSexing && (
              <span style={{ fontSize: 11, color: '#8B5CF6', background: '#8B5CF608', padding: '2px 8px', borderRadius: 4 }}>♻️ Auto-sexing</span>
            )}
            {gompertzPred && (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-700)', background: 'var(--neutral-50)', padding: '2px 8px', borderRadius: 4 }}>
                {destinationEmoji(gompertzPred.dest)} {destinationLabel(gompertzPred.dest)}
              </span>
            )}
          </div>
        </div>

        {/* Score circle */}
        {score && (
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{
              width: 76, height: 76, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `conic-gradient(${scoreColor(score.total)} ${score.total * 3.6}deg, var(--neutral-100) 0deg)`,
              position: 'relative',
            }}>
              <div style={{
                width: 58, height: 58, borderRadius: '50%', background: 'var(--neutral-0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800, color: scoreColor(score.total),
              }}>
                {score.total.toFixed(0)}
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--neutral-500)', marginTop: 4, fontWeight: 600 }}>Score Selección</div>
          </div>
        )}
      </div>

      {/* ═══════ 3-COLUMN LAYOUT: B | C | D ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: 16, alignItems: 'start' }}>

        {/* ═══════ ZONE B — Pedigree & Genetics (Left) ═══════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Pedigree tree */}
          <div className="nf-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--neutral-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Dna size={14} style={{ color: 'var(--primary-500)' }} /> Árbol Genealógico
            </div>
            <PedigreeTree bird={bird} prog={prog} />
          </div>

          {/* COI */}
          <div className="nf-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--neutral-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={14} style={{ color: '#F59E0B' }} /> Consanguinidad
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--neutral-50)' }}>
                <div style={{ fontSize: 9, color: 'var(--neutral-500)', textTransform: 'uppercase' }}>COI</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: coiColor(coi) }}>{(coi * 100).toFixed(2)}%</div>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--neutral-50)' }}>
                <div style={{ fontSize: 9, color: 'var(--neutral-500)', textTransform: 'uppercase' }}>Riesgo</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: coiColor(coi), marginTop: 4 }}>
                  {classifyInbreedingRisk(coi).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Breed composition */}
          <div className="nf-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--neutral-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={14} style={{ color: '#8B5CF6' }} /> Composición Racial
            </div>
            {Object.keys(breedContrib).length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>Fundador — 100% {bird.raza}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {Object.entries(breedContrib).sort((a, b) => b[1] - a[1]).map(([breedName, pct]) => (
                  <div key={breedName} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                    <span style={{ flex: 1, color: 'var(--neutral-600)' }}>{breedName}</span>
                    <div style={{ width: 60, background: 'var(--neutral-100)', borderRadius: 3, height: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary-500)', borderRadius: 3 }} />
                    </div>
                    <span style={{ width: 32, textAlign: 'right', color: 'var(--neutral-700)', fontWeight: 600, fontSize: 10 }}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Offspring */}
          <div className="nf-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--neutral-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Heart size={14} style={{ color: '#EC4899' }} /> Descendencia ({offspring.length})
            </div>
            {offspring.length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>Sin descendencia registrada</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 120, overflowY: 'auto' }}>
                {offspring.slice(0, 10).map(o => (
                  <Link key={o.id} href={`/genetics/birds/${o.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 4px', borderRadius: 4, textDecoration: 'none', fontSize: 10 }}>
                    <span style={{ color: o.sexo === 'M' ? '#3B82F6' : '#EC4899' }}>{o.sexo === 'M' ? '♂' : '♀'}</span>
                    <span style={{ color: 'var(--neutral-700)', fontWeight: 500 }}>{o.anilla}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--neutral-400)', fontSize: 9 }}>{o.generacion}</span>
                  </Link>
                ))}
                {offspring.length > 10 && (
                  <div style={{ fontSize: 9, color: 'var(--neutral-400)', textAlign: 'center' }}>+{offspring.length - 10} más</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ═══════ ZONE C — Cockpit (Center) ═══════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Radar chart */}
          <div className="nf-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--neutral-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Target size={14} style={{ color: 'var(--primary-500)' }} /> Perfil de Selección
            </div>
            {radarData.length > 0 && <RadarChart data={radarData} />}
            {/* Score breakdown compact */}
            {score && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, marginTop: 8 }}>
                {score.breakdown.filter(b => b.pesado !== 0).map(b => (
                  <div key={b.criterio} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                    <span style={{ width: 64, color: 'var(--neutral-500)', textTransform: 'capitalize', fontSize: 9 }}>
                      {b.criterio.replace(/_/g, ' ')}
                    </span>
                    <div style={{ flex: 1, background: 'var(--neutral-100)', borderRadius: 2, height: 6, overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, Math.max(0, b.valor))}%`,
                        height: '100%', borderRadius: 2,
                        background: b.pesado < 0 ? '#DC2626' : b.valor >= 70 ? '#16A34A' : b.valor >= 40 ? '#D97706' : '#DC2626',
                      }} />
                    </div>
                    <span style={{ width: 28, textAlign: 'right', fontWeight: 600, color: 'var(--neutral-600)', fontSize: 9 }}>
                      {b.pesado.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gompertz chart */}
          <div className="nf-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--neutral-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={14} style={{ color: 'var(--primary-500)' }} /> Curva Gompertz
              <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--neutral-400)', fontStyle: 'italic' }}>
                W(t) = A·e^(-e^(-k(t-t₀)))
              </span>
            </div>
            <GompertzChart measurements={growthData} breed={bird.raza} sex={bird.sexo} currentAge={ageInDays} />
            <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 10, color: 'var(--neutral-500)' }}>
              <span>━ Referencia</span>
              <span>● Pesajes reales</span>
              <span style={{ color: '#16A34A' }}>█ Ventana sacrificio</span>
            </div>

            {/* Prediction table */}
            {gompertzPred && (
              <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--neutral-50)', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'var(--neutral-500)' }}>Peso esperado</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--neutral-800)' }}>{gompertzPred.expected.toFixed(2)} kg</div>
                </div>
                <div style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--neutral-50)', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'var(--neutral-500)' }}>Desviación</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: gompertzPred.deviation !== null ? (gompertzPred.deviation > 0 ? '#16A34A' : '#DC2626') : 'var(--neutral-500)' }}>
                    {gompertzPred.deviation !== null ? `${gompertzPred.deviation > 0 ? '+' : ''}${gompertzPred.deviation.toFixed(1)}%` : '—'}
                  </div>
                </div>
                <div style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--neutral-50)', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'var(--neutral-500)' }}>Destino</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {destinationEmoji(gompertzPred.dest)} {destinationLabel(gompertzPred.dest)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Canal evaluation */}
          {evaluation && (
            <div className="nf-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--neutral-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Target size={14} style={{ color: 'var(--primary-500)' }} /> Evaluación Canal
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, fontSize: 10 }}>
                <div style={{ textAlign: 'center', padding: '6px 4px', borderRadius: 6, background: 'var(--neutral-50)' }}>
                  <div style={{ color: 'var(--neutral-400)', fontSize: 8 }}>P.Vivo</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--neutral-800)' }}>{evaluation.pesoVivo} kg</div>
                </div>
                <div style={{ textAlign: 'center', padding: '6px 4px', borderRadius: 6, background: 'var(--neutral-50)' }}>
                  <div style={{ color: 'var(--neutral-400)', fontSize: 8 }}>Canal</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--neutral-800)' }}>{evaluation.pesoCanal} kg</div>
                </div>
                <div style={{ textAlign: 'center', padding: '6px 4px', borderRadius: 6, background: 'var(--neutral-50)' }}>
                  <div style={{ color: 'var(--neutral-400)', fontSize: 8 }}>Rto.</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary-500)' }}>{evaluation.rendimientoCanal}%</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 6 }}>
                <div style={{ textAlign: 'center', padding: '4px', borderRadius: 6, background: 'var(--neutral-50)' }}>
                  <div style={{ color: 'var(--neutral-400)', fontSize: 8 }}>Grasa</div>
                  <div style={{ color: '#F59E0B', fontSize: 11 }}>{'★'.repeat(evaluation.grasaInfiltrada)}{'☆'.repeat(5 - evaluation.grasaInfiltrada)}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '4px', borderRadius: 6, background: 'var(--neutral-50)' }}>
                  <div style={{ color: 'var(--neutral-400)', fontSize: 8 }}>Sabor</div>
                  <div style={{ color: '#F59E0B', fontSize: 11 }}>{'★'.repeat(evaluation.sabor || 0)}{'☆'.repeat(5 - (evaluation.sabor || 0))}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '4px', borderRadius: 6, background: 'var(--neutral-50)' }}>
                  <div style={{ color: 'var(--neutral-400)', fontSize: 8 }}>Textura</div>
                  <div style={{ color: '#F59E0B', fontSize: 11 }}>{'★'.repeat(evaluation.textura || 0)}{'☆'.repeat(5 - (evaluation.textura || 0))}</div>
                </div>
              </div>
              {evaluation.notasOrganolepticas && (
                <div style={{ marginTop: 6, padding: '6px 8px', borderRadius: 6, background: 'var(--neutral-50)',
                  fontSize: 10, color: 'var(--neutral-600)', fontStyle: 'italic' }}>
                  «{evaluation.notasOrganolepticas}»
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════ ZONE D — Decision Panel (Right) ═══════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Decision buttons */}
          <div className="nf-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: 'var(--neutral-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={14} style={{ color: 'var(--primary-500)' }} /> Decisión
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {([
                { key: 'apto', label: 'APTO', color: '#16A34A', Icon: ThumbsUp },
                { key: 'observacion', label: 'OBSERVAR', color: '#D97706', Icon: Minus },
                { key: 'descartado', label: 'DESCARTAR', color: '#DC2626', Icon: ThumbsDown },
              ] as const).map(btn => (
                <button key={btn.key} style={{
                  flex: 1, padding: '8px 0', borderRadius: 8,
                  border: `2px solid ${bird.estadoSeleccion === btn.key ? btn.color : 'var(--neutral-200)'}`,
                  background: bird.estadoSeleccion === btn.key ? `${btn.color}10` : 'var(--neutral-0)',
                  cursor: 'pointer', color: btn.color, fontWeight: 700, fontSize: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                }}>
                  <btn.Icon size={13} /> {btn.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: 'var(--neutral-500)', textAlign: 'center' }}>
              Estado actual:{' '}
              <b style={{ color: bird.estadoSeleccion === 'apto' ? '#16A34A' : bird.estadoSeleccion === 'descartado' ? '#DC2626' : '#D97706' }}>
                {(bird.estadoSeleccion || 'pendiente').toUpperCase()}
              </b>
            </div>
          </div>

          {/* Selection checklist */}
          <div className="nf-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--neutral-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Check size={14} style={{ color: '#16A34A' }} /> Checklist Selección
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {checklist.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: c.pass ? '#16A34A15' : '#DC262615',
                    color: c.pass ? '#16A34A' : '#DC2626', fontSize: 10, fontWeight: 700,
                  }}>
                    {c.pass ? '✓' : '✗'}
                  </span>
                  <span style={{ color: c.pass ? 'var(--neutral-700)' : 'var(--neutral-400)' }}>{c.label}</span>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 8, padding: '6px 8px', borderRadius: 6,
              background: checklist.filter(c => c.pass).length >= 5 ? '#16A34A08' : '#D9770608',
              fontSize: 10, fontWeight: 600, textAlign: 'center',
              color: checklist.filter(c => c.pass).length >= 5 ? '#16A34A' : '#D97706',
            }}>
              {checklist.filter(c => c.pass).length}/{checklist.length} criterios cumplidos
            </div>
          </div>

          {/* Mate recommendations */}
          <div className="nf-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--neutral-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Heart size={14} style={{ color: '#EC4899' }} /> Parejas Recomendadas
            </div>
            {mateRecs.length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>Sin parejas compatibles disponibles</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {mateRecs.map((r, i) => (
                  <Link key={r.mate.id} href={`/genetics/birds/${r.mate.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px',
                      borderRadius: 6, textDecoration: 'none',
                      background: i === 0 ? 'rgba(196,144,53,0.05)' : 'transparent',
                      border: i === 0 ? '1px solid var(--neutral-100)' : '1px solid transparent',
                    }}>
                    <span style={{ fontSize: 12, color: r.mate.sexo === 'M' ? '#3B82F6' : '#EC4899' }}>
                      {r.mate.sexo === 'M' ? '♂' : '♀'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--neutral-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.mate.nombre || r.mate.anilla}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--neutral-400)' }}>{r.mate.generacion} · {r.mate.raza}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: scoreColor(r.score) }}>{r.score.toFixed(0)}</div>
                      <div style={{ fontSize: 8, color: coiColor(r.coi) }}>COI {(r.coi * 100).toFixed(1)}%</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Conformación stars */}
          <div className="nf-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--neutral-800)' }}>
              ⭐ Conformación
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { label: 'Pecho', val: bird.conformacionPecho },
                { label: 'Muslo', val: bird.conformacionMuslo },
                { label: 'Docilidad', val: bird.docilidad },
              ].map(attr => (
                <div key={attr.label} style={{ padding: '4px 6px', borderRadius: 6, background: 'var(--neutral-50)' }}>
                  <div style={{ fontSize: 9, color: 'var(--neutral-500)' }}>{attr.label}</div>
                  <div style={{ color: '#F59E0B', fontSize: 12 }}>
                    {attr.val ? '★'.repeat(attr.val) + '☆'.repeat(5 - attr.val) : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 6 }}>
            <Link href={`/genetics/birds/${id}/passport`}
              style={{
                flex: 1, textDecoration: 'none', textAlign: 'center', fontSize: 10,
                padding: '6px 8px', borderRadius: 6, border: '1px solid var(--neutral-200)',
                color: 'var(--neutral-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
              <FileText size={12} /> Pasaporte
            </Link>
            <Link href="/genetics/quick-entry"
              style={{
                flex: 1, textDecoration: 'none', textAlign: 'center', fontSize: 10,
                padding: '6px 8px', borderRadius: 6, border: '1px solid var(--neutral-200)',
                color: 'var(--neutral-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
              <Activity size={12} /> Registrar
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════ ZONE E — Life Timeline (Bottom) ═══════ */}
      <div className="nf-card" style={{ padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--neutral-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={14} style={{ color: 'var(--primary-500)' }} /> Línea de Vida
        </div>
        <LifeTimeline
          events={events}
          measurements={measurements.filter(m => m.tipo === 'peso')}
          birthDate={bird.fechaNacimiento}
        />
      </div>
    </div>
  );
}
