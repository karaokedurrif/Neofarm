'use client';

import { useState } from 'react';
import { Home, Thermometer, Droplets, ChevronRight, Plus, X, Edit2, Users, AlertTriangle } from 'lucide-react';

/* ── Types ─────────────────────────────────────────── */
interface Reproductor {
  id: number;
  anilla: string;
  raza: string;
  tipo: 'Gallo' | 'Gallina';
  peso: number;
}

interface Gallinero {
  id: string;
  name: string;
  zona: 'Ponedoras' | 'Engorde' | 'Cría' | 'Exterior' | 'Mixto';
  aves: number;
  capacidad: number;
  m2: number;
  temp: number;
  humedad: number;
  estado: 'ok' | 'warn' | 'alert';
  reproductores: Reproductor[];
  notas?: string;
}

/* ── Demo data ─────────────────────────────────────── */
const REPRO_POOL: Reproductor[] = [
  { id: 20, anilla: 'OVS-2025-0020', raza: 'Castellana Negra', tipo: 'Gallo', peso: 3.2 },
  { id: 21, anilla: 'OVS-2025-0021', raza: 'Prat Leonada', tipo: 'Gallo', peso: 3.5 },
  { id: 1, anilla: 'OVS-2025-0001', raza: 'Castellana Negra', tipo: 'Gallina', peso: 2.2 },
  { id: 2, anilla: 'OVS-2025-0002', raza: 'Prat Leonada', tipo: 'Gallina', peso: 2.5 },
  { id: 3, anilla: 'OVS-2025-0003', raza: 'Plymouth Rock', tipo: 'Gallina', peso: 2.8 },
  { id: 4, anilla: 'OVS-2025-0004', raza: 'Sussex', tipo: 'Gallina', peso: 2.6 },
  { id: 5, anilla: 'OVS-2025-0005', raza: 'Castellana Negra', tipo: 'Gallina', peso: 2.3 },
];

const INITIAL_GALLINEROS: Gallinero[] = [
  {
    id: 'G1', name: 'Gallinero Principal', zona: 'Ponedoras', aves: 18, capacidad: 25, m2: 30,
    temp: 18, humedad: 62, estado: 'ok',
    reproductores: [REPRO_POOL[0], REPRO_POOL[2], REPRO_POOL[3], REPRO_POOL[4]],
  },
  {
    id: 'G2', name: 'Zona Capones', zona: 'Engorde', aves: 12, capacidad: 20, m2: 24,
    temp: 19, humedad: 58, estado: 'ok', reproductores: [],
  },
  {
    id: 'G3', name: 'Zona Cría', zona: 'Cría', aves: 6, capacidad: 10, m2: 10,
    temp: 32, humedad: 55, estado: 'ok', reproductores: [],
  },
  {
    id: 'G4', name: 'Parque Exterior', zona: 'Exterior', aves: 38, capacidad: 500, m2: 2000,
    temp: 14, humedad: 45, estado: 'ok', reproductores: [],
  },
];

const ZONAS: Gallinero['zona'][] = ['Ponedoras', 'Engorde', 'Cría', 'Exterior', 'Mixto'];

