'use client';

import { useState, useMemo } from 'react';
import {
  Egg, TrendingUp, Plus, ChevronRight, ArrowRight, X, Package, Check,
  Bird, Drumstick, Crown, ShoppingCart, CheckCircle2, MoreVertical, Baby
} from 'lucide-react';

/* ── Types ─────────────────────────────────────────── */
type Fase = 'Incubación' | 'Cría' | 'Juvenil' | 'Engorde' | 'Reproductores' | 'Venta' | 'Finalizado';

interface Lote {
  id: string;
  nombre: string;
  fase: Fase;
  animales: number;
  razaCruce: string;
  fechaInicio: string;
  dias: number;
  gallinero?: string;
  pesoMedio?: number;
  mortalidad: number;
  color: string;
}

/* ── Column config ────────────────────────────────── */
const FASES: { fase: Fase; icon: any; color: string; bg: string }[] = [
  { fase: 'Incubación',    icon: Egg,            color: '#F59E0B', bg: '#FFFBEB' },
  { fase: 'Cría',          icon: Baby,           color: '#F97316', bg: '#FFF7ED' },
  { fase: 'Juvenil',       icon: Bird,           color: '#3B82F6', bg: '#EFF6FF' },
  { fase: 'Engorde',       icon: Drumstick,      color: '#8B5CF6', bg: '#F5F3FF' },
  { fase: 'Reproductores', icon: Crown,          color: '#EC4899', bg: '#FDF2F8' },
  { fase: 'Venta',         icon: ShoppingCart,    color: '#10B981', bg: '#ECFDF5' },
  { fase: 'Finalizado',    icon: CheckCircle2,   color: '#6B7280', bg: '#F9FAFB' },
];

