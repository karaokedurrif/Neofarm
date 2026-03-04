'use client';

import { useState, useMemo } from 'react';
import {
  FlaskConical, TrendingUp, TrendingDown, Leaf, ShoppingCart,
  Sun, Snowflake, TreePine, Flower2, Zap, AlertTriangle, BarChart3
} from 'lucide-react';

/* ── Types ─────────────────────────────────────────── */
type Tab = 'formulador' | 'mercado' | 'pastos' | 'finition' | 'alternativas' | 'parcela';

interface Fase {
  nombre: string;
  proteina: string;
  energiaKcal: number;
  calcio: string;
  fosforo: string;
  lisina: string;
  metionina: string;
}

interface Ingrediente {
  nombre: string;
  proteina: number;
  energia: number;
  calcio: number;
  fosforo: number;
  precio: number;
  eco: boolean;
  selected?: boolean;
  porcentaje?: number;
}

/* ── Data ──────────────────────────────────────────── */
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
  { cereal: 'Maíz', lonja: 'Lonja de Mercolleida', precio: 0.232, fecha: '2025-03-01', tendencia: '↓' as const, variacion: -2.1 },
  { cereal: 'Trigo', lonja: 'Lonja del Ebro', precio: 0.218, fecha: '2025-03-01', tendencia: '=' as const, variacion: 0.3 },
  { cereal: 'Cebada', lonja: 'Lonja de Mercolleida', precio: 0.195, fecha: '2025-03-01', tendencia: '↑' as const, variacion: 1.8 },
  { cereal: 'Soja (harina)', lonja: 'CBoT referencia', precio: 0.385, fecha: '2025-03-01', tendencia: '↓' as const, variacion: -3.2 },
  { cereal: 'Girasol (harina)', lonja: 'Mercolleida', precio: 0.280, fecha: '2025-03-01', tendencia: '=' as const, variacion: 0.5 },
  { cereal: 'Guisante', lonja: 'Lonja del Ebro', precio: 0.310, fecha: '2025-03-01', tendencia: '↑' as const, variacion: 2.0 },
  { cereal: 'Sorgo', lonja: 'Mercolleida', precio: 0.205, fecha: '2025-03-01', tendencia: '↓' as const, variacion: -1.5 },
];

const MERCADO_POLLO = [
  { producto: 'Pollo ecológico (vivo)', lonja: 'Lonja de Bellpuig', precio: 3.85, unidad: '€/kg vivo', tendencia: '↑' as const },
  { producto: 'Capón (canal)', lonja: 'Ref. Navidad', precio: 18.50, unidad: '€/kg canal', tendencia: '=' as const },
  { producto: 'Pularda (canal)', lonja: 'Ref. gourmet', precio: 14.00, unidad: '€/kg canal', tendencia: '=' as const },
  { producto: 'Picantón (canal)', lonja: 'Ref. rest.', precio: 8.50, unidad: '€/kg canal', tendencia: '↑' as const },
  { producto: 'Gallina vieja (canal)', lonja: 'Ref. caldo', precio: 4.20, unidad: '€/kg canal', tendencia: '=' as const },
  { producto: 'Huevo eco (docena)', lonja: 'Referencia', precio: 4.50, unidad: '€/docena', tendencia: '↑' as const },
];

const PRECIOS_HISTORICO = [
  { mes: 'Oct', maiz: 0.245, trigo: 0.225, cebada: 0.185, soja: 0.410 },
  { mes: 'Nov', maiz: 0.240, trigo: 0.222, cebada: 0.188, soja: 0.400 },
  { mes: 'Dic', maiz: 0.238, trigo: 0.220, cebada: 0.190, soja: 0.395 },
  { mes: 'Ene', maiz: 0.235, trigo: 0.219, cebada: 0.192, soja: 0.390 },
  { mes: 'Feb', maiz: 0.234, trigo: 0.218, cebada: 0.194, soja: 0.388 },
  { mes: 'Mar', maiz: 0.232, trigo: 0.218, cebada: 0.195, soja: 0.385 },
];

