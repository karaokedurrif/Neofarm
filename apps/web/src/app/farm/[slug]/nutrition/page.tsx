'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import {
  FlaskConical, TrendingUp, TrendingDown, Leaf, ShoppingCart,
  Sun, Snowflake, TreePine, Flower2, Zap, AlertTriangle, BarChart3,
  MapPin, Satellite, RotateCcw, Plus, Trash2, Mountain, Thermometer
} from 'lucide-react';

type Tab = 'formulador' | 'mercado' | 'pastos' | 'finition' | 'alternativas' | 'parcela';

interface Fase { nombre: string; proteina: string; energiaKcal: number; calcio: string; fosforo: string; lisina: string; metionina: string; }
interface Ingrediente { nombre: string; proteina: number; energia: number; calcio: number; fosforo: number; precio: number; eco: boolean; selected?: boolean; porcentaje?: number; }
interface Parcela { id: number; nombre: string; hectareas: number; estado: 'en_uso' | 'descanso' | 'preparacion'; diasEnEstado: number; ndviEstimado: number; }
interface SentinelData { configured: boolean; ndvi_mean: number | null; ndvi_min: number | null; ndvi_max: number | null; ndvi_stdev: number | null; ndvi_date: string | null; ndvi_image: string | null; truecolor_image?: string | null; source?: string; message?: string; error?: string; }

const FASES: Fase[] = [
  { nombre: 'Pollito (0-4 sem)', proteina: '20-22%', energiaKcal: 2900, calcio: '1.0%', fosforo: '0.45%', lisina: '1.10%', metionina: '0.50%' },
  { nombre: 'Crecimiento (4-10 sem)', proteina: '18-20%', energiaKcal: 2850, calcio: '0.9%', fosforo: '0.40%', lisina: '0.95%', metionina: '0.42%' },
  { nombre: 'Capón engorde (10-24 sem)', proteina: '14-16%', energiaKcal: 2800, calcio: '0.8%', fosforo: '0.35%', lisina: '0.75%', metionina: '0.35%' },
  { nombre: 'Ponedora', proteina: '16-18%', energiaKcal: 2750, calcio: '3.5-4.0%', fosforo: '0.45%', lisina: '0.80%', metionina: '0.38%' },
  { nombre: 'Reproductor/a', proteina: '15-17%', energiaKcal: 2750, calcio: '3.0%', fosforo: '0.40%', lisina: '0.75%', metionina: '0.36%' },
  { nombre: 'Picantón (sacrificio)', proteina: '20-22%', energiaKcal: 3000, calcio: '1.0%', fosforo: '0.45%', lisina: '1.15%', metionina: '0.52%' },
  { nombre: 'Pularda', proteina: '16-18%', energiaKcal: 2850, calcio: '0.9%', fosforo: '0.38%', lisina: '0.85%', metionina: '0.40%' },
  { nombre: 'Gallina vieja (descarte)', proteina: '14-16%', energiaKcal: 2700, calcio: '3.0%', fosforo: '0.35%', lisina: '0.70%', metionina: '0.33%' },
];

const INGREDIENTES_BASE: Ingrediente[] = [
  { nombre: 'Maíz ecológico', proteina: 8.5, energia: 3350, calcio: 0.02, fosforo: 0.28, precio: 0.38, eco: true },
  { nombre: 'Trigo ecológico', proteina: 11.5, energia: 3120, calcio: 0.05, fosforo: 0.32, precio: 0.34, eco: true },
  { nombre: 'Cebada ecológica', proteina: 11.0, energia: 2700, calcio: 0.05, fosforo: 0.35, precio: 0.30, eco: true },
  { nombre: 'Soja extrusionada eco', proteina: 36.0, energia: 3350, calcio: 0.29, fosforo: 0.65, precio: 0.72, eco: true },
  { nombre: 'Guisante ecológico', proteina: 21.5, energia: 2600, calcio: 0.08, fosforo: 0.40, precio: 0.45, eco: true },
  { nombre: 'Girasol (harina) eco', proteina: 28.0, energia: 2100, calcio: 0.30, fosforo: 0.90, precio: 0.40, eco: true },
  { nombre: 'Sorgo ecológico', proteina: 10.0, energia: 3300, calcio: 0.03, fosforo: 0.30, precio: 0.35, eco: true },
  { nombre: 'Conchilla de ostra', proteina: 0, energia: 0, calcio: 38.0, fosforo: 0.08, precio: 0.15, eco: true },
  { nombre: 'Fosfato bicálcico', proteina: 0, energia: 0, calcio: 24.0, fosforo: 18.5, precio: 0.55, eco: true },
  { nombre: 'Premix vitamínico-min.', proteina: 0, energia: 0, calcio: 0, fosforo: 0, precio: 2.80, eco: true },
];

const MERCADO_CEREALES = [
  { cereal: 'Maíz', lonja: 'Mercolleida', precio: 0.232, tendencia: '↓', variacion: -2.1 },
  { cereal: 'Trigo', lonja: 'Ebro', precio: 0.218, tendencia: '=', variacion: 0.3 },
  { cereal: 'Cebada', lonja: 'Mercolleida', precio: 0.195, tendencia: '↑', variacion: 1.8 },
  { cereal: 'Soja (harina)', lonja: 'CBoT', precio: 0.385, tendencia: '↓', variacion: -3.2 },
  { cereal: 'Girasol (harina)', lonja: 'Mercolleida', precio: 0.280, tendencia: '=', variacion: 0.5 },
  { cereal: 'Guisante', lonja: 'Ebro', precio: 0.310, tendencia: '↑', variacion: 2.0 },
];

