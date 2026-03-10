'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp, Bird, BarChart2, Beaker, ChevronRight,
  Target, Activity, Sliders
} from 'lucide-react';
import { loadProgram, getMeasurements } from '@/lib/genetics/store';
import type { SelectionProgram, Bird as BirdType } from '@/lib/genetics/types';
import { gompertzWeight, gompertzCurve, predictWeight, optimalSlaughterWindow, classifyDestination, destinationLabel, destinationEmoji } from '@/lib/genetics/services/gompertz.service';
import { getBreedGompertz, BREED_CATALOG } from '@/lib/genetics/breeds';
import type { GompertzParams } from '@/lib/genetics/types';

/* ── SVG Growth Chart ── */
function GrowthChartFull({ curves, measurements, highlightBird }: {
  curves: { label: string; color: string; params: GompertzParams }[];
  measurements: { birdId: string; day: number; peso: number; label: string }[];
  highlightBird: string | null;
}) {
  const w = 560, h = 220, pad = { t: 20, r: 20, b: 30, l: 40 };
  const maxDay = 300;
  const allWeights = [
    ...curves.flatMap(c => gompertzCurve(c.params, maxDay).map(p => p.w)),
    ...measurements.map(m => m.peso),
  ];
  const maxW = Math.max(...allWeights, 1);
  const sx = (d: number) => pad.l + (d / maxDay) * (w - pad.l - pad.r);
  const sy = (v: number) => h - pad.b - (v / maxW) * (h - pad.t - pad.b);

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ borderRadius: 8, background: 'rgba(var(--primary-rgb,180,130,50),0.02)' }}>
      {/* Grid */}
      {[0, 1, 2, 3, 4, 5, 6].map(kg => {
        const yy = sy(kg);
        if (yy < pad.t || yy > h - pad.b) return null;
        return (
          <g key={kg}>
            <line x1={pad.l} y1={yy} x2={w - pad.r} y2={yy} stroke="var(--neutral-800)" strokeWidth={0.5} />
            <text x={pad.l - 4} y={yy + 3} textAnchor="end" fontSize={8} fill="var(--neutral-500)">{kg}kg</text>
          </g>
        );
      })}
      {[0, 50, 100, 150, 200, 250, 300].map(d => (
        <text key={d} x={sx(d)} y={h - pad.b + 14} textAnchor="middle" fontSize={8} fill="var(--neutral-500)">{d}d</text>
      ))}

      {/* Curves */}
      {curves.map(c => {
        const pts = gompertzCurve(c.params, maxDay).filter((_, i) => i % 3 === 0);
        return (
          <g key={c.label}>
            <polyline fill="none" stroke={c.color} strokeWidth={1.5} opacity={0.6}
              points={pts.map(p => `${sx(p.t)},${sy(p.w)}`).join(' ')} />
            {pts.length > 0 && (
              <text x={sx(pts[pts.length - 1].t) + 2} y={sy(pts[pts.length - 1].w) - 4}
                fontSize={8} fill={c.color}>{c.label}</text>
            )}
          </g>
        );
      })}

      {/* Real measurements */}
      {measurements.map((m, i) => (
        <circle key={i} cx={sx(m.day)} cy={sy(m.peso)} r={highlightBird === m.birdId ? 5 : 3}
          fill={highlightBird === m.birdId ? '#3B82F6' : 'var(--primary)'} stroke="#fff" strokeWidth={0.5}
          opacity={highlightBird && highlightBird !== m.birdId ? 0.2 : 0.8}>
          <title>{m.label}: {m.peso.toFixed(2)}kg @ d{m.day}</title>
        </circle>
      ))}

      {/* Axes labels */}
      <text x={w / 2} y={h - 2} textAnchor="middle" fontSize={9} fill="var(--neutral-400)">Días de vida</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════
 *  MAIN — Growth Lab
 * ══════════════════════════════════════════════════════════════════ */

