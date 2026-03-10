'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Dna, Bird, BarChart3, Heart, Egg, Shield, Target, Zap,
  TrendingUp, AlertTriangle, ChevronRight, Activity,
  Users, Beaker, Eye, ClipboardList, BookOpen, FileText,
  LayoutGrid, Layers, ArrowRight, Sparkles
} from 'lucide-react';
import { loadProgram, programStats } from '@/lib/genetics/store';
import type { SelectionProgram, Bird as BirdType, SelectionAlert } from '@/lib/genetics/types';
import { rankBirds } from '@/lib/genetics/services/scoring.service';
import { estimateOffspringCOI } from '@/lib/genetics/services/inbreeding.service';

/* ── SVG Mini Bar Chart ── */
function MiniBarChart({ data, color = 'var(--primary)' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <svg width="100%" height="40" viewBox="0 0 120 40" preserveAspectRatio="none">
      {data.map((v, i) => (
        <rect key={i} x={i * (120 / data.length) + 1} y={40 - (v / max) * 36}
          width={120 / data.length - 2} height={(v / max) * 36}
          rx={2} fill={color} opacity={0.7 + (i / data.length) * 0.3} />
      ))}
    </svg>
  );
}

/* ── SVG Generational River ── */
function GenerationalRiver({ birds }: { birds: BirdType[] }) {
  const gens = ['F0', 'F1', 'F2', 'F3', 'F4', 'F5'];
  const counts = gens.map(g => birds.filter(b => b.generacion === g).length);
  const max = Math.max(...counts, 1);
  const w = 600, h = 80;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet"
      style={{ borderRadius: 8, background: 'rgba(var(--primary-rgb,180,130,50),0.05)' }}>
      <defs>
        <linearGradient id="river-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {counts.map((c, i) => {
        const x = (i / gens.length) * w + 50;
        const r = Math.max(8, (c / max) * 30);
        return (
          <g key={gens[i]}>
            {i > 0 && (
              <line x1={((i - 1) / gens.length) * w + 50 + Math.max(8, (counts[i - 1] / max) * 30)}
                y1={h / 2} x2={x - r} y2={h / 2}
                stroke="var(--primary)" strokeWidth={2} strokeDasharray="4 2" opacity={0.3} />
            )}
            <circle cx={x} cy={h / 2} r={r} fill={c > 0 ? 'url(#river-grad)' : 'rgba(120,120,120,0.1)'}
              stroke={c > 0 ? 'var(--primary)' : 'rgba(120,120,120,0.3)'} strokeWidth={1.5} />
            <text x={x} y={h / 2 + 1} textAnchor="middle" dominantBaseline="middle"
              fontSize={c > 0 ? 11 : 9} fontWeight={600}
              fill={c > 0 ? 'var(--primary)' : 'rgba(120,120,120,0.5)'}>{c > 0 ? c : '—'}</text>
            <text x={x} y={h / 2 + r + 14} textAnchor="middle" fontSize={9} fill="var(--neutral-400)">
              {gens[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Alert Badge ── */
function AlertBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: '#DC2626', warning: '#F59E0B', info: '#3B82F6', success: '#16A34A',
  };
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: colors[severity] || '#888', marginRight: 6, flexShrink: 0, marginTop: 4 }} />;
}