const ESTACIONES = [
  { nombre: 'Primavera', icon: '🌸', meses: 'Mar-May', pasto: 'Abundante', bicheo: 'Alto', reduccionPienso: '25-30%', color: '#10B981', ndviRef: 0.75 },
  { nombre: 'Verano', icon: '☀️', meses: 'Jun-Ago', pasto: 'Seco', bicheo: 'Medio', reduccionPienso: '+10-15%', color: '#F59E0B', ndviRef: 0.35 },
  { nombre: 'Otoño', icon: '🍂', meses: 'Sep-Nov', pasto: 'Recuperación', bicheo: 'Medio-alto', reduccionPienso: '15-20%', color: '#EA580C', ndviRef: 0.55 },
  { nombre: 'Invierno', icon: '❄️', meses: 'Dic-Feb', pasto: 'Mínimo', bicheo: 'Bajo', reduccionPienso: '0%', color: '#3B82F6', ndviRef: 0.30 },
];

function getSeason(): string {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'Primavera';
  if (m >= 5 && m <= 7) return 'Verano';
  if (m >= 8 && m <= 10) return 'Otoño';
  return 'Invierno';
}

function ndviColor(ndvi: number): string {
  if (ndvi >= 0.7) return '#15803D';
  if (ndvi >= 0.5) return '#16A34A';
  if (ndvi >= 0.3) return '#CA8A04';
  if (ndvi >= 0.15) return '#EA580C';
  return '#DC2626';
}

function ndviLabel(ndvi: number): string {
  if (ndvi >= 0.7) return 'Excelente';
  if (ndvi >= 0.5) return 'Bueno';
  if (ndvi >= 0.3) return 'Moderado';
  if (ndvi >= 0.15) return 'Pobre';
  return 'Muy pobre';
}

function buildNdviWmsUrl(lat: number, lon: number): string {
  const d = 0.015; // ~1.5km box
  const bbox = `${lon - d},${lat - d},${lon + d},${lat + d}`;
  return `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=MODIS_Terra_NDVI_8Day&FORMAT=image/png&TRANSPARENT=true&WIDTH=512&HEIGHT=512&SRS=EPSG:4326&BBOX=${bbox}&STYLES=`;
}

// Pasture productivity model based on real NDVI + altitude + season
function estimatePasture(ndvi: number, altitud: number | null, ha: number, season: string) {
  // Base productivity per hectare (kg MS/ha) based on NDVI
  let baseKgHa: number;
  if (ndvi >= 0.7) baseKgHa = 3000;
  else if (ndvi >= 0.5) baseKgHa = 2000;
  else if (ndvi >= 0.3) baseKgHa = 1000;
  else if (ndvi >= 0.15) baseKgHa = 400;
  else baseKgHa = 100;

  // Altitude correction: higher = less productive
  let altFactor = 1.0;
  if (altitud !== null) {
    if (altitud > 1200) altFactor = 0.6;
    else if (altitud > 800) altFactor = 0.75;
    else if (altitud > 400) altFactor = 0.9;
  }

  const totalKg = Math.round(baseKgHa * altFactor * ha);
  // Bird capacity: 15 kg MS / bird-month typical consumption offset
  const avesCapacidad = Math.max(1, Math.floor(totalKg / 15));
  // Feed reduction based on real NDVI
  let reduccionPienso: string;
  if (ndvi >= 0.7) reduccionPienso = '25-30%';
  else if (ndvi >= 0.5) reduccionPienso = '15-20%';
  else if (ndvi >= 0.3) reduccionPienso = '5-10%';
  else reduccionPienso = '0%';

  return { baseKgHa: Math.round(baseKgHa * altFactor), totalKg, avesCapacidad, reduccionPienso };
}