const ESTACIONES = [
  {
    nombre: 'Primavera', icon: '🌸', meses: 'Mar-May',
    pasto: 'Abundante', bicheo: 'Alto (insectos, lombrices)',
    reduccionPienso: '25-30%', color: '#10B981',
    detalle: 'Máximo aprovechamiento de pasto verde. Las aves consumen gran cantidad de insectos y vegetación fresca. Reducir pienso proporcionalmente.',
  },
  {
    nombre: 'Verano', icon: '☀️', meses: 'Jun-Ago',
    pasto: 'Seco', bicheo: 'Medio',
    reduccionPienso: '-10-15% (más pienso)', color: '#F59E0B',
    detalle: 'Pasto seco con poco valor nutritivo. Aumentar pienso un 10-15%. Asegurar agua fresca constantemente. Bicheo reduce a media hora matutina.',
  },
  {
    nombre: 'Otoño', icon: '🍂', meses: 'Sep-Nov',
    pasto: 'En recuperación + frutos', bicheo: 'Medio-alto',
    reduccionPienso: '15-20%', color: '#EA580C',
    detalle: 'Pasto en recuperación. Bellotas, castañas y frutos caídos complementan la dieta. Excelente para la fase de acabado de capones.',
  },
  {
    nombre: 'Invierno', icon: '❄️', meses: 'Dic-Feb',
    pasto: 'Mínimo', bicheo: 'Bajo',
    reduccionPienso: '0% (pienso completo)', color: '#3B82F6',
    detalle: 'Pasto mínimo, bicheo escaso. Pienso completo + suplementos vitamínicos. Especialmente importante para ponedoras (mantener calcio alto).',
  },
];

const FINITION_DATA = {
  duracion: '15-30 días',
  recetas: [
    { nombre: 'Tradicional', composicion: '70% harina maíz + 20% suero lácteo + 10% grasa vegetal', costeKg: 0.52 },
    { nombre: 'Eco Premium', composicion: '60% maíz eco molido + 30% suero quesería local + 10% trigo sarraceno', costeKg: 0.48 },
    { nombre: 'Económica', composicion: '65% maíz + 25% suero + 5% aceite girasol + 5% avena', costeKg: 0.38 },
  ],
  condiciones: [
    { param: 'Luz', valor: 'Oscuridad/penumbra', nota: 'Reduce actividad, favorece engrase' },
    { param: 'Espacio', valor: 'Individual o 2-3/épinette', nota: 'Evitar estrés por hacinamiento' },
    { param: 'Temperatura', valor: '15-18°C ideal', nota: 'Sin corrientes de aire' },
    { param: 'Duración', valor: 'Mín. 15 días, ideal 21-28', nota: 'Más tiempo = más infiltración grasa' },
    { param: 'Alimentación', valor: '2-3 tomas/día, ad libitum', nota: 'Siempre agua fresca' },
  ],
  resultado: {
    aumentoPeso: '+20-30%',
    calidadCarne: 'Grasa intramuscular infiltrada',
    valorSin: '15-18 €/kg canal',
    valorCon: '22-28 €/kg canal',
  },
};

const ALTERNATIVAS = [
  {
    nombre: 'Harinas de insectos (BSF)',
    emoji: '🪲',
    proteina: '40-50%', grasa: '30-35%',
    precio: '~1.20 €/kg (crianza propia: ~0.30 €/kg)',
    disponibilidad: 'Alta (criable en granja)',
    eco: '✅ Permitido en ecológico (Reg. UE 2021/1372)',
    ventajas: 'Alta proteína, producible con residuos orgánicos de la granja. Hermetia illucens (mosca soldado negro).',
  },
  {
    nombre: 'Suero lácteo',
    emoji: '🥛',
    proteina: '0.8-1.0%', grasa: '0.3%',
    precio: '~0.05 €/L (o gratis de queserías)',
    disponibilidad: 'Alta en zonas ganaderas',
    eco: '✅ Permitido',
    ventajas: 'Excelente para finition de capones. Lactosa mejora palatabilidad. Proteína de suero de alto valor biológico.',
  },
  {
    nombre: 'Pan duro de panadería',
    emoji: '🍞',
    proteina: '8-10%', grasa: '1-3%',
    precio: '~0.05 €/kg (o gratis)',
    disponibilidad: 'Alta (panaderías locales)',
    eco: '⚠️ Solo si pan ecológico',
    ventajas: 'Alto en energía. Debe secarse y triturarse. Máx 15-20% de la ración.',
  },
  {
    nombre: 'Pulpa de remolacha',
    emoji: '🫒',
    proteina: '8-10%', grasa: '0.5%',
    precio: '~0.12 €/kg',
    disponibilidad: 'Estacional (campaña azucarera)',
    eco: '✅ Permitido (si ecológica)',
    ventajas: 'Buena fuente de fibra fermentable. Mejora tránsito digestivo. Máx 10% de la ración.',
  },
  {
    nombre: 'DDGS (granos destilería)',
    emoji: '🌾',
    proteina: '25-30%', grasa: '8-12%',
    precio: '~0.22 €/kg',
    disponibilidad: 'Media (destilerías)',
    eco: '⚠️ Verificar origen eco',
    ventajas: 'Alta proteína y energía. Buen perfil aminoacídico. Máx 15% en ponedoras, 20% en engorde.',
  },
  {
    nombre: 'Restos de huerta',
    emoji: '🥬',
    proteina: 'Variable (2-8%)', grasa: '<1%',
    precio: 'Gratis (producción propia)',
    disponibilidad: 'Estacional',
    eco: '✅ 100% ecológico',
    ventajas: 'Calabaza, col, remolacha forrajera, lechuga. Complemento vitamínico natural. No sustituye pienso base.',
  },
];

