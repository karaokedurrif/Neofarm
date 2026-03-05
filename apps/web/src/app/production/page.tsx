'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  DndContext, DragOverlay, closestCorners, useSensor, useSensors,
  PointerSensor, KeyboardSensor, DragStartEvent, DragEndEvent, DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Egg, Plus, ArrowRight, X, Package, Bird, Drumstick,
  Crown, ShoppingCart, CheckCircle2, MoreVertical, Baby,
  Scissors, AlertTriangle, GripVertical
} from 'lucide-react';

/* ── Types ─────────────────────────────────────────── */
type Fase = 'Incubación' | 'Cría' | 'Juvenil' | 'Engorde' | 'Reproductores' | 'Venta' | 'Finalizado';

interface Lote {
  id: string;
  nombre: string;
  fase: Fase;
  animales: number;
  desglose?: { machos: number; hembras: number; sinSexar: number };
  razaCruce: string;
  fechaInicio: string;
  fechaEstimadaSiguienteFase: string;
  gallinero?: string;
  pesoMedio?: number;
  mortalidad: number;
  notas?: string;
}

/* ── Kanban column config (high contrast per spec) ── */
const KANBAN_COLS: { fase: Fase; bg: string; border: string; emoji: string; icon: any }[] = [
  { fase: 'Incubación',    bg: '#FFF8E1', border: '#F9A825', emoji: '🥚', icon: Egg },
  { fase: 'Cría',          bg: '#E8F5E9', border: '#43A047', emoji: '🐣', icon: Baby },
  { fase: 'Juvenil',       bg: '#E3F2FD', border: '#1E88E5', emoji: '🐥', icon: Bird },
  { fase: 'Engorde',       bg: '#FFF3E0', border: '#EF6C00', emoji: '🐔', icon: Drumstick },
  { fase: 'Reproductores', bg: '#F3E5F5', border: '#8E24AA', emoji: '🐓', icon: Crown },
  { fase: 'Venta',         bg: '#E0F2F1', border: '#00897B', emoji: '📦', icon: ShoppingCart },
  { fase: 'Finalizado',    bg: '#EFEBE9', border: '#6D4C41', emoji: '✅', icon: CheckCircle2 },
];

/* ── Demo lots ─────────────────────────────────────── */
const INITIAL_LOTES: Lote[] = [
  { id: 'LOT-2025-001', nombre: 'Lote Navidad 2025', fase: 'Engorde', animales: 12, desglose: { machos: 12, hembras: 0, sinSexar: 0 }, razaCruce: 'CN × Plymouth Rock', fechaInicio: '2025-02-15', fechaEstimadaSiguienteFase: '2025-11-15', gallinero: 'Zona Capones', pesoMedio: 2.8, mortalidad: 1, notas: 'Capones para Navidad — engorde lento' },
  { id: 'LOT-2025-002', nombre: 'Lote Reproductores', fase: 'Reproductores', animales: 20, desglose: { machos: 2, hembras: 18, sinSexar: 0 }, razaCruce: 'Castellana Negra', fechaInicio: '2024-03-10', fechaEstimadaSiguienteFase: '—', gallinero: 'Gallinero Principal', pesoMedio: 2.1, mortalidad: 0 },
  { id: 'LOT-2025-003', nombre: 'Incubación Primavera', fase: 'Incubación', animales: 24, razaCruce: 'CN × PL + PR', fechaInicio: '2025-06-28', fechaEstimadaSiguienteFase: '2025-07-19', gallinero: 'Incubadora', mortalidad: 0 },
  { id: 'LOT-2025-004', nombre: 'Pollitos Mayo', fase: 'Cría', animales: 18, desglose: { machos: 0, hembras: 0, sinSexar: 18 }, razaCruce: 'Plymouth Rock', fechaInicio: '2025-05-20', fechaEstimadaSiguienteFase: '2025-07-01', gallinero: 'Zona Cría', pesoMedio: 0.6, mortalidad: 2 },
  { id: 'LOT-2025-005', nombre: 'Juveniles Abril', fase: 'Juvenil', animales: 15, desglose: { machos: 7, hembras: 8, sinSexar: 0 }, razaCruce: 'CN × PR', fechaInicio: '2025-04-01', fechaEstimadaSiguienteFase: '2025-08-15', gallinero: 'Parque 2', pesoMedio: 1.4, mortalidad: 1 },
  { id: 'LOT-2025-006', nombre: 'Lote Pascua', fase: 'Venta', animales: 8, razaCruce: 'Mos × CN', fechaInicio: '2024-09-15', fechaEstimadaSiguienteFase: '—', pesoMedio: 4.1, mortalidad: 0, notas: 'Listos para venta a restaurantes' },
  { id: 'LOT-2025-007', nombre: 'Engorde Otoño', fase: 'Engorde', animales: 10, desglose: { machos: 10, hembras: 0, sinSexar: 0 }, razaCruce: 'CN × Sulmtaler', fechaInicio: '2025-03-10', fechaEstimadaSiguienteFase: '2025-12-20', gallinero: 'Zona Capones', pesoMedio: 2.2, mortalidad: 0 },
  { id: 'LOT-2025-008', nombre: 'Cría Verano', fase: 'Cría', animales: 22, desglose: { machos: 0, hembras: 0, sinSexar: 22 }, razaCruce: 'CN puro', fechaInicio: '2025-06-10', fechaEstimadaSiguienteFase: '2025-07-22', gallinero: 'Zona Cría', pesoMedio: 0.3, mortalidad: 1 },
];

