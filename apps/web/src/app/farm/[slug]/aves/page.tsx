'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import EmptyState from '@/components/tenant/EmptyState';
import { Package, Plus, Search, X, Trash2, Edit2, Camera, Upload, ImageIcon } from 'lucide-react';

/* ── Types ─────────────────────────────────────────── */
type TipoAve = 'Gallina' | 'Gallo' | 'Capón' | 'Pollito' | 'Pularda';
type EstadoAve = 'Ponedora activa' | 'Reproductor' | 'Engorde' | 'Cría' | 'Reposo' | 'Baja';

interface Ave {
  id: number;
  anilla: string;
  tipo: TipoAve;
  raza: string;
  color?: string;
  sexo: 'M' | 'H';
  fechaNac: string;
  peso: number;
  estado: EstadoAve;
  gallinero: string;
  notas?: string;
  fechaAlta: string;
  foto?: string;
  aiVisionId?: string;
}

/* ── Unified breed catalog (common + heritage + simulator) ───── */
const RAZAS = [
  'Andaluza Azul',
  'Araucana',
  'Australorp',
  'Ayam Cemani',
  'Barbezieux',
  'Barnevelder',
  'Bielefelder',
  'Brahma',
  'Bresse',
  'Campine',
  'Castellana Negra',
  'Cochin',
  'Cornish',
  'Crèvecœur',
  'Delaware',
  'Dorking',
  'Empordanesa',
  'Euskal Oiloa',
  'Faverolles',
  'Hamburg',
  'Houdan',
  'Jersey Giant',
  'La Flèche',
  'Leghorn',
  'Malines',
  'Marans',
  'Minorca',
  'Mos',
  'Naked Neck',
  'New Hampshire',
  'Orpington',
  'Penedesenca Negra',
  'Pita Pinta Asturiana',
  'Plymouth Rock',
  'Prat Leonada',
  'Rhode Island Red',
  'Sobrarbe',
  'Sulmtaler',
  'Sussex',
  'Vorwerk',
  'Welsummer',
  'Wyandotte',
  'Cruce F1',
  'Otra raza',
];

/* ── Recognized color varieties per breed ─────── */
/* English names for foreign breeds, Spanish for national */
const COLORES_RAZA: Record<string, string[]> = {
  'Andaluza Azul':        ['Azul', 'Negro', 'Splash'],
  'Araucana':             ['Lavanda', 'Negra', 'Azul', 'Trigueña', 'Blanca'],
  'Australorp':           ['Black', 'White', 'Blue'],
  'Ayam Cemani':          ['Negro total'],
  'Barbezieux':           ['Black'],
  'Barnevelder':          ['Double Laced', 'Black', 'White', 'Blue Laced'],
  'Bielefelder':          ['Kennfarbig (autosexing)'],
  'Brahma':               ['Light', 'Dark', 'Buff', 'Partridge', 'White', 'Blue'],
  'Bresse':               ['White', 'Grey', 'Black', 'Blue'],
  'Campine':              ['Golden', 'Silver'],
  'Castellana Negra':     ['Negro'],
  'Cochin':               ['Buff', 'Black', 'White', 'Partridge', 'Blue', 'Splash'],
  'Cornish':              ['Dark', 'White', 'White Laced Red', 'Buff'],
  'Crèvecœur':           ['Black'],
  'Delaware':             ['Columbian'],
  'Dorking':              ['Silver Grey', 'Dark', 'Red', 'Cuckoo', 'White'],
  'Empordanesa':          ['Roja', 'Blanca', 'Negra', 'Perdiz'],
  'Euskal Oiloa':         ['Gorria (Roja)', 'Beltza (Negra)', 'Lepasoila (Cuello Desnudo)', 'Marraduna', 'Zilarra (Plata)'],
  'Faverolles':           ['Salmon', 'White', 'Black', 'Ermine', 'Blue', 'Cuckoo'],
  'Hamburg':              ['Gold Spangled', 'Silver Spangled', 'Gold Penciled', 'Silver Penciled', 'Black', 'White'],
  'Houdan':               ['Mottled', 'White', 'Lavender'],
  'Jersey Giant':         ['Black', 'White', 'Blue'],
  'La Flèche':            ['Black'],
  'Leghorn':              ['White', 'Brown', 'Buff', 'Black', 'Red', 'Silver'],
  'Malines':              ['Cuckoo', 'Black', 'White', 'Columbian', 'Blue', 'Ermine'],
  'Marans':               ['Black Copper', 'Wheaten', 'Cuckoo', 'Silver Cuckoo', 'Black', 'White', 'Birchen', 'Columbian'],
  'Minorca':              ['Black', 'White', 'Blue'],
  'Mos':                  ['Trigueña', 'Bermella'],
  'Naked Neck':           ['Red', 'Black', 'White', 'Buff', 'Cuckoo'],
  'New Hampshire':        ['Red'],
  'Orpington':            ['Buff', 'Black', 'White', 'Blue', 'Red', 'Chocolate'],
  'Penedesenca Negra':    ['Negra', 'Trigueña', 'Aperdizada', 'Barrada'],
  'Pita Pinta Asturiana': ['Pinta', 'Blanca', 'Roxa', 'Abedul'],
  'Plymouth Rock':        ['Barred', 'White', 'Buff', 'Partridge', 'Silver Penciled', 'Blue', 'Columbian', 'Black'],
  'Prat Leonada':         ['Leonada', 'Blanca', 'Negra', 'Perdiz', 'Aperdizada'],
  'Rhode Island Red':     ['Red', 'White'],
  'Sobrarbe':             ['Trigueña', 'Negra', 'Ceniza'],
  'Sulmtaler':            ['Wheaten (Weizenfarbig)'],
  'Sussex':               ['Speckled', 'Light (Silver)', 'Red', 'Buff', 'White', 'Brown', 'Coronation'],
  'Vorwerk':              ['Gold-Black'],
  'Welsummer':            ['Partridge', 'Silver Duckwing'],
  'Wyandotte':            ['Silver Laced', 'Gold Laced', 'White', 'Black', 'Buff', 'Blue', 'Partridge', 'Columbian', 'Silver Penciled'],
  'Cruce F1':             ['Variado'],
  'Otra raza':            ['Sin especificar'],
};

