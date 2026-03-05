'use client';

import { useState, useMemo, useEffect } from 'react';
import { Package, Plus, Search, Filter, X, Camera, Edit2, Trash2, ChevronDown, Eye } from 'lucide-react';

/* ── Types ─────────────────────────────────────────── */
type TipoAve = 'Gallina' | 'Gallo' | 'Capón' | 'Pollito' | 'Pularda';
type EstadoAve = 'Ponedora activa' | 'Reproductor' | 'Engorde' | 'Cría' | 'Reposo' | 'Baja';

interface Ave {
  id: number;
  anilla: string;           // Código pasaporte: OVS-YYYY-NNNN
  tipo: TipoAve;
  raza: string;
  sexo: 'M' | 'H';
  fechaNac: string;         // ISO date
  peso: number;             // kg
  estado: EstadoAve;
  gallinero: string;
  foto?: string;
  notas?: string;
  fechaAlta: string;
  madre?: string;
  padre?: string;
  color?: string;
  fenotipo?: string;
  genotipo?: string;
}

/* ── Config ─────────────────────────────────────────── */
const RAZAS_CATALOGO = [
  'Castellana Negra',
  'Prat Leonada',
  'Plymouth Rock',
  'Sussex',
  'Mos (Galicia)',
  'Empordanesa',
  'Rhode Island Red',
  'Wyandotte',
  'Brahma',
  'Marans',
  'Leghorn Blanca',
  'Orpington',
];

const GALLINEROS_LIST = ['G1 — Principal', 'G2 — Capones', 'G3 — Cría', 'G4 — Parque exterior'];
const ESTADOS: EstadoAve[] = ['Ponedora activa', 'Reproductor', 'Engorde', 'Cría', 'Reposo', 'Baja'];
const TIPOS: TipoAve[] = ['Gallina', 'Gallo', 'Capón', 'Pollito', 'Pularda'];

/* ── Auto-sex from tipo ────────────────────────────── */
function sexFromTipo(tipo: TipoAve): 'M' | 'H' | null {
  if (tipo === 'Gallo' || tipo === 'Capón') return 'M';
  if (tipo === 'Gallina' || tipo === 'Pularda') return 'H';
  return null; // Pollito → no determinado hasta sexaje
}

/* ── Fenotipo por raza (auto-fill) ─────────────────── */
const FENOTIPO_POR_RAZA: Record<string, { color: string; fenotipo: string; genotipo: string }> = {
  'Castellana Negra': { color: 'Negro', fenotipo: 'Plumaje negro iridiscente, cresta simple, orejillas blancas', genotipo: 'E/E (extensión negro), Ml+/Ml+' },
  'Prat Leonada': { color: 'Leonado', fenotipo: 'Plumaje leonado dorado, tarsos rosados, piel blanca', genotipo: 'e+/e+ (tipo salvaje), Co/Co (colombino)' },
  'Plymouth Rock': { color: 'Barrado', fenotipo: 'Plumaje barrado blanco/negro, cresta simple, tarsos amarillos', genotipo: 'B/B (barring), E/E' },
  'Sussex': { color: 'Blanco armiñado', fenotipo: 'Plumaje blanco con collar negro, cresta simple', genotipo: 'Co/Co (colombino), e+/e+' },
  'Mos (Galicia)': { color: 'Trigueño', fenotipo: 'Plumaje trigueño variado, cresta en guisante, tarsos verdes', genotipo: 'P/P (guisante), e+/e+ (salvaje)' },
  'Empordanesa': { color: 'Rojo/Negro', fenotipo: 'Plumaje pardo-rojizo, cresta clavel, orejas rojas', genotipo: 'RN/RN (rojo negro), eWh/eWh' },
  'Rhode Island Red': { color: 'Caoba', fenotipo: 'Plumaje rojo caoba brillante, cresta simple', genotipo: 'Mh/Mh (caoba), e+/e+' },
  'Wyandotte': { color: 'Variado', fenotipo: 'Plumaje ribeteado, cresta en rosa, cuerpo redondeado', genotipo: 'R/R (rosa), Pg/Pg (ribeteado)' },
  'Brahma': { color: 'Armiñado', fenotipo: 'Plumaje denso, patas emplumadas, gran tamaño', genotipo: 'Co/Co (colombino), Pti-1/Pti-1 (plumas tarsos)' },
  'Marans': { color: 'Negro cobrizo', fenotipo: 'Plumaje cobrizo oscuro, huevos chocolate oscuro', genotipo: 'Mh/Mh, O (huevo marrón oscuro)' },
  'Leghorn Blanca': { color: 'Blanco', fenotipo: 'Plumaje blanco puro, cresta grande, producción alta', genotipo: 'I/I (blanco dominante), c/c (recesivo)' },
  'Orpington': { color: 'Leonado/Negro', fenotipo: 'Plumaje denso bufado, gran tamaño, temperamento dócil', genotipo: 'bf/bf (buff), e+/e+' },
};

