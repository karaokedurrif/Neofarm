'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Dna, Sparkles, Sliders, Send, Loader2, ChevronRight, Bird,
  Target, Shield, Zap, Heart, Sun, TreePine, Egg, Scissors,
  BarChart3, AlertTriangle, BookOpen, Map, Calendar, Bot,
  X, Download, ArrowRight, RefreshCw
} from 'lucide-react';

/* ── Constants ── */
const CAPONES_API = 'https://capones.ovosfera.com';

/* ── Types ── */
type Tab = 'plantel' | 'recommender';

interface BreedSummary {
  name: string;
  weight_m: number;
  weight_f: number;
  eggs_per_year: number;
  carcass_pct: number;
  growth: string;
  origin: string;
  rusticity: number;
  docility: number;
}

interface ObjectiveSlider {
  key: string;
  label: string;
  icon: any;
  color: string;
  value: number;
  description: string;
}

interface RecommendResult {
  resumen_ejecutivo?: string;
  cruces_recomendados?: any[];
  plan_parque?: any;
  consanguinidad?: any;
  roadmap_f1_f5?: any[];
  nutricion_clave?: string;
  timeline_meses?: any[];
  raw_response?: string;
  parse_error?: boolean;
}

/* ── Demo Plantel Data ── */
const PLANTEL_DEMO = [
  { id: 'AVE-001', nombre: 'Gallo Principal', raza: 'Castellana Negra', sexo: 'M' as const, edad: '2 años', peso: 3.1, notas: 'Reproductor #1, resistente' },
  { id: 'AVE-002', nombre: 'Gallo Reserva', raza: 'Castellana Negra', sexo: 'M' as const, edad: '1.5 años', peso: 2.9, notas: 'Buen temperamento' },
  { id: 'AVE-003', nombre: 'Gallina A1', raza: 'Castellana Negra', sexo: 'F' as const, edad: '2 años', peso: 2.3, notas: '165 huevos/año' },
  { id: 'AVE-004', nombre: 'Gallina A2', raza: 'Castellana Negra', sexo: 'F' as const, edad: '1.5 años', peso: 2.4, notas: '172 huevos/año' },
  { id: 'AVE-005', nombre: 'Gallina B1', raza: 'Plymouth Rock Barrada', sexo: 'F' as const, edad: '2 años', peso: 3.0, notas: '195 huevos/año' },
  { id: 'AVE-006', nombre: 'Gallina B2', raza: 'Bresse', sexo: 'F' as const, edad: '1 año', peso: 2.8, notas: 'Importada de Francia' },
  { id: 'AVE-007', nombre: 'Gallina C1', raza: 'Mos', sexo: 'F' as const, edad: '3 años', peso: 2.7, notas: 'Raza autóctona gallega' },
  { id: 'AVE-008', nombre: 'Gallina C2', raza: 'Prat Leonada', sexo: 'F' as const, edad: '1.5 años', peso: 2.3, notas: 'Piel blanca, carne premium' },
];

/* ══════════════════════════════════════════════════════
   OBJECTIVE SLIDER COMPONENT
   ══════════════════════════════════════════════════════ */