export default function TenantNutritionPage() {
  const { slug } = useTenant();
  const [activeTab, setActiveTab] = useState<Tab>('parcela');
  const [selectedFase, setSelectedFase] = useState(0);
  const [ingredients, setIngredients] = useState<Ingrediente[]>(
    INGREDIENTES_BASE.map((ing, i) => ({
      ...ing, selected: i < 6,
      porcentaje: i === 0 ? 40 : i === 1 ? 15 : i === 2 ? 10 : i === 3 ? 20 : i === 4 ? 8 : i === 5 ? 5 : 0,
    }))
  );
  // Catastro — default references per farm
  const FARM_CATASTRO: Record<string, string> = {
    palacio: '4206113VL1340N0001MT',
  };
  const [catRef, setCatRef] = useState(FARM_CATASTRO[slug] || '');
  const [catManualLat, setCatManualLat] = useState('');
  const [catManualLon, setCatManualLon] = useState('');
  const [catData, setCatData] = useState<any>(null);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState('');
  // Sentinel-2 NDVI
  const [sentinel, setSentinel] = useState<SentinelData | null>(null);
  const [sentinelLoading, setSentinelLoading] = useState(false);
  const [satView, setSatView] = useState<'truecolor' | 'ndvi'>('truecolor');
  // Parcelas rotation
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [numParcelas, setNumParcelas] = useState(4);
  const [diasRotacion, setDiasRotacion] = useState(14);
  // NDVI imagery (MODIS fallback)
  const [ndviUrl, setNdviUrl] = useState('');

  const season = getSeason();
  const seasonData = ESTACIONES.find(e => e.nombre === season) || ESTACIONES[0];

  // Get the best available NDVI value (Sentinel-2 real or seasonal estimate)
  const realNdvi = sentinel?.ndvi_mean ?? null;
  const effectiveNdvi = realNdvi ?? seasonData.ndviRef;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'parcela', label: 'Mi Parcela + NDVI', icon: '🗺️' },
    { id: 'formulador', label: 'Formulador', icon: '🧪' },
    { id: 'mercado', label: 'Mercado', icon: '📊' },
    { id: 'pastos', label: 'Pastos', icon: '🌿' },
    { id: 'finition', label: 'Finition', icon: '🍗' },
    { id: 'alternativas', label: 'Alternativas', icon: '🤖' },
  ];

  // Fetch Sentinel-2 NDVI for given coordinates (with optional tight parcel bbox)
  const fetchSentinel = useCallback(async (lat: number, lon: number, parcelBbox?: number[]) => {
    setSentinelLoading(true);
    try {
      let url = `/api/sentinel?lat=${lat}&lon=${lon}`;
      if (parcelBbox && parcelBbox.length === 4) {
        url += `&bbox=${parcelBbox.join(',')}`;
      }
      const res = await fetch(url);
      const data: SentinelData = await res.json();
      setSentinel(data);
    } catch {
      setSentinel(null);
    }
    setSentinelLoading(false);
  }, []);

  const selectedIngs = ingredients.filter(i => i.selected && (i.porcentaje || 0) > 0);
  const totalPct = selectedIngs.reduce((s, i) => s + (i.porcentaje || 0), 0);
  const mixProtein = selectedIngs.reduce((s, i) => s + i.proteina * (i.porcentaje || 0) / 100, 0);
  const mixEnergia = selectedIngs.reduce((s, i) => s + i.energia * (i.porcentaje || 0) / 100, 0);
  const mixPrecio = selectedIngs.reduce((s, i) => s + i.precio * (i.porcentaje || 0) / 100, 0);
  const fase = FASES[selectedFase];

  const autoOptimize = () => {
    const targetProtein = parseFloat(fase.proteina.split('-')[0]) || 16;
    const available = ingredients.filter(i => i.selected);
    if (available.length < 2) return;
    const sorted = [...available].sort((a, b) => {
      const cpa = a.proteina > 0 ? a.precio / a.proteina : 999;
      const cpb = b.proteina > 0 ? b.precio / b.proteina : 999;
      return cpa - cpb;
    });
    const alloc: Record<string, number> = {};
    let remaining = 100, currentProtein = 0;
    for (const ing of sorted.filter(i => i.proteina > 15)) {
      if (currentProtein >= targetProtein || remaining <= 0) break;
      const needed = Math.min(Math.ceil(((targetProtein - currentProtein) / ing.proteina) * 100), remaining, 40);
      alloc[ing.nombre] = needed; currentProtein += ing.proteina * needed / 100; remaining -= needed;
    }
    for (const ing of sorted.filter(i => i.proteina <= 15 && i.energia > 2500)) {
      if (remaining <= 0) break;
      const amount = Math.min(remaining, 35); alloc[ing.nombre] = amount; remaining -= amount;
    }
    if (remaining > 0 && sorted.length > 0) alloc[sorted[sorted.length - 1].nombre] = (alloc[sorted[sorted.length - 1].nombre] || 0) + remaining;
    setIngredients(prev => prev.map(ing => ({ ...ing, porcentaje: alloc[ing.nombre] || 0, selected: ing.selected || (alloc[ing.nombre] || 0) > 0 })));
  };

  const handleCatastro = async () => {
    if (!catRef || catRef.length < 14) { setCatError('Mínimo 14 caracteres'); return; }
    setCatLoading(true); setCatError('');
    try {
      let url = `/api/catastro?rc=${encodeURIComponent(catRef)}`;
      // Append manual coordinates if provided (fallback if reference can't be resolved)
      if (catManualLat && catManualLon) {
        url += `&lat=${encodeURIComponent(catManualLat)}&lon=${encodeURIComponent(catManualLon)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al consultar catastro');
      setCatData(data);
      // Generate MODIS NDVI URL as fallback visual
      if (data.lat && data.lon) {
        setNdviUrl(buildNdviWmsUrl(data.lat, data.lon));
        // Also fetch real Sentinel-2 NDVI (with tight parcel bbox if available)
        fetchSentinel(data.lat, data.lon, data.parcelBbox || undefined);
      }
      // Auto-generate rotation parcelas
      if (data.superficie_m2 > 0) {
        const totalHa = data.superficie_m2 / 10000;
        const haPerParcela = totalHa / numParcelas;
        const estados: ('en_uso' | 'descanso' | 'preparacion')[] = ['en_uso', 'descanso', 'descanso', 'preparacion'];
        setParcelas(Array.from({ length: numParcelas }, (_, i) => ({
          id: i + 1, nombre: `Parcela ${String.fromCharCode(65 + i)}`,
          hectareas: Math.round(haPerParcela * 100) / 100,
          estado: estados[i % estados.length],
          diasEnEstado: Math.floor(Math.random() * diasRotacion),
          ndviEstimado: seasonData.ndviRef + (Math.random() - 0.5) * 0.2,
        })));
      }
    } catch (e: any) {
      setCatError(e.message || 'Error al consultar catastro');
    }
    setCatLoading(false);
  };

  const regenerateParcelas = () => {
    if (!catData || catData.superficie_m2 <= 0) return;
    const totalHa = catData.superficie_m2 / 10000;
    const haPerParcela = totalHa / numParcelas;
    const estados: ('en_uso' | 'descanso' | 'preparacion')[] = ['en_uso', 'descanso', 'descanso', 'preparacion'];
    // Use real NDVI or seasonal estimate as base
    const baseNdvi = realNdvi ?? seasonData.ndviRef;
    setParcelas(Array.from({ length: numParcelas }, (_, i) => ({
      id: i + 1, nombre: `Parcela ${String.fromCharCode(65 + i)}`,
      hectareas: Math.round(haPerParcela * 100) / 100,
      estado: estados[i % estados.length],
      diasEnEstado: 0,
      ndviEstimado: baseNdvi + (Math.random() - 0.5) * 0.15,
    })));
  };

  return (
    <div className="nf-content" style={{ maxWidth: 1200 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
        <FlaskConical size={22} style={{ display: 'inline', marginRight: 8 }} />
        Nutrición Inteligente
      </h1>
      <p style={{ color: 'var(--neutral-500)', fontSize: 13, marginBottom: 20 }}>
        Parcela catastral, NDVI satelital, rotación de pastos, formulación de pienso.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', borderBottom: '1px solid var(--neutral-200)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 16px', border: 'none', cursor: 'pointer',
              background: activeTab === t.id ? 'var(--primary-500)22' : 'transparent',
              color: activeTab === t.id ? 'var(--primary-600)' : 'var(--neutral-500)',
              borderBottom: activeTab === t.id ? '2px solid var(--primary-500)' : '2px solid transparent',
              fontWeight: activeTab === t.id ? 700 : 500, fontSize: 13, whiteSpace: 'nowrap', borderRadius: '8px 8px 0 0',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB: MI PARCELA + NDVI ═══ */}
      {activeTab === 'parcela' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Catastro lookup */}
          <div className="nf-card">
            <div className="nf-card-hd">
              <div className="nf-card-title">🗺️ Consulta Catastral</div>
              <div className="nf-card-meta">Referencia catastral para obtener superficie, coordenadas y mapa NDVI</div>
            </div>
            <div className="nf-card-pad">
              <div style={{ display: 'flex', gap: 10, alignItems: 'end', marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label className="nf-label">Referencia Catastral</label>
                  <input className="nf-input" value={catRef} onChange={e => setCatRef(e.target.value)}
                    placeholder="Ej: 29900A01200039" style={{ width: '100%' }} />
                </div>
                <button onClick={handleCatastro} className="nf-btn primary" disabled={catLoading} style={{ whiteSpace: 'nowrap' }}>
                  {catLoading ? '⏳ Consultando...' : '🔍 Consultar'}
                </button>
              </div>

              {catError && (
                <div style={{ padding: '8px 12px', borderRadius: 8, background: '#FEE2E2', color: '#DC2626', fontSize: 12, marginBottom: 16 }}>{catError}</div>
              )}

              {catData && (
                <div>
                  {/* WMS Map */}
                  <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 16, border: '1px solid var(--neutral-200)' }}>
                    <img src={catData.wms} alt="Catastro WMS" style={{ width: '100%', height: 250, objectFit: 'cover' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  {/* Data grid — extended with altitude and climate */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
                    {[
                      { l: 'Coordenadas', v: `${catData.lat.toFixed(5)}, ${catData.lon.toFixed(5)}`, icon: '📍' },
                      { l: 'Superficie', v: catData.superficie_m2 > 10000 ? `${(catData.superficie_m2 / 10000).toFixed(2)} ha` : `${catData.superficie_m2.toLocaleString()} m²`, icon: '📐' },
                      { l: 'Altitud', v: catData.altitud != null ? `${Math.round(catData.altitud)} m.s.n.m.` : 'No disponible', icon: '⛰️' },
                      { l: 'Zona climática', v: catData.climaZona || '—', icon: '🌡️' },
                      { l: 'Provincia', v: catData.provincia || '—', icon: '🏛️' },
                      { l: 'Municipio', v: catData.municipio || '—', icon: '🏘️' },
                      { l: 'Uso del suelo', v: catData.uso || catData.descripcion || '—', icon: '🌾' },
                    ].map(r => (
                      <div key={r.l} style={{ background: 'var(--neutral-50)', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 10, color: 'var(--neutral-400)' }}>{r.icon} {r.l}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>{r.v}</div>
                      </div>
                    ))}
                  </div>
                  {catData.descripcion && (
                    <div style={{ fontSize: 12, color: 'var(--neutral-600)', marginBottom: 12 }}>
                      <strong>Descripción catastral:</strong> {catData.descripcion}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* NDVI Satellite Section — Real Sentinel-2 + MODIS fallback */}
          {catData && catData.lat && (
            <div className="nf-card">
              <div className="nf-card-hd">
                <div className="nf-card-title">🛰️ Sentinel-2 — Vista Satelital en Tiempo Real</div>
                <div className="nf-card-meta">
                  {sentinel?.configured
                    ? `Fuente: ${sentinel.source || 'Sentinel-2 L2A'} · Últimos 30 días · Resolución 10m/px`
                    : 'Fuente: MODIS Terra (fallback) · Configura SENTINEL_CLIENT_ID para datos Sentinel-2 reales'}
                </div>
              </div>
              <div className="nf-card-pad">
                {/* Sentinel status badge */}
                {sentinel && !sentinel.configured && (
                  <div style={{ padding: '8px 12px', borderRadius: 8, background: '#FEF3C7', color: '#92400E', fontSize: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={14} />
                    {sentinel.message || 'Sentinel-2 no configurado. Usando estimaciones MODIS.'}
                  </div>
                )}
                {sentinelLoading && (
                  <div style={{ padding: '8px 12px', borderRadius: 8, background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, marginBottom: 16 }}>
                    ⏳ Consultando Sentinel-2 Copernicus Data Space...
                  </div>
                )}

                {/* View toggle buttons */}
                {sentinel?.configured && (sentinel.truecolor_image || sentinel.ndvi_image) && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <button onClick={() => setSatView('truecolor')}
                      style={{ padding: '8px 16px', borderRadius: 8, border: '2px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                        borderColor: satView === 'truecolor' ? '#2563EB' : 'var(--neutral-200)',
                        background: satView === 'truecolor' ? '#2563EB' : 'white',
                        color: satView === 'truecolor' ? 'white' : 'var(--neutral-600)' }}>
                      🌍 Color Real
                    </button>
                    <button onClick={() => setSatView('ndvi')}
                      style={{ padding: '8px 16px', borderRadius: 8, border: '2px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                        borderColor: satView === 'ndvi' ? '#059669' : 'var(--neutral-200)',
                        background: satView === 'ndvi' ? '#059669' : 'white',
                        color: satView === 'ndvi' ? 'white' : 'var(--neutral-600)' }}>
                      🟢 NDVI Vegetación
                    </button>
                  </div>
                )}

                {/* Full-width satellite image */}
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--neutral-200)', marginBottom: 12, position: 'relative' }}>
                  {(() => {
                    const activeImage = satView === 'truecolor' ? sentinel?.truecolor_image : sentinel?.ndvi_image;
                    if (activeImage) {
                      return (
                        <img src={activeImage} alt={satView === 'truecolor' ? 'Sentinel-2 Color Real' : 'Sentinel-2 NDVI'}
                          style={{ width: '100%', height: 420, objectFit: 'cover', background: '#1a1a2e' }} />
                      );
                    }
                    if (sentinel?.ndvi_image) {
                      return (
                        <img src={sentinel.ndvi_image} alt="Sentinel-2 NDVI"
                          style={{ width: '100%', height: 420, objectFit: 'cover', background: '#1a1a2e' }} />
                      );
                    }
                    if (ndviUrl) {
                      return (
                        <img src={ndviUrl} alt="MODIS NDVI" style={{ width: '100%', height: 420, objectFit: 'cover', background: '#1a1a2e' }}
                          onError={e => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            const parent = img.parentElement;
                            if (parent && !parent.querySelector('.ndvi-fallback')) {
                              const div = document.createElement('div');
                              div.className = 'ndvi-fallback';
                              div.style.cssText = 'height:420px;display:flex;align-items:center;justify-content:center;background:#1a1a2e;color:#10B981;font-size:13px;text-align:center;padding:20px;';
                              div.innerHTML = '🛰️ Imagen NDVI no disponible.<br>Ver datos numéricos debajo.';
                              parent.appendChild(div);
                            }
                          }} />
                      );
                    }
                    return (
                      <div style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', color: '#10B981', fontSize: 13 }}>
                        🛰️ Esperando datos satelitales...
                      </div>
                    );
                  })()}
                  <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{satView === 'truecolor' ? '🌍 Sentinel-2 L2A Color Real' : '🟢 Sentinel-2 L2A NDVI'}</span>
                    <span style={{ opacity: 0.7 }}>·</span>
                    <span>{catData.lat.toFixed(4)}°N, {Math.abs(catData.lon).toFixed(4)}°{catData.lon < 0 ? 'W' : 'E'}</span>
                    {sentinel?.ndvi_date && <><span style={{ opacity: 0.7 }}>·</span><span>{sentinel.ndvi_date}</span></>}
                  </div>
                  {sentinel?.configured && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: '#10B981', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                      1024×1024 · 10m/px
                    </div>
                  )}
                </div>

                {/* NDVI Scale — only in NDVI view */}
                {satView === 'ndvi' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, marginBottom: 16 }}>
                    <span style={{ color: 'var(--neutral-400)' }}>NDVI:</span>
                    {[
                      { v: 0.0, c: '#8B0000', l: '0.0' },
                      { v: 0.15, c: '#DC2626', l: '0.15' },
                      { v: 0.3, c: '#CA8A04', l: '0.3' },
                      { v: 0.5, c: '#16A34A', l: '0.5' },
                      { v: 0.7, c: '#15803D', l: '0.7' },
                      { v: 1.0, c: '#064E3B', l: '1.0' },
                    ].map(s => (
                      <div key={s.v} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <div style={{ width: 16, height: 10, background: s.c, borderRadius: 2 }} />
                        <span style={{ color: 'var(--neutral-500)' }}>{s.l}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Data panels row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Real Sentinel-2 stats */}
                  {sentinel?.configured && realNdvi !== null && (
                    <div style={{ background: '#F0FDF4', borderRadius: 10, padding: 16, border: '1px solid #10B98133' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#059669', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Satellite size={16} /> Sentinel-2 — NDVI Real (últimos 30 días)
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                          { l: 'NDVI medio', v: realNdvi.toFixed(3), c: ndviColor(realNdvi) },
                          { l: 'Calidad pasto', v: ndviLabel(realNdvi), c: ndviColor(realNdvi) },
                          { l: 'NDVI mínimo', v: (sentinel.ndvi_min ?? 0).toFixed(3), c: '#6B7280' },
                          { l: 'NDVI máximo', v: (sentinel.ndvi_max ?? 0).toFixed(3), c: '#6B7280' },
                          { l: 'Desv. estándar', v: (sentinel.ndvi_stdev ?? 0).toFixed(3), c: '#6B7280' },
                          { l: 'Nubes máx.', v: '30%', c: '#6B7280' },
                        ].map(r => (
                          <div key={r.l}>
                            <div style={{ fontSize: 10, color: '#16A34A' }}>{r.l}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: r.c, fontFamily: 'var(--font-mono)' }}>{r.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cross-reference: Catastro + NDVI + Altitude → Pasture estimation */}
                  <div style={{ background: '#ECFDF5', borderRadius: 10, padding: 16, border: '1px solid #10B98133' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#10B981', marginBottom: 10 }}>
                      🌿 Estimación de Pastos — {season} {realNdvi !== null ? '(datos reales)' : '(estimación estacional)'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {(() => {
                        const ha = catData.superficie_m2 / 10000;
                        const pasture = estimatePasture(effectiveNdvi, catData.altitud ?? null, ha, season);
                        return [
                          { l: 'NDVI efectivo', v: effectiveNdvi.toFixed(2), c: ndviColor(effectiveNdvi) },
                          { l: 'Calidad pasto', v: ndviLabel(effectiveNdvi), c: ndviColor(effectiveNdvi) },
                          { l: 'Sup. disponible', v: `${ha.toFixed(2)} ha`, c: '#15803D' },
                          { l: 'Productividad', v: `${pasture.baseKgHa} kg MS/ha`, c: '#15803D' },
                          { l: 'Pasto total', v: `${pasture.totalKg.toLocaleString()} kg MS`, c: '#15803D' },
                          { l: 'Capacidad', v: `~${pasture.avesCapacidad.toLocaleString()} aves`, c: '#15803D' },
                          { l: 'Reducción pienso', v: pasture.reduccionPienso, c: seasonData.color },
                          { l: 'Altitud corrección', v: catData.altitud != null ? `${Math.round(catData.altitud)}m → ${catData.altitud > 800 ? '↓' : '='} prod.` : 'N/D', c: '#6B7280' },
                        ].map(r => (
                          <div key={r.l}>
                            <div style={{ fontSize: 10, color: '#16A34A' }}>{r.l}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: r.c, fontFamily: 'var(--font-mono)' }}>{r.v}</div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                {/* Season NDVI comparison */}
                <div style={{ fontSize: 12, color: 'var(--neutral-700)', marginTop: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>NDVI por estación (referencia zona):</div>
                  {ESTACIONES.map(e => (
                    <div key={e.nombre} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ width: 80 }}>{e.icon} {e.nombre}</span>
                      <div style={{ flex: 1, height: 8, background: 'var(--neutral-100)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${e.ndviRef * 100}%`, background: ndviColor(e.ndviRef), borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: ndviColor(e.ndviRef), width: 30, textAlign: 'right' }}>{e.ndviRef.toFixed(2)}</span>
                      {season === e.nombre && realNdvi !== null && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: ndviColor(realNdvi), marginLeft: 4 }}>
                          (real: {realNdvi.toFixed(2)})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rotation Planner */}
          {catData && catData.superficie_m2 > 0 && (
            <div className="nf-card">
              <div className="nf-card-hd">
                <div className="nf-card-title">🔄 Planificador de Rotación de Parcelas</div>
                <div className="nf-card-meta">Divide tu terreno en parcelas y planifica la rotación para mantener pastos sanos</div>
              </div>
              <div className="nf-card-pad">
                <div style={{ display: 'flex', gap: 16, alignItems: 'end', marginBottom: 16 }}>
                  <div>
                    <label className="nf-label">Nº Parcelas</label>
                    <input className="nf-input" type="number" min={2} max={12} value={numParcelas}
                      onChange={e => setNumParcelas(Math.max(2, Math.min(12, parseInt(e.target.value) || 4)))}
                      style={{ width: 80 }} />
                  </div>
                  <div>
                    <label className="nf-label">Días rotación</label>
                    <input className="nf-input" type="number" min={7} max={60} value={diasRotacion}
                      onChange={e => setDiasRotacion(Math.max(7, parseInt(e.target.value) || 14))}
                      style={{ width: 80 }} />
                  </div>
                  <button onClick={regenerateParcelas} className="nf-btn primary" style={{ whiteSpace: 'nowrap' }}>
                    <RotateCcw size={14} /> Recalcular
                  </button>
                  <div style={{ fontSize: 11, color: 'var(--neutral-400)', marginLeft: 'auto' }}>
                    Ciclo completo: <b style={{ color: 'var(--neutral-700)' }}>{numParcelas * diasRotacion} días</b> ·
                    Descanso por parcela: <b style={{ color: 'var(--neutral-700)' }}>{(numParcelas - 1) * diasRotacion} días</b>
                  </div>
                </div>

                {/* Parcelas grid */}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(200px, 1fr))`, gap: 12 }}>
                  {parcelas.map((p, i) => {
                    const estadoColors: Record<string, { bg: string; border: string; label: string; emoji: string }> = {
                      en_uso: { bg: '#FEF3C7', border: '#F59E0B', label: 'En uso', emoji: '🐔' },
                      descanso: { bg: '#ECFDF5', border: '#10B981', label: 'Descanso', emoji: '🌱' },
                      preparacion: { bg: '#EFF6FF', border: '#3B82F6', label: 'Preparación', emoji: '🔧' },
                    };
                    const ec = estadoColors[p.estado];
                    const ndvi = Math.max(0, Math.min(1, p.ndviEstimado));
                    return (
                      <div key={p.id} style={{ background: ec.bg, border: `2px solid ${ec.border}`, borderRadius: 'var(--radius-xl)', padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--neutral-800)' }}>{ec.emoji} {p.nombre}</span>
                          <select className="nf-input" value={p.estado} style={{ width: 'auto', padding: '2px 8px', fontSize: 11 }}
                            onChange={e => setParcelas(prev => prev.map((pp, ii) => ii === i ? { ...pp, estado: e.target.value as any } : pp))}>
                            <option value="en_uso">🐔 En uso</option>
                            <option value="descanso">🌱 Descanso</option>
                            <option value="preparacion">🔧 Preparación</option>
                          </select>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--neutral-600)', marginBottom: 8 }}>
                          {p.hectareas} ha · {p.diasEnEstado}/{diasRotacion} días
                        </div>
                        {/* NDVI bar */}
                        <div style={{ fontSize: 10, color: 'var(--neutral-500)', marginBottom: 2 }}>NDVI: {ndvi.toFixed(2)} — {ndviLabel(ndvi)}</div>
                        <div style={{ height: 6, background: 'var(--neutral-200)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${ndvi * 100}%`, background: ndviColor(ndvi), borderRadius: 3 }} />
                        </div>
                        {/* Progress bar for days */}
                        <div style={{ marginTop: 6, fontSize: 10, color: 'var(--neutral-400)' }}>Progreso rotación:</div>
                        <div style={{ height: 4, background: 'var(--neutral-200)', borderRadius: 2, overflow: 'hidden', marginTop: 2 }}>
                          <div style={{ height: '100%', width: `${(p.diasEnEstado / diasRotacion) * 100}%`, background: ec.border, borderRadius: 2 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Rotation timeline */}
                {parcelas.length > 0 && (
                  <div style={{ marginTop: 16, background: 'var(--neutral-25)', borderRadius: 'var(--radius-lg)', padding: 12, border: 'var(--border-default)' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-700)', marginBottom: 8 }}>📅 Calendario de rotación (próximas {numParcelas} rotaciones)</div>
                    <div style={{ display: 'flex', gap: 4, overflow: 'auto' }}>
                      {parcelas.map((p, i) => (
                        <div key={p.id} style={{ flex: 1, textAlign: 'center', padding: '6px 4px', background: i === 0 ? '#FEF3C7' : '#ECFDF5', borderRadius: 6, fontSize: 11 }}>
                          <div style={{ fontWeight: 700 }}>Rot. {i + 1}</div>
                          <div style={{ color: 'var(--neutral-500)' }}>Día {i * diasRotacion + 1}-{(i + 1) * diasRotacion}</div>
                          <div style={{ fontWeight: 600, color: i === 0 ? '#F59E0B' : '#10B981' }}>{i === 0 ? '🐔 Pastoreo' : '🌱 Descanso'}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--neutral-500)', marginTop: 8, lineHeight: 1.5 }}>
                      ℹ️ Con {numParcelas} parcelas y {diasRotacion} días de ocupación, cada parcela descansa <b>{(numParcelas - 1) * diasRotacion} días</b>.
                      {(numParcelas - 1) * diasRotacion >= 28 ? ' ✅ Suficiente para regeneración del pasto.' : ' ⚠️ Recomendado ≥28 días de descanso. Considera más parcelas.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state if no catastro */}
          {!catData && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--neutral-25)', borderRadius: 'var(--radius-xl)', border: 'var(--border-default)' }}>
              <MapPin size={48} style={{ color: 'var(--neutral-300)', marginBottom: 12 }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--neutral-700)' }}>Introduce tu referencia catastral</p>
              <p style={{ fontSize: 13, color: 'var(--neutral-400)', maxWidth: 400, margin: '8px auto' }}>
                Consulta los datos de tu parcela para obtener visualización NDVI de Sentinel, estimación de pasto y planificador de rotación.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: FORMULADOR ═══ */}
      {activeTab === 'formulador' && (
        <div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {FASES.map((f, i) => (
              <button key={f.nombre} onClick={() => setSelectedFase(i)}
                style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: selectedFase === i ? 'var(--primary-500)' : 'var(--neutral-100)', color: selectedFase === i ? '#fff' : 'var(--neutral-600)' }}>
                {f.nombre}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <button onClick={autoOptimize} disabled={ingredients.filter(i => i.selected).length < 2}
              className="nf-btn primary" style={{ opacity: ingredients.filter(i => i.selected).length < 2 ? 0.5 : 1 }}>
              ⚡ Auto-Optimizar
            </button>
            <button onClick={() => setIngredients(prev => prev.map(ing => ({ ...ing, porcentaje: 0 })))} className="nf-btn">🔄 Reset</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="nf-card">
              <div className="nf-card-hd"><div className="nf-card-title">Requisitos: {fase.nombre}</div></div>
              <div className="nf-card-pad">
                {[{ l: 'Proteína', v: fase.proteina }, { l: 'Energía', v: `${fase.energiaKcal} kcal/kg` }, { l: 'Calcio', v: fase.calcio }, { l: 'Fósforo', v: fase.fosforo }].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid var(--neutral-100)' }}>
                    <span style={{ color: 'var(--neutral-500)' }}>{r.l}</span><span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="nf-card">
              <div className="nf-card-hd"><div className="nf-card-title">Tu mezcla</div>
                <div className="nf-card-meta" style={{ color: totalPct === 100 ? 'var(--ok)' : 'var(--alert)' }}>{totalPct}%{totalPct !== 100 && ' ⚠'}</div>
              </div>
              <div className="nf-card-pad">
                {[{ l: 'Proteína', v: `${mixProtein.toFixed(1)}%` }, { l: 'Energía', v: `${Math.round(mixEnergia)} kcal` }, { l: 'Coste/kg', v: `${mixPrecio.toFixed(3)} €` }].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid var(--neutral-100)' }}>
                    <span style={{ color: 'var(--neutral-500)' }}>{r.l}</span><span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="nf-card" style={{ marginTop: 16 }}>
            <div className="nf-card-hd"><div className="nf-card-title">Ingredientes</div></div>
            <div style={{ overflow: 'auto' }}>
              <table className="nf-table" style={{ fontSize: 12 }}>
                <thead><tr><th>Usar</th><th>Ingrediente</th><th>%</th><th>Prot.</th><th>Energía</th><th>€/kg</th></tr></thead>
                <tbody>
                  {ingredients.map((ing, i) => (
                    <tr key={ing.nombre} style={{ opacity: ing.selected ? 1 : 0.5 }}>
                      <td><input type="checkbox" checked={ing.selected || false} onChange={e => { const c = [...ingredients]; c[i] = { ...c[i], selected: e.target.checked }; setIngredients(c); }} /></td>
                      <td style={{ fontWeight: 600 }}>{ing.eco ? '🌿 ' : ''}{ing.nombre}</td>
                      <td><input type="number" min={0} max={100} value={ing.porcentaje || 0} disabled={!ing.selected}
                        onChange={e => { const c = [...ingredients]; c[i] = { ...c[i], porcentaje: parseInt(e.target.value) || 0 }; setIngredients(c); }}
                        className="nf-input" style={{ width: 55, padding: '2px 6px', textAlign: 'right' }} /></td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{ing.proteina}%</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{ing.energia}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-400)' }}>{ing.precio.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: MERCADO ═══ */}
      {activeTab === 'mercado' && (
        <div className="nf-card">
          <div className="nf-card-hd"><div className="nf-card-title">📊 Precios de cereales (referencia)</div></div>
          <div style={{ overflow: 'auto' }}>
            <table className="nf-table" style={{ fontSize: 12 }}>
              <thead><tr><th>Cereal</th><th>Lonja</th><th>Precio/kg</th><th>Tend.</th><th>Var%</th></tr></thead>
              <tbody>
                {MERCADO_CEREALES.map(m => (
                  <tr key={m.cereal}>
                    <td style={{ fontWeight: 600 }}>{m.cereal}</td>
                    <td>{m.lonja}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{m.precio.toFixed(3)} €</td>
                    <td>{m.tendencia}</td>
                    <td style={{ color: m.variacion >= 0 ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
                      {m.variacion >= 0 ? '+' : ''}{m.variacion}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ TAB: PASTOS ═══ */}
      {activeTab === 'pastos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {ESTACIONES.map(e => (
            <div key={e.nombre} className="nf-card" style={{ borderLeft: `4px solid ${e.color}` }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{e.icon} {e.nombre} <span style={{ fontSize: 12, color: 'var(--neutral-400)' }}>({e.meses})</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
                <div><span style={{ color: 'var(--neutral-500)' }}>Pasto:</span> <b>{e.pasto}</b></div>
                <div><span style={{ color: 'var(--neutral-500)' }}>Bicheo:</span> <b>{e.bicheo}</b></div>
                <div><span style={{ color: 'var(--neutral-500)' }}>Reducción pienso:</span> <b style={{ color: e.color }}>{e.reduccionPienso}</b></div>
                <div><span style={{ color: 'var(--neutral-500)' }}>NDVI ref:</span> <b style={{ color: ndviColor(e.ndviRef) }}>{e.ndviRef.toFixed(2)}</b></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ TAB: FINITION ═══ */}
      {activeTab === 'finition' && (
        <div className="nf-card">
          <div className="nf-card-hd"><div className="nf-card-title">🍗 Finition (épinette) — Acabado de capones</div></div>
          <div className="nf-card-pad">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
              {[
                { l: 'Duración recomendada', v: '15-30 días' },
                { l: 'Condiciones', v: 'Oscuridad/penumbra, 15-18°C' },
                { l: 'Alimentación', v: '70% harina maíz + 20% suero lácteo + 10% grasa' },
                { l: 'Aumento peso esperado', v: '+20-30%' },
                { l: 'Valor sin finition', v: '15-18 €/kg canal' },
                { l: 'Valor con finition', v: '22-28 €/kg canal' },
              ].map(r => (
                <div key={r.l} style={{ padding: 8, background: 'var(--neutral-50)', borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: 'var(--neutral-400)' }}>{r.l}</div>
                  <div style={{ fontWeight: 600, color: 'var(--neutral-800)' }}>{r.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: ALTERNATIVAS ═══ */}
      {activeTab === 'alternativas' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {[
            { n: '🪲 Harinas de insectos (BSF)', p: '40-50%', pr: '~1.20 €/kg', d: 'Alta proteína, producible en granja' },
            { n: '🥛 Suero lácteo', p: '0.8-1.0%', pr: '~0.05 €/L', d: 'Excelente para finition de capones' },
            { n: '🍞 Pan duro de panadería', p: '8-10%', pr: '~0.05 €/kg', d: 'Alto en energía. Máx 15-20% ración' },
            { n: '🫒 Pulpa de remolacha', p: '8-10%', pr: '~0.12 €/kg', d: 'Buena fibra fermentable' },
            { n: '🌾 DDGS (destilería)', p: '25-30%', pr: '~0.22 €/kg', d: 'Alta proteína y energía' },
            { n: '🥬 Restos de huerta', p: 'Variable', pr: 'Gratis', d: 'Calabaza, col, remolacha forrajera' },
          ].map(a => (
            <div key={a.n} className="nf-card">
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{a.n}</div>
              <div style={{ fontSize: 12, color: 'var(--neutral-600)', marginBottom: 4 }}>Proteína: <b>{a.p}</b> · Precio: <b>{a.pr}</b></div>
              <div style={{ fontSize: 12, color: 'var(--neutral-500)' }}>{a.d}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