/* ── helpers ── */
function daysBetween(a: string) {
  const d = new Date(a);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
}
function faseIndex(f: Fase) { return KANBAN_COLS.findIndex(c => c.fase === f); }
function nextFase(f: Fase): Fase | null { const i = faseIndex(f); return i < KANBAN_COLS.length - 1 ? KANBAN_COLS[i + 1].fase : null; }

/* ══════════════════════════════════════════════════════
   SORTABLE LOT CARD (draggable)
   ══════════════════════════════════════════════════════ */
function LoteCard({ lote, col, onDetail, onContext, contextOpen, onContextAction, onDivide }: {
  lote: Lote; col: typeof KANBAN_COLS[0];
  onDetail: () => void; onContext: () => void; contextOpen: boolean;
  onContextAction: (action: string, target?: Fase) => void;
  onDivide: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lote.id,
    data: { type: 'lote', fase: lote.fase },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    background: 'white', borderRadius: 10, padding: 10,
    border: `1px solid ${col.border}30`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    position: 'relative', cursor: 'grab', touchAction: 'none',
  };

  const dias = daysBetween(lote.fechaInicio);

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Drag handle + header */}
      <div style={{ display: 'flex', alignItems: 'start', gap: 4 }}>
        <div {...listeners} style={{ cursor: 'grab', color: 'var(--neutral-300)', flexShrink: 0, marginTop: 2 }}>
          <GripVertical size={14} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }} onClick={onDetail}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-800)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {lote.nombre}
          </div>
          <div style={{ fontSize: 10, color: 'var(--neutral-400)', fontFamily: 'var(--font-mono)' }}>{lote.id}</div>
        </div>
        <button onClick={e => { e.stopPropagation(); onContext(); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--neutral-400)', flexShrink: 0 }}>
          <MoreVertical size={14} />
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 6, marginTop: 8, fontSize: 11, flexWrap: 'wrap' }}>
        <span title="Animales" style={{ color: col.border, fontWeight: 700 }}>🐔 {lote.animales}</span>
        {lote.pesoMedio != null && <span style={{ color: 'var(--neutral-500)' }}>⚖️ {lote.pesoMedio}kg</span>}
        <span style={{ color: 'var(--neutral-400)' }}>{dias}d</span>
        {lote.mortalidad > 0 && <span style={{ color: 'var(--alert)' }}>💀 {lote.mortalidad}%</span>}
      </div>

      {/* Desglose */}
      {lote.desglose && (
        <div style={{ display: 'flex', gap: 6, marginTop: 4, fontSize: 10, color: 'var(--neutral-500)' }}>
          {lote.desglose.machos > 0 && <span>♂ {lote.desglose.machos}</span>}
          {lote.desglose.hembras > 0 && <span>♀ {lote.desglose.hembras}</span>}
          {lote.desglose.sinSexar > 0 && <span>? {lote.desglose.sinSexar}</span>}
        </div>
      )}

      <div style={{ fontSize: 10, color: 'var(--neutral-400)', marginTop: 4 }}>{lote.razaCruce}</div>

      {/* Action buttons row */}
      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
        {nextFase(lote.fase) && (
          <button onClick={e => { e.stopPropagation(); onContextAction('move', nextFase(lote.fase)!); }}
            style={{
              flex: 1, padding: '5px 0', borderRadius: 6,
              background: `${col.border}15`, border: `1px solid ${col.border}30`, cursor: 'pointer',
              fontSize: 10, fontWeight: 600, color: col.border,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
            }}>
            → {nextFase(lote.fase)} <ArrowRight size={10} />
          </button>
        )}
        <button onClick={e => { e.stopPropagation(); onDivide(); }}
          title="Dividir lote"
          style={{
            padding: '5px 8px', borderRadius: 6,
            background: 'var(--neutral-50)', border: '1px solid var(--neutral-200)', cursor: 'pointer',
            fontSize: 10, color: 'var(--neutral-600)', display: 'flex', alignItems: 'center', gap: 3,
          }}>
          <Scissors size={10} /> Dividir
        </button>
      </div>

      {/* Context menu dropdown */}
      {contextOpen && (
        <div onClick={e => e.stopPropagation()} style={{
          position: 'absolute', top: 28, right: 4, zIndex: 50,
          background: 'white', border: '1px solid var(--neutral-200)', borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.14)', padding: 4, minWidth: 170,
        }}>
          <div style={{ fontSize: 10, color: 'var(--neutral-400)', padding: '4px 8px', fontWeight: 700 }}>MOVER A:</div>
          {KANBAN_COLS.filter(c => c.fase !== lote.fase).map(c => (
            <button key={c.fase} onClick={() => onContextAction('move', c.fase)} style={{
              display: 'flex', alignItems: 'center', gap: 6, width: '100%', textAlign: 'left',
              padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'var(--neutral-700)', borderRadius: 4,
            }} onMouseEnter={e => (e.currentTarget.style.background = c.bg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <span>{c.emoji}</span> {c.fase}
            </button>
          ))}
          <div style={{ borderTop: '1px solid var(--neutral-100)', marginTop: 4, paddingTop: 4 }}>
            <button onClick={() => onContextAction('delete')} style={{
              display: 'flex', alignItems: 'center', gap: 6, width: '100%',
              padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'var(--alert)', borderRadius: 4,
            }}>🗑️ Eliminar lote</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   DROPPABLE COLUMN
   ══════════════════════════════════════════════════════ */
function KanbanColumn({ col, lotes, children }: {
  col: typeof KANBAN_COLS[0]; lotes: Lote[]; children: React.ReactNode;
}) {
  const Icon = col.icon;
  return (
    <div style={{
      minWidth: 210, maxWidth: 240, flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: col.bg, borderRadius: 12, border: `2px solid ${col.border}33`,
    }}>
      {/* Column header */}
      <div style={{
        padding: '10px 12px', borderBottom: `3px solid ${col.border}`,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ fontSize: 16 }}>{col.emoji}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: col.border }}>{col.fase}</span>
        <span style={{
          marginLeft: 'auto', fontSize: 11, fontWeight: 700,
          background: col.border, color: '#fff', borderRadius: 10, padding: '2px 8px',
          minWidth: 20, textAlign: 'center',
        }}>
          {lotes.length}
        </span>
      </div>
      {/* Cards area — scrollable */}
      <SortableContext items={lotes.map(l => l.id)} strategy={verticalListSortingStrategy}>
        <div style={{
          padding: 8, flex: 1, overflowY: 'auto', maxHeight: 520,
          display: 'flex', flexDirection: 'column', gap: 8,
          minHeight: 60,
        }}>
          {children}
          {lotes.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '24px 8px', fontSize: 11, color: `${col.border}80`,
              border: `2px dashed ${col.border}40`, borderRadius: 8, background: `${col.border}08`,
            }}>
              Arrastra un lote aquí
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════ */
export default function ProductionPage() {
  const [lotes, setLotes] = useState<Lote[]>(INITIAL_LOTES);
  const [contextMenu, setContextMenu] = useState<string | null>(null);
  const [detailLote, setDetailLote] = useState<Lote | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [confirmMove, setConfirmMove] = useState<{ lote: Lote; from: Fase; to: Fase } | null>(null);
  const [divideModal, setDivideModal] = useState<Lote | null>(null);
  const [divMachos, setDivMachos] = useState(0);
  const [divHembras, setDivHembras] = useState(0);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // New lot form state
  const [newNombre, setNewNombre] = useState('');
  const [newFase, setNewFase] = useState<Fase>('Incubación');
  const [newAnimales, setNewAnimales] = useState(10);
  const [newRaza, setNewRaza] = useState('');

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const lotesPerFase = useMemo(() => {
    const map = Object.fromEntries(KANBAN_COLS.map(c => [c.fase, [] as Lote[]])) as Record<Fase, Lote[]>;
    lotes.forEach(l => { if (map[l.fase]) map[l.fase].push(l); });
    return map;
  }, [lotes]);

  // Find which column a lote ID belongs to
  const findFaseForId = useCallback((id: string): Fase | null => {
    const l = lotes.find(x => x.id === id);
    return l ? l.fase : null;
  }, [lotes]);

  /* ── Drag handlers ── */
  function handleDragStart(e: DragStartEvent) {
    setActiveDragId(e.active.id as string);
    setContextMenu(null);
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeFase = findFaseForId(activeId);
    let overFase = findFaseForId(overId);

    // If over is a column (fase name matches), treat it as dropping into that column
    if (!overFase) {
      const col = KANBAN_COLS.find(c => c.fase === overId);
      if (col) overFase = col.fase;
    }

    if (activeFase && overFase && activeFase !== overFase) {
      // Move immediately for visual feedback (will confirm on drop)
      setLotes(prev => prev.map(l => l.id === activeId ? { ...l, fase: overFase! } : l));
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveDragId(null);

    if (!over) return;

    const lote = INITIAL_LOTES.find(l => l.id === active.id) || lotes.find(l => l.id === active.id);
    if (!lote) return;

    const currentFase = lotes.find(l => l.id === active.id)?.fase;
    const originalFase = INITIAL_LOTES.find(l => l.id === active.id)?.fase || lote.fase;

    // If the lote is now in a different column from its original, show confirmation
    if (currentFase && currentFase !== originalFase) {
      // Revert first, then confirm
      setLotes(prev => prev.map(l => l.id === lote.id ? { ...l, fase: originalFase } : l));
      setConfirmMove({ lote: { ...lote, fase: originalFase }, from: originalFase, to: currentFase });
    }
  }

  function confirmMoveAction() {
    if (!confirmMove) return;
    const now = new Date().toISOString().slice(0, 10);
    setLotes(prev => prev.map(l =>
      l.id === confirmMove.lote.id ? { ...l, fase: confirmMove.to, notas: `${l.notas ? l.notas + ' | ' : ''}Movido ${confirmMove.from}→${confirmMove.to} el ${now}` } : l
    ));
    setConfirmMove(null);
  }

  function moveLoteDirect(loteId: string, from: Fase, to: Fase) {
    const lote = lotes.find(l => l.id === loteId);
    if (!lote) return;
    setConfirmMove({ lote, from, to });
    setContextMenu(null);
  }

  function deleteLote(id: string) {
    setLotes(prev => prev.filter(l => l.id !== id));
    setContextMenu(null);
  }

  function createLote() {
    if (!newNombre || !newRaza) return;
    const id = `LOT-2025-${String(lotes.length + 1).padStart(3, '0')}`;
    setLotes(prev => [...prev, {
      id, nombre: newNombre, fase: newFase, animales: newAnimales,
      razaCruce: newRaza, fechaInicio: new Date().toISOString().slice(0, 10),
      fechaEstimadaSiguienteFase: '—', mortalidad: 0,
    }]);
    setCreateModal(false);
    setNewNombre(''); setNewRaza(''); setNewAnimales(10);
  }

  function openDivide(lote: Lote) {
    setDivideModal(lote);
    setDivMachos(lote.desglose?.machos || Math.floor(lote.animales / 2));
    setDivHembras(lote.desglose?.hembras || Math.ceil(lote.animales / 2));
    setContextMenu(null);
  }

  function confirmDivide() {
    if (!divideModal) return;
    const total = divMachos + divHembras;
    if (total > divideModal.animales || total <= 0) return;

    const baseName = divideModal.nombre;
    const newLotes = lotes.filter(l => l.id !== divideModal.id);

    if (divMachos > 0) {
      newLotes.push({
        ...divideModal,
        id: `${divideModal.id}-M`,
        nombre: `${baseName} (♂)`,
        animales: divMachos,
        desglose: { machos: divMachos, hembras: 0, sinSexar: 0 },
      });
    }
    if (divHembras > 0) {
      newLotes.push({
        ...divideModal,
        id: `${divideModal.id}-F`,
        nombre: `${baseName} (♀)`,
        animales: divHembras,
        desglose: { machos: 0, hembras: divHembras, sinSexar: 0 },
      });
    }
    const remainder = divideModal.animales - total;
    if (remainder > 0) {
      newLotes.push({
        ...divideModal,
        id: `${divideModal.id}-X`,
        nombre: `${baseName} (sin sexar)`,
        animales: remainder,
        desglose: { machos: 0, hembras: 0, sinSexar: remainder },
      });
    }

    setLotes(newLotes);
    setDivideModal(null);
  }

  // KPIs
  const totalAves = lotes.reduce((s, l) => s + l.animales, 0);
  const lotesActivos = lotes.filter(l => l.fase !== 'Finalizado').length;
  const activeDragLote = activeDragId ? lotes.find(l => l.id === activeDragId) : null;

  return (
    <div className="nf-content" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', margin: 0 }}>
            Producción — Kanban
          </h1>
          <p style={{ fontSize: 13, color: 'var(--neutral-500)', margin: '4px 0 0' }}>
            Arrastra lotes entre fases para cambiar su estado
          </p>
        </div>
        <button onClick={() => setCreateModal(true)} className="nf-btn primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
          <Plus size={16} /> Nuevo lote
        </button>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { v: totalAves, l: 'Aves total', c: 'var(--primary-600)', emoji: '🐔' },
          { v: lotesActivos, l: 'Lotes activos', c: '#1E88E5', emoji: '📋' },
          { v: lotes.filter(l => l.fase === 'Venta').reduce((s, l) => s + l.animales, 0), l: 'Listos venta', c: '#00897B', emoji: '📦' },
          { v: lotes.filter(l => l.fase === 'Incubación').reduce((s, l) => s + l.animales, 0), l: 'Incubando', c: '#F9A825', emoji: '🥚' },
          { v: lotes.filter(l => l.fase === 'Engorde').reduce((s, l) => s + l.animales, 0), l: 'Engorde', c: '#EF6C00', emoji: '🐔' },
        ].map(k => (
          <div key={k.l} style={{
            background: 'white', borderRadius: 10, padding: '10px 16px',
            border: '1px solid var(--neutral-100)', minWidth: 100,
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.c, fontFamily: 'var(--font-mono)' }}>{k.emoji} {k.v}</div>
            <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* ════ KANBAN BOARD with DnD ════ */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div style={{
          display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16,
          minHeight: 400,
        }}>
          {KANBAN_COLS.map(col => {
            const lots = lotesPerFase[col.fase] || [];
            return (
              <KanbanColumn key={col.fase} col={col} lotes={lots}>
                {lots.map(lote => (
                  <LoteCard
                    key={lote.id}
                    lote={lote}
                    col={col}
                    onDetail={() => setDetailLote(lote)}
                    onContext={() => setContextMenu(contextMenu === lote.id ? null : lote.id)}
                    contextOpen={contextMenu === lote.id}
                    onContextAction={(action, target) => {
                      if (action === 'delete') deleteLote(lote.id);
                      else if (action === 'move' && target) moveLoteDirect(lote.id, lote.fase, target);
                    }}
                    onDivide={() => openDivide(lote)}
                  />
                ))}
              </KanbanColumn>
            );
          })}
        </div>

        {/* Drag overlay — ghost card while dragging */}
        <DragOverlay>
          {activeDragLote ? (
            <div style={{
              background: 'white', borderRadius: 10, padding: 10,
              border: '2px solid var(--primary-500)', boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              width: 210, opacity: 0.9,
            }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--neutral-800)' }}>{activeDragLote.nombre}</div>
              <div style={{ fontSize: 11, color: 'var(--neutral-500)', marginTop: 4 }}>🐔 {activeDragLote.animales} · {activeDragLote.razaCruce}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8,
        fontSize: 11, color: 'var(--neutral-500)',
      }}>
        <span>💡 Arrastra las tarjetas entre columnas · Haz click para ver detalle · Usa ✂️ para dividir lotes</span>
      </div>

      {/* ═══ CONFIRM MOVE MODAL ═══ */}
      {confirmMove && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => { setConfirmMove(null); }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 16, padding: 24, width: 400,
            boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <AlertTriangle size={20} style={{ color: '#F59E0B' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--neutral-900)', margin: 0 }}>Confirmar movimiento</h3>
            </div>
            <p style={{ fontSize: 14, color: 'var(--neutral-600)', lineHeight: 1.6, marginBottom: 20 }}>
              ¿Mover <strong>"{confirmMove.lote.nombre}"</strong> de{' '}
              <span style={{ color: KANBAN_COLS.find(c => c.fase === confirmMove.from)?.border, fontWeight: 700 }}>
                {KANBAN_COLS.find(c => c.fase === confirmMove.from)?.emoji} {confirmMove.from}
              </span>
              {' '}a{' '}
              <span style={{ color: KANBAN_COLS.find(c => c.fase === confirmMove.to)?.border, fontWeight: 700 }}>
                {KANBAN_COLS.find(c => c.fase === confirmMove.to)?.emoji} {confirmMove.to}
              </span>?
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmMove(null)} style={{
                padding: '10px 20px', borderRadius: 8, border: '1px solid var(--neutral-200)',
                background: 'white', cursor: 'pointer', fontWeight: 600, color: 'var(--neutral-600)',
              }}>Cancelar</button>
              <button onClick={confirmMoveAction} className="nf-btn primary" style={{
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                Mover <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DIVIDE MODAL ═══ */}
      {divideModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setDivideModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 16, padding: 24, width: 400,
            boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Scissors size={20} style={{ color: 'var(--primary-500)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--neutral-900)', margin: 0 }}>
                Dividir "{divideModal.nombre}"
              </h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--neutral-500)', marginBottom: 16 }}>
              Total: <strong>{divideModal.animales} aves</strong>. Separa en machos y hembras (el resto queda como "sin sexar").
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-600)', display: 'block', marginBottom: 4 }}>♂ Machos</label>
                <input className="nf-input" type="number" min={0} max={divideModal.animales}
                  value={divMachos} onChange={e => setDivMachos(+e.target.value)} style={{ width: '100%' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-600)', display: 'block', marginBottom: 4 }}>♀ Hembras</label>
                <input className="nf-input" type="number" min={0} max={divideModal.animales}
                  value={divHembras} onChange={e => setDivHembras(+e.target.value)} style={{ width: '100%' }} />
              </div>
            </div>
            {(divMachos + divHembras) > divideModal.animales && (
              <div style={{ fontSize: 12, color: 'var(--alert)', marginBottom: 12 }}>
                ⚠️ La suma excede el total ({divMachos + divHembras} &gt; {divideModal.animales})
              </div>
            )}
            {(divMachos + divHembras) < divideModal.animales && (
              <div style={{ fontSize: 12, color: 'var(--neutral-500)', marginBottom: 12 }}>
                ℹ️ {divideModal.animales - divMachos - divHembras} quedarán como "sin sexar"
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setDivideModal(null)} style={{
                padding: '10px 20px', borderRadius: 8, border: '1px solid var(--neutral-200)',
                background: 'white', cursor: 'pointer', fontWeight: 600, color: 'var(--neutral-600)',
              }}>Cancelar</button>
              <button onClick={confirmDivide} className="nf-btn primary"
                disabled={(divMachos + divHembras) > divideModal.animales}>
                <Scissors size={14} /> Dividir lote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DETAIL MODAL ═══ */}
      {detailLote && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setDetailLote(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 16, padding: 24, width: 480,
            boxShadow: '0 16px 48px rgba(0,0,0,0.25)', maxHeight: '80vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--neutral-900)', margin: 0 }}>{detailLote.nombre}</h3>
                <div style={{ fontSize: 12, color: 'var(--neutral-400)', fontFamily: 'var(--font-mono)' }}>{detailLote.id}</div>
              </div>
              <button onClick={() => setDetailLote(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Phase badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              borderRadius: 8, marginBottom: 16, fontWeight: 700, fontSize: 13,
              background: KANBAN_COLS.find(c => c.fase === detailLote.fase)?.bg,
              color: KANBAN_COLS.find(c => c.fase === detailLote.fase)?.border,
              border: `1px solid ${KANBAN_COLS.find(c => c.fase === detailLote.fase)?.border}40`,
            }}>
              {KANBAN_COLS.find(c => c.fase === detailLote.fase)?.emoji} {detailLote.fase}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              {[
                { l: 'Animales', v: `${detailLote.animales} aves` },
                { l: 'Raza/Cruce', v: detailLote.razaCruce },
                { l: 'Días en producción', v: `${daysBetween(detailLote.fechaInicio)} días` },
                { l: 'Peso medio', v: detailLote.pesoMedio ? `${detailLote.pesoMedio} kg` : '—' },
                { l: 'Mortalidad', v: `${detailLote.mortalidad}%` },
                { l: 'Gallinero', v: detailLote.gallinero || '—' },
                { l: 'Inicio', v: detailLote.fechaInicio },
                { l: 'Próxima fase', v: detailLote.fechaEstimadaSiguienteFase },
              ].map(r => (
                <div key={r.l}>
                  <div style={{ fontSize: 11, color: 'var(--neutral-400)', marginBottom: 2 }}>{r.l}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-800)' }}>{r.v}</div>
                </div>
              ))}
            </div>

            {/* Desglose */}
            {detailLote.desglose && (
              <div style={{ background: 'var(--neutral-50)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-700)', marginBottom: 6 }}>Desglose</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                  <span>♂ Machos: <strong>{detailLote.desglose.machos}</strong></span>
                  <span>♀ Hembras: <strong>{detailLote.desglose.hembras}</strong></span>
                  <span>? Sin sexar: <strong>{detailLote.desglose.sinSexar}</strong></span>
                </div>
              </div>
            )}

            {/* Notes */}
            {detailLote.notas && (
              <div style={{ background: '#FFFDE7', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12, color: '#827717', border: '1px solid #FFF9C4' }}>
                📝 {detailLote.notas}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              {nextFase(detailLote.fase) && (
                <button onClick={() => { moveLoteDirect(detailLote.id, detailLote.fase, nextFase(detailLote.fase)!); setDetailLote(null); }}
                  className="nf-btn primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  Avanzar a {nextFase(detailLote.fase)} <ArrowRight size={14} />
                </button>
              )}
              <button onClick={() => { openDivide(detailLote); setDetailLote(null); }}
                style={{
                  padding: '10px 16px', borderRadius: 8, border: '1px solid var(--neutral-200)',
                  background: 'white', cursor: 'pointer', fontWeight: 600, color: 'var(--neutral-600)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                <Scissors size={14} /> Dividir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CREATE MODAL ═══ */}
      {createModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setCreateModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 16, padding: 24, width: 420,
            boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--neutral-900)', marginBottom: 16 }}>➕ Nuevo lote</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-600)', display: 'block', marginBottom: 4 }}>Nombre</label>
                <input className="nf-input" value={newNombre} onChange={e => setNewNombre(e.target.value)} placeholder="Lote Navidad 2026" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-600)', display: 'block', marginBottom: 4 }}>Fase inicial</label>
                <select className="nf-input" value={newFase} onChange={e => setNewFase(e.target.value as Fase)} style={{ width: '100%' }}>
                  {KANBAN_COLS.map(c => <option key={c.fase} value={c.fase}>{c.emoji} {c.fase}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-600)', display: 'block', marginBottom: 4 }}>Animales</label>
                <input className="nf-input" type="number" value={newAnimales} onChange={e => setNewAnimales(+e.target.value)} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-600)', display: 'block', marginBottom: 4 }}>Raza / Cruce</label>
                <input className="nf-input" value={newRaza} onChange={e => setNewRaza(e.target.value)} placeholder="CN × Plymouth Rock" style={{ width: '100%' }} />
              </div>
              <button onClick={createLote} className="nf-btn primary" style={{ width: '100%', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
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
