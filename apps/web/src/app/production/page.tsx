'use client';

import { useState, useMemo } from 'react';
import {
  Egg, TrendingUp, Plus, Scissors, Merge, ChevronRight,
  ArrowRight, X, AlertCircle, Package, Check, Baby,
  Bird, Drumstick, Crown, ShoppingCart, CheckCircle2, MoreVertical
} from 'lucide-react';

/* ── Types ─────────────────────────────────────────── */
type Fase = 'Incubación' | 'Cría' | 'Juvenil' | 'Engorde' | 'Reproductores' | 'Venta' | 'Finalizado';

interface Lote {
  id: string;
  nombre: string;
  fase: Fase;
  animales: number;
  desglose: { machos: number; hembras: number; sinSexar: number };
  razaCruce: string;
  fechaInicio: string;
  fechaEstimadaSiguienteFase: string;
  gallinero?: string;
  pesoMedio?: number;
  mortalidad: number;
  notas?: string;
  color: string;
  parentId?: string;
}

/* ── Column config ────────────────────────────────── */
const FASES: { fase: Fase; icon: string; label: string; color: string; semanas?: string }[] = [
  { fase: 'Incubación', icon: '🥚', label: 'INCUBACIÓN', color: '#F59E0B', semanas: '21 días' },
  { fase: 'Cría', icon: '🐣', label: 'CRÍA', color: '#10B981', semanas: '0-4 sem' },
  { fase: 'Juvenil', icon: '🐥', label: 'JUVENIL', color: '#3B82F6', semanas: '4-10 sem' },
  { fase: 'Engorde', icon: '🐔', label: 'ENGORDE', color: '#8B5CF6', semanas: '10-24 sem' },
  { fase: 'Reproductores', icon: '🐓', label: 'REPRODUCTORES', color: '#EC4899' },
  { fase: 'Venta', icon: '📦', label: 'VENTA', color: '#F97316' },
  { fase: 'Finalizado', icon: '✅', label: 'FINALIZADO', color: '#6B7280' },
];

const LOT_COLORS = ['#B07D2B', '#2563EB', '#059669', '#DC2626', '#7C3AED', '#EA580C', '#0891B2'];

/* ── Demo data ────────────────────────────────────── */
const INITIAL_LOTES: Lote[] = [
  {
    id: 'LOT-2025-001', nombre: 'Lote Primavera 2025', fase: 'Engorde',
    animales: 12, desglose: { machos: 12, hembras: 0, sinSexar: 0 },
    razaCruce: 'Castellana Negra × Plymouth Rock', fechaInicio: '2024-10-15',
    fechaEstimadaSiguienteFase: '2025-04-15', gallinero: 'Zona Capones',
    pesoMedio: 3.2, mortalidad: 2, color: '#B07D2B',
    notas: 'Capones para Navidad 2025 — excelente desarrollo'
  },
  {
    id: 'LOT-2025-002', nombre: 'Pollitos Febrero', fase: 'Cría',
    animales: 6, desglose: { machos: 0, hembras: 0, sinSexar: 6 },
    razaCruce: 'Castellana Negra pura', fechaInicio: '2025-02-10',
    fechaEstimadaSiguienteFase: '2025-03-10', gallinero: 'Zona Cría',
    pesoMedio: 0.18, mortalidad: 0, color: '#059669',
    notas: 'Sin sexar todavía — esperar a 4-5 semanas'
  },
  {
    id: 'LOT-2025-003', nombre: 'Plantel Reproductor', fase: 'Reproductores',
    animales: 20, desglose: { machos: 2, hembras: 18, sinSexar: 0 },
    razaCruce: 'Castellana Negra + Plymouth Rock', fechaInicio: '2024-03-01',
    fechaEstimadaSiguienteFase: '—', gallinero: 'Gallinero Principal',
    pesoMedio: 2.8, mortalidad: 1, color: '#EC4899',
    notas: '2 gallos (CN-001 Carbón, PR-001 Rocky) + 18 gallinas'
  },
  {
    id: 'LOT-2025-004', nombre: 'Incubación Marzo', fase: 'Incubación',
    animales: 24, desglose: { machos: 0, hembras: 0, sinSexar: 24 },
    razaCruce: 'Castellana Negra × Plymouth Rock', fechaInicio: '2025-02-28',
    fechaEstimadaSiguienteFase: '2025-03-21', gallinero: undefined,
    pesoMedio: undefined, mortalidad: 0, color: '#F59E0B',
    notas: '24 huevos fértiles en incubadora — día 4'
  },
];

