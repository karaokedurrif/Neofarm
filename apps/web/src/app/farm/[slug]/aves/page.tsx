'use client';

import { useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import EmptyState, { HoverGuide } from '@/components/tenant/EmptyState';
import { Package, Plus, Search, X, Edit2, Trash2, Eye, Camera } from 'lucide-react';

/* ── Types ─────────────────────────────────────────── */
type TipoAve = 'Gallina' | 'Gallo' | 'Capón' | 'Pollito' | 'Pularda';
type EstadoAve = 'Ponedora activa' | 'Reproductor' | 'Engorde' | 'Cría' | 'Reposo' | 'Baja';

interface Ave {
  id: number;
  anilla: string;
  tipo: TipoAve;
  raza: string;
  sexo: 'M' | 'H';
  fechaNac: string;
  peso: number;
  estado: EstadoAve;
  gallinero: string;
  notas?: string;
  fechaAlta: string;
}

const RAZAS = [
  'Castellana Negra', 'Prat Leonada', 'Plymouth Rock', 'Sussex',
  'Mos (Galicia)', 'Empordanesa', 'Rhode Island Red', 'Wyandotte',
  'Brahma', 'Marans', 'Leghorn Blanca', 'Orpington',
];

const TIPOS: TipoAve[] = ['Gallina', 'Gallo', 'Capón', 'Pollito', 'Pularda'];
const ESTADOS: EstadoAve[] = ['Ponedora activa', 'Reproductor', 'Engorde', 'Cría', 'Reposo', 'Baja'];

function sexFromTipo(tipo: TipoAve): 'M' | 'H' {
  if (tipo === 'Gallo' || tipo === 'Capón') return 'M';
  return 'H';
}

/* ── Example bird (shown dimmed as reference) ──── */
const EXAMPLE_AVE: Ave = {
  id: 0,
  anilla: 'PAL-2026-0001',
  tipo: 'Gallina',
  raza: 'Castellana Negra',
  sexo: 'H',
  fechaNac: '2025-03-15',
  peso: 2.2,
  estado: 'Ponedora activa',
  gallinero: '(sin gallinero)',
  fechaAlta: '2026-03-09',
  notas: 'Ave de ejemplo — borra o edita este registro',
};

export default function TenantAvesPage() {
  const { farm } = useTenant();
  const [aves, setAves] = useState<Ave[]>([EXAMPLE_AVE]);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Ave | null>(null);
  const [form, setForm] = useState({
    tipo: 'Gallina' as TipoAve,
    raza: RAZAS[0],
    fechaNac: '',
    peso: '',
    estado: 'Ponedora activa' as EstadoAve,
    gallinero: '',
    notas: '',
  });

  const nextAnilla = `PAL-2026-${String(aves.length + 1).padStart(4, '0')}`;

  const handleCreate = () => {
    const newAve: Ave = {
      id: Date.now(),
      anilla: nextAnilla,
      tipo: form.tipo,
      raza: form.raza,
      sexo: sexFromTipo(form.tipo),
      fechaNac: form.fechaNac || new Date().toISOString().slice(0, 10),
      peso: parseFloat(form.peso) || 0,
      estado: form.estado,
      gallinero: form.gallinero || '(sin asignar)',
      fechaAlta: new Date().toISOString().slice(0, 10),
      notas: form.notas,
    };
    setAves(prev => [...prev, newAve]);
    setShowCreate(false);
    setForm({ tipo: 'Gallina', raza: RAZAS[0], fechaNac: '', peso: '', estado: 'Ponedora activa', gallinero: '', notas: '' });
  };

  const handleDelete = (id: number) => {
    setAves(prev => prev.filter(a => a.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = aves.filter(a =>
    !search || a.anilla.toLowerCase().includes(search.toLowerCase()) ||
    a.raza.toLowerCase().includes(search.toLowerCase()) ||
    a.tipo.toLowerCase().includes(search.toLowerCase())
  );

  const realAves = aves.filter(a => a.id !== 0);

  return (
    <div className="nf-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)' }}>
            🐔 Aves
          </h1>
          <p style={{ fontSize: 13, color: 'var(--neutral-500)', marginTop: 4 }}>
            {realAves.length === 0
              ? 'Registra tu primera ave para empezar el censo'
              : `${realAves.length} ave${realAves.length !== 1 ? 's' : ''} registrada${realAves.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <button className="nf-btn primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Registrar ave
        </button>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
          <input
            className="nf-input"
            placeholder="Buscar por anilla, raza, tipo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowCreate(false)}>
          <div
            style={{
              width: '100%', maxWidth: 520, background: 'var(--neutral-0)',
              borderRadius: 'var(--radius-xl)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', background: 'var(--neutral-25)', borderBottom: 'var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>🐔 Nueva Ave</h3>
                <p style={{ fontSize: 12, color: 'var(--neutral-500)', marginTop: 2 }}>Anilla: {nextAnilla}</p>
              </div>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: 'var(--neutral-500)' }} />
              </button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="nf-label">Tipo</label>
                  <select className="nf-input" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TipoAve }))}>
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="nf-label">Raza</label>
                  <select className="nf-input" value={form.raza} onChange={e => setForm(f => ({ ...f, raza: e.target.value }))}>
                    {RAZAS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="nf-label">Fecha nacimiento</label>
                  <input className="nf-input" type="date" value={form.fechaNac} onChange={e => setForm(f => ({ ...f, fechaNac: e.target.value }))} />
                </div>
                <div>
                  <label className="nf-label">Peso (kg)</label>
                  <input className="nf-input" type="number" step="0.1" placeholder="2.5" value={form.peso} onChange={e => setForm(f => ({ ...f, peso: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="nf-label">Estado</label>
                <select className="nf-input" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as EstadoAve }))}>
                  {ESTADOS.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="nf-label">Notas</label>
                <textarea
                  className="nf-input"
                  rows={2}
                  placeholder="Observaciones opcionales..."
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
                💡 Sexo se asigna automáticamente según el tipo. Si aún no hay gallineros creados, puedes asignar el ave más tarde.
              </div>
              <button className="nf-btn primary" onClick={handleCreate} style={{ width: '100%' }}>
                <Plus size={16} /> Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="nf-card" style={{ marginBottom: 16 }}>
          <div className="nf-card-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="nf-card-title">📋 {selected.anilla} — {selected.raza}</div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
          <div className="nf-card-pad" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
            <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>TIPO</span><br />{selected.tipo}</div>
            <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>SEXO</span><br />{selected.sexo === 'M' ? '♂ Macho' : '♀ Hembra'}</div>
            <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>PESO</span><br />{selected.peso} kg</div>
            <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>ESTADO</span><br />{selected.estado}</div>
            <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>GALLINERO</span><br />{selected.gallinero}</div>
            <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>NACIMIENTO</span><br />{selected.fechaNac}</div>
            {selected.notas && (
              <div style={{ gridColumn: '1 / -1' }}><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>NOTAS</span><br />{selected.notas}</div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 && !search ? (
        <EmptyState
          icon={Package}
          emoji="🐔"
          title="Sin aves registradas"
          description="Empieza registrando tus gallinas, gallos, capones o pollitos. Cada ave recibe un código pasaporte único."
          hint="Haz clic en 'Registrar ave' para añadir tu primera ave."
          action={
            <button className="nf-btn primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Registrar primera ave
            </button>
          }
          example={{
            title: 'Ejemplo de registro',
            items: [
              'PAL-2026-0001 · Gallina Castellana Negra · 2.2 kg · Ponedora activa',
              'PAL-2026-0002 · Gallo Prat Leonada · 3.5 kg · Reproductor',
              'PAL-2026-0003 · Capón Plymouth Rock × Castellana · 4.2 kg · Engorde',
            ],
          }}
        />
      ) : (
        <div className="nf-card">
          <table className="nf-table">
            <thead>
              <tr>
                <th>Anilla</th>
                <th>Tipo</th>
                <th>Raza</th>
                <th>Sexo</th>
                <th>Peso</th>
                <th>Estado</th>
                <th>Gallinero</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ave => (
                <tr
                  key={ave.id}
                  style={{
                    cursor: 'pointer',
                    opacity: ave.id === 0 ? 0.5 : 1,
                    fontStyle: ave.id === 0 ? 'italic' : 'normal',
                  }}
                  onClick={() => setSelected(ave)}
                >
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12 }}>
                    {ave.anilla}
                    {ave.id === 0 && (
                      <span style={{
                        marginLeft: 6, padding: '2px 6px', borderRadius: 4,
                        background: 'rgba(59,130,246,0.1)', color: '#3B82F6',
                        fontSize: 10, fontWeight: 600, fontStyle: 'normal',
                      }}>ejemplo</span>
                    )}
                  </td>
                  <td>{ave.tipo}</td>
                  <td>{ave.raza}</td>
                  <td>{ave.sexo === 'M' ? '♂' : '♀'}</td>
                  <td>{ave.peso} kg</td>
                  <td>
                    <span className="nf-tag" style={{
                      background: ave.estado === 'Ponedora activa' ? 'rgba(22,163,74,0.1)' : 'var(--neutral-100)',
                      color: ave.estado === 'Ponedora activa' ? 'var(--ok)' : 'var(--neutral-700)',
                    }}>
                      {ave.estado}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>{ave.gallinero}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(ave.id); }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 4, borderRadius: 4, color: 'var(--neutral-400)',
                      }}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