/* ── Demo lots ─────────────────────────────────────── */
const INITIAL_LOTES: Lote[] = [
  { id: 'LOT-2025-001', nombre: 'Lote Navidad 2025', fase: 'Engorde', animales: 12, razaCruce: 'CN × PR', fechaInicio: '2025-02-15', dias: 142, gallinero: 'Zona Capones', pesoMedio: 2.8, mortalidad: 1, color: '#8B5CF6' },
  { id: 'LOT-2025-002', nombre: 'Lote Reproductores', fase: 'Reproductores', animales: 20, razaCruce: 'Castellana Negra', fechaInicio: '2024-03-10', dias: 362, gallinero: 'Gallinero Principal', pesoMedio: 2.1, mortalidad: 0, color: '#EC4899' },
  { id: 'LOT-2025-003', nombre: 'Incubación Primavera', fase: 'Incubación', animales: 24, razaCruce: 'CN × PL + PR', fechaInicio: '2025-06-28', dias: 5, gallinero: 'Incubadora', mortalidad: 0, color: '#F59E0B' },
  { id: 'LOT-2025-004', nombre: 'Pollitos Mayo', fase: 'Cría', animales: 18, razaCruce: 'Plymouth Rock', fechaInicio: '2025-05-20', dias: 42, gallinero: 'Zona Cría', pesoMedio: 0.6, mortalidad: 2, color: '#F97316' },
  { id: 'LOT-2025-005', nombre: 'Juveniles Abril', fase: 'Juvenil', animales: 15, razaCruce: 'CN × PR', fechaInicio: '2025-04-01', dias: 91, gallinero: 'Parque 2', pesoMedio: 1.4, mortalidad: 1, color: '#3B82F6' },
  { id: 'LOT-2025-006', nombre: 'Lote Pascua', fase: 'Venta', animales: 8, razaCruce: 'Mos × CN', fechaInicio: '2024-09-15', dias: 292, pesoMedio: 4.1, mortalidad: 0, color: '#10B981' },
];

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function ProductionPage() {
  const [lotes, setLotes] = useState<Lote[]>(INITIAL_LOTES);
  const [moveModal, setMoveModal] = useState<{ lote: Lote; targetFase?: Fase } | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [detailLote, setDetailLote] = useState<Lote | null>(null);
  const [contextMenu, setContextMenu] = useState<string | null>(null);

  // New lot form
  const [newNombre, setNewNombre] = useState('');
  const [newFase, setNewFase] = useState<Fase>('Incubación');
  const [newAnimales, setNewAnimales] = useState(10);
  const [newRaza, setNewRaza] = useState('');

  const lotesPerFase = useMemo(() => {
    const map: Record<Fase, Lote[]> = {} as any;
    FASES.forEach(f => { map[f.fase] = []; });
    lotes.forEach(l => { if (map[l.fase]) map[l.fase].push(l); });
    return map;
  }, [lotes]);

  function moveLote(loteId: string, targetFase: Fase) {
    setLotes(prev => prev.map(l => l.id === loteId ? { ...l, fase: targetFase } : l));
    setMoveModal(null);
    setContextMenu(null);
  }

  function createLote() {
    if (!newNombre || !newRaza) return;
    const id = `LOT-2025-${String(lotes.length + 1).padStart(3, '0')}`;
    setLotes(prev => [...prev, {
      id, nombre: newNombre, fase: newFase, animales: newAnimales,
      razaCruce: newRaza, fechaInicio: new Date().toISOString().slice(0, 10),
      dias: 0, mortalidad: 0, color: FASES.find(f => f.fase === newFase)?.color || '#888',
    }]);
    setCreateModal(false);
    setNewNombre(''); setNewRaza('');
  }

  function deleteLote(id: string) {
    setLotes(prev => prev.filter(l => l.id !== id));
    setContextMenu(null);
  }

  function getNextFase(fase: Fase): Fase | null {
    const idx = FASES.findIndex(f => f.fase === fase);
    return idx < FASES.length - 1 ? FASES[idx + 1].fase : null;
  }

  // KPIs
  const totalAves = lotes.reduce((s, l) => s + l.animales, 0);
  const lotesActivos = lotes.filter(l => l.fase !== 'Finalizado').length;

  return (
    <div className="nf-content" style={{ padding: 20 }}>
      {/* Header + KPIs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', margin: 0 }}>
            Producción — Kanban
          </h1>
          <p style={{ fontSize: 13, color: 'var(--neutral-500)', margin: '4px 0 0' }}>
            Arrastra lotes entre fases o usa el menú para moverlos
          </p>
        </div>
        <button onClick={() => setCreateModal(true)} className="nf-btn primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Nuevo lote
        </button>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { v: totalAves, l: 'Aves total', c: 'var(--primary-600)' },
          { v: lotesActivos, l: 'Lotes activos', c: 'var(--info)' },
          { v: lotes.filter(l => l.fase === 'Venta').reduce((s, l) => s + l.animales, 0), l: 'En venta', c: 'var(--ok)' },
          { v: lotes.filter(l => l.fase === 'Incubación').reduce((s, l) => s + l.animales, 0), l: 'Incubando', c: 'var(--warn)' },
        ].map(k => (
          <div key={k.l} style={{
            background: 'white', borderRadius: 10, padding: '12px 18px',
            border: '1px solid var(--neutral-100)', minWidth: 110,
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.c, fontFamily: 'var(--font-mono)' }}>{k.v}</div>
            <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* Kanban board — horizontal scroll */}
      <div style={{
        display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12,
        minHeight: 400,
      }}>
        {FASES.map(({ fase, icon: Icon, color, bg }) => {
          const lots = lotesPerFase[fase] || [];
          return (
            <div key={fase} style={{
              minWidth: 200, maxWidth: 220, flexShrink: 0,
              background: bg, borderRadius: 12,
              border: `1px solid ${color}22`, display: 'flex', flexDirection: 'column',
            }}>
              {/* Column header */}
              <div style={{
                padding: '10px 12px', borderBottom: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Icon size={16} style={{ color }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-800)' }}>{fase}</span>
                <span style={{
                  marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                  background: `${color}20`, color, borderRadius: 10, padding: '2px 8px',
                }}>
                  {lots.length}
                </span>
              </div>

              {/* Lot cards — vertical scroll within column */}
              <div style={{ padding: 8, flex: 1, overflowY: 'auto', maxHeight: 500, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lots.map(lote => (
                  <div key={lote.id} style={{
                    background: 'white', borderRadius: 10, padding: 10,
                    border: '1px solid var(--neutral-100)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    position: 'relative', cursor: 'pointer',
                  }}
                    onClick={() => setDetailLote(lote)}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', background: lote.color,
                        flexShrink: 0, marginTop: 3,
                      }} />
                      <div style={{ flex: 1, marginLeft: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-800)', lineHeight: 1.2 }}>
                          {lote.nombre}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--neutral-400)' }}>{lote.id}</div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setContextMenu(contextMenu === lote.id ? null : lote.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--neutral-400)' }}
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 11 }}>
                      <span style={{ color: 'var(--neutral-600)', fontWeight: 600 }}>
                        🐔 {lote.animales}
                      </span>
                      {lote.pesoMedio && (
                        <span style={{ color: 'var(--neutral-500)' }}>⚖️ {lote.pesoMedio}kg</span>
                      )}
                      <span style={{ color: 'var(--neutral-400)' }}>{lote.dias}d</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--neutral-400)', marginTop: 4 }}>{lote.razaCruce}</div>

                    {/* Move button */}
                    {getNextFase(lote.fase) && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          moveLote(lote.id, getNextFase(lote.fase)!);
                        }}
                        style={{
                          marginTop: 8, width: '100%', padding: '5px 0', borderRadius: 6,
                          background: `${color}15`, border: `1px solid ${color}30`, cursor: 'pointer',
                          fontSize: 10, fontWeight: 600, color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        }}
                      >
                        Mover a {getNextFase(lote.fase)} <ArrowRight size={12} />
                      </button>
                    )}

                    {/* Context menu */}
                    {contextMenu === lote.id && (
                      <div onClick={e => e.stopPropagation()} style={{
                        position: 'absolute', top: 30, right: 8, zIndex: 50,
                        background: 'white', border: '1px solid var(--neutral-200)', borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)', padding: 4, minWidth: 160,
                      }}>
                        <div style={{ fontSize: 10, color: 'var(--neutral-400)', padding: '4px 8px', fontWeight: 700 }}>
                          MOVER A:
                        </div>
                        {FASES.filter(f => f.fase !== lote.fase).map(f => (
                          <button key={f.fase} onClick={() => moveLote(lote.id, f.fase)} style={{
                            display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                            padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 12, color: 'var(--neutral-700)', borderRadius: 4,
                          }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--neutral-50)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                          >
                            <f.icon size={12} style={{ color: f.color }} /> {f.fase}
                          </button>
                        ))}
                        <div style={{ borderTop: '1px solid var(--neutral-100)', marginTop: 4, paddingTop: 4 }}>
                          <button onClick={() => deleteLote(lote.id)} style={{
                            display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                            padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 12, color: 'var(--alert)', borderRadius: 4,
                          }}>
                            🗑️ Eliminar lote
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {lots.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 20, fontSize: 11, color: 'var(--neutral-400)' }}>
                    Sin lotes
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Detail modal ──── */}
      {detailLote && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setDetailLote(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 16, padding: 24, width: 440,
            boxShadow: '0 16px 48px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--neutral-900)', margin: 0 }}>{detailLote.nombre}</h3>
                <div style={{ fontSize: 12, color: 'var(--neutral-400)' }}>{detailLote.id}</div>
              </div>
              <button onClick={() => setDetailLote(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { l: 'Fase', v: detailLote.fase },
                { l: 'Animales', v: detailLote.animales },
                { l: 'Raza/Cruce', v: detailLote.razaCruce },
                { l: 'Días', v: detailLote.dias },
                { l: 'Peso medio', v: detailLote.pesoMedio ? `${detailLote.pesoMedio} kg` : '—' },
                { l: 'Mortalidad', v: `${detailLote.mortalidad}%` },
                { l: 'Gallinero', v: detailLote.gallinero || '—' },
                { l: 'Inicio', v: detailLote.fechaInicio },
              ].map(r => (
                <div key={r.l}>
                  <div style={{ fontSize: 11, color: 'var(--neutral-400)', marginBottom: 2 }}>{r.l}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-800)' }}>{r.v}</div>
                </div>
              ))}
            </div>
            {getNextFase(detailLote.fase) && (
              <button
                onClick={() => { moveLote(detailLote.id, getNextFase(detailLote.fase)!); setDetailLote(null); }}
                className="nf-btn primary" style={{ width: '100%', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                Avanzar a {getNextFase(detailLote.fase)} <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Move modal ──── */}
      {moveModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setMoveModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 16, padding: 24, width: 380,
            boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--neutral-900)', marginBottom: 12 }}>
              Mover "{moveModal.lote.nombre}"
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {FASES.filter(f => f.fase !== moveModal.lote.fase).map(f => (
                <button key={f.fase} onClick={() => moveLote(moveModal.lote.id, f.fase)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                  background: 'var(--neutral-50)', border: '1px solid var(--neutral-100)', borderRadius: 8,
                  cursor: 'pointer', fontSize: 13, color: 'var(--neutral-800)',
                }}>
                  <f.icon size={16} style={{ color: f.color }} /> {f.fase}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Create modal ──── */}
      {createModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setCreateModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 16, padding: 24, width: 400,
            boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--neutral-900)', marginBottom: 16 }}>Nuevo lote</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-600)', display: 'block', marginBottom: 4 }}>Nombre</label>
                <input className="nf-input" value={newNombre} onChange={e => setNewNombre(e.target.value)} placeholder="Lote Navidad 2025" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-600)', display: 'block', marginBottom: 4 }}>Fase inicial</label>
                <select className="nf-input" value={newFase} onChange={e => setNewFase(e.target.value as Fase)} style={{ width: '100%' }}>
                  {FASES.map(f => <option key={f.fase} value={f.fase}>{f.fase}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-600)', display: 'block', marginBottom: 4 }}>Animales</label>
                <input className="nf-input" type="number" value={newAnimales} onChange={e => setNewAnimales(+e.target.value)} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-600)', display: 'block', marginBottom: 4 }}>Raza / Cruce</label>
                <input className="nf-input" value={newRaza} onChange={e => setNewRaza(e.target.value)} placeholder="CN × PR" style={{ width: '100%' }} />
              </div>
              <button onClick={createLote} className="nf-btn primary" style={{ width: '100%', marginTop: 4 }}>
                <Plus size={16} /> Crear lote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click-away for context menu */}
      {contextMenu && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setContextMenu(null)} />
      )}
    </div>
  );
}