const TIPOS: TipoAve[] = ['Gallina', 'Gallo', 'Capón', 'Pollito', 'Pularda'];
const ESTADOS: EstadoAve[] = ['Ponedora activa', 'Reproductor', 'Engorde', 'Cría', 'Reposo', 'Baja'];

function sexFromTipo(tipo: TipoAve): 'M' | 'H' {
  if (tipo === 'Gallo' || tipo === 'Capón') return 'M';
  return 'H';
}

function estadoColor(e: EstadoAve): string {
  switch (e) {
    case 'Ponedora activa': case 'Reproductor': return 'rgba(22,163,74,0.1)';
    case 'Engorde': case 'Cría': return 'rgba(59,130,246,0.1)';
    case 'Reposo': return 'rgba(234,179,8,0.1)';
    case 'Baja': return 'rgba(239,68,68,0.1)';
    default: return 'var(--neutral-100)';
  }
}
function estadoTextColor(e: EstadoAve): string {
  switch (e) {
    case 'Ponedora activa': case 'Reproductor': return 'var(--ok)';
    case 'Engorde': case 'Cría': return '#3B82F6';
    case 'Reposo': return '#CA8A04';
    case 'Baja': return '#DC2626';
    default: return 'var(--neutral-700)';
  }
}

/* ── Photo to base64 (max 200KB compressed) ──────── */
function fileToBase64(file: File, maxW = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxW / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('no canvas')); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── API helpers ─────────────────────────────────── */
const API = (slug: string) => `/api/ovosfera/farms/${slug}`;

interface AveAPI {
  id: number; anilla: string; tipo: string; raza: string; color?: string | null;
  sexo: string; fecha_nac?: string | null; peso: number; estado: string;
  gallinero?: string | null; notas?: string | null; foto?: string | null;
  ai_vision_id?: string | null; fecha_alta?: string | null;
}

function apiToAve(a: AveAPI): Ave {
  return {
    id: a.id, anilla: a.anilla, tipo: a.tipo as TipoAve, raza: a.raza,
    color: a.color || undefined, sexo: a.sexo as 'M' | 'H',
    fechaNac: a.fecha_nac || '', peso: a.peso, estado: a.estado as EstadoAve,
    gallinero: a.gallinero || '', notas: a.notas || undefined,
    foto: a.foto || undefined, aiVisionId: a.ai_vision_id || undefined,
    fechaAlta: a.fecha_alta || '',
  };
}

function aveToAPI(a: Omit<Ave, 'id'>) {
  return {
    anilla: a.anilla, tipo: a.tipo, raza: a.raza, color: a.color || null,
    sexo: a.sexo, fecha_nac: a.fechaNac || null, peso: a.peso,
    estado: a.estado, gallinero: a.gallinero || null,
    notas: a.notas || null, foto: a.foto || null,
    ai_vision_id: a.aiVisionId || null, fecha_alta: a.fechaAlta || null,
  };
}

