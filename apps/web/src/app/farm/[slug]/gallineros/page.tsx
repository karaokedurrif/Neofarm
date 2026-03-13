'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import EmptyState, { HoverGuide } from '@/components/tenant/EmptyState';
import { Home, Plus, X, Edit2, Thermometer, Droplets, Users, Trash2 } from 'lucide-react';

/* ── Types ─────────────────────────────────────────── */
type ZonaTipo = 'Ponedoras' | 'Engorde' | 'Cría' | 'Exterior' | 'Mixto';

interface Gallinero {
  id: number;
  name: string;
  zona: ZonaTipo;
  capacidad: number;
  m2: number;
  aves: number;
  temp: number;
  humedad: number;
  estado: 'ok' | 'warn' | 'alert';
  notas?: string;
}

interface GallineroAPI {
  id: number;
  name: string;
  zona: string;
  capacidad: number;
  m2: number;
  aves_count: number;
  temp: number | null;
  humedad: number | null;
  estado: string;
  notas: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const ZONAS: ZonaTipo[] = ['Ponedoras', 'Engorde', 'Cría', 'Exterior', 'Mixto'];

function apiToGallinero(g: GallineroAPI): Gallinero {
  return {
    id: g.id, name: g.name, zona: (g.zona || 'Mixto') as ZonaTipo,
    capacidad: g.capacidad, m2: g.m2, aves: g.aves_count,
    temp: g.temp ?? 18, humedad: g.humedad ?? 55,
    estado: (g.estado || 'ok') as Gallinero['estado'],
    notas: g.notas || undefined,
  };
}

const API = (slug: string) => `/api/ovosfera/farms/${encodeURIComponent(slug)}`;

function zonaEmoji(zona: ZonaTipo): string {
  switch (zona) {
    case 'Ponedoras': return '🥚';
    case 'Engorde': return '🍗';
    case 'Cría': return '🐣';
    case 'Exterior': return '🌳';
    default: return '🏠';
  }
}

function estadoLabel(e: string) {
  return e === 'ok' ? '✅ Operativo' : e === 'warn' ? '⚠️ Atención' : '🔴 Alerta';
}

export default function TenantGallinerosPage() {
  const { farm, slug } = useTenant();
  const [gallineros, setGallineros] = useState<Gallinero[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Gallinero | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const emptyForm = () => ({
    name: '',
    zona: 'Ponedoras' as ZonaTipo,
    capacidad: '25',
    m2: '30',
    notas: '',
  });
  const [form, setForm] = useState(emptyForm());

  /* ── Load from API ──────────────────────────────── */
  const loadGallineros = useCallback(async () => {
    if (!slug) return;
    setFetchError(null);
    try {
      const res = await fetch(`${API(slug)}/gallineros`);
      if (res.ok) {
        const data: GallineroAPI[] = await res.json();
        setGallineros(data.map(apiToGallinero));
      } else {
        setFetchError(`Error cargando gallineros: ${res.status}`);
      }
    } catch (err) { setFetchError('Error de red al cargar gallineros'); }
    setLoaded(true);
  }, [slug]);

  useEffect(() => { loadGallineros(); }, [loadGallineros]);

  /* ── Create via API ─────────────────────────────── */
  const handleCreate = async () => {
    if (!slug || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`${API(slug)}/gallineros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name || 'Gallinero nuevo',
          zona: form.zona,
          capacidad: parseInt(form.capacidad) || 20,
          m2: parseFloat(form.m2) || 25,
          notas: form.notas || null,
        }),
      });
      if (res.ok) {
        const created: GallineroAPI = await res.json();
        setGallineros(prev => [...prev, apiToGallinero(created)]);
      }
    } catch {}
    setSaving(false);
    setShowCreate(false);
    setForm(emptyForm());
    setEditId(null);
  };

  /* ── Update via API ─────────────────────────────── */
  const handleUpdate = async () => {
    if (!slug || !editId || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`${API(slug)}/gallineros/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name || null,
          zona: form.zona,
          capacidad: parseInt(form.capacidad) || 20,
          m2: parseFloat(form.m2) || 25,
          notas: form.notas || null,
        }),
      });
      if (res.ok) {
        const updated: GallineroAPI = await res.json();
        const mapped = apiToGallinero(updated);
        setGallineros(prev => prev.map(g => g.id === editId ? mapped : g));
        if (selected?.id === editId) setSelected(mapped);
      }
    } catch {}
    setSaving(false);
    setShowCreate(false);
    setForm(emptyForm());
    setEditId(null);
  };

  /* ── Delete via API ─────────────────────────────── */
  const handleDelete = async (id: number) => {
    if (!slug) return;
    try {
      const res = await fetch(`${API(slug)}/gallineros/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        setGallineros(prev => prev.filter(g => g.id !== id));
        if (selected?.id === id) setSelected(null);
      }
    } catch {}
  };

  /* ── Open edit modal ────────────────────────────── */
  const openEdit = (g: Gallinero) => {
    setEditId(g.id);
    setForm({
      name: g.name,
      zona: g.zona,
      capacidad: String(g.capacidad),
      m2: String(g.m2),
      notas: g.notas || '',
    });
    setShowCreate(true);
  };

  if (!loaded) return <div className="nf-content"><p style={{ color: 'var(--neutral-500)' }}>Cargando gallineros…</p></div>;

  return (
    <div className="nf-content">
      {fetchError && (
        <div style={{ padding: '10px 16px', marginBottom: 16, borderRadius: 'var(--radius-md)', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#DC2626', fontSize: 13 }}>
          ⚠️ {fetchError} — <button onClick={loadGallineros} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>Reintentar</button>
        </div>
      )}
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)' }}>
            🏠 Gallineros
          </h1>
          <p style={{ fontSize: 13, color: 'var(--neutral-500)', marginTop: 4 }}>
            {gallineros.length === 0
              ? 'Define tus gallineros: tipo de zona, capacidad y metros cuadrados'
              : `${gallineros.length} gallinero${gallineros.length !== 1 ? 's' : ''} configurado${gallineros.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <button className="nf-btn primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Nuevo gallinero
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => { setShowCreate(false); setEditId(null); }}>
          <div
            style={{
              width: '100%', maxWidth: 480, background: 'var(--neutral-0)',
              borderRadius: 'var(--radius-xl)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', background: 'var(--neutral-25)', borderBottom: 'var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{editId ? '✏️ Editar Gallinero' : '🏠 Nuevo Gallinero'}</h3>
              <button onClick={() => { setShowCreate(false); setEditId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: 'var(--neutral-500)' }} />
              </button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="nf-label">Nombre</label>
                <input className="nf-input" placeholder="Ej: Gallinero Principal" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="nf-label">Tipo de zona</label>
                <select className="nf-input" value={form.zona} onChange={e => setForm(f => ({ ...f, zona: e.target.value as ZonaTipo }))}>
                  {ZONAS.map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="nf-label">Capacidad (aves)</label>
                  <input className="nf-input" type="number" value={form.capacidad} onChange={e => setForm(f => ({ ...f, capacidad: e.target.value }))} />
                </div>
                <div>
                  <label className="nf-label">Metros² (m²)</label>
                  <input className="nf-input" type="number" value={form.m2} onChange={e => setForm(f => ({ ...f, m2: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="nf-label">Notas</label>
                <textarea
                  className="nf-input"
                  rows={2}
                  placeholder="Orientación, material, particularidades..."
                  value={form.notas}
                  onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)',
                fontSize: 12, color: '#3B82F6',
              }}>
                💡 Los datos se guardan en base de datos.
              </div>
              <button className="nf-btn primary" disabled={saving} onClick={editId ? handleUpdate : handleCreate} style={{ width: '100%' }}>
                {saving ? '⏳ Guardando…' : editId ? '💾 Guardar cambios' : <><Plus size={16} /> Crear gallinero</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="nf-card" style={{ marginBottom: 16 }}>
          <div className="nf-card-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="nf-card-title">{zonaEmoji(selected.zona)} {selected.name}</div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
          <div className="nf-card-pad" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
            <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>ZONA</span><br />{selected.zona}</div>
            <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>CAPACIDAD</span><br />{selected.capacidad} aves</div>
            <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>M²</span><br />{selected.m2} m²</div>
            <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>AVES</span><br />{selected.aves}</div>
            <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>TEMP</span><br />{selected.temp}°C</div>
            <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>HUMEDAD</span><br />{selected.humedad}%</div>
            <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>ESTADO</span><br />{estadoLabel(selected.estado)}</div>
            {selected.notas && (
              <div style={{ gridColumn: '1 / -1' }}><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>NOTAS</span><br />{selected.notas}</div>
            )}
          </div>
        </div>
      )}

      {/* Grid of gallineros */}
      {gallineros.length === 0 ? (
        <EmptyState
          icon={Home}
          emoji="🏠"
          title="Sin gallineros"
          description="Un gallinero es un espacio donde alojas tus aves. Puede ser un gallinero cerrado, una zona de cría, un parque exterior..."
          hint="Haz clic en 'Nuevo gallinero' para crear el primero."
          action={
            <button className="nf-btn primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Crear primer gallinero
            </button>
          }
          example={{
            title: 'Tipos de gallinero',
            items: [
              '🥚 Ponedoras — gallinas en producción de huevos',
              '🍗 Engorde — capones o pollos para carne',
              '🐣 Cría — pollitos bajo lámpara de calor',
              '🌳 Exterior — parque o patio al aire libre',
            ],
          }}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {gallineros.map(g => (
            <div
              key={g.id}
              className="nf-card"
              onClick={() => setSelected(g)}
              style={{
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 160ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{zonaEmoji(g.zona)}</span>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--neutral-800)' }}>{g.name}</h3>
                    <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>
                      {g.zona} · #{g.id}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                  <HoverGuide tip="Aves alojadas / Capacidad máxima">
                    <div className="nf-kbox" style={{ padding: 10 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary-700)' }}>{g.aves}/{g.capacidad}</span>
                      <span style={{ fontSize: 10, color: 'var(--neutral-500)' }}>Aves</span>
                    </div>
                  </HoverGuide>
                  <HoverGuide tip="Temperatura actual del gallinero">
                    <div className="nf-kbox" style={{ padding: 10 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary-700)' }}>{g.temp}°C</span>
                      <span style={{ fontSize: 10, color: 'var(--neutral-500)' }}>Temp</span>
                    </div>
                  </HoverGuide>
                  <HoverGuide tip="Superficie del gallinero">
                    <div className="nf-kbox" style={{ padding: 10 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary-700)' }}>{g.m2}</span>
                      <span style={{ fontSize: 10, color: 'var(--neutral-500)' }}>m²</span>
                    </div>
                  </HoverGuide>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--neutral-400)' }}>
                    {estadoLabel(g.estado)}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={e => { e.stopPropagation(); openEdit(g); }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 4, borderRadius: 4, color: 'var(--neutral-400)',
                      }}
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(g.id); }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 4, borderRadius: 4, color: 'var(--neutral-400)',
                      }}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add card */}
          <div
            style={{
              border: '2px dashed var(--neutral-200)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              minHeight: 200,
              transition: 'all 160ms ease',
            }}
            onClick={() => setShowCreate(true)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-400)'; e.currentTarget.style.background = 'rgba(176,125,43,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--neutral-200)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <Plus size={24} style={{ color: 'var(--neutral-400)' }} />
            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--neutral-500)' }}>Añadir gallinero</span>
          </div>
        </div>
      )}
    </div>
  );
}