/* ── Quick Nav Card ── */
function QuickNav({ href, Icon, label, desc, badge }: { href: string; Icon: any; label: string; desc: string; badge?: string }) {
  return (
    <Link href={href} className="nf-card" style={{ textDecoration: 'none', display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px', transition: 'all 0.15s', cursor: 'pointer' }}>
      <div style={{ background: 'rgba(var(--primary-rgb,180,130,50),0.1)', borderRadius: 8, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} style={{ color: 'var(--primary)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-900)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--neutral-400)', marginTop: 1 }}>{desc}</div>
      </div>
      {badge && <span className="nf-tag" style={{ fontSize: 10 }}>{badge}</span>}
      <ChevronRight size={14} style={{ color: 'var(--neutral-500)', flexShrink: 0 }} />
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════════
 *  MAIN — Selection Command Center
 * ══════════════════════════════════════════════════════════════════ */

export default function GeneticsCommandCenter() {
  const [prog, setProg] = useState<SelectionProgram | null>(null);

  useEffect(() => { setProg(loadProgram()); }, []);

  const stats = useMemo(() => prog ? programStats(prog) : null, [prog]);

  /* Alerts */
  const alerts = useMemo<SelectionAlert[]>(() => {
    if (!prog) return [];
    const a: SelectionAlert[] = [];
    const f2Pending = prog.birds.filter(b => b.generacion === 'F2' && b.estadoSeleccion === 'pendiente');
    if (f2Pending.length > 10) {
      a.push({ id: 'a1', tipo: 'evaluacion_pendiente', severidad: 'warning', titulo: 'Evaluaciones pendientes',
        descripcion: `${f2Pending.length} aves F2 pendientes de evaluación`, fecha: new Date().toISOString().slice(0, 10) });
    }
    const activePairs = prog.breedingPairs.filter(bp => bp.activo);
    for (const bp of activePairs) {
      const coi = estimateOffspringCOI(bp.machoId, bp.hembraId, prog.birds);
      if (coi > 0.0625) {
        a.push({ id: `a-coi-${bp.id}`, tipo: 'consanguinidad_alta', severidad: 'danger', titulo: 'COI elevado',
          descripcion: `Pareja ${bp.machoId} × ${bp.hembraId} tiene COI ${(coi * 100).toFixed(1)}%`, fecha: new Date().toISOString().slice(0, 10) });
      }
    }
    if (activePairs.length < 2) {
      a.push({ id: 'a-bp', tipo: 'deficit_reproductores', severidad: 'info', titulo: 'Pocas parejas',
        descripcion: `Solo ${activePairs.length} pareja(s) activa(s). Considerar nuevos cruces.`, fecha: new Date().toISOString().slice(0, 10) });
    }
    return a;
  }, [prog]);

  /* Top F2 by score */
  const topF2 = useMemo(() => {
    if (!prog) return [];
    const f2 = prog.birds.filter(b => b.generacion === 'F2' && b.estadoSeleccion !== 'descartado');
    return rankBirds(f2, prog.birds, prog.measurements, prog.evaluations, prog.selectionWeights).slice(0, 5);
  }, [prog]);

  /* Trait progress */
  const traitProgress = useMemo(() => {
    if (!prog) return [];
    const latestGen = ['F2', 'F1', 'F0'].find(g => prog.traitTracking.some(t => t.generacion === g)) || 'F0';
    return prog.traitTracking.filter(t => t.generacion === latestGen).sort((a, b) => b.porcentajeFijacion - a.porcentajeFijacion);
  }, [prog]);

  if (!prog || !stats) return <div style={{ padding: 32, color: 'var(--neutral-400)' }}>Cargando programa…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 4 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), #8B5CF6)', borderRadius: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Dna size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--neutral-900)' }}>
            {prog.nombre}
          </h1>
          <div style={{ fontSize: 12, color: 'var(--neutral-400)' }}>
            {prog.descripcion}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span className="nf-tag" style={{ background: 'rgba(var(--primary-rgb,180,130,50),0.15)', color: 'var(--primary)' }}>
            {prog.perfilObjetivo}
          </span>
          <span className="nf-tag">{prog.ubicacion}</span>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Aves Activas', value: stats.activeBirds, icon: Bird, color: 'var(--primary)' },
          { label: 'Machos / Hembras', value: `${stats.males} / ${stats.females}`, icon: Users, color: '#3B82F6' },
          { label: 'Parejas Activas', value: stats.breedingPairsActive, icon: Heart, color: '#EC4899' },
          { label: 'Razas Base', value: stats.breeds, icon: Layers, color: '#8B5CF6' },
          { label: 'Evaluaciones', value: stats.evaluations, icon: Target, color: '#16A34A' },
        ].map(kpi => (
          <div key={kpi.label} className="nf-kbox">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <kpi.icon size={14} style={{ color: kpi.color }} />
              <span style={{ fontSize: 11, color: 'var(--neutral-400)' }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--neutral-900)' }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Generational River */}
      <div className="nf-card">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--neutral-800)' }}>
          <TrendingUp size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          Río Generacional
        </div>
        <GenerationalRiver birds={prog.birds} />
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: 'var(--neutral-400)' }}>
          {Object.entries(stats.byGeneration).map(([gen, count]) => (
            <span key={gen}>{gen}: <b style={{ color: 'var(--neutral-800)' }}>{count}</b> activas</span>
          ))}
        </div>
      </div>

      {/* Two column: Alerts + Top Birds */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Alerts */}
        <div className="nf-card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-800)' }}>
            <AlertTriangle size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Alertas del Programa
          </div>
          {alerts.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--neutral-500)', padding: 12, textAlign: 'center' }}>
              Sin alertas activas ✓
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {alerts.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '6px 8px', borderRadius: 6, background: 'rgba(var(--primary-rgb,180,130,50),0.03)' }}>
                  <AlertBadge severity={a.severidad} />
                  <span style={{ fontSize: 12, color: 'var(--neutral-700)', lineHeight: 1.4 }}>{a.descripcion}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top F2 */}
        <div className="nf-card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-800)' }}>
            <Sparkles size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Top 5 F2 por Score
          </div>
          {topF2.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--neutral-500)', padding: 12, textAlign: 'center' }}>
              Sin aves F2 evaluadas
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {topF2.map((r, i) => (
                <Link key={r.id} href={`/genetics/birds/${r.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 6, textDecoration: 'none', fontSize: 12, transition: 'background 0.15s' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i === 0 ? 'var(--primary)' : 'var(--neutral-200)', color: i === 0 ? '#fff' : 'var(--neutral-700)', fontSize: 10, fontWeight: 700 }}>
                    {i + 1}
                  </span>
                  <span style={{ color: 'var(--neutral-800)', fontWeight: 500 }}>{r.anilla}</span>
                  <span style={{ color: 'var(--neutral-400)' }}>{r.sexo === 'M' ? '♂' : '♀'} {r.pesoActual}kg</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, color: r.score >= 70 ? '#16A34A' : r.score >= 50 ? '#F59E0B' : '#DC2626' }}>
                    {r.score.toFixed(0)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trait Lock Board Summary */}
      <div className="nf-card">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-800)' }}>
          <Shield size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          Progreso de Fijación de Rasgos
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          {traitProgress.map(t => {
            const trait = prog.traits.find(td => td.id === t.traitId);
            const levelColors: Record<string, string> = { emergent: '#F59E0B', unstable: '#3B82F6', almost_fixed: '#8B5CF6', fixed: '#16A34A', lost: '#DC2626' };
            return (
              <div key={t.traitId} style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(var(--primary-rgb,180,130,50),0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--neutral-800)' }}>{trait?.nombre || t.traitId}</span>
                  <span style={{ fontSize: 10, color: levelColors[t.nivel] || '#888', fontWeight: 600 }}>
                    {t.nivel === 'emergent' ? 'Emergente' : t.nivel === 'unstable' ? 'Inestable' : t.nivel === 'almost_fixed' ? 'Casi fijo' : t.nivel === 'fixed' ? 'Fijado' : 'Perdido'}
                  </span>
                </div>
                <div style={{ background: 'var(--neutral-100)', borderRadius: 3, height: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${t.porcentajeFijacion}%`, background: levelColors[t.nivel], borderRadius: 3, transition: 'width 0.3s' }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--neutral-500)', marginTop: 2 }}>{t.porcentajeFijacion}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Grid */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-800)' }}>
          <LayoutGrid size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          Módulos del Programa
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          <QuickNav href="/genetics/birds" Icon={Bird} label="Registro de Aves" desc="Censo, fichas, filtros avanzados" badge={`${stats.totalBirds}`} />
          <QuickNav href="/genetics/mate-canvas" Icon={Heart} label="Mate Canvas" desc="Planificar cruces con drag & drop" badge={`${stats.breedingPairsActive} activos`} />
          <QuickNav href="/simulator/growth-lab" Icon={TrendingUp} label="Growth Lab" desc="Curvas Gompertz, predicción de peso" />
          <QuickNav href="/genetics/generations" Icon={Layers} label="Generaciones" desc="Dashboard F0→F5, progreso por gen" />
          <QuickNav href="/genetics/inbreeding" Icon={Shield} label="Observatorio COI" desc="Consanguinidad, mapa de calor" />
          <QuickNav href="/genetics/quick-entry" Icon={ClipboardList} label="Entrada Rápida" desc="Pesajes, evaluaciones, eventos" />
          <QuickNav href="/genetics/catalog" Icon={BookOpen} label="Catálogo" desc="Razas heritage, parámetros zootécnicos" />
          <QuickNav href="/genetics/recommender" Icon={Sparkles} label="Cruces IA" desc="Recomendador inteligente de cruces" />
        </div>
      </div>
    </div>
  );
}