/* ── Component ─────────────────────────────────────── */
export default function GallinerosPage() {
  const [gallineros, setGallineros] = useState<Gallinero[]>(INITIAL_GALLINEROS);
  const [selected, setSelected] = useState<Gallinero | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', zona: 'Ponedoras' as Gallinero['zona'], capacidad: 20, m2: 25 });

  const totalAves = gallineros.reduce((s, g) => s + g.aves, 0);
  const totalM2 = gallineros.reduce((s, g) => s + g.m2, 0);
  const totalCap = gallineros.reduce((s, g) => s + g.capacidad, 0);

  const handleCreate = () => {
    const id = `G${gallineros.length + 1}`;
    setGallineros(prev => [...prev, {
      id, name: form.name || `Gallinero ${id}`, zona: form.zona,
      aves: 0, capacidad: form.capacidad, m2: form.m2,
      temp: 18, humedad: 50, estado: 'ok', reproductores: [],
    }]);
    setShowCreate(false);
    setForm({ name: '', zona: 'Ponedoras', capacidad: 20, m2: 25 });
  };

  const assignRepro = (gallineroId: string, repro: Reproductor) => {
    setGallineros(prev => prev.map(g =>
      g.id === gallineroId && !g.reproductores.find(r => r.id === repro.id)
        ? { ...g, reproductores: [...g.reproductores, repro] }
        : g
    ));
  };

  const removeRepro = (gallineroId: string, reproId: number) => {
    setGallineros(prev => prev.map(g =>
      g.id === gallineroId
        ? { ...g, reproductores: g.reproductores.filter(r => r.id !== reproId) }
        : g
    ));
  };

  return (
    <div className="nf-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>
          <Home size={24} style={{ display: 'inline', marginRight: 8 }} />
          Gallineros
        </h1>
        <button className="nf-btn primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Nuevo Gallinero
        </button>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="nf-kbox">
          <div className="nf-kbox-v">{gallineros.length}</div>
          <div className="nf-kbox-label">Gallineros</div>
        </div>
        <div className="nf-kbox">
          <div className="nf-kbox-v">{totalAves}</div>
          <div className="nf-kbox-label">Total Aves</div>
        </div>
        <div className="nf-kbox">
          <div className="nf-kbox-v">{totalM2.toLocaleString()}</div>
          <div className="nf-kbox-label">m² Totales</div>
        </div>
        <div className="nf-kbox">
          <div className="nf-kbox-v">{Math.round((totalAves / totalCap) * 100)}%</div>
          <div className="nf-kbox-label">Ocupación</div>
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
        {gallineros.map((g) => {
          const occ = Math.round((g.aves / g.capacidad) * 100);
          const occColor = occ > 90 ? 'var(--alert)' : occ > 70 ? 'var(--warn)' : 'var(--ok)';
          return (
            <div key={g.id} className="nf-card">
              <div className="nf-card-hd">
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                  <div>
                    <div className="nf-card-title">{g.name}</div>
                    <div className="nf-card-meta">{g.zona} · {g.id}</div>
                  </div>
                  <span className={`nf-dot ${g.estado}`} />
                </div>
              </div>
              <div className="nf-card-pad">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <div className="nf-label" style={{ marginBottom: 4 }}>Ocupación</div>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)', color: occColor }}>
                      {g.aves}/{g.capacidad}
                    </div>
                    <div className="nf-progress" style={{ marginTop: 6 }}>
                      <div className="nf-progress-fill" style={{ width: `${occ}%`, background: occColor }} />
                    </div>
                  </div>
                  <div>
                    <div className="nf-label" style={{ marginBottom: 4 }}>Superficie</div>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {g.m2.toLocaleString()} m²
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--neutral-500)', marginTop: 4 }}>
                      {g.aves > 0 ? (g.m2 / g.aves).toFixed(1) : '—'} m²/ave
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 12, borderTop: 'var(--border-default)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Thermometer size={14} style={{ color: 'var(--neutral-500)' }} />
                    <span style={{ fontSize: 12, color: 'var(--neutral-600)' }}>Temp:</span>
                    <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{g.temp}°C</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Droplets size={14} style={{ color: 'var(--neutral-500)' }} />
                    <span style={{ fontSize: 12, color: 'var(--neutral-600)' }}>Hum:</span>
                    <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{g.humedad}%</span>
                  </div>
                </div>

                {/* Reproductores section */}
                {g.reproductores.length > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: 'var(--border-default)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--neutral-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <Users size={12} style={{ display: 'inline', marginRight: 4 }} /> Reproductores ({g.reproductores.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {g.reproductores.map(r => (
                        <span key={r.id} className="nf-tag" style={{ fontSize: 10 }}>
                          {r.tipo === 'Gallo' ? '♂' : '♀'} {r.raza.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button className="nf-btn" style={{ width: '100%', marginTop: 16 }} onClick={() => setSelected(g)}>
                  Ver detalles <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Detail + Reproducer Assignment Modal ── */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={() => setSelected(null)}>
          <div
            style={{
              background: 'var(--neutral-0)', borderRadius: 'var(--radius-xl)',
              width: '100%', maxWidth: 620, maxHeight: '90vh', overflow: 'auto',
              boxShadow: 'var(--shadow-float)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: 'var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 18 }}>{selected.name}</h2>
                <div style={{ fontSize: 12, color: 'var(--neutral-500)' }}>{selected.id} · {selected.zona}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: 24 }}>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                <div className="nf-kbox" style={{ padding: 12 }}>
                  <div className="nf-kbox-v" style={{ fontSize: 20 }}>{selected.aves}</div>
                  <div className="nf-kbox-label">Aves</div>
                </div>
                <div className="nf-kbox" style={{ padding: 12 }}>
                  <div className="nf-kbox-v" style={{ fontSize: 20 }}>{selected.capacidad}</div>
                  <div className="nf-kbox-label">Capacidad</div>
                </div>
                <div className="nf-kbox" style={{ padding: 12 }}>
                  <div className="nf-kbox-v" style={{ fontSize: 20 }}>{selected.m2}</div>
                  <div className="nf-kbox-label">m²</div>
                </div>
                <div className="nf-kbox" style={{ padding: 12 }}>
                  <div className="nf-kbox-v" style={{ fontSize: 20 }}>{selected.temp}°C</div>
                  <div className="nf-kbox-label">Temp</div>
                </div>
              </div>

              {/* Normativa alert */}
              {selected.m2 > 0 && selected.aves > 0 && (selected.m2 / selected.aves) < 4 && (
                <div style={{
                  padding: '10px 14px', marginBottom: 16, fontSize: 12,
                  background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)',
                  borderRadius: 'var(--radius-md)', display: 'flex', gap: 8, alignItems: 'center',
                }}>
                  <AlertTriangle size={16} style={{ color: 'var(--warn)' }} />
                  <span>Densidad actual: <strong>{(selected.m2 / selected.aves).toFixed(1)} m²/ave</strong> — mínimo ecológico 4 m²/ave</span>
                </div>
              )}

              {/* Reproductores asignados */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  <Users size={16} style={{ display: 'inline', marginRight: 6 }} />
                  Reproductores Asignados ({selected.reproductores.length})
                </h3>
                {selected.reproductores.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--neutral-400)' }}>No hay reproductores asignados</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selected.reproductores.map(r => (
                      <div key={r.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)',
                        border: 'var(--border-default)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 16 }}>{r.tipo === 'Gallo' ? '♂' : '♀'}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{r.raza}</div>
                            <div style={{ fontSize: 11, color: 'var(--neutral-500)', fontFamily: 'var(--font-mono)' }}>{r.anilla} · {r.peso} kg</div>
                          </div>
                        </div>
                        <button
                          className="nf-btn"
                          style={{ padding: '2px 8px', fontSize: 11, color: 'var(--alert)' }}
                          onClick={() => {
                            removeRepro(selected.id, r.id);
                            setSelected(prev => prev ? { ...prev, reproductores: prev.reproductores.filter(rr => rr.id !== r.id) } : null);
                          }}
                        >
                          Quitar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign new reproductor */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Asignar Reproductor</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {REPRO_POOL.filter(r => !selected.reproductores.find(sr => sr.id === r.id)).map(r => (
                    <div key={r.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 12px', borderRadius: 'var(--radius-md)',
                      border: 'var(--border-default)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{r.tipo === 'Gallo' ? '♂' : '♀'}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{r.raza}</div>
                          <div style={{ fontSize: 11, color: 'var(--neutral-500)', fontFamily: 'var(--font-mono)' }}>{r.anilla}</div>
                        </div>
                      </div>
                      <button
                        className="nf-btn primary"
                        style={{ padding: '4px 12px', fontSize: 11 }}
                        onClick={() => {
                          assignRepro(selected.id, r);
                          setSelected(prev => prev ? { ...prev, reproductores: [...prev.reproductores, r] } : null);
                        }}
                      >
                        + Asignar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button className="nf-btn primary" onClick={() => setSelected(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Modal ─────────────────────────── */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={() => setShowCreate(false)}>
          <div
            style={{
              background: 'var(--neutral-0)', borderRadius: 'var(--radius-xl)',
              width: '100%', maxWidth: 460, boxShadow: 'var(--shadow-float)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: 'var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 800, fontSize: 18 }}>Nuevo Gallinero</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="nf-label">Nombre</label>
                <input className="nf-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Gallinero Norte" />
              </div>
              <div>
                <label className="nf-label">Zona/Función</label>
                <select className="nf-input" value={form.zona} onChange={e => setForm(f => ({ ...f, zona: e.target.value as Gallinero['zona'] }))}>
                  {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="nf-label">Capacidad (aves)</label>
                  <input className="nf-input" type="number" value={form.capacidad} onChange={e => setForm(f => ({ ...f, capacidad: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="nf-label">Superficie (m²)</label>
                  <input className="nf-input" type="number" value={form.m2} onChange={e => setForm(f => ({ ...f, m2: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="nf-btn" onClick={() => setShowCreate(false)}>Cancelar</button>
                <button className="nf-btn primary" onClick={handleCreate}>Crear Gallinero</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
