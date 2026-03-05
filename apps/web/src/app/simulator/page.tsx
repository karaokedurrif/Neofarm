'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dna, Camera, Sparkles, Search, ChevronRight, X, ArrowRight, Download,
  Loader2, FlaskConical, BarChart3, Star, Eye, Microscope, RefreshCw,
  ChevronDown, ImageIcon, BookOpen
} from 'lucide-react';

/* ══════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════ */
const CAPONES_API = 'https://capones.ovosfera.com';

interface BreedProfile {
  name: string;
  weight_m: number;
  weight_f: number;
  eggs_per_year: number;
  carcass_pct: number;
  growth: string;
  comb: string;
  origin?: string;
  genetic_profile?: {
    plumage_loci: Record<string, string>;
    phenotype: string;
    comb_type: string;
    eye_color: string;
    special_traits?: string[];
  };
}

type CrossType = 'F0xF0' | 'F1xF0' | 'F1xF1' | 'F2xF1' | 'F2xF0' | 'F2xF2';
type Sexo = 'male' | 'female';
type ImgStyle = 'fotorrealista' | 'artístico' | 'profesional';
type Tab = 'gallery' | 'cross' | 'library';

interface PredictResult {
  cross_type: string;
  padre: string;
  madre: string;
  f1_prediction: {
    weight_m: number;
    weight_f: number;
    eggs_per_year: number;
    carcass_pct: number;
    growth: string;
    heterosis: number;
    capon_score?: number;
  };
  recommendation?: string;
}

interface GeneticAnalysis {
  color_genetics?: any;
  f1_prediction?: any;
  special_traits?: any;
  production_morphology?: any;
}

interface BLUPResult {
  breeding_values?: any;
  heterosis?: any;
  selection_index?: number;
  accuracy?: number;
}