/* ══════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════ */
export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('formulador');
  const [selectedFase, setSelectedFase] = useState(0);
  const [ingredients, setIngredients] = useState<Ingrediente[]>(
    INGREDIENTES_BASE.map((ing, i) => ({
      ...ing,
      selected: i < 6,
      porcentaje: i === 0 ? 40 : i === 1 ? 15 : i === 2 ? 10 : i === 3 ? 20 : i === 4 ? 8 : i === 5 ? 5 : 0,
    }))
  );
  const [capones, setCapones] = useState(12);
  const [diasFinition, setDiasFinition] = useState(21);
  const [recetaIdx, setRecetaIdx] = useState(0);
  const [catRef, setCatRef] = useState('');
  const [catData, setCatData] = useState<any>(null);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState('');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'formulador', label: 'Formulador', icon: '🧪' },
    { id: 'mercado', label: 'Mercado cereales', icon: '📊' },
    { id: 'pastos', label: 'Pastos y bicheo', icon: '🌿' },
    { id: 'finition', label: 'Finition (épinette)', icon: '🍗' },
    { id: 'alternativas', label: 'Alternativas IA', icon: '🤖' },
    { id: 'parcela', label: 'Mi Parcela', icon: '🗺️' },
  ];

  // Formulador calculations
  const selectedIngs = ingredients.filter(i => i.selected && (i.porcentaje || 0) > 0);
  const totalPct = selectedIngs.reduce((s, i) => s + (i.porcentaje || 0), 0);
  const mixProtein = selectedIngs.reduce((s, i) => s + i.proteina * (i.porcentaje || 0) / 100, 0);
  const mixEnergia = selectedIngs.reduce((s, i) => s + i.energia * (i.porcentaje || 0) / 100, 0);
  const mixCalcio = selectedIngs.reduce((s, i) => s + i.calcio * (i.porcentaje || 0) / 100, 0);
  const mixPrecio = selectedIngs.reduce((s, i) => s + i.precio * (i.porcentaje || 0) / 100, 0);
  const fase = FASES[selectedFase];

  // Finition calculator
  const receta = FINITION_DATA.recetas[recetaIdx];
  const consumoDiarioKg = 0.15; // ~150g/día/capón
  const costeTotal = capones * diasFinition * consumoDiarioKg * receta.costeKg;
  const valorSinFinition = capones * 3.5 * 16.5; // 3.5kg × 16.5€/kg
  const valorConFinition = capones * 4.3 * 25; // 4.3kg × 25€/kg

  return (
    <div className="nf-content" style={{ maxWidth: 1200 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
        <FlaskConical size={24} style={{ display: 'inline', marginRight: 8 }} />
        Nutrición Inteligente
      </h1>
      <p style={{ color: 'var(--neutral-500)', fontSize: 13, marginBottom: 20 }}>
        Formulación de pienso, mercado de cereales, gestión de pastos y acabado de capones.
      </p>

      {/* ── Tabs ──────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto',
        borderBottom: '1px solid var(--neutral-200)', paddingBottom: 0,
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 16px', border: 'none', cursor: 'pointer',
              background: activeTab === t.id ? 'var(--primary-500)22' : 'transparent',
              color: activeTab === t.id ? 'var(--primary-600)' : 'var(--neutral-500)',
              borderBottom: activeTab === t.id ? '2px solid var(--primary-500)' : '2px solid transparent',
              fontWeight: activeTab === t.id ? 700 : 500, fontSize: 13,
              whiteSpace: 'nowrap', borderRadius: '8px 8px 0 0',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
         TAB: FORMULADOR
         ══════════════════════════════════════════════ */}
      {activeTab === 'formulador' && (
        <div>
          {/* Fase selector */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {FASES.map((f, i) => (
              <button
                key={f.nombre}
                onClick={() => setSelectedFase(i)}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', border: 'none',
                  background: selectedFase === i ? 'var(--primary-500)' : 'var(--neutral-800)',
                  color: selectedFase === i ? '#fff' : 'var(--neutral-300)',
                }}
              >
                {f.nombre}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Requirements */}
            <div className="nf-card">
              <div className="nf-card-hd">
                <div className="nf-card-title">Requisitos: {fase.nombre}</div>
              </div>
              <div className="nf-card-pad">
                {[
                  { l: 'Proteína', v: fase.proteina },
                  { l: 'Energía', v: `${fase.energiaKcal} kcal/kg` },
                  { l: 'Calcio', v: fase.calcio },
                  { l: 'Fósforo', v: fase.fosforo },
                  { l: 'Lisina', v: fase.lisina },
                  { l: 'Metionina', v: fase.metionina },
                ].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid var(--neutral-800)' }}>
                    <span style={{ color: 'var(--neutral-400)' }}>{r.l}</span>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mix result */}
            <div className="nf-card">
              <div className="nf-card-hd">
                <div className="nf-card-title">Tu mezcla actual</div>
                <div className="nf-card-meta" style={{ color: totalPct === 100 ? 'var(--ok)' : 'var(--alert)' }}>
                  {totalPct}%{totalPct !== 100 && ' ⚠ debe sumar 100%'}
                </div>
              </div>
              <div className="nf-card-pad">
                {[
                  { l: 'Proteína', v: `${mixProtein.toFixed(1)}%`, ok: mixProtein >= 14 },
                  { l: 'Energía', v: `${Math.round(mixEnergia)} kcal/kg`, ok: mixEnergia >= 2700 },
                  { l: 'Calcio', v: `${mixCalcio.toFixed(2)}%`, ok: mixCalcio >= 0.5 },
                  { l: 'Coste/kg', v: `${mixPrecio.toFixed(3)} €/kg`, ok: true },
                  { l: 'Coste/100kg', v: `${(mixPrecio * 100).toFixed(1)} €`, ok: true },
                ].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid var(--neutral-800)' }}>
                    <span style={{ color: 'var(--neutral-400)' }}>{r.l}</span>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: r.ok ? 'var(--ok)' : 'var(--alert)' }}>{r.v}</span>
                  </div>
                ))}

                {/* Nutrient radar (simple bar chart) */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--neutral-500)', marginBottom: 8 }}>Perfil nutricional (% del objetivo)</div>
                  {[
                    { l: 'Proteína', pct: Math.min((mixProtein / 18) * 100, 100) },
                    { l: 'Energía', pct: Math.min((mixEnergia / fase.energiaKcal) * 100, 100) },
                  ].map(b => (
                    <div key={b.l} style={{ marginBottom: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                        <span>{b.l}</span><span>{b.pct.toFixed(0)}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--neutral-700)', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${b.pct}%`, background: b.pct >= 90 ? 'var(--ok)' : b.pct >= 70 ? '#F59E0B' : 'var(--alert)', borderRadius: 3, transition: 'width .3s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients table */}
          <div className="nf-card" style={{ marginTop: 16 }}>
            <div className="nf-card-hd">
              <div className="nf-card-title">Ingredientes disponibles</div>
              <div className="nf-card-meta">Marca los que tienes y ajusta porcentajes</div>
            </div>
            <div style={{ overflow: 'auto' }}>
              <table className="nf-table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>Usar</th>
                    <th>Ingrediente</th>
                    <th>%</th>
                    <th>Proteína</th>
                    <th>Energía</th>
                    <th>Ca</th>
                    <th>P</th>
                    <th>€/kg</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing, i) => (
                    <tr key={ing.nombre} style={{ opacity: ing.selected ? 1 : 0.5 }}>
                      <td>
                        <input type="checkbox" checked={ing.selected || false}
                          onChange={e => {
                            const copy = [...ingredients];
                            copy[i] = { ...copy[i], selected: e.target.checked };
                            setIngredients(copy);
                          }} />
                      </td>
                      <td style={{ fontWeight: 600 }}>{ing.eco ? '🌿 ' : ''}{ing.nombre}</td>
                      <td>
                        <input
                          type="number" min={0} max={100} value={ing.porcentaje || 0}
                          disabled={!ing.selected}
                          onChange={e => {
                            const copy = [...ingredients];
                            copy[i] = { ...copy[i], porcentaje: parseInt(e.target.value) || 0 };
                            setIngredients(copy);
                          }}
                          className="nf-input" style={{ width: 55, padding: '2px 6px', textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{ing.proteina}%</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{ing.energia}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{ing.calcio}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{ing.fosforo}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-400)' }}>{ing.precio.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
         TAB: MERCADO
         ══════════════════════════════════════════════ */}
      {activeTab === 'mercado' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {/* Cereals */}
            <div className="nf-card">
              <div className="nf-card-hd">
                <div className="nf-card-title">🌾 Lonjas de Cereales</div>
                <div className="nf-card-meta">Precios indicativos</div>
              </div>
              <div style={{ overflow: 'auto' }}>
                <table className="nf-table" style={{ fontSize: 12 }}>
                  <thead>
                    <tr><th>Cereal</th><th>Lonja</th><th>€/kg</th><th>Var.</th></tr>
                  </thead>
                  <tbody>
                    {MERCADO_CEREALES.map(m => (
                      <tr key={m.cereal}>
                        <td style={{ fontWeight: 600 }}>{m.cereal}</td>
                        <td style={{ fontSize: 11, color: 'var(--neutral-400)' }}>{m.lonja}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{m.precio.toFixed(3)}</td>
                        <td style={{
                          fontWeight: 600, fontFamily: 'var(--font-mono)',
                          color: m.variacion > 0 ? 'var(--alert)' : m.variacion < 0 ? 'var(--ok)' : 'var(--neutral-400)',
                        }}>
                          {m.tendencia} {m.variacion > 0 ? '+' : ''}{m.variacion}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pollo/productos */}
            <div className="nf-card">
              <div className="nf-card-hd">
                <div className="nf-card-title">🐔 Mercado Avícola</div>
                <div className="nf-card-meta">Precios de venta referencia</div>
              </div>
              <div style={{ overflow: 'auto' }}>
                <table className="nf-table" style={{ fontSize: 12 }}>
                  <thead>
                    <tr><th>Producto</th><th>Precio</th><th>Tend.</th></tr>
                  </thead>
                  <tbody>
                    {MERCADO_POLLO.map(m => (
                      <tr key={m.producto}>
                        <td style={{ fontWeight: 600 }}>{m.producto}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {m.precio.toFixed(2)} <span style={{ fontSize: 10, color: 'var(--neutral-500)' }}>{m.unidad}</span>
                        </td>
                        <td style={{
                          color: m.tendencia === '↑' ? 'var(--ok)' : 'var(--neutral-400)',
                          fontWeight: 600,
                        }}>{m.tendencia}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Price chart */}
          <div className="nf-card">
            <div className="nf-card-hd">
              <div className="nf-card-title">📈 Evolución precios (últimos 6 meses)</div>
            </div>
            <div className="nf-card-pad">
              <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-around', height: 140, gap: 4 }}>
                {PRECIOS_HISTORICO.map(p => (
                  <div key={p.mes} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 }}>
                    <div style={{ display: 'flex', gap: 2, alignItems: 'end' }}>
                      {[
                        { v: p.maiz, c: '#F59E0B', l: 'Maíz' },
                        { v: p.trigo, c: '#3B82F6', l: 'Trigo' },
                        { v: p.cebada, c: '#10B981', l: 'Cebada' },
                      ].map(b => (
                        <div key={b.l} title={`${b.l}: ${b.v} €/kg`} style={{
                          width: 12, minHeight: 4, height: b.v * 400,
                          background: b.c, borderRadius: '2px 2px 0 0',
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--neutral-500)', marginTop: 4 }}>{p.mes}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10 }}>
                {[
                  { c: '#F59E0B', l: 'Maíz' },
                  { c: '#3B82F6', l: 'Trigo' },
                  { c: '#10B981', l: 'Cebada' },
                ].map(b => (
                  <div key={b.l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--neutral-400)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: b.c }} />
                    {b.l}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
         TAB: PASTOS
         ══════════════════════════════════════════════ */}
      {activeTab === 'pastos' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px,1fr))', gap: 12, marginBottom: 20 }}>
            {ESTACIONES.map(e => (
              <div key={e.nombre} className="nf-card" style={{ borderTop: `3px solid ${e.color}` }}>
                <div className="nf-card-pad">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{e.icon} {e.nombre}</div>
                    <span style={{ fontSize: 11, color: 'var(--neutral-400)' }}>{e.meses}</span>
                  </div>
                  {[
                    { l: 'Pasto', v: e.pasto },
                    { l: 'Bicheo', v: e.bicheo },
                    { l: 'Ajuste pienso', v: e.reduccionPienso },
                  ].map(r => (
                    <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, borderBottom: '1px solid var(--neutral-800)' }}>
                      <span style={{ color: 'var(--neutral-400)' }}>{r.l}</span>
                      <span style={{ fontWeight: 600, color: e.color }}>{r.v}</span>
                    </div>
                  ))}
                  <p style={{ fontSize: 11, color: 'var(--neutral-400)', marginTop: 8, lineHeight: 1.5 }}>
                    {e.detalle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Breed foraging table */}
          <div className="nf-card">
            <div className="nf-card-hd">
              <div className="nf-card-title">🐔 Aprovechamiento de pasto por raza</div>
            </div>
            <div style={{ overflow: 'auto' }}>
              <table className="nf-table" style={{ fontSize: 12 }}>
                <thead>
                  <tr><th>Raza</th><th>Forrajeo</th><th>Reducción pienso</th><th>Nota</th></tr>
                </thead>
                <tbody>
                  {[
                    { raza: 'Castellana Negra', forrajeo: '↑↑↑', red: '25-30%', nota: 'Excelente forrajeadora, muy rústica' },
                    { raza: 'Plymouth Rock', forrajeo: '↑↑', red: '15-20%', nota: 'Buen forrajeo pero más sedentaria' },
                    { raza: 'Prat Leonada', forrajeo: '↑↑↑', red: '25-30%', nota: 'Muy activa, excelente en extensivo' },
                    { raza: 'Empordanesa', forrajeo: '↑↑↑', red: '25-35%', nota: 'Raza rústica autóctona, máximo aprovechamiento' },
                    { raza: 'Mos (Galicia)', forrajeo: '↑↑↑', red: '25-30%', nota: 'Adaptada a clima húmedo, gran forrajeadora' },
                    { raza: 'Sulmtaler', forrajeo: '↑↑↑', red: '20-30%', nota: 'Alto aprovechamiento pasto, reduce pienso significativamente' },
                  ].map(r => (
                    <tr key={r.raza}>
                      <td style={{ fontWeight: 600 }}>{r.raza}</td>
                      <td style={{ color: 'var(--ok)', fontWeight: 700 }}>{r.forrajeo}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.red}</td>
                      <td style={{ color: 'var(--neutral-400)' }}>{r.nota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
         TAB: FINITION
         ══════════════════════════════════════════════ */}
      {activeTab === 'finition' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {/* Process */}
            <div className="nf-card">
              <div className="nf-card-hd">
                <div className="nf-card-title">🍗 Proceso Épinette</div>
                <div className="nf-card-meta">Acabado tradicional francés</div>
              </div>
              <div className="nf-card-pad">
                <p style={{ fontSize: 13, color: 'var(--neutral-600)', lineHeight: 1.6, marginBottom: 12 }}>
                  La <strong>épinette</strong> es la técnica francesa de acabado de capones en jaula con penumbra
                  y alimentación rica durante los últimos 15-30 días antes del sacrificio.
                  Produce carne con grasa intramuscular infiltrada, más tierna y jugosa.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {FINITION_DATA.condiciones.map(c => (
                    <div key={c.param} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 10px', background: 'var(--neutral-50)', borderRadius: 8, fontSize: 12,
                    }}>
                      <div>
                        <span style={{ fontWeight: 700 }}>{c.param}:</span>{' '}
                        <span style={{ color: 'var(--primary-400)' }}>{c.valor}</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--neutral-500)' }}>{c.nota}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="nf-card">
              <div className="nf-card-hd">
                <div className="nf-card-title">📊 Resultado esperado</div>
              </div>
              <div className="nf-card-pad">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {[
                    { l: 'Aumento peso', v: FINITION_DATA.resultado.aumentoPeso, c: 'var(--ok)' },
                    { l: 'Calidad', v: FINITION_DATA.resultado.calidadCarne, c: 'var(--primary-400)' },
                    { l: 'Sin acabado', v: FINITION_DATA.resultado.valorSin, c: 'var(--neutral-400)' },
                    { l: 'Con épinette', v: FINITION_DATA.resultado.valorCon, c: '#F59E0B' },
                  ].map(r => (
                    <div key={r.l} style={{ background: 'var(--neutral-50)', borderRadius: 8, padding: 10 }}>
                      <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>{r.l}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: r.c }}>{r.v}</div>
                    </div>
                  ))}
                </div>

                {/* Recetas */}
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Recetas de pienso finition</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {FINITION_DATA.recetas.map((r, i) => (
                    <div
                      key={r.nombre}
                      onClick={() => setRecetaIdx(i)}
                      style={{
                        padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                        background: recetaIdx === i ? 'var(--primary-500)15' : 'var(--neutral-800)',
                        border: `1px solid ${recetaIdx === i ? 'var(--primary-500)' : 'var(--neutral-700)'}`,
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>
                        {r.nombre} — <span style={{ color: 'var(--primary-400)', fontFamily: 'var(--font-mono)' }}>{r.costeKg.toFixed(2)} €/kg</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--neutral-400)' }}>{r.composicion}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cost calculator */}
          <div className="nf-card">
            <div className="nf-card-hd">
              <div className="nf-card-title">🧮 Calculadora de costes finition</div>
            </div>
            <div className="nf-card-pad">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16, alignItems: 'start' }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--neutral-400)' }}>Nº capones</label>
                  <input type="number" value={capones} min={1} max={100}
                    onChange={e => setCapones(parseInt(e.target.value) || 1)}
                    className="nf-input" style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--neutral-400)' }}>Días finition</label>
                  <input type="number" value={diasFinition} min={10} max={45}
                    onChange={e => setDiasFinition(parseInt(e.target.value) || 21)}
                    className="nf-input" style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div style={{ background: 'var(--neutral-50)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>Coste total</div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--alert)', fontFamily: 'var(--font-mono)' }}>
                      {costeTotal.toFixed(0)}€
                    </div>
                  </div>
                  <div style={{ background: 'var(--neutral-50)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>Valor sin</div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--neutral-400)', fontFamily: 'var(--font-mono)' }}>
                      {valorSinFinition.toFixed(0)}€
                    </div>
                  </div>
                  <div style={{ background: 'var(--neutral-50)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>Valor con</div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
                      {valorConFinition.toFixed(0)}€
                    </div>
                  </div>
                </div>
              </div>
              <div style={{
                marginTop: 12, padding: 12, borderRadius: 10,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                fontSize: 13,
              }}>
                💰 <strong>ROI épinette:</strong> Inviertes <strong>{costeTotal.toFixed(0)}€</strong> y obtienes <strong>+{(valorConFinition - valorSinFinition).toFixed(0)}€</strong> de valor adicional.
                Retorno: <strong style={{ color: 'var(--ok)' }}>×{((valorConFinition - valorSinFinition) / costeTotal).toFixed(1)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
         TAB: ALTERNATIVAS IA
         ══════════════════════════════════════════════ */}
      {activeTab === 'alternativas' && (
        <div>
          <div className="nf-card" style={{ marginBottom: 16, background: 'rgba(139,92,246,0.06)' }}>
            <div className="nf-card-pad">
              <div style={{ display: 'flex', gap: 10, alignItems: 'start' }}>
                <span style={{ fontSize: 20 }}>🤖</span>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                  <strong>Seedy IA recomienda:</strong> Para una granja ecológica de capones en Segovia,
                  los subproductos locales pueden reducir el coste de alimentación un 15-25%
                  sin comprometer la calidad ni la certificación ecológica.
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: 12 }}>
            {ALTERNATIVAS.map(alt => (
              <div key={alt.nombre} className="nf-card">
                <div className="nf-card-pad">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 28 }}>{alt.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{alt.nombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--neutral-400)' }}>{alt.eco}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                    {[
                      { l: 'Proteína', v: alt.proteina },
                      { l: 'Precio', v: alt.precio },
                      { l: 'Disponibilidad', v: alt.disponibilidad },
                    ].map(r => (
                      <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
                        <span style={{ color: 'var(--neutral-400)' }}>{r.l}</span>
                        <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--neutral-600)', lineHeight: 1.5, margin: 0, padding: '8px 0 0', borderTop: '1px solid var(--neutral-200)' }}>
                    {alt.ventajas}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
         TAB: MI PARCELA (CATASTRO)
         ══════════════════════════════════════════════ */}
      {activeTab === 'parcela' && (
        <div>
          <div className="nf-card">
            <div className="nf-card-hd">
              <div className="nf-card-title">🗺️ Mi Parcela — Catastro</div>
              <div className="nf-card-meta">Introduce tu referencia catastral para estimar disponibilidad de pasto</div>
            </div>
            <div className="nf-card-pad">
              <div style={{ display: 'flex', gap: 10, alignItems: 'end', marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-600)', display: 'block', marginBottom: 4 }}>
                    Referencia Catastral
                  </label>
                  <input
                    className="nf-input"
                    value={catRef}
                    onChange={e => setCatRef(e.target.value)}
                    placeholder="Ej: 29900A01200039"
                    style={{ width: '100%' }}
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!catRef || catRef.length < 14) { setCatError('Mínimo 14 caracteres'); return; }
                    setCatLoading(true); setCatError('');
                    try {
                      const res = await fetch(`/api/catastro?rc=${encodeURIComponent(catRef)}`);
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || 'Error al consultar catastro');
                      setCatData(data);
                    } catch (e: any) {
                      setCatError(e.message || 'Error al consultar catastro');
                    }
                    setCatLoading(false);
                  }}
                  className="nf-btn primary"
                  disabled={catLoading}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {catLoading ? '⏳ Consultando...' : '🔍 Consultar'}
                </button>
              </div>

              {catError && (
                <div style={{ padding: '8px 12px', borderRadius: 8, background: '#FEE2E2', color: '#DC2626', fontSize: 12, marginBottom: 16 }}>
                  {catError}
                </div>
              )}

              {catData && (
                <div>
                  {/* Map */}
                  <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 16, border: '1px solid var(--neutral-200)' }}>
                    <img
                      src={catData.wms}
                      alt="Catastro WMS"
                      style={{ width: '100%', height: 250, objectFit: 'cover' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>

                  {/* Data grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
                    {[
                      { l: 'Coordenadas', v: `${catData.lat.toFixed(5)}, ${catData.lon.toFixed(5)}` },
                      { l: 'Superficie', v: catData.superficie_m2 > 10000 ? `${(catData.superficie_m2/10000).toFixed(2)} ha` : `${catData.superficie_m2.toLocaleString()} m²` },
                      { l: 'Provincia', v: catData.provincia },
                      { l: 'Municipio', v: catData.municipio },
                    ].map(r => (
                      <div key={r.l} style={{ background: 'var(--neutral-50)', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 10, color: 'var(--neutral-400)' }}>{r.l}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>{r.v}</div>
                      </div>
                    ))}
                  </div>

                  {catData.descripcion && (
                    <div style={{ fontSize: 12, color: 'var(--neutral-600)', marginBottom: 16 }}>
                      <strong>Descripción:</strong> {catData.descripcion}
                    </div>
                  )}

                  {/* Pasture estimation */}
                  <div style={{
                    background: '#ECFDF5', borderRadius: 10, padding: 16,
                    border: '1px solid #10B98133',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#10B981', marginBottom: 10 }}>
                      🌿 Estimación de pasto disponible
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {(() => {
                        const ha = catData.superficie_m2 / 10000;
                        const pastoKgHaSeason = { primavera: 2500, verano: 800, otoño: 1500, invierno: 500 };
                        const season = new Date().getMonth() < 3 || new Date().getMonth() > 10 ? 'invierno' : new Date().getMonth() < 6 ? 'primavera' : new Date().getMonth() < 9 ? 'verano' : 'otoño';
                        const pastoKg = ha * pastoKgHaSeason[season];
                        const avesCapacidad = Math.floor(ha * 1000); // ~1000 aves/ha camperas
                        return [
                          { l: 'Hectáreas', v: ha.toFixed(2) },
                          { l: 'Estación actual', v: season.charAt(0).toUpperCase() + season.slice(1) },
                          { l: 'Pasto estimado', v: `${pastoKg.toFixed(0)} kg MS` },
                          { l: 'Capacidad', v: `~${avesCapacidad} aves camperas` },
                        ].map(r => (
                          <div key={r.l}>
                            <div style={{ fontSize: 10, color: '#16A34A' }}>{r.l}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#15803D', fontFamily: 'var(--font-mono)' }}>{r.v}</div>
                          </div>
                        ));
                      })()}
                    </div>
                    <div style={{ fontSize: 11, color: '#16A34A', marginTop: 10, lineHeight: 1.5 }}>
                      ℹ️ Estimaciones basadas en producción media de materia seca por estación en clima mediterráneo.
                      La capacidad ganadera depende del sistema de rotación de parcelas.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
