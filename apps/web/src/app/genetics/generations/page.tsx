'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers, Bird, TrendingUp, Shield, Heart, Target,
  ChevronRight, BarChart2, Users
} from 'lucide-react';
import { loadProgram, getBirdsByGeneration, programStats } from '@/lib/genetics/store';
import type { SelectionProgram, Bird as BirdType } from '@/lib/genetics/types';
import { calculateSelectionScore, rankBirds, calculateUniformity, scoreColor } from '@/lib/genetics/services/scoring.service';

/* ── Gen summary card ── */
function GenCard({ gen, birds, prog }: { gen: string; birds: BirdType[]; prog: SelectionProgram }) {
  const active = birds.filter(b => b.estadoProductivo === 'activo');
  const males = active.filter(b => b.sexo === 'M');
  const females = active.filter(b => b.sexo === 'F');
  const ranked = rankBirds(active, prog.birds, prog.measurements, prog.evaluations, prog.selectionWeights);
  const avgScore = ranked.length > 0 ? ranked.reduce((s, r) => s + r.score, 0) / ranked.length : 0;
  const topScore = ranked.length > 0 ? ranked[0].score : 0;
  const weights = active.filter(b => b.pesoActual).map(b => b.pesoActual!);
  const avgW = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0;
  const uniformity = calculateUniformity(weights);

  // Trait progress for this generation
  const genTraits = prog.traitTracking.filter(t => t.generacion === gen);
  const avgFixation = genTraits.length > 0 ? genTraits.reduce((s, t) => s + t.porcentajeFijacion, 0) / genTraits.length : 0;

  const genColors: Record<string, string> = { F0: '#16A34A', F1: '#3B82F6', F2: '#8B5CF6', F3: '#EC4899', F4: '#F59E0B', 'F5+': '#DC2626' };
  const color = genColors[gen] || '#888';

  return (
    <div className="nf-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color }}>{gen}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-800)' }}>
            {birds.length} aves · {active.length} activas
          </div>
          <div style={{ fontSize: 11, color: 'var(--neutral-400)' }}>
            {males.length} ♂ · {females.length} ♀
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--neutral-900)' }}>{avgScore.toFixed(0)}</div>
          <div style={{ fontSize: 9, color: 'var(--neutral-500)' }}>Score medio</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: scoreColor(topScore) }}>{topScore.toFixed(0)}</div>
          <div style={{ fontSize: 9, color: 'var(--neutral-500)' }}>Top score</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--neutral-900)' }}>{avgW.toFixed(1)}</div>
          <div style={{ fontSize: 9, color: 'var(--neutral-500)' }}>Peso medio (kg)</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: uniformity >= 70 ? '#16A34A' : '#F59E0B' }}>{uniformity.toFixed(0)}%</div>
          <div style={{ fontSize: 9, color: 'var(--neutral-500)' }}>Uniformidad</div>
        </div>
      </div>

      {/* Trait fixation summary */}
      {genTraits.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: 'var(--neutral-500)', marginBottom: 4 }}>Fijación media: {avgFixation.toFixed(0)}%</div>
          <div style={{ background: 'var(--neutral-100)', borderRadius: 3, height: 4, overflow: 'hidden' }}>
            <div style={{ width: `${avgFixation}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      {/* Top 3 birds */}
      {ranked.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--neutral-500)', marginBottom: 4 }}>Top aves:</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {ranked.slice(0, 3).map((r, i) => (
              <Link key={r.id} href={`/genetics/birds/${r.id}`}
                style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3,
                  background: 'rgba(var(--primary-rgb,180,130,50),0.05)', border: '1px solid var(--neutral-100)' }}>
                <span style={{ color: r.sexo === 'M' ? '#3B82F6' : '#EC4899' }}>{r.sexo === 'M' ? '♂' : '♀'}</span>
                <span style={{ color: 'var(--neutral-700)' }}>{r.nombre || r.anilla}</span>
                <span style={{ fontWeight: 700, color: scoreColor(r.score) }}>{r.score.toFixed(0)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Cross-gen comparison SVG ── */
function GenerationCompare({ data }: { data: { gen: string; avg: number; top: number }[] }) {
  const w = 400, h = 100, pad = 30;
  const maxS = Math.max(...data.map(d => d.top), 1);
  const barW = Math.min(30, (w - pad * 2) / data.length / 2);
  const genColors: Record<string, string> = { F0: '#16A34A', F1: '#3B82F6', F2: '#8B5CF6', F3: '#EC4899' };

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ borderRadius: 6 }}>
      {data.map((d, i) => {
        const x = pad + (i / data.length) * (w - pad * 2) + barW / 2;
        const hAvg = (d.avg / maxS) * (h - pad * 2);
        const hTop = (d.top / maxS) * (h - pad * 2);
        return (
          <g key={d.gen}>
            <rect x={x} y={h - pad - hTop} width={barW * 0.6} height={hTop} rx={2}
              fill={genColors[d.gen] || '#888'} opacity={0.3} />
            <rect x={x + barW * 0.6 + 2} y={h - pad - hAvg} width={barW * 0.6} height={hAvg} rx={2}
              fill={genColors[d.gen] || '#888'} opacity={0.7} />
            <text x={x + barW * 0.6} y={h - pad + 12} textAnchor="middle" fontSize={9} fill="var(--neutral-400)">{d.gen}</text>
          </g>
        );
      })}
      <text x={3} y={12} fontSize={8} fill="var(--neutral-500)">Score</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════
 *  MAIN — Generations Dashboard
 * ══════════════════════════════════════════════════════════════════ */

export default function GenerationsDashboardPage() {
  const [prog, setProg] = useState<SelectionProgram | null>(null);

  useEffect(() => { setProg(loadProgram()); }, []);

  const generations = useMemo(() => {
    if (!prog) return [];
    const gens = ['F0', 'F1', 'F2', 'F3', 'F4', 'F5+'];
    return gens.filter(g => prog.birds.some(b => b.generacion === g));
  }, [prog]);

  const compareData = useMemo(() => {
    if (!prog) return [];
    return generations.map(gen => {
      const birds = getBirdsByGeneration(prog, gen).filter(b => b.estadoProductivo === 'activo');
      const ranked = rankBirds(birds, prog.birds, prog.measurements, prog.evaluations, prog.selectionWeights);
      return {
        gen,
        avg: ranked.length > 0 ? ranked.reduce((s, r) => s + r.score, 0) / ranked.length : 0,
        top: ranked.length > 0 ? ranked[0].score : 0,
      };
    });
  }, [prog, generations]);

  if (!prog) return <div style={{ padding: 32, color: 'var(--neutral-400)' }}>Cargando…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/genetics" style={{ color: 'var(--neutral-400)', textDecoration: 'none', fontSize: 12 }}>← Programa</Link>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--neutral-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={20} style={{ color: 'var(--primary)' }} /> Generaciones
        </h1>
      </div>

      {/* Comparison chart */}
      <div className="nf-card">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--neutral-800)' }}>
          <BarChart2 size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          Evolución del Score por Generación
        </div>
        <GenerationCompare data={compareData} />
        <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 10, color: 'var(--neutral-400)' }}>
          <span>▐ Top score (claro)</span>
          <span>▐ Score medio (oscuro)</span>
        </div>
      </div>

      {/* Generation cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {generations.map(gen => (
          <GenCard key={gen} gen={gen} birds={getBirdsByGeneration(prog, gen)} prog={prog} />
        ))}
      </div>
    </div>
  );
}
