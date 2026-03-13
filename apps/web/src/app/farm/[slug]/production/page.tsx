'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { Plus, X, Egg, Bird, Package, Crown, ShoppingCart, CheckCircle2, Trash2, Edit2 } from 'lucide-react';

type Fase = 'Incubación' | 'Juvenil' | 'Engorde' | 'Reproductores' | 'Venta' | 'Finalizado';

interface Lote {
  id: number;
  nombre: string;
  fase: Fase;
  animales: number;
  razaCruce: string;
  fechaInicio: string;
  gallinero?: string;
  pesoMedio?: number;
  mortalidad: number;
  notas?: string;
}

interface LoteAPI {
  id: number;
  nombre: string;
  fase: string;
  animales: number;
  raza_cruce: string;
  fecha_inicio: string;
  gallinero: string | null;
  peso_medio: number | null;
  mortalidad: number;
  notas: string | null;
}

const KANBAN: { fase: Fase; bg: string; border: string; emoji: string }[] = [
  { fase: 'Incubación',    bg: '#FFF8E1', border: '#F9A825', emoji: '🥚' },
  { fase: 'Juvenil',       bg: '#E3F2FD', border: '#1E88E5', emoji: '🐥' },
  { fase: 'Engorde',       bg: '#FFF3E0', border: '#EF6C00', emoji: '🐔' },
  { fase: 'Reproductores', bg: '#F3E5F5', border: '#8E24AA', emoji: '🐓' },
  { fase: 'Venta',         bg: '#E0F2F1', border: '#00897B', emoji: '📦' },
  { fase: 'Finalizado',    bg: '#EFEBE9', border: '#6D4C41', emoji: '✅' },
];

const API = (slug: string) => `/api/ovosfera/farms/${encodeURIComponent(slug)}`;

function apiToLote(a: LoteAPI): Lote {
  return {
    id: a.id, nombre: a.nombre, fase: (a.fase || 'Incubación') as Fase,
    animales: a.animales, razaCruce: a.raza_cruce, fechaInicio: a.fecha_inicio,
    gallinero: a.gallinero || undefined, pesoMedio: a.peso_medio ?? undefined,
    mortalidad: a.mortalidad, notas: a.notas || undefined,
  };
}