export default function GrowthLabPage() {
  const [prog, setProg] = useState<SelectionProgram | null>(null);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>(['Malines', 'Dorking', 'Bresse']);
  const [sex, setSex] = useState<'M' | 'F'>('M');
  const [highlightBird, setHighlightBird] = useState<string | null>(null);
  const [predDay, setPredDay] = useState(150);

  useEffect(() => { setProg(loadProgram()); }, []);

  /* Build curves from selected breeds */
  const curves = useMemo(() => {
    const colors = ['#3B82F6', '#EC4899', '#16A34A', '#F59E0B', '#8B5CF6', '#DC2626'];
    return selectedBreeds.map((breed, i) => {
      const params = getBreedGompertz(breed, sex);
      if (!params) return null;
      return { label: breed, color: colors[i % colors.length], params };
    }).filter(Boolean) as { label: string; color: string; params: GompertzParams }[];
  }, [selectedBreeds, sex]);

  /* All measurement points */
  const allMeasurements = useMemo(() => {
    if (!prog) return [];
    const pts: { birdId: string; day: number; peso: number; label: string }[] = [];
    for (const bird of prog.birds) {
      if (bird.sexo !== sex) continue;
      const birthMs = new Date(bird.fechaNacimiento).getTime();
      const ms = getMeasurements(prog, bird.id).filter(m => m.tipo === 'peso');
      for (const m of ms) {
        const day = Math.floor((new Date(m.fecha).getTime() - birthMs) / 86400000);
        if (day > 0 && day <= 300) {
          pts.push({ birdId: bird.id, day, peso: m.valor, label: bird.anilla });
        }
      }
    }
    return pts;
  }, [prog, sex]);

  /* Per-breed predictions at target day */
  const predictions = useMemo(() =>
    curves.map(c => ({
      breed: c.label, color: c.color,
      weight: gompertzWeight(c.params, predDay),
      dest: classifyDestination(c.params, sex, predDay),
    })),
    [curves, predDay, sex]
  );

  /* Bird list for analysis */
  const birdsCurrent = useMemo(() => {
    if (!prog) return [];
    return prog.birds.filter(b => b.sexo === sex && b.estadoProductivo === 'activo')
      .map(b => {
        const ageD = Math.floor((Date.now() - new Date(b.fechaNacimiento).getTime()) / 86400000);
        // Try to match breed for Gompertz
        const breedEntry = BREED_CATALOG.find(entry =>
          b.raza.includes(entry.nombre) || entry.nombre.includes(b.raza)
        );
        const params = breedEntry ? getBreedGompertz(breedEntry.nombre, sex) : null;
        const predicted = params ? gompertzWeight(params, ageD) : null;
        const deviation = predicted && b.pesoActual ? ((b.pesoActual - predicted) / predicted * 100) : null;
        return { bird: b, ageD, predicted, deviation, dest: params ? classifyDestination(params, sex, ageD) : null };
      })
      .sort((a, b) => (b.deviation || 0) - (a.deviation || 0));
  }, [prog, sex]);

  if (!prog) return <div style={{ padding: 32, color: 'var(--neutral-400)' }}>Cargando…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 4 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/genetics" style={{ color: 'var(--neutral-400)', textDecoration: 'none', fontSize: 12 }}>← Programa</Link>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--neutral-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={20} style={{ color: 'var(--primary)' }} /> Growth Lab
        </h1>
        <span style={{ fontSize: 11, color: 'var(--neutral-400)' }}>Curvas Gompertz · Predicción · Clasificación</span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={`nf-btn nf-btn-sm${sex === 'M' ? '' : ' nf-btn-ghost'}`} onClick={() => setSex('M')} style={{ fontSize: 11 }}>♂ Machos</button>
          <button className={`nf-btn nf-btn-sm${sex === 'F' ? '' : ' nf-btn-ghost'}`} onClick={() => setSex('F')} style={{ fontSize: 11 }}>♀ Hembras</button>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {BREED_CATALOG.map(breed => {
            const active = selectedBreeds.includes(breed.nombre);
            return (
              <button key={breed.nombre} onClick={() => setSelectedBreeds(active ? selectedBreeds.filter(b => b !== breed.nombre) : [...selectedBreeds, breed.nombre])}
                className={`nf-btn nf-btn-sm${active ? '' : ' nf-btn-ghost'}`}
                style={{ fontSize: 10, padding: '2px 8px', opacity: active ? 1 : 0.5 }}>
                {breed.nombre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="nf-card">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--neutral-200)' }}>
          <BarChart2 size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          Comparative W(t) = A × e^(-e^(-k(t-t₀)))
        </div>
        <GrowthChartFull curves={curves} measurements={allMeasurements} highlightBird={highlightBird} />
        <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          {curves.map(c => (
            <span key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
              <span style={{ width: 10, height: 2, background: c.color, display: 'inline-block' }} />
              <span style={{ color: 'var(--neutral-400)' }}>{c.label}</span>
            </span>
          ))}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
            <span style={{ color: 'var(--neutral-400)' }}>Datos reales ({sex})</span>
          </span>
        </div>
      </div>

      {/* Prediction slider */}
      <div className="nf-card">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--neutral-200)' }}>
          <Target size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          Predicción a día {predDay}
        </div>
        <input type="range" min={30} max={300} step={5} value={predDay} onChange={e => setPredDay(+e.target.value)}
          style={{ width: '100%', accentColor: 'var(--primary)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, marginTop: 8 }}>
          {predictions.map(p => (
            <div key={p.breed} style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(var(--primary-rgb,180,130,50),0.03)', borderLeft: `3px solid ${p.color}` }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--neutral-200)' }}>{p.breed}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--neutral-100)' }}>{p.weight.toFixed(2)} kg</div>
              <div style={{ fontSize: 10, color: 'var(--neutral-400)' }}>
                {destinationEmoji(p.dest)} {destinationLabel(p.dest)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Birds analysis table */}
      <div className="nf-card" style={{ padding: 0, overflow: 'auto' }}>
        <div style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--neutral-200)' }}>
          <Activity size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          Aves {sex === 'M' ? 'Machos' : 'Hembras'} · Desviación vs Gompertz
        </div>
        <table className="nf-table" style={{ width: '100%', fontSize: 11 }}>
          <thead>
            <tr>
              <th>Anilla</th>
              <th>Gen</th>
              <th>Edad</th>
              <th>Peso Real</th>
              <th>Peso Esperado</th>
              <th>Desviación</th>
              <th>Destino</th>
            </tr>
          </thead>
          <tbody>
            {birdsCurrent.slice(0, 30).map(r => (
              <tr key={r.bird.id} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHighlightBird(r.bird.id)} onMouseLeave={() => setHighlightBird(null)}
                onClick={() => window.location.href = `/genetics/birds/${r.bird.id}`}>
                <td style={{ fontWeight: 500, color: 'var(--neutral-200)' }}>{r.bird.anilla}</td>
                <td style={{ color: 'var(--neutral-400)' }}>{r.bird.generacion}</td>
                <td style={{ color: 'var(--neutral-400)' }}>{r.ageD}d</td>
                <td style={{ fontWeight: 600, color: 'var(--neutral-200)' }}>{r.bird.pesoActual ? `${r.bird.pesoActual}kg` : '—'}</td>
                <td style={{ color: 'var(--neutral-400)' }}>{r.predicted ? `${r.predicted.toFixed(2)}kg` : '—'}</td>
                <td>
                  {r.deviation !== null ? (
                    <span style={{ fontWeight: 700, color: r.deviation > 10 ? '#16A34A' : r.deviation > -10 ? '#F59E0B' : '#DC2626' }}>
                      {r.deviation > 0 ? '+' : ''}{r.deviation.toFixed(1)}%
                    </span>
                  ) : '—'}
                </td>
                <td>
                  {r.dest ? (
                    <span style={{ fontSize: 10 }}>{destinationEmoji(r.dest)} {destinationLabel(r.dest)}</span>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