/* ══════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════ */
export default function SimulatorPage() {
  const [tab, setTab] = useState<Tab>('gallery');
  const [breeds, setBreeds] = useState<BreedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cross config
  const [crossType, setCrossType] = useState<CrossType>('F0xF0');
  const [padre, setPadre] = useState('');
  const [madre, setMadre] = useState('');

  // Results
  const [predResult, setPredResult] = useState<PredictResult | null>(null);
  const [genAnalysis, setGenAnalysis] = useState<GeneticAnalysis | null>(null);
  const [blupResult, setBlupResult] = useState<BLUPResult | null>(null);
  const [genImage, setGenImage] = useState<string | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [generatingImg, setGeneratingImg] = useState(false);
  const [analyzingBLUP, setAnalyzingBLUP] = useState(false);

  // Image options
  const [imgSex, setImgSex] = useState<Sexo>('male');
  const [imgStyle, setImgStyle] = useState<ImgStyle>('fotorrealista');

  // Gallery detail
  const [selectedBreed, setSelectedBreed] = useState<BreedProfile | null>(null);
  const [breedImgSex, setBreedImgSex] = useState<'male' | 'female'>('male');

  // Hybrid library
  const [hybrids, setHybrids] = useState<any[]>([]);
  const [hybridTab, setHybridTab] = useState<'F1' | 'F2' | 'F3'>('F1');

  // Gallery search & filter
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'pesada' | 'ligera' | 'española' | 'francesa'>('all');

  /* ── Fetch breeds ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${CAPONES_API}/api/breeds`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBreeds(Array.isArray(data) ? data : data.breeds || []);
        setLoading(false);
      } catch (e: any) {
        console.error('Breeds fetch error:', e);
        // Fallback demo breeds — 42 razas para capones gourmet
        setBreeds([
          { name: 'Bresse', weight_m: 4.5, weight_f: 3.5, eggs_per_year: 200, carcass_pct: 70, growth: 'medio', comb: 'simple', origin: 'Francia' },
          { name: 'Sulmtaler', weight_m: 4.0, weight_f: 3.0, eggs_per_year: 180, carcass_pct: 68, growth: 'medio', comb: 'nuez', origin: 'Austria' },
          { name: 'Orpington', weight_m: 4.5, weight_f: 3.5, eggs_per_year: 160, carcass_pct: 65, growth: 'lento', comb: 'simple', origin: 'Reino Unido' },
          { name: 'Plymouth Rock Barrada', weight_m: 4.3, weight_f: 3.3, eggs_per_year: 200, carcass_pct: 72, growth: 'rápido', comb: 'simple', origin: 'Estados Unidos' },
          { name: 'Cochin', weight_m: 4.8, weight_f: 3.8, eggs_per_year: 140, carcass_pct: 68, growth: 'lento', comb: 'guisante', origin: 'China' },
          { name: 'Sussex', weight_m: 4.2, weight_f: 3.2, eggs_per_year: 210, carcass_pct: 70, growth: 'medio', comb: 'simple', origin: 'Reino Unido' },
          { name: 'Vorwerk', weight_m: 3.5, weight_f: 2.8, eggs_per_year: 170, carcass_pct: 66, growth: 'medio', comb: 'simple', origin: 'Alemania' },
          { name: 'Andaluza', weight_m: 3.0, weight_f: 2.5, eggs_per_year: 180, carcass_pct: 64, growth: 'rápido', comb: 'simple', origin: 'España' },
          { name: 'Castellana Negra', weight_m: 3.2, weight_f: 2.6, eggs_per_year: 190, carcass_pct: 67, growth: 'rápido', comb: 'simple', origin: 'España' },
          { name: 'Brahma', weight_m: 5.0, weight_f: 4.0, eggs_per_year: 140, carcass_pct: 68, growth: 'lento', comb: 'guisante', origin: 'India' },
          { name: 'Cornish', weight_m: 4.0, weight_f: 2.5, eggs_per_year: 80, carcass_pct: 75, growth: 'medio', comb: 'guisante', origin: 'Reino Unido' },
          { name: 'Rhode Island Red', weight_m: 3.9, weight_f: 2.9, eggs_per_year: 220, carcass_pct: 70, growth: 'rápido', comb: 'simple', origin: 'Estados Unidos' },
          { name: 'New Hampshire', weight_m: 3.8, weight_f: 2.8, eggs_per_year: 200, carcass_pct: 72, growth: 'rápido', comb: 'simple', origin: 'Estados Unidos' },
          { name: 'Wyandotte', weight_m: 3.8, weight_f: 2.8, eggs_per_year: 180, carcass_pct: 70, growth: 'medio', comb: 'rosa', origin: 'Estados Unidos' },
          { name: 'Australorp', weight_m: 3.9, weight_f: 3.1, eggs_per_year: 250, carcass_pct: 68, growth: 'rápido', comb: 'simple', origin: 'Australia' },
          { name: 'Marans', weight_m: 3.5, weight_f: 2.6, eggs_per_year: 150, carcass_pct: 70, growth: 'medio', comb: 'simple', origin: 'Francia' },
          { name: 'Faverolles', weight_m: 4.0, weight_f: 3.3, eggs_per_year: 160, carcass_pct: 68, growth: 'lento', comb: 'simple', origin: 'Francia' },
          { name: 'Dorking', weight_m: 4.5, weight_f: 3.6, eggs_per_year: 140, carcass_pct: 70, growth: 'lento', comb: 'simple', origin: 'Reino Unido' },
          { name: 'Jersey Giant', weight_m: 5.5, weight_f: 4.5, eggs_per_year: 180, carcass_pct: 72, growth: 'lento', comb: 'simple', origin: 'Estados Unidos' },
          { name: 'Euskal Oiloa', weight_m: 4.0, weight_f: 2.9, eggs_per_year: 200, carcass_pct: 68, growth: 'medio', comb: 'simple', origin: 'País Vasco' },
          { name: 'Pita Pinta Asturiana', weight_m: 4.3, weight_f: 2.8, eggs_per_year: 180, carcass_pct: 70, growth: 'medio', comb: 'simple', origin: 'Asturias' },
          { name: 'Prat Leonada', weight_m: 3.5, weight_f: 2.5, eggs_per_year: 180, carcass_pct: 70, growth: 'medio', comb: 'simple', origin: 'Cataluña' },
          { name: 'Penedesenca Negra', weight_m: 3.0, weight_f: 2.3, eggs_per_year: 160, carcass_pct: 65, growth: 'rápido', comb: 'simple', origin: 'Cataluña' },
          { name: 'Mos', weight_m: 4.0, weight_f: 3.0, eggs_per_year: 190, carcass_pct: 72, growth: 'lento', comb: 'guisante', origin: 'Galicia' },
          { name: 'Malines', weight_m: 5.0, weight_f: 3.8, eggs_per_year: 150, carcass_pct: 72, growth: 'lento', comb: 'simple', origin: 'Bélgica' },
          { name: 'Ayam Cemani', weight_m: 2.0, weight_f: 1.4, eggs_per_year: 140, carcass_pct: 60, growth: 'medio', comb: 'simple', origin: 'Indonesia' },
          { name: 'Delaware', weight_m: 3.8, weight_f: 2.8, eggs_per_year: 200, carcass_pct: 72, growth: 'rápido', comb: 'simple', origin: 'Estados Unidos' },
          { name: 'Naked Neck', weight_m: 3.5, weight_f: 2.5, eggs_per_year: 160, carcass_pct: 72, growth: 'medio', comb: 'simple', origin: 'Transilvania' },
          { name: 'Leghorn', weight_m: 2.5, weight_f: 1.8, eggs_per_year: 280, carcass_pct: 62, growth: 'rápido', comb: 'simple', origin: 'Italia' },
          { name: 'Minorca', weight_m: 3.5, weight_f: 2.5, eggs_per_year: 200, carcass_pct: 62, growth: 'medio', comb: 'simple', origin: 'España' },
          { name: 'Welsummer', weight_m: 3.2, weight_f: 2.5, eggs_per_year: 170, carcass_pct: 68, growth: 'medio', comb: 'simple', origin: 'Países Bajos' },
          { name: 'Barnevelder', weight_m: 3.5, weight_f: 2.8, eggs_per_year: 180, carcass_pct: 68, growth: 'medio', comb: 'simple', origin: 'Países Bajos' },
          { name: 'Empordanesa', weight_m: 3.2, weight_f: 2.4, eggs_per_year: 160, carcass_pct: 66, growth: 'medio', comb: 'simple', origin: 'Cataluña' },
          { name: 'Sobrarbe', weight_m: 3.5, weight_f: 2.8, eggs_per_year: 150, carcass_pct: 67, growth: 'lento', comb: 'simple', origin: 'Aragón' },
          { name: 'La Flèche', weight_m: 4.0, weight_f: 3.0, eggs_per_year: 150, carcass_pct: 72, growth: 'medio', comb: 'en V', origin: 'Francia' },
          { name: 'Houdan', weight_m: 3.5, weight_f: 2.5, eggs_per_year: 170, carcass_pct: 68, growth: 'medio', comb: 'en V', origin: 'Francia' },
          { name: 'Crèvecœur', weight_m: 4.0, weight_f: 3.0, eggs_per_year: 140, carcass_pct: 70, growth: 'lento', comb: 'en V', origin: 'Francia' },
          { name: 'Barbezieux', weight_m: 4.5, weight_f: 3.5, eggs_per_year: 180, carcass_pct: 72, growth: 'medio', comb: 'simple', origin: 'Francia' },
          { name: 'Hamburg', weight_m: 2.5, weight_f: 2.0, eggs_per_year: 200, carcass_pct: 62, growth: 'rápido', comb: 'rosa', origin: 'Alemania' },
          { name: 'Campine', weight_m: 2.5, weight_f: 2.0, eggs_per_year: 180, carcass_pct: 62, growth: 'rápido', comb: 'simple', origin: 'Bélgica' },
          { name: 'Araucana', weight_m: 2.8, weight_f: 2.2, eggs_per_year: 170, carcass_pct: 66, growth: 'medio', comb: 'guisante', origin: 'Chile' },
          { name: 'Bielefelder', weight_m: 4.2, weight_f: 3.2, eggs_per_year: 220, carcass_pct: 70, growth: 'rápido', comb: 'simple', origin: 'Alemania' },
        ]);
        setError('Usando catálogo demo — capones-backend no disponible');
        setLoading(false);
      }
    })();
  }, []);

  /* ── Fetch hybrids ── */
  useEffect(() => {
    if (tab !== 'library') return;
    (async () => {
      try {
        const res = await fetch(`${CAPONES_API}/api/saved-hybrids`);
        if (res.ok) setHybrids(await res.json());
      } catch {}
    })();
  }, [tab]);

  /* ── Predict F1 ── */
  const predictCross = useCallback(async () => {
    if (!padre || !madre) return;
    setPredicting(true);
    setPredResult(null); setGenAnalysis(null); setBlupResult(null); setGenImage(null);
    try {
      const [predRes, genRes] = await Promise.all([
        fetch(`${CAPONES_API}/api/predict-f1`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ padre, madre, cross_type: crossType }),
        }),
        fetch(`${CAPONES_API}/api/genetic-analysis`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ padre, madre }),
        }),
      ]);
      if (predRes.ok) setPredResult(await predRes.json());
      if (genRes.ok) setGenAnalysis(await genRes.json());
    } catch (e) {
      console.error('Predict error:', e);
      // Offline fallback
      const p = breeds.find(b => b.name === padre);
      const m = breeds.find(b => b.name === madre);
      if (p && m) {
        setPredResult({
          cross_type: crossType,
          padre, madre,
          f1_prediction: {
            weight_m: +((p.weight_m + m.weight_m) / 2 * 1.05).toFixed(1),
            weight_f: +((p.weight_f + m.weight_f) / 2 * 1.05).toFixed(1),
            eggs_per_year: Math.round((p.eggs_per_year + m.eggs_per_year) / 2),
            carcass_pct: +((p.carcass_pct + m.carcass_pct) / 2).toFixed(1),
            growth: 'medio-rápido',
            heterosis: 12,
            capon_score: 7.5,
          },
          recommendation: 'Predicción offline — conecta con capones-backend para análisis completo.',
        });
      }
    }
    setPredicting(false);
  }, [padre, madre, crossType, breeds]);

  /* ── BLUP analysis ── */
  const runBLUP = useCallback(async () => {
    if (!padre || !madre) return;
    setAnalyzingBLUP(true);
    try {
      const res = await fetch(`${CAPONES_API}/api/evaluate-breeding-values`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ padre, madre }),
      });
      if (res.ok) setBlupResult(await res.json());
    } catch {}
    setAnalyzingBLUP(false);
  }, [padre, madre]);

  /* ── Generate image ── */
  const generateImage = useCallback(async () => {
    if (!padre || !madre) return;
    setGeneratingImg(true); setGenImage(null);
    try {
      const res = await fetch(`${CAPONES_API}/api/generate-genetic-image`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ padre, madre, sex: imgSex, style: imgStyle }),
      });
      if (res.ok) {
        const data = await res.json();
        setGenImage(data.image_url || data.url || data.image || null);
      }
    } catch (e) {
      console.error('Image gen error:', e);
    }
    setGeneratingImg(false);
  }, [padre, madre, imgSex, imgStyle]);

  const CROSS_TYPES: { value: CrossType; label: string; desc: string }[] = [
    { value: 'F0xF0', label: 'F0 × F0', desc: 'Razas puras' },
    { value: 'F1xF0', label: 'F1 × F0', desc: 'Retrocruce (BC1)' },
    { value: 'F1xF1', label: 'F1 × F1', desc: 'Segunda generación' },
    { value: 'F2xF1', label: 'F2 × F1', desc: 'Cruce mixto' },
    { value: 'F2xF0', label: 'F2 × F0', desc: 'Retrocruce F2' },
    { value: 'F2xF2', label: 'F2 × F2', desc: 'Tercera generación' },
  ];

  if (loading) return (
    <div className="nf-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary-500)' }} />
      <span style={{ marginLeft: 8, color: 'var(--neutral-600)' }}>Cargando catálogo de razas...</span>
    </div>
  );

  return (
    <div className="nf-content" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FlaskConical size={22} style={{ color: 'var(--primary-500)' }} />
          Simulador Genético
        </h1>
        <p style={{ fontSize: 13, color: 'var(--neutral-500)', margin: '4px 0 0' }}>
          Catálogo de {breeds.length} razas — cruza, analiza y genera imágenes con IA
        </p>
        {error && <div style={{ fontSize: 11, color: 'var(--warn)', marginTop: 4 }}>{error}</div>}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid var(--neutral-100)', paddingBottom: 0 }}>
        {([
          { key: 'gallery' as Tab, label: 'Catálogo de Razas', icon: BookOpen },
          { key: 'cross' as Tab, label: 'Simulador de Cruces', icon: Dna },
          { key: 'library' as Tab, label: 'Biblioteca Híbridos', icon: Star },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 16px', fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
            color: tab === t.key ? 'var(--primary-600)' : 'var(--neutral-500)',
            background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid var(--primary-500)' : '2px solid transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: -2,
          }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════ GALLERY TAB ═══════════ */}
      {tab === 'gallery' && (
        <div>
          {/* Search & Filter bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
              <input
                className="nf-input" placeholder="Buscar raza..."
                value={gallerySearch} onChange={e => setGallerySearch(e.target.value)}
                style={{ width: '100%', paddingLeft: 30 }}
              />
            </div>
            {[
              { k: 'all', l: 'Todas' },
              { k: 'pesada', l: '🐔 Pesadas (>3.5kg)' },
              { k: 'ligera', l: '🐤 Ligeras (<3kg)' },
              { k: 'española', l: '🇪🇸 Españolas' },
              { k: 'francesa', l: '🇫🇷 Francesas' },
            ].map(f => (
              <button key={f.k} onClick={() => setGalleryFilter(f.k as any)} style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: galleryFilter === f.k ? 700 : 500,
                background: galleryFilter === f.k ? 'var(--primary-500)' : 'var(--neutral-50)',
                color: galleryFilter === f.k ? 'white' : 'var(--neutral-600)',
                border: galleryFilter === f.k ? '1px solid var(--primary-600)' : '1px solid var(--neutral-200)',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                {f.l}
              </button>
            ))}
            <span style={{ fontSize: 11, color: 'var(--neutral-400)', marginLeft: 'auto' }}>
              {(() => {
                const spanishOrigins = ['España','Cataluña','Galicia','Asturias','País Vasco','Aragón'];
                const frenchOrigins = ['Francia'];
                const filtered = breeds.filter(b => {
                  const q = gallerySearch.toLowerCase();
                  if (q && !b.name.toLowerCase().includes(q) && !(b.origin || '').toLowerCase().includes(q)) return false;
                  if (galleryFilter === 'pesada' && b.weight_m < 3.5) return false;
                  if (galleryFilter === 'ligera' && b.weight_m >= 3.0) return false;
                  if (galleryFilter === 'española' && !spanishOrigins.includes(b.origin || '')) return false;
                  if (galleryFilter === 'francesa' && !frenchOrigins.includes(b.origin || '')) return false;
                  return true;
                });
                return `${filtered.length} razas`;
              })()}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {breeds.filter(b => {
              const spanishOrigins = ['España','Cataluña','Galicia','Asturias','País Vasco','Aragón'];
              const frenchOrigins = ['Francia'];
              const q = gallerySearch.toLowerCase();
              if (q && !b.name.toLowerCase().includes(q) && !(b.origin || '').toLowerCase().includes(q)) return false;
              if (galleryFilter === 'pesada' && b.weight_m < 3.5) return false;
              if (galleryFilter === 'ligera' && b.weight_m >= 3.0) return false;
              if (galleryFilter === 'española' && !spanishOrigins.includes(b.origin || '')) return false;
              if (galleryFilter === 'francesa' && !frenchOrigins.includes(b.origin || '')) return false;
              return true;
            }).map(breed => {
              // Mini radar chart data (normalize 0-1)
              const radarData = [
                { label: 'Peso', value: Math.min(1, breed.weight_m / 5.5) },
                { label: 'Huevos', value: Math.min(1, breed.eggs_per_year / 280) },
                { label: 'Canal', value: Math.min(1, breed.carcass_pct / 80) },
                { label: 'Crec.', value: breed.growth === 'rápido' ? 0.9 : breed.growth === 'medio' ? 0.6 : 0.3 },
              ];
              const cx = 40, cy = 36, r = 28;
              const radarPoints = radarData.map((d, i) => {
                const angle = (Math.PI * 2 * i) / radarData.length - Math.PI / 2;
                return `${cx + r * d.value * Math.cos(angle)},${cy + r * d.value * Math.sin(angle)}`;
              }).join(' ');
              const radarAxes = radarData.map((_, i) => {
                const angle = (Math.PI * 2 * i) / radarData.length - Math.PI / 2;
                return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
              });

              return (
                <div key={breed.name} onClick={() => setSelectedBreed(breed)} style={{
                  background: 'white', borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                  border: '1px solid var(--neutral-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  transition: 'transform .15s, box-shadow .15s',
                  display: 'flex', flexDirection: 'row',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; }}
                >
                  {/* Left: Photo */}
                  <div style={{ width: 100, minHeight: 120, flexShrink: 0, background: 'var(--neutral-50)', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={`${CAPONES_API}/images/males/${breed.name.toLowerCase().replace(/ /g, '_')}.jpg`}
                      alt={breed.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.setAttribute('style', 'display:flex');
                      }}
                    />
                    <div style={{ display: 'none', position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', background: 'var(--neutral-50)' }}>
                      <span style={{ fontSize: 36 }}>🐓</span>
                    </div>
                  </div>

                  {/* Right: Info + mini radar */}
                  <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>{breed.name}</div>
                      {breed.origin && <div style={{ fontSize: 10, color: 'var(--neutral-400)', marginTop: 1 }}>📍 {breed.origin}</div>}
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, fontSize: 10, color: 'var(--neutral-500)', flexWrap: 'wrap' }}>
                        <span>♂{breed.weight_m}kg</span>
                        <span>♀{breed.weight_f}kg</span>
                        <span>🥚{breed.eggs_per_year}</span>
                        <span>{breed.carcass_pct}%</span>
                      </div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: breed.growth === 'rápido' ? '#ECFDF5' : breed.growth === 'lento' ? '#FEF3C7' : '#EFF6FF', color: breed.growth === 'rápido' ? '#059669' : breed.growth === 'lento' ? '#92400E' : '#2563EB', fontWeight: 600 }}>
                          {breed.growth}
                        </span>
                        <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'var(--neutral-50)', color: 'var(--neutral-500)' }}>
                          {breed.comb}
                        </span>
                      </div>
                    </div>
                    {/* Mini SVG radar chart */}
                    <svg width={80} height={72} viewBox="0 0 80 72" style={{ marginTop: 4, alignSelf: 'flex-end' }}>
                      {/* Grid */}
                      {[0.33, 0.66, 1].map(s => (
                        <polygon key={s} points={radarData.map((_, i) => {
                          const angle = (Math.PI * 2 * i) / radarData.length - Math.PI / 2;
                          return `${cx + r * s * Math.cos(angle)},${cy + r * s * Math.sin(angle)}`;
                        }).join(' ')} fill="none" stroke="var(--neutral-200)" strokeWidth={0.5} />
                      ))}
                      {radarAxes.map((a, i) => (
                        <line key={i} x1={cx} y1={cy} x2={a.x} y2={a.y} stroke="var(--neutral-200)" strokeWidth={0.5} />
                      ))}
                      {/* Data fill */}
                      <polygon points={radarPoints} fill="rgba(176,125,43,0.2)" stroke="var(--primary-500)" strokeWidth={1.2} />
                      {/* Labels */}
                      {radarData.map((d, i) => {
                        const angle = (Math.PI * 2 * i) / radarData.length - Math.PI / 2;
                        const lx = cx + (r + 10) * Math.cos(angle);
                        const ly = cy + (r + 10) * Math.sin(angle);
                        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="var(--neutral-400)">{d.label}</text>;
                      })}
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Breed detail modal */}
          {selectedBreed && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} onClick={() => setSelectedBreed(null)}>
              <div onClick={e => e.stopPropagation()} style={{
                background: 'white', borderRadius: 16, width: 520, maxHeight: '85vh', overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              }}>
                {/* Photo toggle */}
                <div style={{ position: 'relative', height: 240, background: 'var(--neutral-50)' }}>
                  <img
                    src={`${CAPONES_API}/images/${breedImgSex === 'male' ? 'males' : 'females'}/${selectedBreed.name.toLowerCase().replace(/ /g, '_')}.jpg`}
                    alt={selectedBreed.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px 16px 0 0' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4 }}>
                    {(['male', 'female'] as const).map(s => (
                      <button key={s} onClick={() => setBreedImgSex(s)} style={{
                        padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: breedImgSex === s ? 'var(--primary-500)' : 'rgba(255,255,255,0.9)',
                        color: breedImgSex === s ? 'white' : 'var(--neutral-700)',
                        border: 'none', cursor: 'pointer',
                      }}>
                        {s === 'male' ? '♂ Macho' : '♀ Hembra'}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setSelectedBreed(null)} style={{
                    position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.9)',
                    border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer',
                  }}>
                    <X size={16} />
                  </button>
                </div>

                <div style={{ padding: 20 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 4 }}>{selectedBreed.name}</h2>
                  {selectedBreed.origin && <div style={{ fontSize: 12, color: 'var(--neutral-500)', marginBottom: 12 }}>Origen: {selectedBreed.origin}</div>}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                    {[
                      { l: 'Peso ♂', v: `${selectedBreed.weight_m} kg` },
                      { l: 'Peso ♀', v: `${selectedBreed.weight_f} kg` },
                      { l: 'Huevos/año', v: selectedBreed.eggs_per_year },
                      { l: '% Canal', v: `${selectedBreed.carcass_pct}%` },
                      { l: 'Crecimiento', v: selectedBreed.growth },
                      { l: 'Cresta', v: selectedBreed.comb },
                    ].map(r => (
                      <div key={r.l} style={{ background: 'var(--neutral-25)', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 10, color: 'var(--neutral-400)' }}>{r.l}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>{r.v}</div>
                      </div>
                    ))}
                  </div>

                  {selectedBreed.genetic_profile && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-600)', marginBottom: 8 }}>Perfil Genético</div>
                      <div style={{ background: 'var(--neutral-25)', borderRadius: 10, padding: 12, fontSize: 12 }}>
                        <div><strong>Fenotipo:</strong> {selectedBreed.genetic_profile.phenotype}</div>
                        <div><strong>Color ojos:</strong> {selectedBreed.genetic_profile.eye_color}</div>
                        <div><strong>Cresta:</strong> {selectedBreed.genetic_profile.comb_type}</div>
                        {selectedBreed.genetic_profile.plumage_loci && (
                          <div style={{ marginTop: 8 }}>
                            <strong>Loci de plumaje:</strong>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                              {Object.entries(selectedBreed.genetic_profile.plumage_loci).map(([k, v]) => (
                                <span key={k} style={{ padding: '2px 6px', borderRadius: 4, background: 'white', border: '1px solid var(--neutral-200)', fontSize: 11 }}>
                                  {k}: {v as string}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedBreed.genetic_profile.special_traits && selectedBreed.genetic_profile.special_traits.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <strong>Rasgos especiales:</strong> {selectedBreed.genetic_profile.special_traits.join(', ')}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <button onClick={() => {
                    setPadre(selectedBreed.name);
                    setSelectedBreed(null);
                    setTab('cross');
                  }} className="nf-btn primary" style={{ width: '100%', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Dna size={14} /> Usar como padre en cruce
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ CROSS TAB ═══════════ */}
      {tab === 'cross' && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
          {/* Left panel — config */}
          <div style={{
            background: 'white', borderRadius: 14, padding: 18,
            border: '1px solid var(--neutral-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            alignSelf: 'start',
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 14 }}>
              Configurar Cruce
            </h3>

            {/* Cross type */}
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 6 }}>
              Tipo de cruce
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 14 }}>
              {CROSS_TYPES.map(ct => (
                <button key={ct.value} onClick={() => setCrossType(ct.value)} style={{
                  padding: '6px 8px', borderRadius: 6, fontSize: 11, fontWeight: crossType === ct.value ? 700 : 500,
                  background: crossType === ct.value ? 'var(--primary-500)' : 'var(--neutral-50)',
                  color: crossType === ct.value ? 'white' : 'var(--neutral-600)',
                  border: crossType === ct.value ? '1px solid var(--primary-600)' : '1px solid var(--neutral-200)',
                  cursor: 'pointer', textAlign: 'left',
                }}>
                  <div>{ct.label}</div>
                  <div style={{ fontSize: 9, opacity: 0.8 }}>{ct.desc}</div>
                </button>
              ))}
            </div>

            {/* Padre */}
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>
              ♂ Padre
            </label>
            <select
              className="nf-input" value={padre} onChange={e => setPadre(e.target.value)}
              style={{ width: '100%', marginBottom: 12, padding: '8px 10px', fontSize: 13 }}
            >
              <option value="">Seleccionar raza...</option>
              {breeds.map(b => <option key={b.name} value={b.name}>{b.name} ({b.weight_m}kg)</option>)}
            </select>

            {/* Madre */}
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>
              ♀ Madre
            </label>
            <select
              className="nf-input" value={madre} onChange={e => setMadre(e.target.value)}
              style={{ width: '100%', marginBottom: 14, padding: '8px 10px', fontSize: 13 }}
            >
              <option value="">Seleccionar raza...</option>
              {breeds.map(b => <option key={b.name} value={b.name}>{b.name} ({b.weight_f}kg)</option>)}
            </select>

            {/* Simulate button */}
            <button
              onClick={predictCross} disabled={!padre || !madre || predicting}
              className="nf-btn primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: (!padre || !madre) ? 0.5 : 1 }}
            >
              {predicting ? <Loader2 size={14} className="animate-spin" /> : <Dna size={14} />}
              Simular Cruce
            </button>

            {/* Image generation section */}
            {predResult && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--neutral-100)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-700)', marginBottom: 10 }}>Generar imagen IA</div>

                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                  {(['male', 'female'] as const).map(s => (
                    <button key={s} onClick={() => setImgSex(s)} style={{
                      flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: imgSex === s ? 'var(--primary-500)' : 'var(--neutral-50)',
                      color: imgSex === s ? 'white' : 'var(--neutral-600)',
                      border: imgSex === s ? '1px solid var(--primary-600)' : '1px solid var(--neutral-200)',
                      cursor: 'pointer',
                    }}>
                      {s === 'male' ? '♂ Macho' : '♀ Hembra'}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {(['fotorrealista', 'artístico', 'profesional'] as const).map(s => (
                    <button key={s} onClick={() => setImgStyle(s)} style={{
                      flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 10, fontWeight: 600,
                      background: imgStyle === s ? 'var(--primary-500)' : 'var(--neutral-50)',
                      color: imgStyle === s ? 'white' : 'var(--neutral-600)',
                      border: imgStyle === s ? '1px solid var(--primary-600)' : '1px solid var(--neutral-200)',
                      cursor: 'pointer', textTransform: 'capitalize',
                    }}>
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  onClick={generateImage} disabled={generatingImg}
                  style={{
                    width: '100%', padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 700,
                    background: '#8B5CF6', color: 'white', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    opacity: generatingImg ? 0.6 : 1,
                  }}
                >
                  {generatingImg ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  {generatingImg ? 'Generando...' : 'Generar Imagen'}
                </button>
              </div>
            )}
          </div>

          {/* Right panel — results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!predResult && !predicting && (
              <div style={{
                background: 'white', borderRadius: 14, padding: 40, textAlign: 'center',
                border: '1px solid var(--neutral-100)',
              }}>
                <FlaskConical size={36} style={{ color: 'var(--neutral-300)', marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--neutral-500)' }}>Selecciona padre y madre</div>
                <div style={{ fontSize: 12, color: 'var(--neutral-400)', marginTop: 4 }}>
                  Elige un tipo de cruce y las razas parentales para ver la predicción F1
                </div>
              </div>
            )}

            {predicting && (
              <div style={{ background: 'white', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid var(--neutral-100)' }}>
                <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary-500)', marginBottom: 12 }} />
                <div style={{ fontSize: 13, color: 'var(--neutral-600)' }}>Analizando cruce {padre} × {madre}...</div>
              </div>
            )}

            {predResult && (
              <>
                {/* F1 Prediction card */}
                <div style={{
                  background: 'white', borderRadius: 14, overflow: 'hidden',
                  border: '1px solid var(--neutral-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '2px solid var(--primary-500)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Dna size={16} style={{ color: 'var(--primary-500)' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>
                      Predicción {predResult.cross_type}: {predResult.padre} × {predResult.madre}
                    </span>
                    {predResult.f1_prediction.heterosis > 0 && (
                      <span style={{
                        marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '2px 8px',
                        borderRadius: 10, background: '#ECFDF5', color: '#10B981',
                      }}>
                        +{predResult.f1_prediction.heterosis}% heterosis
                      </span>
                    )}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      {[
                        { l: 'Peso ♂', v: `${predResult.f1_prediction.weight_m} kg`, c: '#3B82F6' },
                        { l: 'Peso ♀', v: `${predResult.f1_prediction.weight_f} kg`, c: '#EC4899' },
                        { l: 'Huevos/año', v: predResult.f1_prediction.eggs_per_year, c: '#F59E0B' },
                        { l: '% Canal', v: `${predResult.f1_prediction.carcass_pct}%`, c: '#10B981' },
                        { l: 'Crecimiento', v: predResult.f1_prediction.growth, c: '#8B5CF6' },
                        { l: 'Score Capón', v: predResult.f1_prediction.capon_score?.toFixed(1) || '—', c: '#B07D2B' },
                      ].map(r => (
                        <div key={r.l} style={{ background: 'var(--neutral-25)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                          <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>{r.l}</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: r.c, fontFamily: 'var(--font-mono)' }}>{r.v}</div>
                        </div>
                      ))}
                    </div>
                    {predResult.recommendation && (
                      <div style={{
                        marginTop: 12, padding: 10, borderRadius: 8,
                        background: 'rgba(176,125,43,0.06)', border: '1px solid rgba(176,125,43,0.15)',
                        fontSize: 12, color: 'var(--neutral-700)', lineHeight: 1.5,
                      }}>
                        <strong>💡</strong> {predResult.recommendation}
                      </div>
                    )}
                  </div>
                </div>

                {/* Genetic Analysis card */}
                {genAnalysis && (
                  <div style={{
                    background: 'white', borderRadius: 14, overflow: 'hidden',
                    border: '1px solid var(--neutral-100)',
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--neutral-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Microscope size={16} style={{ color: '#8B5CF6' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>Análisis Genético Mendeliano</span>
                    </div>
                    <div style={{ padding: 16, fontSize: 12, lineHeight: 1.6, color: 'var(--neutral-700)' }}>
                      {genAnalysis.color_genetics && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--neutral-800)' }}>Genética del color</div>
                          <pre style={{
                            background: 'var(--neutral-25)', borderRadius: 8, padding: 10,
                            fontSize: 11, overflow: 'auto', whiteSpace: 'pre-wrap',
                          }}>
                            {typeof genAnalysis.color_genetics === 'string' ? genAnalysis.color_genetics : JSON.stringify(genAnalysis.color_genetics, null, 2)}
                          </pre>
                        </div>
                      )}
                      {genAnalysis.f1_prediction && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--neutral-800)' }}>Predicción F1</div>
                          <pre style={{ background: 'var(--neutral-25)', borderRadius: 8, padding: 10, fontSize: 11, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                            {typeof genAnalysis.f1_prediction === 'string' ? genAnalysis.f1_prediction : JSON.stringify(genAnalysis.f1_prediction, null, 2)}
                          </pre>
                        </div>
                      )}
                      {genAnalysis.special_traits && (
                        <div>
                          <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--neutral-800)' }}>Rasgos especiales</div>
                          <pre style={{ background: 'var(--neutral-25)', borderRadius: 8, padding: 10, fontSize: 11, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                            {typeof genAnalysis.special_traits === 'string' ? genAnalysis.special_traits : JSON.stringify(genAnalysis.special_traits, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* BLUP button + results */}
                <div style={{
                  background: 'white', borderRadius: 14, padding: 16,
                  border: '1px solid var(--neutral-100)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <BarChart3 size={16} style={{ color: '#10B981' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>Análisis BLUP / EBV</span>
                  </div>

                  {!blupResult && (
                    <button onClick={runBLUP} disabled={analyzingBLUP} className="nf-btn" style={{
                      display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
                      opacity: analyzingBLUP ? 0.6 : 1,
                    }}>
                      {analyzingBLUP ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />}
                      {analyzingBLUP ? 'Calculando...' : 'Ejecutar Análisis Profesional'}
                    </button>
                  )}

                  {blupResult && (
                    <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--neutral-700)' }}>
                      {blupResult.selection_index !== undefined && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 8, background: '#ECFDF5', marginBottom: 10,
                        }}>
                          <Star size={14} style={{ color: '#10B981' }} />
                          <span style={{ fontWeight: 700, color: '#10B981' }}>
                            Índice de selección: {blupResult.selection_index}
                          </span>
                          {blupResult.accuracy && (
                            <span style={{ fontSize: 10, color: 'var(--neutral-500)' }}>
                              (precisión: {(blupResult.accuracy * 100).toFixed(0)}%)
                            </span>
                          )}
                        </div>
                      )}
                      <pre style={{ background: 'var(--neutral-25)', borderRadius: 8, padding: 10, fontSize: 11, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(blupResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Generated image */}
                {(genImage || generatingImg) && (
                  <div style={{
                    background: 'white', borderRadius: 14, overflow: 'hidden',
                    border: '1px solid var(--neutral-100)',
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--neutral-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Camera size={16} style={{ color: '#8B5CF6' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>Imagen IA del Híbrido</span>
                    </div>
                    <div style={{ padding: 16, textAlign: 'center' }}>
                      {generatingImg ? (
                        <div style={{ padding: 40 }}>
                          <Loader2 size={32} className="animate-spin" style={{ color: '#8B5CF6', marginBottom: 12 }} />
                          <div style={{ fontSize: 13, color: 'var(--neutral-500)' }}>Generando imagen con Flux schnell...</div>
                          <div style={{ fontSize: 11, color: 'var(--neutral-400)', marginTop: 4 }}>Esto puede tardar 10-30 segundos</div>
                        </div>
                      ) : genImage ? (
                        <img src={genImage} alt={`${padre} × ${madre} F1`} style={{
                          maxWidth: '100%', borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }} />
                      ) : null}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ LIBRARY TAB ═══════════ */}
      {tab === 'library' && (
        <div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {(['F1', 'F2', 'F3'] as const).map(t => (
              <button key={t} onClick={() => setHybridTab(t)} style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: hybridTab === t ? 700 : 500,
                background: hybridTab === t ? 'var(--primary-500)' : 'var(--neutral-50)',
                color: hybridTab === t ? 'white' : 'var(--neutral-600)',
                border: hybridTab === t ? '1px solid var(--primary-600)' : '1px solid var(--neutral-200)',
                cursor: 'pointer',
              }}>
                {t}
              </button>
            ))}
          </div>

          {hybrids.length === 0 ? (
            <div style={{
              background: 'white', borderRadius: 14, padding: 40, textAlign: 'center',
              border: '1px solid var(--neutral-100)',
            }}>
              <Star size={32} style={{ color: 'var(--neutral-300)', marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--neutral-500)' }}>Sin híbridos guardados</div>
              <div style={{ fontSize: 12, color: 'var(--neutral-400)', marginTop: 4 }}>
                Simula cruces y guarda los mejores resultados aquí
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {hybrids.filter((h: any) => h.generation === hybridTab || !h.generation).map((h: any, i: number) => (
                <div key={i} style={{
                  background: 'white', borderRadius: 12, padding: 14,
                  border: '1px solid var(--neutral-100)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}>
                  {h.image_url && (
                    <img src={h.image_url} alt={h.name || 'Hybrid'} style={{
                      width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 10,
                    }} />
                  )}
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>{h.name || `${h.padre} × ${h.madre}`}</div>
                  <div style={{ fontSize: 11, color: 'var(--neutral-500)', marginTop: 4 }}>{h.cross_type || 'F0×F0'}</div>
                  {h.capon_score && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#B07D2B', marginTop: 6 }}>
                      Score capón: {h.capon_score}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