function ObjectiveInput({ obj, onChange }: { obj: ObjectiveSlider; onChange: (v: number) => void }) {
  const Icon = obj.icon;
  return (
    <div style={{ background: 'white', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--neutral-100)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Icon size={14} style={{ color: obj.color }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-700)' }}>{obj.label}</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: obj.color, fontFamily: 'var(--font-mono)' }}>
          {(obj.value * 10).toFixed(0)}
        </span>
      </div>
      <input
        type="range" min={0} max={1} step={0.1} value={obj.value}
        onChange={e => onChange(+e.target.value)}
        style={{ width: '100%', accentColor: obj.color }}
      />
      <div style={{ fontSize: 10, color: 'var(--neutral-400)', marginTop: 2 }}>{obj.description}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════ */
export default function GeneticsPage() {
  const [tab, setTab] = useState<Tab>('recommender');
  const [breeds, setBreeds] = useState<BreedSummary[]>([]);
  const [loadingBreeds, setLoadingBreeds] = useState(true);

  // Recommender state
  const [objectives, setObjectives] = useState<ObjectiveSlider[]>([
    { key: 'peso_carne', label: 'Peso / Carne', icon: Target, color: '#EF4444', value: 0.5, description: 'Prioridad en peso corporal y masa muscular' },
    { key: 'calidad_carne', label: 'Calidad Carne', icon: Sparkles, color: '#B07D2B', value: 0.8, description: 'Sabor, textura, infiltración grasa' },
    { key: 'rendimiento_canal', label: '% Canal', icon: BarChart3, color: '#10B981', value: 0.6, description: 'Proporción de carne aprovechable' },
    { key: 'huevos', label: 'Puesta', icon: Egg, color: '#F59E0B', value: 0.3, description: 'Producción de huevos para reproducción' },
    { key: 'rusticidad', label: 'Rusticidad', icon: TreePine, color: '#059669', value: 0.7, description: 'Resistencia y adaptación al terreno' },
    { key: 'docilidad', label: 'Docilidad', icon: Heart, color: '#EC4899', value: 0.6, description: 'Temperamento calmado, manejo fácil' },
    { key: 'precocidad', label: 'Precocidad', icon: Zap, color: '#8B5CF6', value: 0.4, description: 'Velocidad de crecimiento' },
    { key: 'plumaje_oscuro', label: 'Plumaje Oscuro', icon: Bird, color: '#374151', value: 0.5, description: 'Preferencia por plumaje oscuro' },
    { key: 'autosuficiencia', label: 'Autosuficiencia', icon: Sun, color: '#D97706', value: 0.6, description: 'Capacidad de forrajeo y autonomía' },
    { key: 'consanguinidad_min', label: 'Min. Consanguinidad', icon: Shield, color: '#6366F1', value: 0.8, description: 'Evitar endogamia, diversidad genética' },
  ]);
  const [selectedPlantel, setSelectedPlantel] = useState<string[]>(['Castellana Negra', 'Plymouth Rock Barrada', 'Bresse']);
  const [numAves, setNumAves] = useState(100);
  const [clima, setClima] = useState('templado');
  const [experiencia, setExperiencia] = useState('media');
  const [generaciones, setGeneraciones] = useState(3);
  const [restricciones, setRestricciones] = useState('');

  // Results
  const [result, setResult] = useState<RecommendResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chat
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  /* ── Fetch breeds ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${CAPONES_API}/api/genetics/breeds-summary`);
        if (res.ok) {
          const data = await res.json();
          setBreeds(data.breeds || []);
        }
      } catch {}
      setLoadingBreeds(false);
    })();
  }, []);

  /* ── Run recommendation ── */
  const runRecommend = useCallback(async () => {
    setLoading(true); setError(null); setResult(null);
    const body = {
      plantel_actual: selectedPlantel,
      objetivos: Object.fromEntries(objectives.map(o => [o.key, o.value])),
      num_aves_objetivo: numAves,
      presupuesto: 'medio',
      clima,
      experiencia,
      restricciones: restricciones || undefined,
      generaciones_plan: generaciones,
    };
    try {
      const res = await fetch(`${CAPONES_API}/api/genetics/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Error desconocido' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      setResult(await res.json());
    } catch (e: any) {
      setError(e.message);
      // Fallback demo result
      setResult({
        resumen_ejecutivo: 'Demo: Recomendamos un programa de cruce F1 entre Castellana Negra × Plymouth Rock Barrada como base, con aportes de Bresse para calidad de carne. El plan a 3 generaciones maximiza vigor híbrido y calidad de capón gourmet.',
        cruces_recomendados: [
          { padre: 'Castellana Negra', madre: 'Plymouth Rock Barrada', tipo: 'F0×F0', objetivo: 'Base híbrida con rusticidad + masa', heterosis_estimada: 15, score_capon: 8.2, puntos_fuertes: ['Alto vigor híbrido', 'Rusticidad peninsular', 'Buen rendimiento canal'], riesgos: ['Plumaje barrado irregular'] },
          { padre: 'Bresse', madre: 'Castellana Negra', tipo: 'F0×F0', objetivo: 'Calidad carne francesa + autóctona', heterosis_estimada: 12, score_capon: 8.8, puntos_fuertes: ['Carne excepcional', 'Piel blanca premium'], riesgos: ['Menor rusticidad que CN pura'] },
          { padre: 'F1(CN×PR)', madre: 'Bresse', tipo: 'F1×F0', objetivo: 'Capón gourmet generación 2', heterosis_estimada: 10, score_capon: 9.1, puntos_fuertes: ['Calidad suprema', 'Base genética amplia'], riesgos: ['Segregación fenotípica F2'] },
        ],
        plan_parque: { reproductores_necesarios: { machos: 3, hembras: 25 }, lotes_anuales: 4, capacidad_total: 120, calendario: 'Incubaciones en Feb, Abr, Jun, Sep — capones para Navidad y primavera' },
        consanguinidad: { riesgo: 'bajo', coeficiente_estimado: 0.03, recomendaciones: ['Mantener 3+ líneas paternas activas', 'Rotar gallos cada 2 generaciones', 'Introducir sangre nueva de Mos o Euskal Oiloa cada 3 años'] },
        roadmap_f1_f5: [
          { generacion: 'F1', cruce: 'CN × Plymouth Rock', objetivo: 'Vigor híbrido máximo', seleccion: 'Machos >3.2kg a 6 meses, plumaje oscuro' },
          { generacion: 'F2', cruce: 'F1(CN×PR) × Bresse', objetivo: 'Incorporar calidad carne francesa', seleccion: 'Carcasa >74%, piel blanca' },
          { generacion: 'F3', cruce: 'F2 × CN (retrocruce)', objetivo: 'Fijar rusticidad + autóctona', seleccion: 'Autosuficiencia, resist. enfermedades' },
        ],
        nutricion_clave: 'F1: Inicio con 22% proteína. Engorde: mezcla 70% cereal + 15% soja + 15% pasto. Capones: dieta acabado con maíz 30 días pre-sacrificio.',
        timeline_meses: [
          { mes: 1, accion: 'Seleccionar reproductores' },
          { mes: 2, accion: 'Primera incubación CN × PR' },
          { mes: 5, accion: 'Sexado y separación pollitos' },
          { mes: 6, accion: 'Caponaje machos seleccionados' },
          { mes: 12, accion: 'Venta primeros capones' },
        ],
      });
    }
    setLoading(false);
  }, [selectedPlantel, objectives, numAves, clima, experiencia, restricciones, generaciones]);

  /* ── Chat ── */
  const sendChat = useCallback(async () => {
    if (!chatMsg.trim()) return;
    const msg = chatMsg.trim();
    setChatMsg('');
    setChatHistory(h => [...h, { role: 'user', text: msg }]);
    setChatLoading(true);
    try {
      const res = await fetch(`${CAPONES_API}/api/genetics/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory(h => [...h, { role: 'assistant', text: data.response }]);
      } else {
        setChatHistory(h => [...h, { role: 'assistant', text: '⚠️ Error conectando con IA. Verifica ANTHROPIC_API_KEY en el backend.' }]);
      }
    } catch {
      setChatHistory(h => [...h, { role: 'assistant', text: '⚠️ Backend no disponible. Asegúrate de que capones-backend esté activo.' }]);
    }
    setChatLoading(false);
  }, [chatMsg]);

  const updateObjective = (key: string, value: number) => {
    setObjectives(prev => prev.map(o => o.key === key ? { ...o, value } : o));
  };

  const togglePlantel = (name: string) => {
    setSelectedPlantel(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  return (
    <div className="nf-content" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Dna size={22} style={{ color: 'var(--primary-500)' }} />
          Genética — Recomendador IA
        </h1>
        <p style={{ fontSize: 13, color: 'var(--neutral-500)', margin: '4px 0 0' }}>
          Plan genético inteligente con Claude AI · {breeds.length} razas disponibles
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid var(--neutral-100)' }}>
        {([
          { key: 'plantel' as Tab, label: 'Mi Plantel', icon: Bird },
          { key: 'recommender' as Tab, label: 'Recomendador IA', icon: Sparkles },
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

      {/* ═══════════ PLANTEL TAB ═══════════ */}
      {tab === 'plantel' && (
        <div>
          {/* KPIs */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { v: PLANTEL_DEMO.length, l: 'Total aves', c: 'var(--primary-600)', e: '🐔' },
              { v: PLANTEL_DEMO.filter(a => a.sexo === 'M').length, l: 'Machos', c: '#3B82F6', e: '♂' },
              { v: PLANTEL_DEMO.filter(a => a.sexo === 'F').length, l: 'Hembras', c: '#EC4899', e: '♀' },
              { v: [...new Set(PLANTEL_DEMO.map(a => a.raza))].length, l: 'Razas', c: '#8B5CF6', e: '🧬' },
            ].map(k => (
              <div key={k.l} style={{ background: 'white', borderRadius: 10, padding: '10px 16px', border: '1px solid var(--neutral-100)', minWidth: 100 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: k.c, fontFamily: 'var(--font-mono)' }}>{k.e} {k.v}</div>
                <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>{k.l}</div>
              </div>
            ))}
          </div>

          {/* Plantel table */}
          <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--neutral-100)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--neutral-50)', borderBottom: '2px solid var(--neutral-100)' }}>
                  {['ID', 'Nombre', 'Raza', 'Sexo', 'Edad', 'Peso', 'Notas'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--neutral-600)', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLANTEL_DEMO.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--neutral-50)' }}>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--neutral-400)' }}>{a.id}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--neutral-800)' }}>{a.nombre}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--neutral-600)' }}>{a.raza}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: a.sexo === 'M' ? '#DBEAFE' : '#FCE7F3', color: a.sexo === 'M' ? '#2563EB' : '#DB2777' }}>
                        {a.sexo === 'M' ? '♂ Macho' : '♀ Hembra'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--neutral-500)' }}>{a.edad}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--neutral-800)', fontFamily: 'var(--font-mono)' }}>{a.peso} kg</td>
                    <td style={{ padding: '8px 12px', fontSize: 11, color: 'var(--neutral-500)' }}>{a.notas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CTA to recommender */}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button onClick={() => setTab('recommender')} className="nf-btn primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} /> Obtener recomendación IA para mi plantel
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ RECOMMENDER TAB ═══════════ */}
      {tab === 'recommender' && (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>
          {/* Left panel — Configuration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignSelf: 'start' }}>
            {/* Objective sliders */}
            <div style={{
              background: 'white', borderRadius: 14, padding: 16,
              border: '1px solid var(--neutral-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Sliders size={14} style={{ color: 'var(--primary-500)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>Objetivos (0-10)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {objectives.map(obj => (
                  <ObjectiveInput key={obj.key} obj={obj} onChange={v => updateObjective(obj.key, v)} />
                ))}
              </div>
            </div>

            {/* Plantel selection */}
            <div style={{
              background: 'white', borderRadius: 14, padding: 16,
              border: '1px solid var(--neutral-100)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 8 }}>
                🐔 Plantel actual
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxHeight: 180, overflowY: 'auto' }}>
                {(breeds.length > 0 ? breeds : [
                  { name: 'Castellana Negra' }, { name: 'Plymouth Rock Barrada' }, { name: 'Bresse' },
                  { name: 'Sulmtaler' }, { name: 'Mos' }, { name: 'Prat Leonada' },
                  { name: 'Euskal Oiloa' }, { name: 'Sussex' }, { name: 'Orpington' },
                ] as any[]).map(b => (
                  <button key={b.name} onClick={() => togglePlantel(b.name)} style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                    background: selectedPlantel.includes(b.name) ? 'var(--primary-500)' : 'var(--neutral-50)',
                    color: selectedPlantel.includes(b.name) ? 'white' : 'var(--neutral-600)',
                    border: selectedPlantel.includes(b.name) ? '1px solid var(--primary-600)' : '1px solid var(--neutral-200)',
                    cursor: 'pointer',
                  }}>
                    {b.name}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 10, color: 'var(--neutral-400)', marginTop: 6 }}>
                Seleccionadas: {selectedPlantel.length} razas
              </div>
            </div>

            {/* Parameters */}
            <div style={{
              background: 'white', borderRadius: 14, padding: 16,
              border: '1px solid var(--neutral-100)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 12 }}>⚙️ Parámetros</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>Nº aves objetivo</label>
                  <input className="nf-input" type="number" min={10} max={1000} value={numAves} onChange={e => setNumAves(+e.target.value)} style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>Clima</label>
                    <select className="nf-input" value={clima} onChange={e => setClima(e.target.value)} style={{ width: '100%' }}>
                      {['cálido', 'templado', 'frío', 'húmedo'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>Experiencia</label>
                    <select className="nf-input" value={experiencia} onChange={e => setExperiencia(e.target.value)} style={{ width: '100%' }}>
                      {['principiante', 'media', 'experta'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>Generaciones (1-5)</label>
                  <input className="nf-input" type="number" min={1} max={5} value={generaciones} onChange={e => setGeneraciones(+e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>Restricciones (opcional)</label>
                  <input className="nf-input" value={restricciones} onChange={e => setRestricciones(e.target.value)} placeholder="Ej: solo razas españolas, sin Cornish..." style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={runRecommend} disabled={loading}
              className="nf-btn primary"
              style={{ width: '100%', padding: '14px 0', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Claude analizando...' : 'Generar Plan Genético IA'}
            </button>
          </div>

          {/* Right panel — Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div style={{
                background: '#FEF2F2', borderRadius: 10, padding: 12,
                border: '1px solid #FECACA', fontSize: 12, color: '#991B1B',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <AlertTriangle size={14} /> {error}
                <span style={{ fontSize: 10, color: '#B91C1C' }}>(mostrando resultado demo)</span>
              </div>
            )}

            {!result && !loading && (
              <div style={{
                background: 'white', borderRadius: 14, padding: 48, textAlign: 'center',
                border: '1px solid var(--neutral-100)',
              }}>
                <Sparkles size={40} style={{ color: 'var(--neutral-300)', marginBottom: 12 }} />
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--neutral-500)' }}>Configura objetivos y lanza el análisis</div>
                <div style={{ fontSize: 12, color: 'var(--neutral-400)', marginTop: 6 }}>
                  Claude analizará las {breeds.length || 42} razas disponibles y generará un plan genético completo personalizado
                </div>
              </div>
            )}

            {loading && (
              <div style={{
                background: 'white', borderRadius: 14, padding: 48, textAlign: 'center',
                border: '1px solid var(--neutral-100)',
              }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary-500)', marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--neutral-700)' }}>Claude está analizando tu plantel...</div>
                <div style={{ fontSize: 12, color: 'var(--neutral-400)', marginTop: 6 }}>Evaluando {selectedPlantel.length} razas × 10 objetivos × {generaciones} generaciones</div>
              </div>
            )}

            {result && (
              <>
                {/* Executive Summary */}
                {result.resumen_ejecutivo && (
                  <div style={{
                    background: 'linear-gradient(145deg, #FFFBEB, #FEF3C7)', borderRadius: 14, padding: 18,
                    border: '1px solid #FDE68A',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <BookOpen size={14} style={{ color: '#B07D2B' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>Resumen Ejecutivo</span>
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: '#78350F', margin: 0 }}>{result.resumen_ejecutivo}</p>
                  </div>
                )}

                {/* Recommended Crosses */}
                {result.cruces_recomendados && result.cruces_recomendados.length > 0 && (
                  <div style={{
                    background: 'white', borderRadius: 14, overflow: 'hidden',
                    border: '1px solid var(--neutral-100)',
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '2px solid var(--primary-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Dna size={16} style={{ color: 'var(--primary-500)' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>Cruces Recomendados</span>
                    </div>
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {result.cruces_recomendados.map((c: any, i: number) => (
                        <div key={i} style={{
                          background: 'var(--neutral-25)', borderRadius: 10, padding: 14,
                          border: '1px solid var(--neutral-100)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{
                              background: 'var(--primary-500)', color: 'white', width: 24, height: 24,
                              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 800,
                            }}>
                              {i + 1}
                            </span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--neutral-800)' }}>
                              {c.padre} × {c.madre}
                            </span>
                            <span style={{
                              marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 8px',
                              borderRadius: 6, background: '#ECFDF5', color: '#059669',
                            }}>
                              {c.tipo}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--neutral-600)', marginBottom: 8 }}>{c.objetivo}</div>
                          <div style={{ display: 'flex', gap: 12, fontSize: 12, marginBottom: 8 }}>
                            <span style={{ color: '#059669', fontWeight: 700 }}>
                              +{c.heterosis_estimada}% heterosis
                            </span>
                            <span style={{ color: '#B07D2B', fontWeight: 700 }}>
                              Score capón: {c.score_capon}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {c.puntos_fuertes?.map((p: string, j: number) => (
                              <span key={j} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#ECFDF5', color: '#059669' }}>✅ {p}</span>
                            ))}
                            {c.riesgos?.map((r: string, j: number) => (
                              <span key={j} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#FEF2F2', color: '#991B1B' }}>⚠️ {r}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Park Plan */}
                {result.plan_parque && (
                  <div style={{
                    background: 'white', borderRadius: 14, padding: 16,
                    border: '1px solid var(--neutral-100)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <Map size={14} style={{ color: '#10B981' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>Plan de Parque</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 10 }}>
                      {[
                        { l: 'Machos', v: result.plan_parque.reproductores_necesarios?.machos || '—', c: '#3B82F6' },
                        { l: 'Hembras', v: result.plan_parque.reproductores_necesarios?.hembras || '—', c: '#EC4899' },
                        { l: 'Lotes/año', v: result.plan_parque.lotes_anuales || '—', c: '#F59E0B' },
                        { l: 'Capacidad', v: result.plan_parque.capacidad_total || '—', c: '#10B981' },
                      ].map(k => (
                        <div key={k.l} style={{ textAlign: 'center', background: 'var(--neutral-25)', borderRadius: 8, padding: '8px 6px' }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: k.c, fontFamily: 'var(--font-mono)' }}>{k.v}</div>
                          <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>{k.l}</div>
                        </div>
                      ))}
                    </div>
                    {result.plan_parque.calendario && (
                      <div style={{ fontSize: 12, color: 'var(--neutral-600)', lineHeight: 1.5, background: 'var(--neutral-25)', borderRadius: 8, padding: 10 }}>
                        📅 {result.plan_parque.calendario}
                      </div>
                    )}
                  </div>
                )}

                {/* Consanguinity */}
                {result.consanguinidad && (
                  <div style={{
                    background: 'white', borderRadius: 14, padding: 16,
                    border: '1px solid var(--neutral-100)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <Shield size={14} style={{ color: '#6366F1' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>Control de Consanguinidad</span>
                      <span style={{
                        marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                        background: result.consanguinidad.riesgo === 'bajo' ? '#ECFDF5' : result.consanguinidad.riesgo === 'medio' ? '#FEF3C7' : '#FEF2F2',
                        color: result.consanguinidad.riesgo === 'bajo' ? '#059669' : result.consanguinidad.riesgo === 'medio' ? '#D97706' : '#DC2626',
                      }}>
                        Riesgo: {result.consanguinidad.riesgo}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--neutral-600)', marginBottom: 8 }}>
                      Coeficiente estimado: <strong>{result.consanguinidad.coeficiente_estimado}</strong>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--neutral-600)', lineHeight: 1.8 }}>
                      {result.consanguinidad.recomendaciones?.map((r: string, i: number) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Roadmap F1-F5 */}
                {result.roadmap_f1_f5 && result.roadmap_f1_f5.length > 0 && (
                  <div style={{
                    background: 'white', borderRadius: 14, overflow: 'hidden',
                    border: '1px solid var(--neutral-100)',
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--neutral-100)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ArrowRight size={14} style={{ color: '#8B5CF6' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>Roadmap Generacional</span>
                    </div>
                    <div style={{ padding: 16 }}>
                      {/* Pipeline visual */}
                      <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
                        {result.roadmap_f1_f5.map((gen: any, i: number) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                              minWidth: 160, background: `hsl(${260 + i * 20}, 70%, 96%)`,
                              borderRadius: 10, padding: 12,
                              border: `1px solid hsl(${260 + i * 20}, 50%, 80%)`,
                            }}>
                              <div style={{ fontSize: 14, fontWeight: 800, color: `hsl(${260 + i * 20}, 60%, 40%)`, marginBottom: 4 }}>
                                {gen.generacion}
                              </div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-700)', marginBottom: 4 }}>{gen.cruce}</div>
                              <div style={{ fontSize: 10, color: 'var(--neutral-500)', marginBottom: 4 }}>{gen.objetivo}</div>
                              <div style={{ fontSize: 9, color: 'var(--neutral-400)', fontStyle: 'italic' }}>{gen.seleccion}</div>
                            </div>
                            {i < result.roadmap_f1_f5!.length - 1 && (
                              <ChevronRight size={20} style={{ color: 'var(--neutral-300)', flexShrink: 0, margin: '0 4px' }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Nutrition */}
                {result.nutricion_clave && (
                  <div style={{
                    background: '#F0FDF4', borderRadius: 10, padding: 14,
                    border: '1px solid #BBF7D0',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 4 }}>🌾 Nutrición Clave</div>
                    <p style={{ fontSize: 12, color: '#15803D', lineHeight: 1.6, margin: 0 }}>{result.nutricion_clave}</p>
                  </div>
                )}

                {/* Timeline */}
                {result.timeline_meses && result.timeline_meses.length > 0 && (
                  <div style={{
                    background: 'white', borderRadius: 14, padding: 16,
                    border: '1px solid var(--neutral-100)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <Calendar size={14} style={{ color: '#D97706' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>Timeline</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 8 }}>
                      {result.timeline_meses.map((t: any, i: number) => (
                        <div key={i} style={{
                          minWidth: 120, background: 'var(--neutral-25)', borderRadius: 8, padding: 10,
                          borderLeft: '3px solid var(--primary-500)',
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary-600)' }}>Mes {t.mes}</div>
                          <div style={{ fontSize: 11, color: 'var(--neutral-600)', marginTop: 2 }}>{t.accion}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw response (if parse failed) */}
                {result.parse_error && result.raw_response && (
                  <div style={{
                    background: 'var(--neutral-25)', borderRadius: 10, padding: 14,
                    border: '1px solid var(--neutral-200)', fontSize: 12,
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--neutral-700)' }}>Respuesta sin procesar:</div>
                    <pre style={{ whiteSpace: 'pre-wrap', color: 'var(--neutral-600)', maxHeight: 300, overflowY: 'auto' }}>{result.raw_response}</pre>
                  </div>
                )}
              </>
            )}

            {/* ── Seedy Chat panel ── */}
            <div style={{
              background: 'white', borderRadius: 14, padding: 16,
              border: '1px solid var(--neutral-100)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Bot size={14} style={{ color: '#10B981' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>Seedy 🌱 — Chat Genético</span>
              </div>

              {/* Chat history */}
              <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {chatHistory.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--neutral-400)', textAlign: 'center', padding: 12 }}>
                    Pregunta sobre genética avícola, cruces, consanguinidad...
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%', padding: '8px 12px', borderRadius: 10,
                    background: msg.role === 'user' ? 'var(--primary-500)' : 'var(--neutral-50)',
                    color: msg.role === 'user' ? 'white' : 'var(--neutral-700)',
                    fontSize: 12, lineHeight: 1.5,
                  }}>
                    {msg.text}
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--neutral-400)' }}>
                    <Loader2 size={12} className="animate-spin" /> Seedy pensando...
                  </div>
                )}
              </div>

              {/* Chat input */}
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  className="nf-input" value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="¿Qué raza va mejor con Castellana Negra?"
                  style={{ flex: 1 }}
                />
                <button onClick={sendChat} disabled={chatLoading || !chatMsg.trim()} className="nf-btn primary" style={{ padding: '8px 12px' }}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