export default function TenantAvesPage() {
  const { farm, slug } = useTenant();
  const [aves, setAves] = useState<Ave[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Ave | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [fotoPreview, setFotoPreview] = useState<string>('');

  const emptyForm = () => ({
    tipo: 'Gallina' as TipoAve,
    raza: RAZAS[0],
    color: COLORES_RAZA[RAZAS[0]]?.[0] || '',
    fechaNac: '',
    peso: '',
    estado: 'Ponedora activa' as EstadoAve,
    gallinero: '',
    notas: '',
    aiVisionId: '',
  });
  const [form, setForm] = useState(emptyForm());

  /* ── Load from API on mount ──────────────────────── */
  const loadAves = useCallback(async () => {
    if (!slug) return;
    setFetchError(null);
    try {
      const res = await fetch(`${API(slug)}/aves`);
      if (res.ok) {
        const data: AveAPI[] = await res.json();
        setAves(data.map(apiToAve));
      } else {
        setFetchError(`Error cargando aves: ${res.status}`);
      }
    } catch (err) { setFetchError('Error de red al cargar aves'); }
    setLoaded(true);
  }, [slug]);

  useEffect(() => { loadAves(); }, [loadAves]);

  const prefix = (slug || 'PAL').toUpperCase().slice(0, 3);
  const year = new Date().getFullYear();
  const nextAnilla = useCallback(() => {
    const maxNum = aves.reduce((acc, a) => {
      const m = a.anilla.match(/-(\d{4})$/);
      return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
    }, 0);
    return `${prefix}-${year}-${String(maxNum + 1).padStart(4, '0')}`;
  }, [aves, prefix, year]);

  const handlePhoto = async (file: File | null) => {
    if (!file) return;
    const b64 = await fileToBase64(file);
    setFotoPreview(b64);
  };

  /* ── Create new ave via API ──────────────────────── */
  const handleCreate = async () => {
    if (!slug || saving) return;
    setSaving(true);
    const newAve: Omit<Ave, 'id'> = {
      anilla: nextAnilla(),
      tipo: form.tipo,
      raza: form.raza,
      color: form.color || undefined,
      sexo: sexFromTipo(form.tipo),
      fechaNac: form.fechaNac || new Date().toISOString().slice(0, 10),
      peso: parseFloat(form.peso) || 0,
      estado: form.estado,
      gallinero: form.gallinero || '(sin asignar)',
      fechaAlta: new Date().toISOString().slice(0, 10),
      notas: form.notas || undefined,
      foto: fotoPreview || undefined,
      aiVisionId: form.aiVisionId || undefined,
    };
    try {
      const res = await fetch(`${API(slug)}/aves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aveToAPI(newAve)),
      });
      if (res.ok) {
        const created: AveAPI = await res.json();
        setAves(prev => [...prev, apiToAve(created)]);
      }
    } catch { /* network error */ }
    setSaving(false);
    setShowCreate(false);
    setForm(emptyForm());
    setFotoPreview('');
    setEditId(null);
  };

  /* ── Update ave via API ──────────────────────────── */
  const handleUpdate = async () => {
    if (!slug || !editId || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`${API(slug)}/aves/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: form.tipo, raza: form.raza, color: form.color || null,
          sexo: sexFromTipo(form.tipo),
          fecha_nac: form.fechaNac || null, peso: parseFloat(form.peso) || 0,
          estado: form.estado, gallinero: form.gallinero || null,
          notas: form.notas || null, foto: fotoPreview || null,
          ai_vision_id: form.aiVisionId || null,
        }),
      });
      if (res.ok) {
        const updated: AveAPI = await res.json();
        const mapped = apiToAve(updated);
        setAves(prev => prev.map(a => a.id === editId ? mapped : a));
        if (selected?.id === editId) setSelected(mapped);
      }
    } catch {}
    setSaving(false);
    setShowCreate(false);
    setForm(emptyForm());
    setFotoPreview('');
    setEditId(null);
  };

  /* ── Delete ave via API ──────────────────────────── */
  const handleDelete = async (id: number) => {
    if (!slug) return;
    try {
      const res = await fetch(`${API(slug)}/aves/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        setAves(prev => prev.filter(a => a.id !== id));
        if (selected?.id === id) setSelected(null);
      }
    } catch {}
  };

  /* ── Open edit modal ─────────────────────────────── */
  const openEdit = (ave: Ave) => {
    setEditId(ave.id);
    setForm({
      tipo: ave.tipo,
      raza: ave.raza,
      color: ave.color || COLORES_RAZA[ave.raza]?.[0] || '',
      fechaNac: ave.fechaNac,
      peso: String(ave.peso),
      estado: ave.estado,
      gallinero: ave.gallinero,
      notas: ave.notas || '',
      aiVisionId: ave.aiVisionId || '',
    });
    setFotoPreview(ave.foto || '');
    setShowCreate(true);
  };
  const filtered = aves.filter(a =>
    !search || a.anilla.toLowerCase().includes(search.toLowerCase()) ||
    a.raza.toLowerCase().includes(search.toLowerCase()) ||
    a.tipo.toLowerCase().includes(search.toLowerCase())
  );

  if (!loaded) return <div className="nf-content"><p style={{ color: 'var(--neutral-500)' }}>Cargando censo...</p></div>;

  return (
    <div className="nf-content">
      {fetchError && (
        <div style={{ padding: '10px 16px', marginBottom: 16, borderRadius: 'var(--radius-md)', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#DC2626', fontSize: 13 }}>
          ⚠️ {fetchError} — <button onClick={loadAves} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>Reintentar</button>
        </div>
      )}
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)' }}>
            🐔 Aves
          </h1>
          <p style={{ fontSize: 13, color: 'var(--neutral-600)', marginTop: 4 }}>
            {aves.length === 0
              ? 'Registra tu primera ave para empezar el censo'
              : `${aves.length} ave${aves.length !== 1 ? 's' : ''} registrada${aves.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <button className="nf-btn primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Registrar ave
        </button>
      </div>

      {/* Search */}
      {aves.length > 0 && (
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
      )}

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => handlePhoto(e.target.files?.[0] || null)} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
        onChange={e => handlePhoto(e.target.files?.[0] || null)} />

      {/* Create Modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => { setShowCreate(false); setFotoPreview(''); setEditId(null); }}>
          <div
            style={{
              width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
              background: 'var(--neutral-0)',
              borderRadius: 'var(--radius-xl)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', background: 'var(--neutral-25)', borderBottom: 'var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{editId ? '✏️ Editar Ave' : '🐔 Nueva Ave'}</h3>
                {!editId && <p style={{ fontSize: 12, color: 'var(--neutral-500)', marginTop: 2 }}>Anilla: {nextAnilla()}</p>}
              </div>
              <button onClick={() => { setShowCreate(false); setFotoPreview(''); setEditId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: 'var(--neutral-500)' }} />
              </button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Photo upload */}
              <div>
                <label className="nf-label">Foto del ave</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {fotoPreview ? (
                    <div style={{ position: 'relative', width: 80, height: 80 }}>
                      <img src={fotoPreview} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: 'var(--border-default)' }} />
                      <button onClick={() => setFotoPreview('')} style={{
                        position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                        borderRadius: '50%', background: 'var(--alert)', color: '#fff',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, lineHeight: 1,
                      }}>×</button>
                    </div>
                  ) : (
                    <div style={{
                      width: 80, height: 80, borderRadius: 'var(--radius-md)',
                      border: '2px dashed var(--neutral-200)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-300)',
                    }}>
                      <ImageIcon size={28} />
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button type="button" className="nf-btn" onClick={() => cameraInputRef.current?.click()}
                      style={{ fontSize: 12, padding: '6px 12px' }}>
                      <Camera size={14} /> Cámara AI-Vision
                    </button>
                    <button type="button" className="nf-btn" onClick={() => fileInputRef.current?.click()}
                      style={{ fontSize: 12, padding: '6px 12px' }}>
                      <Upload size={14} /> Subir foto
                    </button>
                  </div>
                </div>
              </div>

              {/* AI-Vision ID */}
              <div>
                <label className="nf-label">ID AI-Vision (nº identificación)</label>
                <input className="nf-input" placeholder="Ej: AV-2026-001 o nº chip"
                  value={form.aiVisionId}
                  onChange={e => setForm(f => ({ ...f, aiVisionId: e.target.value }))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="nf-label">Tipo</label>
                  <select className="nf-input" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TipoAve }))}>
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="nf-label">Raza</label>
                  <select className="nf-input" value={form.raza} onChange={e => {
                    const raza = e.target.value;
                    const colores = COLORES_RAZA[raza] || [];
                    setForm(f => ({ ...f, raza, color: colores[0] || '' }));
                  }}>
                    {RAZAS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              {/* Color / Variedad */}
              <div>
                <label className="nf-label">Variedad / Color reconocido</label>
                <select className="nf-input" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}>
                  {(COLORES_RAZA[form.raza] || ['Sin especificar']).map(c => <option key={c}>{c}</option>)}
                </select>
                <p style={{ fontSize: 11, color: 'var(--neutral-500)', marginTop: 3 }}>
                  Variedades reconocidas por el estándar de {form.raza}
                </p>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="nf-label">Estado</label>
                  <select className="nf-input" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as EstadoAve }))}>
                    {ESTADOS.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="nf-label">Gallinero</label>
                  <input className="nf-input" placeholder="Ej: G1 — Principal" value={form.gallinero}
                    onChange={e => setForm(f => ({ ...f, gallinero: e.target.value }))} />
                </div>
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
                💡 Sexo se asigna automáticamente según el tipo. Los datos se guardan en base de datos.
              </div>
              <button className="nf-btn primary" disabled={saving} onClick={editId ? handleUpdate : handleCreate} style={{ width: '100%' }}>
                {saving ? '⏳ Guardando…' : editId ? '💾 Guardar cambios' : <><Plus size={16} /> Registrar</>}
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
          <div className="nf-card-pad" style={{ display: 'flex', gap: 20 }}>
            {selected.foto && (
              <img src={selected.foto} alt={selected.anilla} style={{
                width: 100, height: 100, objectFit: 'cover', borderRadius: 'var(--radius-md)',
                border: 'var(--border-default)', flexShrink: 0,
              }} />
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, flex: 1 }}>
              <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>TIPO</span><br />{selected.tipo}</div>
              <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>SEXO</span><br />{selected.sexo === 'M' ? '♂ Macho' : '♀ Hembra'}</div>
              <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>PESO</span><br />{selected.peso} kg</div>
              <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>ESTADO</span><br />{selected.estado}</div>
              {selected.color && (
                <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>VARIEDAD</span><br />{selected.color}</div>
              )}
              <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>GALLINERO</span><br />{selected.gallinero}</div>
              <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>NACIMIENTO</span><br />{selected.fechaNac}</div>
              {selected.aiVisionId && (
                <div><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>AI-VISION ID</span><br />{selected.aiVisionId}</div>
              )}
              {selected.notas && (
                <div style={{ gridColumn: '1 / -1' }}><span style={{ fontSize: 11, color: 'var(--neutral-500)', fontWeight: 600 }}>NOTAS</span><br />{selected.notas}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table or Empty */}
      {aves.length === 0 ? (
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
              `${prefix}-${year}-0001 · Gallina Castellana Negra · 2.2 kg · Ponedora activa`,
              `${prefix}-${year}-0002 · Gallo Prat Leonada · 3.5 kg · Reproductor`,
              `${prefix}-${year}-0003 · Capón Plymouth Rock × Castellana · 4.2 kg · Engorde`,
            ],
          }}
        />
      ) : (
        <div className="nf-card">
          <table className="nf-table">
            <thead>
              <tr>
                <th></th>
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
                <tr key={ave.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(ave)}>
                  <td style={{ width: 36, padding: '4px 8px' }}>
                    {ave.foto ? (
                      <img src={ave.foto} alt="" style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }} />
                    ) : (
                      <span style={{ display: 'inline-block', width: 28, height: 28, borderRadius: 4, background: 'var(--neutral-100)', textAlign: 'center', lineHeight: '28px', fontSize: 14 }}>🐔</span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12 }}>
                    {ave.anilla}
                  </td>
                  <td>{ave.tipo}</td>
                  <td style={{ color: 'var(--neutral-700)' }}>
                    {ave.raza}
                    {ave.color && <span style={{ display: 'block', fontSize: 11, color: 'var(--neutral-500)' }}>{ave.color}</span>}
                  </td>
                  <td>{ave.sexo === 'M' ? '♂' : '♀'}</td>
                  <td>{ave.peso} kg</td>
                  <td>
                    <span className="nf-tag" style={{
                      background: estadoColor(ave.estado),
                      color: estadoTextColor(ave.estado),
                    }}>
                      {ave.estado}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--neutral-700)' }}>{ave.gallinero}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={e => { e.stopPropagation(); openEdit(ave); }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 4, borderRadius: 4, color: 'var(--neutral-400)',
                      }}
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
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
          {filtered.length === 0 && search && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--neutral-500)', fontSize: 13 }}>
              Sin resultados para &quot;{search}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