/* ── Demo data ─────────────────────────────────────── */
const nextId = () => Math.floor(Math.random() * 9000) + 1000;
const makeAnilla = (id: number) => `OVS-2025-${String(id).padStart(4, '0')}`;

const INITIAL_AVES: Ave[] = [
  { id: 1, anilla: 'OVS-2025-0001', tipo: 'Gallina', raza: 'Castellana Negra', sexo: 'H', fechaNac: '2023-03-15', peso: 2.2, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2023-04-01' },
  { id: 2, anilla: 'OVS-2025-0002', tipo: 'Gallina', raza: 'Prat Leonada', sexo: 'H', fechaNac: '2023-09-01', peso: 2.5, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2023-10-01' },
  { id: 3, anilla: 'OVS-2025-0003', tipo: 'Gallina', raza: 'Plymouth Rock', sexo: 'H', fechaNac: '2023-03-20', peso: 2.8, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2023-04-05' },
  { id: 4, anilla: 'OVS-2025-0004', tipo: 'Gallina', raza: 'Sussex', sexo: 'H', fechaNac: '2023-06-10', peso: 2.6, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2023-07-01' },
  { id: 5, anilla: 'OVS-2025-0005', tipo: 'Gallina', raza: 'Castellana Negra', sexo: 'H', fechaNac: '2023-04-01', peso: 2.3, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2023-04-15' },
  { id: 6, anilla: 'OVS-2025-0006', tipo: 'Gallina', raza: 'Prat Leonada', sexo: 'H', fechaNac: '2023-08-12', peso: 2.4, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2023-09-01' },
  { id: 7, anilla: 'OVS-2025-0007', tipo: 'Gallina', raza: 'Empordanesa', sexo: 'H', fechaNac: '2023-05-20', peso: 2.1, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2023-06-01' },
  { id: 8, anilla: 'OVS-2025-0008', tipo: 'Gallina', raza: 'Plymouth Rock', sexo: 'H', fechaNac: '2023-07-14', peso: 2.7, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2023-08-01' },
  { id: 9, anilla: 'OVS-2025-0009', tipo: 'Gallina', raza: 'Rhode Island Red', sexo: 'H', fechaNac: '2023-09-22', peso: 2.5, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2023-10-05' },
  { id: 10, anilla: 'OVS-2025-0010', tipo: 'Gallina', raza: 'Sussex', sexo: 'H', fechaNac: '2023-10-05', peso: 2.4, estado: 'Reposo', gallinero: 'G1 — Principal', fechaAlta: '2023-11-01' },
  { id: 11, anilla: 'OVS-2025-0011', tipo: 'Gallina', raza: 'Castellana Negra', sexo: 'H', fechaNac: '2024-01-10', peso: 2.0, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2024-02-01' },
  { id: 12, anilla: 'OVS-2025-0012', tipo: 'Gallina', raza: 'Prat Leonada', sexo: 'H', fechaNac: '2024-02-15', peso: 2.3, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2024-03-01' },
  { id: 13, anilla: 'OVS-2025-0013', tipo: 'Gallina', raza: 'Marans', sexo: 'H', fechaNac: '2023-11-01', peso: 2.6, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2023-12-01' },
  { id: 14, anilla: 'OVS-2025-0014', tipo: 'Gallina', raza: 'Wyandotte', sexo: 'H', fechaNac: '2023-12-05', peso: 2.8, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2024-01-01' },
  { id: 15, anilla: 'OVS-2025-0015', tipo: 'Gallina', raza: 'Orpington', sexo: 'H', fechaNac: '2024-01-20', peso: 3.0, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2024-02-15' },
  { id: 16, anilla: 'OVS-2025-0016', tipo: 'Gallina', raza: 'Empordanesa', sexo: 'H', fechaNac: '2024-03-01', peso: 2.2, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2024-03-20' },
  { id: 17, anilla: 'OVS-2025-0017', tipo: 'Gallina', raza: 'Leghorn Blanca', sexo: 'H', fechaNac: '2024-02-10', peso: 1.9, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2024-03-01' },
  { id: 18, anilla: 'OVS-2025-0018', tipo: 'Gallina', raza: 'Brahma', sexo: 'H', fechaNac: '2024-01-05', peso: 3.2, estado: 'Ponedora activa', gallinero: 'G1 — Principal', fechaAlta: '2024-02-01' },
  { id: 20, anilla: 'OVS-2025-0020', tipo: 'Gallo', raza: 'Castellana Negra', sexo: 'M', fechaNac: '2022-03-10', peso: 3.2, estado: 'Reproductor', gallinero: 'G1 — Principal', fechaAlta: '2022-04-01' },
  { id: 21, anilla: 'OVS-2025-0021', tipo: 'Gallo', raza: 'Prat Leonada', sexo: 'M', fechaNac: '2023-03-01', peso: 3.5, estado: 'Reproductor', gallinero: 'G1 — Principal', fechaAlta: '2023-04-01' },
  { id: 30, anilla: 'OVS-2025-0030', tipo: 'Capón', raza: 'Plymouth Rock × Castellana', sexo: 'M', fechaNac: '2025-09-15', peso: 4.2, estado: 'Engorde', gallinero: 'G2 — Capones', fechaAlta: '2025-10-01', padre: 'OVS-2025-0020', madre: 'OVS-2025-0003' },
  { id: 31, anilla: 'OVS-2025-0031', tipo: 'Capón', raza: 'Mos × Prat', sexo: 'M', fechaNac: '2025-10-01', peso: 3.8, estado: 'Engorde', gallinero: 'G2 — Capones', fechaAlta: '2025-10-15' },
  { id: 32, anilla: 'OVS-2025-0032', tipo: 'Capón', raza: 'Sussex × Castellana', sexo: 'M', fechaNac: '2025-09-20', peso: 4.0, estado: 'Engorde', gallinero: 'G2 — Capones', fechaAlta: '2025-10-05' },
  { id: 33, anilla: 'OVS-2025-0033', tipo: 'Capón', raza: 'Empordanesa × Prat', sexo: 'M', fechaNac: '2025-10-05', peso: 3.6, estado: 'Engorde', gallinero: 'G2 — Capones', fechaAlta: '2025-10-20' },
  { id: 34, anilla: 'OVS-2025-0034', tipo: 'Capón', raza: 'Plymouth Rock × Castellana', sexo: 'M', fechaNac: '2025-10-10', peso: 3.5, estado: 'Engorde', gallinero: 'G2 — Capones', fechaAlta: '2025-10-25' },
  { id: 35, anilla: 'OVS-2025-0035', tipo: 'Capón', raza: 'Mos × Sussex', sexo: 'M', fechaNac: '2025-09-25', peso: 4.1, estado: 'Engorde', gallinero: 'G2 — Capones', fechaAlta: '2025-10-10' },
  { id: 36, anilla: 'OVS-2025-0036', tipo: 'Capón', raza: 'Castellana × Prat', sexo: 'M', fechaNac: '2025-10-15', peso: 3.4, estado: 'Engorde', gallinero: 'G2 — Capones', fechaAlta: '2025-11-01' },
  { id: 37, anilla: 'OVS-2025-0037', tipo: 'Capón', raza: 'Plymouth Rock × Empordanesa', sexo: 'M', fechaNac: '2025-10-20', peso: 3.7, estado: 'Engorde', gallinero: 'G2 — Capones', fechaAlta: '2025-11-05' },
  { id: 38, anilla: 'OVS-2025-0038', tipo: 'Capón', raza: 'Sussex × Prat', sexo: 'M', fechaNac: '2025-10-25', peso: 3.9, estado: 'Engorde', gallinero: 'G2 — Capones', fechaAlta: '2025-11-10' },
  { id: 39, anilla: 'OVS-2025-0039', tipo: 'Capón', raza: 'Castellana × Mos', sexo: 'M', fechaNac: '2025-11-01', peso: 3.3, estado: 'Engorde', gallinero: 'G2 — Capones', fechaAlta: '2025-11-15' },
  { id: 40, anilla: 'OVS-2025-0040', tipo: 'Capón', raza: 'Prat × Plymouth Rock', sexo: 'M', fechaNac: '2025-11-05', peso: 3.6, estado: 'Engorde', gallinero: 'G2 — Capones', fechaAlta: '2025-11-20' },
  { id: 41, anilla: 'OVS-2025-0041', tipo: 'Capón', raza: 'Empordanesa × Sussex', sexo: 'M', fechaNac: '2025-11-10', peso: 3.5, estado: 'Engorde', gallinero: 'G2 — Capones', fechaAlta: '2025-11-25' },
  { id: 50, anilla: 'OVS-2025-0050', tipo: 'Pollito', raza: 'Castellana Negra', sexo: 'H', fechaNac: '2026-02-10', peso: 0.4, estado: 'Cría', gallinero: 'G3 — Cría', fechaAlta: '2026-02-10' },
  { id: 51, anilla: 'OVS-2025-0051', tipo: 'Pollito', raza: 'Prat Leonada', sexo: 'M', fechaNac: '2026-02-12', peso: 0.35, estado: 'Cría', gallinero: 'G3 — Cría', fechaAlta: '2026-02-12' },
  { id: 52, anilla: 'OVS-2025-0052', tipo: 'Pollito', raza: 'Plymouth Rock × Castellana', sexo: 'M', fechaNac: '2026-02-15', peso: 0.38, estado: 'Cría', gallinero: 'G3 — Cría', fechaAlta: '2026-02-15' },
  { id: 53, anilla: 'OVS-2025-0053', tipo: 'Pollito', raza: 'Castellana Negra', sexo: 'H', fechaNac: '2026-02-18', peso: 0.32, estado: 'Cría', gallinero: 'G3 — Cría', fechaAlta: '2026-02-18' },
  { id: 54, anilla: 'OVS-2025-0054', tipo: 'Pollito', raza: 'Sussex × Prat', sexo: 'H', fechaNac: '2026-02-20', peso: 0.36, estado: 'Cría', gallinero: 'G3 — Cría', fechaAlta: '2026-02-20' },
  { id: 55, anilla: 'OVS-2025-0055', tipo: 'Pollito', raza: 'Empordanesa', sexo: 'M', fechaNac: '2026-02-22', peso: 0.33, estado: 'Cría', gallinero: 'G3 — Cría', fechaAlta: '2026-02-22' },
];

/* ── Helpers ────────────────────────────────────────── */
function calcEdad(fechaNac: string): string {
  const d = new Date(fechaNac);
  const now = new Date();
  const months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (months < 1) {
    const weeks = Math.floor((now.getTime() - d.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${weeks} sem`;
  }
  if (months < 12) return `${months} meses`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}a ${rem}m` : `${years} años`;
}

function estadoColor(e: EstadoAve): string {
  switch (e) {
    case 'Ponedora activa': return 'ok';
    case 'Reproductor': return 'ok';
    case 'Engorde': return 'info';
    case 'Cría': return 'info';
    case 'Reposo': return 'warn';
    case 'Baja': return 'alert';
    default: return '';
  }
}

/* ── Empty form ────────────────────────────────────── */
const emptyAve = (): Omit<Ave, 'id' | 'anilla' | 'fechaAlta'> => {
  const tipo: TipoAve = 'Gallina';
  const raza = RAZAS_CATALOGO[0];
  const fen = FENOTIPO_POR_RAZA[raza];
  return {
    tipo,
    raza,
    sexo: sexFromTipo(tipo) || 'H',
    fechaNac: new Date().toISOString().split('T')[0],
    peso: 2.0,
    estado: 'Ponedora activa',
    gallinero: GALLINEROS_LIST[0],
    notas: '',
    color: fen?.color || '',
    fenotipo: fen?.fenotipo || '',
    genotipo: fen?.genotipo || '',
  };
};

/* ── localStorage key for cross-page sharing ──────── */
const LS_KEY = 'ovosfera_aves';

/* ── Component ─────────────────────────────────────── */
export default function AvesPage() {
  const [aves, setAves] = useState<Ave[]>(INITIAL_AVES);
  const [searchQ, setSearchQ] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterGallinero, setFilterGallinero] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyAve());
  const [detailAve, setDetailAve] = useState<Ave | null>(null);

  /* Counts by type */
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    aves.forEach(a => { c[a.tipo] = (c[a.tipo] || 0) + 1; });
    return c;
  }, [aves]);

  /* Filtered list */
  const filtered = useMemo(() => {
    return aves.filter(a => {
      if (filterTipo && a.tipo !== filterTipo) return false;
      if (filterGallinero && a.gallinero !== filterGallinero) return false;
      if (searchQ) {
        const q = searchQ.toLowerCase();
        return (
          a.anilla.toLowerCase().includes(q) ||
          a.raza.toLowerCase().includes(q) ||
          a.tipo.toLowerCase().includes(q) ||
          a.estado.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [aves, searchQ, filterTipo, filterGallinero]);

  /* CRUD handlers */
  const openCreate = () => {
    setEditId(null);
    setForm(emptyAve());
    setShowModal(true);
  };

  const openEdit = (a: Ave) => {
    setEditId(a.id);
    setForm({
      tipo: a.tipo,
      raza: a.raza,
      sexo: a.sexo,
      fechaNac: a.fechaNac,
      peso: a.peso,
      estado: a.estado,
      gallinero: a.gallinero,
      notas: a.notas || '',
      color: a.color || '',
      fenotipo: a.fenotipo || '',
      genotipo: a.genotipo || '',
    });
    setShowModal(true);
  };

  /* ── Persist to localStorage for /genetics ── */
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(aves)); } catch {}
  }, [aves]);

  /* ── Auto-fill fenotipo when raza changes ── */
  const handleRazaChange = (raza: string) => {
    const fen = FENOTIPO_POR_RAZA[raza];
    setForm(f => ({
      ...f,
      raza,
      color: fen?.color || f.color || '',
      fenotipo: fen?.fenotipo || f.fenotipo || '',
      genotipo: fen?.genotipo || f.genotipo || '',
    }));
  };

  /* ── Auto-sex when tipo changes ── */
  const handleTipoChange = (tipo: TipoAve) => {
    const autoSex = sexFromTipo(tipo);
    setForm(f => ({ ...f, tipo, ...(autoSex ? { sexo: autoSex } : {}) }));
  };

  const handleSave = () => {
    if (editId !== null) {
      setAves(prev => prev.map(a => a.id === editId ? {
        ...a, ...form,
      } : a));
    } else {
      const id = nextId();
      const nuevo: Ave = {
        id,
        anilla: makeAnilla(id),
        ...form,
        fechaAlta: new Date().toISOString().split('T')[0],
      };
      setAves(prev => [...prev, nuevo]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (!confirm('¿Eliminar este ave del registro?')) return;
    setAves(prev => prev.filter(a => a.id !== id));
  };

  const STATS = [
    { label: 'Gallinas', count: counts['Gallina'] || 0, color: 'var(--primary-500)' },
    { label: 'Gallos', count: counts['Gallo'] || 0, color: 'var(--primary-600)' },
    { label: 'Capones', count: counts['Capón'] || 0, color: 'var(--primary-400)' },
    { label: 'Pollitos', count: counts['Pollito'] || 0, color: 'var(--primary-300)' },
    { label: 'Total', count: aves.length, color: 'var(--neutral-700)' },
  ];

  return (
    <div className="nf-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>
          <Package size={24} style={{ display: 'inline', marginRight: 8 }} />
          Inventario de Aves
        </h1>
        <button className="nf-btn primary" onClick={openCreate}>
          <Plus size={16} /> Registrar Ave
        </button>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {STATS.map((s) => (
          <div key={s.label} className="nf-kbox">
            <div className="nf-kbox-v" style={{ color: s.color }}>{s.count}</div>
            <div className="nf-kbox-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
          <input
            className="nf-input"
            placeholder="Buscar por anilla, raza, tipo..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select className="nf-input" value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={{ width: 160 }}>
          <option value="">Todos los tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="nf-input" value={filterGallinero} onChange={e => setFilterGallinero(e.target.value)} style={{ width: 200 }}>
          <option value="">Todos gallineros</option>
          {GALLINEROS_LIST.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="nf-card">
        <div className="nf-card-hd">
          <div className="nf-card-title">Listado Completo</div>
          <div className="nf-card-meta">{filtered.length} aves {searchQ || filterTipo || filterGallinero ? '(filtrado)' : ''}</div>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table className="nf-table">
            <thead>
              <tr>
                <th>Anilla</th>
                <th>Tipo</th>
                <th>Raza</th>
                <th>Sexo</th>
                <th>Edad</th>
                <th>Peso</th>
                <th>Estado</th>
                <th>Gallinero</th>
                <th style={{ width: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span
                      className="nf-tag"
                      style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11 }}
                      onClick={() => setDetailAve(a)}
                    >
                      {a.anilla}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{a.tipo}</td>
                  <td>{a.raza}</td>
                  <td>{a.sexo === 'M' ? '♂' : '♀'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{calcEdad(a.fechaNac)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{a.peso.toFixed(1)} kg</td>
                  <td>
                    <span className={`nf-dot ${estadoColor(a.estado)}`} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} />
                    {a.estado}
                  </td>
                  <td><span className="nf-tag">{a.gallinero.split(' — ')[0]}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="nf-btn" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => setDetailAve(a)} title="Ver detalle">
                        <Eye size={14} />
                      </button>
                      <button className="nf-btn" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => openEdit(a)} title="Editar">
                        <Edit2 size={14} />
                      </button>
                      <button className="nf-btn" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--alert)' }} onClick={() => handleDelete(a.id)} title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--neutral-400)' }}>
                    No se encontraron aves con los filtros actuales
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create/Edit Modal ────────────────────── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={() => setShowModal(false)}>
          <div
            style={{
              background: 'var(--neutral-0)', borderRadius: 'var(--radius-xl)',
              width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto',
              boxShadow: 'var(--shadow-float)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: 'var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 800, fontSize: 18 }}>{editId ? 'Editar Ave' : 'Registrar Nueva Ave'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Tipo → auto-sex */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="nf-label">Tipo</label>
                  <select className="nf-input" value={form.tipo} onChange={e => handleTipoChange(e.target.value as TipoAve)}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="nf-label">Sexo {sexFromTipo(form.tipo) ? '(auto)' : ''}</label>
                  <select className="nf-input" value={form.sexo} onChange={e => setForm(f => ({ ...f, sexo: e.target.value as 'M' | 'H' }))}
                    disabled={!!sexFromTipo(form.tipo)}>
                    <option value="H">♀ Hembra</option>
                    <option value="M">♂ Macho</option>
                  </select>
                </div>
              </div>

              {/* Raza → auto-fill fenotipo */}
              <div>
                <label className="nf-label">Raza</label>
                <select className="nf-input" value={form.raza} onChange={e => handleRazaChange(e.target.value)}>
                  {RAZAS_CATALOGO.map(r => <option key={r} value={r}>{r}</option>)}
                  <option value="_custom">Otra (cruce)...</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="nf-label">Fecha Nacimiento</label>
                  <input className="nf-input" type="date" value={form.fechaNac} onChange={e => setForm(f => ({ ...f, fechaNac: e.target.value }))} />
                </div>
                <div>
                  <label className="nf-label">Peso (kg)</label>
                  <input className="nf-input" type="number" step="0.1" min="0" value={form.peso} onChange={e => setForm(f => ({ ...f, peso: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="nf-label">Estado</label>
                  <select className="nf-input" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as EstadoAve }))}>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="nf-label">Gallinero</label>
                  <select className="nf-input" value={form.gallinero} onChange={e => setForm(f => ({ ...f, gallinero: e.target.value }))}>
                    {GALLINEROS_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* ── Genética ── */}
              <div style={{ marginTop: 4, padding: '12px 14px', background: 'rgba(176,125,43,0.06)', borderRadius: 10, border: '1px solid rgba(176,125,43,0.15)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#B07D2B', marginBottom: 10 }}>🧬 Genética / Fenotipo</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label className="nf-label">Color plumaje</label>
                    <input className="nf-input" value={form.color || ''} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="Ej: Negro, Leonado..." />
                  </div>
                  <div>
                    <label className="nf-label">Genotipo</label>
                    <input className="nf-input" value={form.genotipo || ''} onChange={e => setForm(f => ({ ...f, genotipo: e.target.value }))} placeholder="Ej: E/E, Ml+/Ml+" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
                  </div>
                </div>
                <div>
                  <label className="nf-label">Fenotipo</label>
                  <textarea className="nf-input" rows={2} value={form.fenotipo || ''} onChange={e => setForm(f => ({ ...f, fenotipo: e.target.value }))} placeholder="Descripción fenotípica..." style={{ fontSize: 12 }} />
                </div>
              </div>

              <div>
                <label className="nf-label">Notas</label>
                <textarea className="nf-input" rows={3} value={form.notas || ''} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} placeholder="Observaciones, genealogía, tratamientos..." />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="nf-btn" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="nf-btn primary" onClick={handleSave}>
                  {editId ? 'Guardar Cambios' : 'Registrar Ave'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ─────────────────────────── */}
      {detailAve && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={() => setDetailAve(null)}>
          <div
            style={{
              background: 'var(--neutral-0)', borderRadius: 'var(--radius-xl)',
              width: '100%', maxWidth: 500, boxShadow: 'var(--shadow-float)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: 'var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 18 }}>{detailAve.tipo} — {detailAve.raza}</h2>
                <div style={{ fontSize: 12, color: 'var(--neutral-500)', fontFamily: 'var(--font-mono)' }}>{detailAve.anilla}</div>
              </div>
              <button onClick={() => setDetailAve(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: 24 }}>
              {/* Photo placeholder */}
              <div style={{
                width: '100%', height: 160, background: 'var(--neutral-50)',
                borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: 20, border: 'var(--border-default)',
              }}>
                <div style={{ textAlign: 'center', color: 'var(--neutral-400)' }}>
                  <Camera size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                  <div style={{ fontSize: 12 }}>Sin foto · Subir imagen</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
                <div><span style={{ color: 'var(--neutral-500)', fontSize: 11 }}>Tipo</span><div style={{ fontWeight: 600 }}>{detailAve.tipo}</div></div>
                <div><span style={{ color: 'var(--neutral-500)', fontSize: 11 }}>Sexo</span><div style={{ fontWeight: 600 }}>{detailAve.sexo === 'M' ? '♂ Macho' : '♀ Hembra'}</div></div>
                <div><span style={{ color: 'var(--neutral-500)', fontSize: 11 }}>Raza</span><div style={{ fontWeight: 600 }}>{detailAve.raza}</div></div>
                <div><span style={{ color: 'var(--neutral-500)', fontSize: 11 }}>Edad</span><div style={{ fontWeight: 600 }}>{calcEdad(detailAve.fechaNac)}</div></div>
                <div><span style={{ color: 'var(--neutral-500)', fontSize: 11 }}>Peso</span><div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{detailAve.peso.toFixed(1)} kg</div></div>
                <div><span style={{ color: 'var(--neutral-500)', fontSize: 11 }}>Estado</span><div style={{ fontWeight: 600 }}><span className={`nf-dot ${estadoColor(detailAve.estado)}`} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} />{detailAve.estado}</div></div>
                <div><span style={{ color: 'var(--neutral-500)', fontSize: 11 }}>Gallinero</span><div style={{ fontWeight: 600 }}>{detailAve.gallinero}</div></div>
                <div><span style={{ color: 'var(--neutral-500)', fontSize: 11 }}>Fecha Alta</span><div style={{ fontWeight: 600 }}>{detailAve.fechaAlta}</div></div>
                {detailAve.padre && <div><span style={{ color: 'var(--neutral-500)', fontSize: 11 }}>Padre</span><div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 11 }}>{detailAve.padre}</div></div>}
                {detailAve.madre && <div><span style={{ color: 'var(--neutral-500)', fontSize: 11 }}>Madre</span><div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 11 }}>{detailAve.madre}</div></div>}
              </div>

              {/* Genética detail */}
              {(detailAve.color || detailAve.fenotipo || detailAve.genotipo) && (
                <div style={{ marginTop: 16, padding: 12, background: 'rgba(176,125,43,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(176,125,43,0.15)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#B07D2B', marginBottom: 6 }}>🧬 Genética</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                    {detailAve.color && <div><span style={{ color: 'var(--neutral-500)' }}>Color:</span> <strong>{detailAve.color}</strong></div>}
                    {detailAve.genotipo && <div><span style={{ color: 'var(--neutral-500)' }}>Genotipo:</span> <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{detailAve.genotipo}</strong></div>}
                  </div>
                  {detailAve.fenotipo && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--neutral-600)' }}>{detailAve.fenotipo}</div>}
                </div>
              )}

              {detailAve.notas && (
                <div style={{ marginTop: 16, padding: 12, background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', fontSize: 13 }}>
                  <strong>Notas:</strong> {detailAve.notas}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
                <button className="nf-btn" onClick={() => { setDetailAve(null); openEdit(detailAve); }}>
                  <Edit2 size={14} /> Editar
                </button>
                <button className="nf-btn primary" onClick={() => setDetailAve(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