export default function TenantProductionPage() {
  const { farm, slug } = useTenant();
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const emptyForm = () => ({
    nombre: '', fase: 'Incubación' as Fase, animales: '1', razaCruce: '',
    fechaInicio: new Date().toISOString().slice(0, 10), gallinero: '', pesoMedio: '', mortalidad: '0', notas: '',
  });
  const [form, setForm] = useState(emptyForm());

  const loadLotes = useCallback(async () => {
    if (!slug) return;
    try {
      const res = await fetch(`${API(slug)}/lotes`);
      if (res.ok) { setLotes((await res.json()).map(apiToLote)); }
    } catch {}
    setLoaded(true);
  }, [slug]);
  useEffect(() => { loadLotes(); }, [loadLotes]);

  const handleCreate = async () => {
    if (!slug || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`${API(slug)}/lotes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre || 'Lote nuevo', fase: form.fase,
          animales: parseInt(form.animales) || 1, raza_cruce: form.razaCruce || 'Sin especificar',
          fecha_inicio: form.fechaInicio, gallinero: form.gallinero || null,
          peso_medio: parseFloat(form.pesoMedio) || null, mortalidad: parseInt(form.mortalidad) || 0,
          notas: form.notas || null,
        }),
      });
      if (res.ok) { const c: LoteAPI = await res.json(); setLotes(p => [...p, apiToLote(c)]); }
    } catch {}
    setSaving(false); setShowCreate(false); setForm(emptyForm()); setEditId(null);
  };

  const handleUpdate = async () => {
    if (!slug || !editId || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`${API(slug)}/lotes/${editId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre || null, fase: form.fase,
          animales: parseInt(form.animales) || 1, raza_cruce: form.razaCruce || null,
          fecha_inicio: form.fechaInicio || null, gallinero: form.gallinero || null,
          peso_medio: parseFloat(form.pesoMedio) || null, mortalidad: parseInt(form.mortalidad) || 0,
          notas: form.notas || null,
        }),
      });
      if (res.ok) { const u: LoteAPI = await res.json(); setLotes(p => p.map(l => l.id === editId ? apiToLote(u) : l)); }
    } catch {}
    setSaving(false); setShowCreate(false); setForm(emptyForm()); setEditId(null);
  };

  const handleDelete = async (id: number) => {
    if (!slug) return;
    try {
      const res = await fetch(`${API(slug)}/lotes/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) { setLotes(p => p.filter(l => l.id !== id)); }
    } catch {}
  };

  const moveFase = async (id: number, newFase: Fase) => {
    if (!slug) return;
    try {
      const res = await fetch(`${API(slug)}/lotes/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fase: newFase }),
      });
      if (res.ok) { const u: LoteAPI = await res.json(); setLotes(p => p.map(l => l.id === id ? apiToLote(u) : l)); }
    } catch {}
  };

  const openEdit = (l: Lote) => {
    setEditId(l.id);
    setForm({
      nombre: l.nombre, fase: l.fase, animales: String(l.animales), razaCruce: l.razaCruce,
      fechaInicio: l.fechaInicio, gallinero: l.gallinero || '', pesoMedio: l.pesoMedio ? String(l.pesoMedio) : '',
      mortalidad: String(l.mortalidad), notas: l.notas || '',
    });
    setShowCreate(true);
  };

  if (!loaded) return <div className="nf-content"><p style={{ color: 'var(--neutral-500)' }}>Cargando producción…</p></div>;

  return (
    <div className="nf-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)' }}>🥚 Producción</h1>
          <p style={{ fontSize: 13, color: 'var(--neutral-500)', marginTop: 4 }}>
            {lotes.length === 0 ? 'Crea tu primer lote de producción' : `${lotes.length} lote${lotes.length !== 1 ? 's' : ''} activo${lotes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button className="nf-btn primary" onClick={() => { setEditId(null); setForm(emptyForm()); setShowCreate(true); }}>
          <Plus size={16} /> Nuevo lote
        </button>
      </div>

      {/* Kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${KANBAN.length}, 1fr)`, gap: 12, overflowX: 'auto' }}>
        {KANBAN.map(col => {
          const items = lotes.filter(l => l.fase === col.fase);
          const colIdx = KANBAN.findIndex(c => c.fase === col.fase);
          return (
            <div key={col.fase} style={{ background: col.bg, border: `2px solid ${col.border}`, borderRadius: 'var(--radius-xl)', minHeight: 250, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>{col.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: col.border }}>{col.fase}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, background: col.border, color: '#fff', borderRadius: 10, padding: '1px 7px' }}>{items.length}</span>
              </div>
              {items.length === 0 && (
                <div style={{ fontSize: 11, color: 'var(--neutral-400)', textAlign: 'center', padding: 16 }}>Sin lotes</div>
              )}
              {items.map(l => (
                <div key={l.id} style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 8, border: '1px solid var(--neutral-150)', fontSize: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: 'var(--neutral-800)' }}>{l.nombre}</div>
                  <div style={{ color: 'var(--neutral-600)' }}>{l.animales} aves · {l.razaCruce}</div>
                  {l.pesoMedio && <div style={{ color: 'var(--neutral-500)', marginTop: 2 }}>⚖️ {l.pesoMedio} kg medio</div>}
                  <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                    {colIdx > 0 && (
                      <button onClick={() => moveFase(l.id, KANBAN[colIdx - 1].fase)} className="nf-btn" style={{ padding: '2px 6px', fontSize: 10 }} title="Mover atrás">
                        ← {KANBAN[colIdx - 1].emoji}
                      </button>
                    )}
                    {colIdx < KANBAN.length - 1 && (
                      <button onClick={() => moveFase(l.id, KANBAN[colIdx + 1].fase)} className="nf-btn" style={{ padding: '2px 6px', fontSize: 10 }} title="Mover adelante">
                        {KANBAN[colIdx + 1].emoji} →
                      </button>
                    )}
                    <button onClick={() => openEdit(l)} className="nf-btn" style={{ padding: '2px 6px', fontSize: 10, marginLeft: 'auto' }} title="Editar"><Edit2 size={10} /></button>
                    <button onClick={() => handleDelete(l.id)} className="nf-btn" style={{ padding: '2px 6px', fontSize: 10, color: '#DC2626' }} title="Eliminar"><Trash2 size={10} /></button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => { setShowCreate(false); setEditId(null); }}>
          <div style={{ width: '100%', maxWidth: 480, background: 'var(--neutral-0)', borderRadius: 'var(--radius-xl)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', background: 'var(--neutral-25)', borderBottom: 'var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{editId ? '✏️ Editar Lote' : '🥚 Nuevo Lote'}</h3>
              <button onClick={() => { setShowCreate(false); setEditId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} style={{ color: 'var(--neutral-500)' }} /></button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label className="nf-label">Nombre</label><input className="nf-input" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Lote Navidad 2026" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label className="nf-label">Fase</label>
                  <select className="nf-input" value={form.fase} onChange={e => setForm(f => ({ ...f, fase: e.target.value as Fase }))}>
                    {KANBAN.map(k => <option key={k.fase}>{k.fase}</option>)}
                  </select>
                </div>
                <div><label className="nf-label">Animales</label><input className="nf-input" type="number" value={form.animales} onChange={e => setForm(f => ({ ...f, animales: e.target.value }))} /></div>
              </div>
              <div><label className="nf-label">Raza / Cruce</label><input className="nf-input" value={form.razaCruce} onChange={e => setForm(f => ({ ...f, razaCruce: e.target.value }))} placeholder="Ej: CN × Plymouth Rock" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label className="nf-label">Fecha inicio</label><input className="nf-input" type="date" value={form.fechaInicio} onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))} /></div>
                <div><label className="nf-label">Gallinero</label><input className="nf-input" value={form.gallinero} onChange={e => setForm(f => ({ ...f, gallinero: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label className="nf-label">Peso medio (kg)</label><input className="nf-input" type="number" step="0.1" value={form.pesoMedio} onChange={e => setForm(f => ({ ...f, pesoMedio: e.target.value }))} /></div>
                <div><label className="nf-label">Mortalidad (%)</label><input className="nf-input" type="number" value={form.mortalidad} onChange={e => setForm(f => ({ ...f, mortalidad: e.target.value }))} /></div>
              </div>
              <div><label className="nf-label">Notas</label><textarea className="nf-input" rows={2} value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} style={{ resize: 'vertical' }} /></div>
              <button className="nf-btn primary" disabled={saving} onClick={editId ? handleUpdate : handleCreate} style={{ width: '100%' }}>
                {saving ? '⏳ Guardando…' : editId ? '💾 Guardar cambios' : <><Plus size={16} /> Crear lote</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