/* ── Helpers ───────────────────────────────────────── */
function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}
function weeksSince(dateStr: string): string {
  const days = daysSince(dateStr);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}sem`;
}
function daysUntil(dateStr: string): string {
  if (dateStr === '—') return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `¡${Math.abs(diff)}d pasado!`;
  if (diff === 0) return 'Hoy';
  return `${diff}d`;
}

/* ── KPIs data ─────────────────────────────────────── */
const PRODUCCION_DIARIA = [
  { fecha: '2026-03-04', huevos: 4, gallinas: 18, tasa: 22.2 },
  { fecha: '2026-03-03', huevos: 3, gallinas: 18, tasa: 16.7 },
  { fecha: '2026-03-02', huevos: 5, gallinas: 18, tasa: 27.7 },
  { fecha: '2026-03-01', huevos: 4, gallinas: 18, tasa: 22.2 },
  { fecha: '2026-02-28', huevos: 6, gallinas: 18, tasa: 33.3 },
  { fecha: '2026-02-27', huevos: 4, gallinas: 18, tasa: 22.2 },
  { fecha: '2026-02-26', huevos: 5, gallinas: 19, tasa: 26.3 },
];

/* ══════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════ */
export default function ProductionPage() {
  const [lotes, setLotes] = useState<Lote[]>(INITIAL_LOTES);
  const [moveModal, setMoveModal] = useState<{ lote: Lote; targetFase?: Fase } | null>(null);
  const [splitModal, setSplitModal] = useState<Lote | null>(null);
  const [mergeModal, setMergeModal] = useState<{ fase: Fase; selected: string[] } | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [detailLote, setDetailLote] = useState<Lote | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Create form state
  const [newLote, setNewLote] = useState({
    nombre: '', razaCruce: 'Castellana Negra pura', animales: 0,
    fase: 'Incubación' as Fase, gallinero: '', notas: '',
    machos: 0, hembras: 0, sinSexar: 0,
  });

  // Split form state
  const [splitA, setSplitA] = useState({ nombre: '', cantidad: 0, fase: 'Engorde' as Fase });
  const [splitB, setSplitB] = useState({ nombre: '', cantidad: 0, fase: 'Reproductores' as Fase });

  const lotesPerFase = useMemo(() => {
    const map: Record<Fase, Lote[]> = {
      'Incubación': [], 'Cría': [], 'Juvenil': [], 'Engorde': [],
      'Reproductores': [], 'Venta': [], 'Finalizado': [],
    };
    lotes.forEach(l => map[l.fase].push(l));
    return map;
  }, [lotes]);

  const totalAnimales = lotes.reduce((s, l) => s + l.animales, 0);
  const totalHuevos7d = PRODUCCION_DIARIA.reduce((s, d) => s + d.huevos, 0);
  const tasaProm = (PRODUCCION_DIARIA.reduce((s, d) => s + d.tasa, 0) / PRODUCCION_DIARIA.length).toFixed(1);

  /* ── Actions ──────────────────────────────────────── */
  function handleMove(lote: Lote, newFase: Fase) {
    setLotes(prev => prev.map(l => l.id === lote.id ? { ...l, fase: newFase } : l));
    setMoveModal(null);
    setMenuOpen(null);
  }

  function handleSplit(parentLote: Lote) {
    if (splitA.cantidad + splitB.cantidad !== parentLote.animales) return;
    const newId = `LOT-${new Date().getFullYear()}-${String(lotes.length + 1).padStart(3, '0')}`;
    const newId2 = `LOT-${new Date().getFullYear()}-${String(lotes.length + 2).padStart(3, '0')}`;
    const today = new Date().toISOString().slice(0, 10);
    const lotA: Lote = {
      ...parentLote, id: newId, nombre: splitA.nombre || `${parentLote.nombre} (A)`,
      animales: splitA.cantidad, fase: splitA.fase,
      desglose: { machos: splitA.cantidad, hembras: 0, sinSexar: 0 },
      fechaInicio: today, parentId: parentLote.id,
    };
    const lotB: Lote = {
      ...parentLote, id: newId2, nombre: splitB.nombre || `${parentLote.nombre} (B)`,
      animales: splitB.cantidad, fase: splitB.fase,
      desglose: { machos: 0, hembras: splitB.cantidad, sinSexar: 0 },
      fechaInicio: today, parentId: parentLote.id,
    };
    setLotes(prev => [...prev.filter(l => l.id !== parentLote.id), lotA, lotB]);
    setSplitModal(null);
    setMenuOpen(null);
  }

  function handleMerge(loteIds: string[]) {
    const mergeLotes = lotes.filter(l => loteIds.includes(l.id));
    if (mergeLotes.length < 2) return;
    const base = mergeLotes[0];
    const merged: Lote = {
      ...base,
      id: `LOT-${new Date().getFullYear()}-${String(lotes.length + 1).padStart(3, '0')}`,
      nombre: `${base.nombre} + fusión`,
      animales: mergeLotes.reduce((s, l) => s + l.animales, 0),
      desglose: {
        machos: mergeLotes.reduce((s, l) => s + l.desglose.machos, 0),
        hembras: mergeLotes.reduce((s, l) => s + l.desglose.hembras, 0),
        sinSexar: mergeLotes.reduce((s, l) => s + l.desglose.sinSexar, 0),
      },
      mortalidad: mergeLotes.reduce((s, l) => s + l.mortalidad, 0),
      fechaInicio: new Date().toISOString().slice(0, 10),
    };
    setLotes(prev => [...prev.filter(l => !loteIds.includes(l.id)), merged]);
    setMergeModal(null);
  }

  function handleCreate() {
    const id = `LOT-${new Date().getFullYear()}-${String(lotes.length + 1).padStart(3, '0')}`;
    const today = new Date().toISOString().slice(0, 10);
    const lot: Lote = {
      id, nombre: newLote.nombre || `Lote ${id}`, fase: newLote.fase,
      animales: newLote.animales || (newLote.machos + newLote.hembras + newLote.sinSexar),
      desglose: { machos: newLote.machos, hembras: newLote.hembras, sinSexar: newLote.sinSexar },
      razaCruce: newLote.razaCruce, fechaInicio: today,
      fechaEstimadaSiguienteFase: '—', gallinero: newLote.gallinero || undefined,
      mortalidad: 0, color: LOT_COLORS[lotes.length % LOT_COLORS.length],
      notas: newLote.notas || undefined,
    };
    setLotes(prev => [...prev, lot]);
    setCreateModal(false);
    setNewLote({ nombre: '', razaCruce: 'Castellana Negra pura', animales: 0, fase: 'Incubación', gallinero: '', notas: '', machos: 0, hembras: 0, sinSexar: 0 });
  }

  /* ── Render ───────────────────────────────────────── */
  const modalBg: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 999,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  };
  const modalBox: React.CSSProperties = {
    background: 'var(--neutral-900)', borderRadius: 16, padding: 24,
    maxWidth: 520, width: '100%', maxHeight: '85vh', overflow: 'auto',
    border: '1px solid var(--neutral-700)',
  };

  return (
    <div className="nf-content" style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Producción — Kanban de Lotes</h1>
          <p style={{ color: 'var(--neutral-400)', fontSize: 13, margin: '4px 0 0' }}>
            Arrastra lotes entre fases · {lotes.length} lotes · {totalAnimales} animales
          </p>
        </div>
        <button
          onClick={() => setCreateModal(true)}
          style={{
            background: 'var(--primary-500)', color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <Plus size={16} /> Nuevo Lote
        </button>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { v: String(totalAnimales), l: 'Total Animales', c: 'var(--primary-500)' },
          { v: String(lotes.length), l: 'Lotes Activos', c: 'var(--ok)' },
          { v: String(totalHuevos7d), l: 'Huevos 7d', c: '#F59E0B' },
          { v: `${tasaProm}%`, l: 'Tasa Postura', c: 'var(--neutral-300)' },
        ].map(k => (
          <div key={k.l} className="nf-kbox" style={{ textAlign: 'center' }}>
            <div className="nf-kbox-v" style={{ color: k.c, fontSize: 22 }}>{k.v}</div>
            <div className="nf-kbox-label" style={{ fontSize: 11 }}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* ── KANBAN BOARD ──────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${FASES.length}, minmax(180px, 1fr))`,
        gap: 10,
        overflowX: 'auto',
        paddingBottom: 16,
      }}>
        {FASES.map(col => {
          const colLotes = lotesPerFase[col.fase];
          return (
            <div key={col.fase} style={{
              background: 'var(--neutral-850, #1a1a1a)', borderRadius: 12,
              border: '1px solid var(--neutral-700)', minHeight: 400,
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Column header */}
              <div style={{
                padding: '12px 12px 8px', borderBottom: '2px solid ' + col.color,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 20 }}>{col.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: '.5px', color: col.color }}>
                    {col.label}
                  </div>
                  {col.semanas && (
                    <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>{col.semanas}</div>
                  )}
                </div>
                <div style={{
                  marginLeft: 'auto', background: col.color + '22', color: col.color,
                  borderRadius: 8, padding: '2px 8px', fontSize: 12, fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                }}>
                  {colLotes.length}
                </div>
              </div>

              {/* Cards */}
              <div style={{ padding: 8, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {colLotes.map(lote => (
                  <div
                    key={lote.id}
                    style={{
                      background: 'var(--neutral-800)', borderRadius: 10,
                      border: '1px solid var(--neutral-700)',
                      borderLeft: `3px solid ${lote.color}`,
                      padding: 10, cursor: 'pointer', position: 'relative',
                      transition: 'transform .15s, box-shadow .15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,.3)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'none';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                    onClick={() => setDetailLote(lote)}
                  >
                    {/* Card header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: lote.color, fontWeight: 700 }}>
                        {lote.id}
                      </div>
                      <div
                        style={{ cursor: 'pointer', padding: 2, borderRadius: 4 }}
                        onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === lote.id ? null : lote.id); }}
                      >
                        <MoreVertical size={14} color="var(--neutral-500)" />
                      </div>
                    </div>

                    {/* Context menu */}
                    {menuOpen === lote.id && (
                      <div style={{
                        position: 'absolute', top: 28, right: 8, zIndex: 50,
                        background: 'var(--neutral-800)', border: '1px solid var(--neutral-600)',
                        borderRadius: 8, padding: 4, minWidth: 160,
                        boxShadow: '0 8px 24px rgba(0,0,0,.4)',
                      }}>
                        <div
                          style={{ padding: '6px 10px', fontSize: 12, cursor: 'pointer', borderRadius: 6, display: 'flex', gap: 8, alignItems: 'center' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--neutral-700)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          onClick={e => { e.stopPropagation(); setMoveModal({ lote }); setMenuOpen(null); }}
                        >
                          <ArrowRight size={13} /> Mover a fase…
                        </div>
                        <div
                          style={{ padding: '6px 10px', fontSize: 12, cursor: 'pointer', borderRadius: 6, display: 'flex', gap: 8, alignItems: 'center' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--neutral-700)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          onClick={e => {
                            e.stopPropagation();
                            setSplitModal(lote);
                            setSplitA({ nombre: '', cantidad: Math.ceil(lote.animales / 2), fase: 'Engorde' });
                            setSplitB({ nombre: '', cantidad: Math.floor(lote.animales / 2), fase: 'Reproductores' });
                            setMenuOpen(null);
                          }}
                        >
                          <Scissors size={13} /> Dividir lote
                        </div>
                        {colLotes.length >= 2 && (
                          <div
                            style={{ padding: '6px 10px', fontSize: 12, cursor: 'pointer', borderRadius: 6, display: 'flex', gap: 8, alignItems: 'center' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--neutral-700)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            onClick={e => {
                              e.stopPropagation();
                              setMergeModal({ fase: col.fase, selected: [lote.id] });
                              setMenuOpen(null);
                            }}
                          >
                            <Merge size={13} /> Fusionar con…
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, lineHeight: 1.3 }}>
                      {lote.nombre}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--neutral-400)', marginBottom: 6 }}>
                      {lote.razaCruce}
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{
                        background: 'var(--neutral-700)', borderRadius: 6, padding: '2px 6px',
                        fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600,
                      }}>
                        {lote.animales} 🐔
                      </span>
                      {lote.pesoMedio && (
                        <span style={{
                          background: 'var(--neutral-700)', borderRadius: 6, padding: '2px 6px',
                          fontSize: 11, fontFamily: 'var(--font-mono)',
                        }}>
                          {lote.pesoMedio}kg
                        </span>
                      )}
                      <span style={{
                        background: 'var(--neutral-700)', borderRadius: 6, padding: '2px 6px',
                        fontSize: 11, fontFamily: 'var(--font-mono)',
                      }}>
                        {weeksSince(lote.fechaInicio)}
                      </span>
                    </div>

                    {/* Desglose */}
                    {(lote.desglose.machos > 0 || lote.desglose.hembras > 0) && (
                      <div style={{ fontSize: 10, color: 'var(--neutral-500)', marginBottom: 4 }}>
                        {lote.desglose.machos > 0 && `♂${lote.desglose.machos} `}
                        {lote.desglose.hembras > 0 && `♀${lote.desglose.hembras} `}
                        {lote.desglose.sinSexar > 0 && `?${lote.desglose.sinSexar}`}
                      </div>
                    )}

                    {/* Progress to next phase */}
                    {lote.fechaEstimadaSiguienteFase !== '—' && (
                      <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>
                        Sig. fase: <span style={{
                          fontWeight: 600,
                          color: daysUntil(lote.fechaEstimadaSiguienteFase).startsWith('¡') ? 'var(--alert)' : 'var(--primary-400)',
                        }}>{daysUntil(lote.fechaEstimadaSiguienteFase)}</span>
                      </div>
                    )}

                    {lote.mortalidad > 0 && (
                      <div style={{ fontSize: 10, color: 'var(--alert)', marginTop: 2 }}>
                        ⚠ {lote.mortalidad} baja{lote.mortalidad > 1 ? 's' : ''}
                      </div>
                    )}

                    {lote.parentId && (
                      <div style={{ fontSize: 10, color: 'var(--neutral-500)', marginTop: 2 }}>
                        ↳ de {lote.parentId}
                      </div>
                    )}
                  </div>
                ))}

                {colLotes.length === 0 && (
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--neutral-600)', fontSize: 12, fontStyle: 'italic',
                    border: '2px dashed var(--neutral-700)', borderRadius: 10, minHeight: 80,
                    margin: 4,
                  }}>
                    Sin lotes
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Production chart (below kanban) ─────────── */}
      <div className="nf-card" style={{ marginTop: 20 }}>
        <div className="nf-card-hd">
          <div className="nf-card-title">
            <Egg size={16} style={{ display: 'inline', marginRight: 6 }} />
            Producción Diaria — Últimos 7 días
          </div>
        </div>
        <div className="nf-card-pad">
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-around', height: 120, gap: 12 }}>
            {PRODUCCION_DIARIA.slice().reverse().map(d => (
              <div key={d.fecha} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{d.huevos}</div>
                <div style={{
                  width: '100%', minHeight: 16, height: d.huevos * 16,
                  background: 'linear-gradient(180deg, var(--primary-400), var(--primary-600))',
                  borderRadius: '4px 4px 0 0',
                }} />
                <div style={{ fontSize: 10, color: 'var(--neutral-500)', marginTop: 4 }}>
                  {new Date(d.fecha).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
         MODALS
         ══════════════════════════════════════════════════ */}

      {/* ── MOVE MODAL ──────────────────────────────── */}
      {moveModal && (
        <div style={modalBg} onClick={() => setMoveModal(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Mover Lote</h2>
              <button onClick={() => setMoveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)' }}><X size={18} /></button>
            </div>
            <p style={{ color: 'var(--neutral-400)', fontSize: 13, marginBottom: 16 }}>
              <strong>{moveModal.lote.nombre}</strong> ({moveModal.lote.animales} animales) — actualmente en <strong>{moveModal.lote.fase}</strong>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
              {FASES.filter(f => f.fase !== moveModal.lote.fase).map(f => (
                <button
                  key={f.fase}
                  onClick={() => handleMove(moveModal.lote, f.fase)}
                  style={{
                    background: 'var(--neutral-800)', border: '1px solid var(--neutral-600)',
                    borderRadius: 10, padding: '12px 10px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'border-color .2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = f.color)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--neutral-600)')}
                >
                  <span style={{ fontSize: 24 }}>{f.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: f.color }}>{f.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SPLIT MODAL ─────────────────────────────── */}
      {splitModal && (
        <div style={modalBg} onClick={() => setSplitModal(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>✂️ Dividir Lote</h2>
              <button onClick={() => setSplitModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)' }}><X size={18} /></button>
            </div>
            <p style={{ color: 'var(--neutral-400)', fontSize: 13, marginBottom: 16 }}>
              <strong>{splitModal.nombre}</strong> — {splitModal.animales} animales
            </p>

            {/* Sub-lote A */}
            <div style={{ background: 'var(--neutral-800)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: 'var(--primary-400)' }}>Sub-lote A</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--neutral-400)' }}>Nombre</label>
                  <input value={splitA.nombre} onChange={e => setSplitA({ ...splitA, nombre: e.target.value })}
                    placeholder={`${splitModal.nombre} (machos)`} className="nf-input" style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--neutral-400)' }}>Cantidad</label>
                  <input type="number" value={splitA.cantidad} min={1} max={splitModal.animales - 1}
                    onChange={e => {
                      const v = parseInt(e.target.value) || 0;
                      setSplitA({ ...splitA, cantidad: v });
                      setSplitB({ ...splitB, cantidad: splitModal.animales - v });
                    }}
                    className="nf-input" style={{ width: '100%', marginTop: 4 }} />
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 11, color: 'var(--neutral-400)' }}>Destino</label>
                <select value={splitA.fase} onChange={e => setSplitA({ ...splitA, fase: e.target.value as Fase })}
                  className="nf-input" style={{ width: '100%', marginTop: 4 }}>
                  {FASES.map(f => <option key={f.fase} value={f.fase}>{f.icon} {f.label}</option>)}
                </select>
              </div>
            </div>

            {/* Sub-lote B */}
            <div style={{ background: 'var(--neutral-800)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: '#3B82F6' }}>Sub-lote B</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--neutral-400)' }}>Nombre</label>
                  <input value={splitB.nombre} onChange={e => setSplitB({ ...splitB, nombre: e.target.value })}
                    placeholder={`${splitModal.nombre} (hembras)`} className="nf-input" style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--neutral-400)' }}>Cantidad</label>
                  <input type="number" value={splitB.cantidad} min={1} max={splitModal.animales - 1}
                    onChange={e => {
                      const v = parseInt(e.target.value) || 0;
                      setSplitB({ ...splitB, cantidad: v });
                      setSplitA({ ...splitA, cantidad: splitModal.animales - v });
                    }}
                    className="nf-input" style={{ width: '100%', marginTop: 4 }} />
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 11, color: 'var(--neutral-400)' }}>Destino</label>
                <select value={splitB.fase} onChange={e => setSplitB({ ...splitB, fase: e.target.value as Fase })}
                  className="nf-input" style={{ width: '100%', marginTop: 4 }}>
                  {FASES.map(f => <option key={f.fase} value={f.fase}>{f.icon} {f.label}</option>)}
                </select>
              </div>
            </div>

            {/* Validation */}
            {splitA.cantidad + splitB.cantidad !== splitModal.animales && (
              <div style={{ color: 'var(--alert)', fontSize: 12, marginBottom: 12 }}>
                ⚠ La suma ({splitA.cantidad} + {splitB.cantidad} = {splitA.cantidad + splitB.cantidad}) debe ser {splitModal.animales}
              </div>
            )}

            <button
              onClick={() => handleSplit(splitModal)}
              disabled={splitA.cantidad + splitB.cantidad !== splitModal.animales}
              style={{
                width: '100%', padding: '12px', background: splitA.cantidad + splitB.cantidad === splitModal.animales ? 'var(--primary-500)' : 'var(--neutral-600)',
                color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}
            >
              Confirmar División
            </button>
          </div>
        </div>
      )}

      {/* ── MERGE MODAL ─────────────────────────────── */}
      {mergeModal && (
        <div style={modalBg} onClick={() => setMergeModal(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>🔗 Fusionar Lotes</h2>
              <button onClick={() => setMergeModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)' }}><X size={18} /></button>
            </div>
            <p style={{ color: 'var(--neutral-400)', fontSize: 13, marginBottom: 16 }}>
              Selecciona los lotes de <strong>{mergeModal.fase}</strong> a fusionar:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {lotesPerFase[mergeModal.fase].map(l => (
                <label key={l.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  background: mergeModal.selected.includes(l.id) ? 'var(--primary-500)22' : 'var(--neutral-800)',
                  border: `1px solid ${mergeModal.selected.includes(l.id) ? 'var(--primary-500)' : 'var(--neutral-700)'}`,
                  borderRadius: 10, cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={mergeModal.selected.includes(l.id)}
                    onChange={e => {
                      setMergeModal({
                        ...mergeModal,
                        selected: e.target.checked
                          ? [...mergeModal.selected, l.id]
                          : mergeModal.selected.filter(id => id !== l.id),
                      });
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{l.nombre}</div>
                    <div style={{ fontSize: 11, color: 'var(--neutral-400)' }}>{l.id} · {l.animales} animales · {l.razaCruce}</div>
                  </div>
                </label>
              ))}
            </div>
            <button
              onClick={() => handleMerge(mergeModal.selected)}
              disabled={mergeModal.selected.length < 2}
              style={{
                width: '100%', padding: '12px',
                background: mergeModal.selected.length >= 2 ? 'var(--primary-500)' : 'var(--neutral-600)',
                color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}
            >
              Fusionar {mergeModal.selected.length} lotes
            </button>
          </div>
        </div>
      )}

      {/* ── CREATE MODAL ────────────────────────────── */}
      {createModal && (
        <div style={modalBg} onClick={() => setCreateModal(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>+ Nuevo Lote</h2>
              <button onClick={() => setCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--neutral-400)' }}>Nombre del lote</label>
                <input value={newLote.nombre} onChange={e => setNewLote({ ...newLote, nombre: e.target.value })}
                  placeholder="Ej: Lote primavera 2025" className="nf-input" style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--neutral-400)' }}>Raza / Cruce</label>
                <select value={newLote.razaCruce} onChange={e => setNewLote({ ...newLote, razaCruce: e.target.value })}
                  className="nf-input" style={{ width: '100%', marginTop: 4 }}>
                  <option>Castellana Negra pura</option>
                  <option>Castellana Negra × Plymouth Rock</option>
                  <option>Plymouth Rock pura</option>
                  <option>Prat Leonada</option>
                  <option>Empordanesa</option>
                  <option>Euskal Oiloa</option>
                  <option>Otro cruce</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--neutral-400)' }}>Fase inicial</label>
                <select value={newLote.fase} onChange={e => setNewLote({ ...newLote, fase: e.target.value as Fase })}
                  className="nf-input" style={{ width: '100%', marginTop: 4 }}>
                  {FASES.map(f => <option key={f.fase} value={f.fase}>{f.icon} {f.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--neutral-400)' }}>Machos</label>
                  <input type="number" value={newLote.machos} min={0}
                    onChange={e => setNewLote({ ...newLote, machos: parseInt(e.target.value) || 0 })}
                    className="nf-input" style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--neutral-400)' }}>Hembras</label>
                  <input type="number" value={newLote.hembras} min={0}
                    onChange={e => setNewLote({ ...newLote, hembras: parseInt(e.target.value) || 0 })}
                    className="nf-input" style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--neutral-400)' }}>Sin sexar</label>
                  <input type="number" value={newLote.sinSexar} min={0}
                    onChange={e => setNewLote({ ...newLote, sinSexar: parseInt(e.target.value) || 0 })}
                    className="nf-input" style={{ width: '100%', marginTop: 4 }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--neutral-400)' }}>Gallinero (opcional)</label>
                <select value={newLote.gallinero} onChange={e => setNewLote({ ...newLote, gallinero: e.target.value })}
                  className="nf-input" style={{ width: '100%', marginTop: 4 }}>
                  <option value="">— Sin asignar —</option>
                  <option>Gallinero Principal</option>
                  <option>Zona Capones</option>
                  <option>Zona Cría</option>
                  <option>Parque Exterior</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--neutral-400)' }}>Notas</label>
                <textarea value={newLote.notas} onChange={e => setNewLote({ ...newLote, notas: e.target.value })}
                  placeholder="Observaciones…" className="nf-input" rows={2} style={{ width: '100%', marginTop: 4, resize: 'vertical' }} />
              </div>
              <button
                onClick={handleCreate}
                disabled={!newLote.nombre && (newLote.machos + newLote.hembras + newLote.sinSexar) === 0}
                style={{
                  width: '100%', padding: '12px', background: 'var(--primary-500)',
                  color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14,
                }}
              >
                Crear Lote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL ────────────────────────────── */}
      {detailLote && (
        <div style={modalBg} onClick={() => setDetailLote(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: detailLote.color, fontWeight: 700 }}>{detailLote.id}</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 0' }}>{detailLote.nombre}</h2>
              </div>
              <button onClick={() => setDetailLote(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { l: 'Fase', v: detailLote.fase },
                { l: 'Animales', v: String(detailLote.animales) },
                { l: 'Raza/Cruce', v: detailLote.razaCruce },
                { l: 'Inicio', v: new Date(detailLote.fechaInicio).toLocaleDateString('es') },
                { l: 'Edad', v: weeksSince(detailLote.fechaInicio) },
                { l: 'Sig. fase', v: daysUntil(detailLote.fechaEstimadaSiguienteFase) },
                { l: 'Peso medio', v: detailLote.pesoMedio ? `${detailLote.pesoMedio} kg` : '—' },
                { l: 'Gallinero', v: detailLote.gallinero || '—' },
                { l: 'Mortalidad', v: String(detailLote.mortalidad) },
                { l: 'Desglose', v: `♂${detailLote.desglose.machos} ♀${detailLote.desglose.hembras} ?${detailLote.desglose.sinSexar}` },
              ].map(r => (
                <div key={r.l}>
                  <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>{r.l}</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.v}</div>
                </div>
              ))}
            </div>

            {detailLote.notas && (
              <div style={{ background: 'var(--neutral-800)', borderRadius: 10, padding: 12, fontSize: 13, color: 'var(--neutral-300)', marginBottom: 16 }}>
                📝 {detailLote.notas}
              </div>
            )}

            {detailLote.parentId && (
              <div style={{ fontSize: 12, color: 'var(--neutral-400)', marginBottom: 16 }}>
                Originado de: <strong>{detailLote.parentId}</strong>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setMoveModal({ lote: detailLote }); setDetailLote(null); }}
                style={{
                  flex: 1, padding: '10px', background: 'var(--neutral-800)', border: '1px solid var(--neutral-600)',
                  borderRadius: 10, color: 'var(--neutral-200)', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <ArrowRight size={14} /> Mover
              </button>
              <button
                onClick={() => {
                  setSplitModal(detailLote);
                  setSplitA({ nombre: '', cantidad: Math.ceil(detailLote.animales / 2), fase: 'Engorde' });
                  setSplitB({ nombre: '', cantidad: Math.floor(detailLote.animales / 2), fase: 'Reproductores' });
                  setDetailLote(null);
                }}
                style={{
                  flex: 1, padding: '10px', background: 'var(--neutral-800)', border: '1px solid var(--neutral-600)',
                  borderRadius: 10, color: 'var(--neutral-200)', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Scissors size={14} /> Dividir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside menus to close */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setMenuOpen(null)} />
      )}
    </div>
  );
}
