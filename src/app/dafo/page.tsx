'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LangProvider, useLang } from '@/config/LangContext';

/* ─── Types ─── */
type Species = 'bovine' | 'porcine' | 'poultry';

interface FarmData {
  species: Species | '';
  modelo: string;
  ccaa: string;
  numNaves: number;
  numAnimales: number;
  numEmpleados: number;
  facturacion: number;
  costePienso: number;
  margenNeto: number;
  ic: number;
  mortalidad: number;
  diasSacrificio: number;
  techLevel: number;
  tieneSensores: boolean;
  tieneCamaras: boolean;
  gestionDigital: string;
  modeloPurines: string;
  quiereValorar: boolean;
}

interface ModuloRecomendado {
  nombre: string;
  descripcion: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  roi: string;
  inversionIoT: string;
  ahorroAnual: string;
  implementacion: string;
}

interface DAFOReport {
  healthScore: number;
  aiScore: number;
  savingsLow: number;
  savingsHigh: number;
  fortalezas: string[];
  debilidades: string[];
  oportunidades: string[];
  amenazas: string[];
  mejoras: string[];
  modulosRecomendados: ModuloRecomendado[];
  timeline: string[];
  valoracionEstimada?: { low: number; high: number; metodo: string };
  detailLevel: string;
  dataPoints: number;
}

/* ─── Constants ─── */
const SPECIES_MAP: { value: Species; es: string; en: string; emoji: string; color: string }[] = [
  { value: 'bovine',  es: 'Vacuno',      en: 'Cattle',  emoji: '\u{1F404}', color: '#3D7A5F' },
  { value: 'porcine', es: 'Porcino',     en: 'Swine',   emoji: '\u{1F416}', color: '#3B6B82' },
  { value: 'poultry', es: 'Avicultura',  en: 'Poultry', emoji: '\u{1F414}', color: '#B07D2B' },
];

const CCAA_OPTIONS = [
  'Castilla y Leon', 'Aragon', 'Cataluna', 'Andalucia', 'Galicia',
  'Extremadura', 'Castilla-La Mancha', 'Navarra', 'Murcia', 'Otra'
];

const MODELO_BOVINE = ['Extensivo carne (dehesa)', 'Extensivo leche', 'Intensivo carne (feedlot)', 'Intensivo leche'];
const MODELO_PORCINE = ['Intensivo cebo', 'Ciclo cerrado', 'Multiplicacion', 'Extensivo (iberico montanera)'];
const MODELO_POULTRY = ['Ponedoras jaula', 'Ponedoras suelo/camperas', 'Broilers intensivo', 'Ecologico'];

const STEPS = [
  { id: 'welcome',    es: 'Diagnostico',           en: 'Diagnosis' },
  { id: 'species',    es: 'Tipo de Explotacion',    en: 'Operation Type' },
  { id: 'basics',     es: 'Datos Basicos',          en: 'Basic Data' },
  { id: 'financials', es: 'Financiero',             en: 'Financials' },
  { id: 'operations', es: 'Operaciones',            en: 'Operations' },
  { id: 'tech',       es: 'Tecnologia',             en: 'Technology' },
  { id: 'market',     es: 'Mercado',                en: 'Market' },
  { id: 'report',     es: 'Tu Informe DAFO',        en: 'Your SWOT Report' },
];

/* ─── Mock report generator ─── */
function generateMockReport(fd: FarmData): DAFOReport {
  const isPorcine = fd.species === 'porcine';
  const isPoultry = fd.species === 'poultry';
  const base = fd.facturacion || 500000;

  const speciesModules: ModuloRecomendado[] = isPorcine ? [
    { nombre: 'IoT Barn Manager', descripcion: 'Sensores T/HR/NH3/CO2 con alertas tiempo real', prioridad: 'Alta', roi: '8-14 meses', inversionIoT: '4.500 - 8.000 EUR', ahorroAnual: '8.000 - 12.000 EUR', implementacion: '2-3 semanas' },
    { nombre: 'SIGE Digital', descripcion: 'Cumplimiento normativo 11 planes obligatorios', prioridad: 'Alta', roi: 'Inmediato', inversionIoT: '0 EUR (software)', ahorroAnual: 'Evita sanciones', implementacion: '1 semana' },
    { nombre: 'SmartPurin Pro', descripcion: 'Gestion purines, nitrogeno, valorizacion biogas', prioridad: 'Media', roi: '12-18 meses', inversionIoT: '2.000 - 5.000 EUR', ahorroAnual: '3.000 - 6.000 EUR', implementacion: '1 semana' },
  ] : isPoultry ? [
    { nombre: 'IoT Climate Control', descripcion: 'Sensores T/HR/CO2/luz con automatizacion', prioridad: 'Alta', roi: '6-10 meses', inversionIoT: '3.500 - 7.000 EUR', ahorroAnual: '6.000 - 10.000 EUR', implementacion: '2 semanas' },
    { nombre: 'Produccion Huevos', descripcion: 'Tracking puesta, clasificacion automatica, calidad', prioridad: 'Alta', roi: '4-8 meses', inversionIoT: '1.500 - 4.000 EUR', ahorroAnual: '5.000 - 9.000 EUR', implementacion: '1-2 semanas' },
    { nombre: 'Energia Smart', descripcion: 'Monitorizacion consumo, optimizacion solar', prioridad: 'Media', roi: '18-24 meses', inversionIoT: '2.000 - 6.000 EUR', ahorroAnual: '2.500 - 5.000 EUR', implementacion: '2-3 semanas' },
  ] : [
    { nombre: 'GeoTwin NDVI', descripcion: 'Gemelo digital parcelas con indice vegetacion', prioridad: 'Alta', roi: '6-12 meses', inversionIoT: '0 EUR (satelital)', ahorroAnual: '5.000 - 10.000 EUR', implementacion: '1 semana' },
    { nombre: 'GPS Collars + Geofencing', descripcion: 'Localizacion ganado, alertas automaticas', prioridad: 'Alta', roi: '8-14 meses', inversionIoT: '3.000 - 8.000 EUR', ahorroAnual: '4.000 - 8.000 EUR', implementacion: '1 semana' },
    { nombre: 'Genetica Predictiva', descripcion: 'EPDs, apareamientos optimos, valor genetico', prioridad: 'Media', roi: '12-24 meses', inversionIoT: '1.000 - 3.000 EUR', ahorroAnual: '6.000 - 15.000 EUR', implementacion: '2 semanas' },
  ];

  return {
    healthScore: Math.min(95, Math.max(30, 65 + (fd.margenNeto - 8) * 3)),
    aiScore: fd.techLevel * 10 + (fd.tieneSensores ? 10 : 0) + (fd.tieneCamaras ? 10 : 0),
    savingsLow: Math.round(base * 0.03),
    savingsHigh: Math.round(base * 0.08),
    fortalezas: [
      fd.numAnimales > 200 ? 'Tamano de explotacion competitivo para economias de escala' : 'Explotacion manejable, ideal para gestion de calidad',
      fd.margenNeto > 6 ? 'Margen neto superior a la media del sector' : 'Estructura de costes optimizable con alto potencial',
      'Localizacion en ' + (fd.ccaa || 'zona estrategica') + ' con acceso a mercados',
    ],
    debilidades: [
      fd.techLevel < 5 ? 'Baja digitalizacion (nivel ' + fd.techLevel + '/10)' : 'Digitalizacion parcial sin integracion completa',
      !fd.tieneSensores ? 'Ausencia de sensores ambientales' : 'Sensores sin conectividad centralizada',
      fd.gestionDigital === 'papel' || fd.gestionDigital === 'excel' ? 'Gestion manual sin automatizacion' : 'Software de gestion fragmentado',
    ],
    oportunidades: [
      'Digitalizacion con IoT Hub NeoFarm reduciria mortalidad ~1.2%',
      isPorcine ? 'Prediccion precios cerealistas optimizaria compras pienso' : isPoultry ? 'Automatizacion climatica reduciria mortalidad y mejoraria puesta' : 'Pastoreo inteligente con GPS reduciria mano de obra ~20%',
      'Subvenciones disponibles PERTE Agro (hasta 200k EUR)',
      'Creditos de carbono MRV - ingresos adicionales 2.000-8.000 EUR/ano',
    ],
    amenazas: [
      'Competencia creciente con explotaciones digitalizadas',
      'Volatilidad precios materias primas (+30% en 2 anos)',
      'Exigencias PAC 2027 y bienestar animal',
      isPorcine ? 'Regulacion purines cada vez mas estricta' : isPoultry ? 'Presion consumidor huevos libres de jaula' : 'Sequias recurrentes afectando pastos',
    ],
    mejoras: [
      'Implementar sensores IoT en ' + fd.numNaves + ' nave(s) - ahorro ' + Math.round(fd.numNaves * 4000) + '-' + Math.round(fd.numNaves * 7000) + ' EUR/ano',
      'Plataforma NeoFarm integrada - eficiencia operativa +15-20%',
      'Solicitar ayudas PERTE digitalizacion (match estimado 75-90%)',
      isPorcine ? 'Conectar con planta biogas - ingresos extra 2-4k EUR/ano' : isPoultry ? 'Automatizar clasificacion huevos - +12% productividad' : 'Activar modulo genetica predictiva - +8% valor rebano',
    ],
    modulosRecomendados: speciesModules,
    timeline: [
      'Mes 1-2: Implementar modulos de cumplimiento normativo',
      'Mes 2-3: Instalar IoT basico (sensores ambientales)',
      'Mes 3-4: Capacitacion equipo en plataforma NeoFarm',
      'Mes 4-6: Activar modulos avanzados (genetica, carbono)',
      'Mes 6-12: Optimizacion y scaling basado en datos reales',
      'Ano 2: ROI completo y evaluacion nuevos modulos',
    ],
    valoracionEstimada: fd.quiereValorar ? {
      low: Math.round(base * 2.5),
      high: Math.round(base * 3.8),
      metodo: 'Multiplo EBITDA sector ' + (isPorcine ? 'porcino' : isPoultry ? 'avicola' : 'vacuno') + ' 2.5-3.8x'
    } : undefined,
    detailLevel: 'intermedio',
    dataPoints: 18,
  };
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function DAFOInner() {
  const { lang, setLang } = useLang();
  const isEs = lang === 'es';

  const [currentStep, setCurrentStep] = useState(0);
  const [farmData, setFarmData] = useState<FarmData>({
    species: '',
    modelo: '',
    ccaa: '',
    numNaves: 1,
    numAnimales: 0,
    numEmpleados: 1,
    facturacion: 0,
    costePienso: 65,
    margenNeto: 8,
    ic: 2.8,
    mortalidad: 4,
    diasSacrificio: 180,
    techLevel: 3,
    tieneSensores: false,
    tieneCamaras: false,
    gestionDigital: 'excel',
    modeloPurines: '',
    quiereValorar: false,
  });
  const [report, setReport] = useState<DAFOReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('neofarm_setup');
        if (saved) {
          const d = JSON.parse(saved);
          if (d.vertical) {
            const specMap: Record<string, Species> = { vacuno: 'bovine', porcino: 'porcine', avicultura: 'poultry' };
            setFarmData(prev => ({
              ...prev,
              species: specMap[d.vertical] || prev.species,
              numAnimales: d.headCount || prev.numAnimales,
            }));
          }
        }
      } catch (_e) { /* ignore */ }
    }
  }, []);

  const updateData = (field: keyof FarmData, value: string | number | boolean) => {
    setFarmData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => { if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const doGenerateReport = () => {
    setLoading(true);
    setCurrentStep(STEPS.length - 1);
    setTimeout(() => {
      setReport(generateMockReport(farmData));
      setLoading(false);
    }, 2200);
  };

  const speciesInfo = SPECIES_MAP.find(s => s.value === farmData.species);
  const accent = speciesInfo?.color ?? '#14B8A6';

  const inputCls = "w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[var(--t1)] placeholder:text-[var(--t3)]/50 focus:outline-none transition-all font-body";

  const Glass = ({ children, cls }: { children: React.ReactNode; cls?: string }) => (
    <div className={'rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-6 ' + (cls || '')}>{children}</div>
  );

  /* ─── STEPS ─── */
  const renderStep = () => {
    const stepId = STEPS[currentStep].id;

    if (stepId === 'welcome') return (
      <div className="text-center space-y-8 py-8">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-2"
          style={{ background: accent + '20' }}>
          <span className="text-4xl">{'\u{1F4CA}'}</span>
        </motion.div>
        <h2 className="text-4xl font-heading font-bold text-[var(--t1)]">
          {isEs ? 'Diagnostico Inteligente NeoFarm' : 'NeoFarm Smart Diagnosis'}
        </h2>
        <p className="text-lg text-[var(--t3)] max-w-2xl mx-auto">
          {isEs
            ? 'Responde 6 pantallas de preguntas y recibe un analisis DAFO personalizado con recomendaciones de modulos NeoFarm.'
            : 'Answer 6 screens of questions and receive a personalized SWOT analysis with NeoFarm module recommendations.'}
        </p>
        <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto mt-6">
          {[
            { emoji: '\u{1F4C8}', es: 'Score Salud Financiera', en: 'Financial Health Score', sub: isEs ? 'Analisis 0-100' : 'Analysis 0-100' },
            { emoji: '\u{1F916}', es: 'Preparacion IA', en: 'AI Readiness', sub: isEs ? 'Nivel digitalizacion' : 'Digitalization level' },
            { emoji: '\u{1F3AF}', es: 'Plan de Mejoras', en: 'Improvement Plan', sub: isEs ? 'Priorizado y cuantificado' : 'Prioritized & quantified' },
            { emoji: '\u{1F4B0}', es: 'Ahorro Estimado', en: 'Estimated Savings', sub: isEs ? 'Con NeoFarm' : 'With NeoFarm' },
          ].map((card, i) => (
            <Glass key={i}>
              <span className="text-2xl">{card.emoji}</span>
              <div className="text-base font-semibold text-[var(--t1)] mt-2">{isEs ? card.es : card.en}</div>
              <div className="text-xs text-[var(--t3)] mt-1">{card.sub}</div>
            </Glass>
          ))}
        </div>
        <button onClick={nextStep}
          className="mt-6 px-8 py-4 rounded-xl font-semibold text-lg text-white transition"
          style={{ background: accent }}>
          {isEs ? 'Comenzar Diagnostico' : 'Start Diagnosis'} {'\u2192'}
        </button>
      </div>
    );

    if (stepId === 'species') return (
      <div className="space-y-6">
        <h2 className="text-3xl font-heading font-bold text-[var(--t1)]">
          {isEs ? 'Tipo de Explotacion' : 'Operation Type'}
        </h2>
        <p className="text-[var(--t3)]">{isEs ? 'Selecciona la especie principal' : 'Select the primary species'}</p>
        <div className="grid grid-cols-3 gap-5 mt-6">
          {SPECIES_MAP.map(sp => (
            <button key={sp.value} onClick={() => updateData('species', sp.value)}
              className="relative p-8 rounded-xl border-2 transition-all text-center"
              style={{
                borderColor: farmData.species === sp.value ? sp.color : 'rgba(255,255,255,0.06)',
                background: farmData.species === sp.value ? sp.color + '15' : 'rgba(255,255,255,0.02)',
              }}>
              <div className="text-5xl mb-3">{sp.emoji}</div>
              <div className="text-xl font-bold text-[var(--t1)]">{isEs ? sp.es : sp.en}</div>
              {farmData.species === sp.value && (
                <span className="absolute top-3 right-3 text-lg" style={{ color: sp.color }}>{'\u2713'}</span>
              )}
            </button>
          ))}
        </div>
        {farmData.species && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">
              {isEs ? 'Modelo productivo' : 'Production model'}
            </label>
            <select value={farmData.modelo} onChange={e => updateData('modelo', e.target.value)}
              className={inputCls} style={{ borderColor: farmData.modelo ? accent + '40' : undefined }}>
              <option value="">{isEs ? 'Selecciona modelo...' : 'Select model...'}</option>
              {(farmData.species === 'bovine' ? MODELO_BOVINE : farmData.species === 'porcine' ? MODELO_PORCINE : MODELO_POULTRY)
                .map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </motion.div>
        )}
      </div>
    );

    if (stepId === 'basics') return (
      <div className="space-y-6">
        <h2 className="text-3xl font-heading font-bold text-[var(--t1)]">
          {isEs ? 'Datos Basicos' : 'Basic Data'}
        </h2>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">{isEs ? 'Comunidad Autonoma' : 'Region'}</label>
            <select value={farmData.ccaa} onChange={e => updateData('ccaa', e.target.value)} className={inputCls}>
              <option value="">{isEs ? 'Selecciona...' : 'Select...'}</option>
              {CCAA_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">{isEs ? 'N. naves / instalaciones' : 'Number of barns'}</label>
            <input type="number" value={farmData.numNaves} onChange={e => updateData('numNaves', parseInt(e.target.value) || 1)} min={1} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">{isEs ? 'N. total de animales' : 'Total animals'}</label>
            <input type="number" value={farmData.numAnimales || ''} onChange={e => updateData('numAnimales', parseInt(e.target.value) || 0)} min={0} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">{isEs ? 'N. de empleados' : 'Employees'}</label>
            <input type="number" value={farmData.numEmpleados} onChange={e => updateData('numEmpleados', parseInt(e.target.value) || 1)} min={1} className={inputCls} />
          </div>
        </div>
      </div>
    );

    if (stepId === 'financials') return (
      <div className="space-y-6">
        <h2 className="text-3xl font-heading font-bold text-[var(--t1)]">
          {isEs ? 'Datos Financieros' : 'Financial Data'}
        </h2>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">{isEs ? 'Facturacion anual (EUR)' : 'Annual revenue (EUR)'}</label>
            <input type="number" value={farmData.facturacion || ''} onChange={e => updateData('facturacion', parseInt(e.target.value) || 0)} min={0} step={10000} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">{isEs ? 'Coste pienso (% sobre total)' : 'Feed cost (% of total)'}</label>
            <input type="number" value={farmData.costePienso} onChange={e => updateData('costePienso', parseFloat(e.target.value) || 0)} min={0} max={100} step={1} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">{isEs ? 'Margen neto (%)' : 'Net margin (%)'}</label>
            <input type="number" value={farmData.margenNeto} onChange={e => updateData('margenNeto', parseFloat(e.target.value) || 0)} min={-50} max={100} step={0.5} className={inputCls} />
          </div>
        </div>
      </div>
    );

    if (stepId === 'operations') return (
      <div className="space-y-6">
        <h2 className="text-3xl font-heading font-bold text-[var(--t1)]">
          {isEs ? 'Indicadores Operativos' : 'Operational Metrics'}
        </h2>
        <div className="grid grid-cols-2 gap-5">
          {farmData.species === 'porcine' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-[var(--t2)] mb-2">{isEs ? 'Indice Conversion (IC)' : 'Feed Conversion Ratio'}</label>
                <input type="number" value={farmData.ic} onChange={e => updateData('ic', parseFloat(e.target.value) || 0)} min={1} max={5} step={0.1} className={inputCls} />
                <div className="text-xs text-[var(--t3)] mt-1">kg pienso / kg ganancia</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--t2)] mb-2">{isEs ? 'Dias hasta sacrificio' : 'Days to slaughter'}</label>
                <input type="number" value={farmData.diasSacrificio} onChange={e => updateData('diasSacrificio', parseInt(e.target.value) || 0)} min={90} max={365} className={inputCls} />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">{isEs ? 'Mortalidad (%)' : 'Mortality (%)'}</label>
            <input type="number" value={farmData.mortalidad} onChange={e => updateData('mortalidad', parseFloat(e.target.value) || 0)} min={0} max={30} step={0.1} className={inputCls} />
          </div>
        </div>
      </div>
    );

    if (stepId === 'tech') return (
      <div className="space-y-6">
        <h2 className="text-3xl font-heading font-bold text-[var(--t1)]">
          {isEs ? 'Nivel Tecnologico' : 'Technology Level'}
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">
              {isEs ? 'Nivel digitalizacion (1-10)' : 'Digitalization level (1-10)'}
            </label>
            <input type="range" value={farmData.techLevel} onChange={e => updateData('techLevel', parseInt(e.target.value))}
              min={1} max={10} className="w-full accent-[var(--neon)]" />
            <div className="flex justify-between text-sm text-[var(--t3)] mt-1">
              <span>{isEs ? 'Basico' : 'Basic'}</span>
              <span className="font-bold text-lg" style={{ color: accent }}>{farmData.techLevel}</span>
              <span>{isEs ? 'Avanzado' : 'Advanced'}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer">
              <input type="checkbox" checked={farmData.tieneSensores} onChange={e => updateData('tieneSensores', e.target.checked)} className="w-5 h-5 rounded accent-[var(--neon)]" />
              <div>
                <div className="text-[var(--t1)] font-medium">{isEs ? 'Sensores ambientales' : 'Environmental sensors'}</div>
                <div className="text-xs text-[var(--t3)]">T, HR, NH3, CO2</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer">
              <input type="checkbox" checked={farmData.tieneCamaras} onChange={e => updateData('tieneCamaras', e.target.checked)} className="w-5 h-5 rounded accent-[var(--neon)]" />
              <div>
                <div className="text-[var(--t1)] font-medium">{isEs ? 'Camaras IA' : 'AI Cameras'}</div>
                <div className="text-xs text-[var(--t3)]">{isEs ? 'Vision artificial' : 'Computer vision'}</div>
              </div>
            </label>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">
              {isEs ? 'Software de gestion actual' : 'Current management software'}
            </label>
            <select value={farmData.gestionDigital} onChange={e => updateData('gestionDigital', e.target.value)} className={inputCls}>
              <option value="papel">{isEs ? 'Papel / cuadernos' : 'Paper / notebooks'}</option>
              <option value="excel">{isEs ? 'Excel / hojas de calculo' : 'Excel / Spreadsheets'}</option>
              <option value="software_basico">{isEs ? 'Software basico' : 'Basic software'}</option>
              <option value="erp">{isEs ? 'ERP especializado' : 'Specialized ERP'}</option>
            </select>
          </div>
        </div>
      </div>
    );

    if (stepId === 'market') return (
      <div className="space-y-6">
        <h2 className="text-3xl font-heading font-bold text-[var(--t1)]">
          {isEs ? 'Valoracion y Mercado' : 'Valuation & Market'}
        </h2>
        <Glass>
          <label className="flex items-start gap-4 cursor-pointer">
            <input type="checkbox" checked={farmData.quiereValorar} onChange={e => updateData('quiereValorar', e.target.checked)}
              className="w-5 h-5 rounded mt-1 accent-[var(--neon)]" />
            <div>
              <div className="text-[var(--t1)] font-semibold text-lg mb-1">
                {isEs ? 'Incluir valoracion estimada de la explotacion' : 'Include estimated farm valuation'}
              </div>
              <div className="text-sm text-[var(--t3)]">
                {isEs
                  ? 'El informe incluira una estimacion del valor de mercado basada en multiplos EBITDA del sector.'
                  : 'The report will include a market value estimate based on sector EBITDA multiples.'}
              </div>
            </div>
          </label>
        </Glass>
        <div className="p-4 rounded-xl border border-[var(--neon)]/20 bg-[var(--neon)]/5">
          <div className="flex items-start gap-3">
            <span className="text-lg">{'\u{1F512}'}</span>
            <div className="text-sm text-[var(--t2)]">
              <strong className="text-[var(--t1)]">{isEs ? 'Confidencialidad garantizada:' : 'Guaranteed confidentiality:'}</strong>{' '}
              {isEs
                ? 'Todos los datos son confidenciales y se usan exclusivamente para generar tu informe.'
                : 'All data is confidential and used exclusively to generate your report.'}
            </div>
          </div>
        </div>
        <button onClick={doGenerateReport} disabled={loading}
          className="w-full mt-4 px-8 py-4 rounded-xl font-bold text-lg text-white transition flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: accent }}>
          {loading ? (
            <><span className="animate-spin inline-block">{'\u23F3'}</span> {isEs ? 'Generando informe con IA...' : 'Generating AI report...'}</>
          ) : (
            <><span>{'\u2728'}</span> {isEs ? 'Generar Informe DAFO' : 'Generate SWOT Report'}</>
          )}
        </button>
      </div>
    );

    /* REPORT */
    if (stepId === 'report') {
      if (loading) return (
        <div className="text-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block text-5xl mb-6">{'\u2699\uFE0F'}</motion.div>
          <div className="text-2xl font-heading font-bold text-[var(--t1)] mb-2">
            {isEs ? 'Analizando tu explotacion...' : 'Analyzing your operation...'}
          </div>
          <div className="text-[var(--t3)]">
            {isEs ? 'Generando informe personalizado' : 'Generating personalized report'}
          </div>
        </div>
      );

      if (!report) return (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">{'\u26A0\uFE0F'}</div>
          <div className="text-2xl font-heading font-bold text-[var(--t1)] mb-2">
            {isEs ? 'Error al generar informe' : 'Error generating report'}
          </div>
        </div>
      );

      const r = report;
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-heading font-bold text-[var(--t1)] mb-2">
              {isEs ? 'Tu Informe DAFO' : 'Your SWOT Report'}
            </h2>
            <p className="text-[var(--t3)]">
              {isEs ? 'Analisis personalizado - ' + r.dataPoints + ' puntos de datos' : 'Personalized analysis - ' + r.dataPoints + ' data points'}
            </p>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-5">
            <Glass>
              <div className="text-sm mb-2" style={{ color: accent }}>{isEs ? 'Salud Financiera' : 'Financial Health'}</div>
              <div className="text-5xl font-heading font-bold text-[var(--t1)] mb-3">{r.healthScore}</div>
              <div className="w-full h-2 bg-white/[0.06] rounded-full">
                <motion.div className="h-full rounded-full" style={{ background: accent }}
                  initial={{ width: 0 }} animate={{ width: r.healthScore + '%' }} transition={{ duration: 1, delay: 0.3 }} />
              </div>
            </Glass>
            <Glass>
              <div className="text-sm text-[var(--cyan)] mb-2">{isEs ? 'Preparacion IA' : 'AI Readiness'}</div>
              <div className="text-5xl font-heading font-bold text-[var(--t1)] mb-3">{r.aiScore}</div>
              <div className="w-full h-2 bg-white/[0.06] rounded-full">
                <motion.div className="h-full rounded-full bg-[var(--cyan)]"
                  initial={{ width: 0 }} animate={{ width: r.aiScore + '%' }} transition={{ duration: 1, delay: 0.5 }} />
              </div>
            </Glass>
          </div>

          {/* Savings */}
          <Glass>
            <div className="text-sm mb-2" style={{ color: accent }}>{isEs ? 'Ahorro Estimado con NeoFarm' : 'Estimated Savings with NeoFarm'}</div>
            <div className="text-3xl font-heading font-bold text-[var(--t1)]">
              {r.savingsLow.toLocaleString()} EUR - {r.savingsHigh.toLocaleString()} EUR
            </div>
            <div className="text-sm text-[var(--t3)] mt-1">{isEs ? 'Anual' : 'Annual'}</div>
          </Glass>

          {/* DAFO Matrix */}
          <div className="grid grid-cols-2 gap-5">
            {[
              { key: 'fortalezas', es: 'Fortalezas', en: 'Strengths', color: '#22c55e', icon: '\u2705', items: r.fortalezas },
              { key: 'debilidades', es: 'Debilidades', en: 'Weaknesses', color: '#f59e0b', icon: '\u26A0\uFE0F', items: r.debilidades },
              { key: 'oportunidades', es: 'Oportunidades', en: 'Opportunities', color: '#3b82f6', icon: '\u{1F4C8}', items: r.oportunidades },
              { key: 'amenazas', es: 'Amenazas', en: 'Threats', color: '#ef4444', icon: '\u{1F534}', items: r.amenazas },
            ].map(q => (
              <div key={q.key} className="rounded-2xl border bg-white/[0.02] p-5" style={{ borderColor: q.color + '30' }}>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: q.color }}>
                  {q.icon} {isEs ? q.es : q.en}
                </h3>
                <ul className="space-y-2">
                  {q.items.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-[var(--t2)] flex items-start gap-2">
                      <span style={{ color: q.color }} className="mt-0.5">{'\u2022'}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mejoras */}
          <Glass>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: accent }}>
              {'\u{1F3AF}'} {isEs ? 'Plan de Mejoras Priorizado' : 'Prioritized Improvement Plan'}
            </h3>
            <ol className="space-y-3">
              {r.mejoras.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[var(--t2)]">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
                    style={{ background: accent }}>{i + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </Glass>

          {/* Modulos Recomendados */}
          <div>
            <h3 className="text-2xl font-heading font-bold text-[var(--t1)] mb-2 flex items-center gap-2">
              {'\u2728'} {isEs ? 'Modulos NeoFarm Recomendados' : 'Recommended NeoFarm Modules'}
            </h3>
            <p className="text-sm text-[var(--t3)] mb-6">
              {isEs ? 'Basado en tu analisis, con ROI estimado' : 'Based on your analysis, with estimated ROI'}
            </p>
            <div className="space-y-4">
              {r.modulosRecomendados.map((mod, i) => (
                <div key={i} className="rounded-xl border p-5"
                  style={{
                    borderColor: mod.prioridad === 'Alta' ? accent + '50' : 'rgba(255,255,255,0.06)',
                    background: mod.prioridad === 'Alta' ? accent + '08' : 'rgba(255,255,255,0.02)',
                  }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-bold text-[var(--t1)]">{mod.nombre}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: mod.prioridad === 'Alta' ? accent + '20' : 'rgba(255,255,255,0.06)',
                            color: mod.prioridad === 'Alta' ? accent : 'var(--t3)',
                          }}>
                          {isEs ? 'Prioridad ' + mod.prioridad : mod.prioridad + ' Priority'}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--t3)]">{mod.descripcion}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-3 pt-3 border-t border-white/[0.06]">
                    <div>
                      <div className="text-xs text-[var(--t3)] mb-1">ROI</div>
                      <div className="text-sm font-semibold" style={{ color: accent }}>{mod.roi}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--t3)] mb-1">{isEs ? 'Inversion IoT' : 'IoT Investment'}</div>
                      <div className="text-sm font-semibold text-[var(--t1)]">{mod.inversionIoT}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--t3)] mb-1">{isEs ? 'Ahorro anual' : 'Annual savings'}</div>
                      <div className="text-sm font-semibold text-[var(--cyan)]">{mod.ahorroAnual}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--t3)] mb-1">{isEs ? 'Implementacion' : 'Implementation'}</div>
                      <div className="text-sm font-semibold text-[var(--t2)]">{mod.implementacion}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <Glass>
            <h3 className="text-xl font-bold text-[var(--cyan)] mb-4 flex items-center gap-2">
              {'\u{1F4C5}'} {isEs ? 'Timeline de Implementacion' : 'Implementation Timeline'}
            </h3>
            <div className="space-y-3">
              {r.timeline.map((fase, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ borderColor: 'var(--cyan)', background: 'rgba(0,212,255,0.1)' }}>
                    <span className="text-xs" style={{ color: 'var(--cyan)' }}>{'\u2713'}</span>
                  </div>
                  <p className="text-[var(--t2)]">{fase}</p>
                </div>
              ))}
            </div>
          </Glass>

          {/* Valoracion */}
          {r.valoracionEstimada && (
            <Glass>
              <h3 className="text-xl font-bold text-[var(--amber)] mb-3">
                {'\u{1F4B0}'} {isEs ? 'Valoracion Estimada' : 'Estimated Valuation'}
              </h3>
              <div className="text-3xl font-heading font-bold text-[var(--t1)] mb-1">
                {r.valoracionEstimada.low.toLocaleString()} EUR - {r.valoracionEstimada.high.toLocaleString()} EUR
              </div>
              <div className="text-sm text-[var(--t3)]">{r.valoracionEstimada.metodo}</div>
            </Glass>
          )}

          {/* Actions */}
          <div className="space-y-4 pt-6 border-t border-white/[0.06]">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('neofarm_dafo', JSON.stringify({
                    species: farmData.species,
                    modelo: farmData.modelo,
                    numAnimales: farmData.numAnimales,
                    ccaa: farmData.ccaa,
                    modulosRecomendados: r.modulosRecomendados.map(m => m.nombre),
                  }));
                  window.location.href = '/setup';
                }
              }}
              className="w-full px-8 py-4 rounded-xl font-bold text-lg text-white transition flex items-center justify-center gap-3 shadow-lg"
              style={{ background: 'linear-gradient(135deg, ' + accent + ', ' + accent + 'cc)' }}>
              {'\u{1F680}'} {isEs ? 'Comenzar Setup con Esta Configuracion' : 'Start Setup with This Configuration'} {'\u2192'}
            </button>
            <div className="flex gap-4">
              <button onClick={() => typeof window !== 'undefined' && window.print()}
                className="flex-1 px-6 py-3 rounded-xl border border-white/[0.08] text-[var(--t2)] hover:bg-white/[0.03] transition font-semibold flex items-center justify-center gap-2">
                {'\u{1F4C4}'} {isEs ? 'Descargar PDF' : 'Download PDF'}
              </button>
              <a href="/"
                className="flex-1 px-6 py-3 rounded-xl border border-white/[0.08] text-[var(--t2)] hover:bg-white/[0.03] transition font-semibold text-center">
                {isEs ? 'Volver a NeoFarm' : 'Back to NeoFarm'}
              </a>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-white/[0.06] bg-[var(--bg)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-heading font-bold text-[var(--neon)]">Neo</span>
            <span className="text-xl font-heading font-bold text-[var(--t1)]">Farm</span>
          </a>
          <div className="flex items-center gap-4">
            <button onClick={() => setLang(isEs ? 'en' : 'es')}
              className="text-xs font-mono text-[var(--t3)] hover:text-[var(--neon)] transition">
              {isEs ? 'EN' : 'ES'}
            </button>
            <span className="text-sm text-[var(--t3)]">
              {isEs ? 'Paso' : 'Step'} {currentStep + 1}/{STEPS.length}
            </span>
          </div>
        </div>
      </header>

      <div className="w-full h-0.5 bg-white/[0.04]">
        <motion.div className="h-full" style={{ background: accent }}
          animate={{ width: progress + '%' }} transition={{ duration: 0.3 }} />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-8 pb-2">
        <div className="text-sm font-medium" style={{ color: accent }}>
          {isEs ? STEPS[currentStep].es : STEPS[currentStep].en}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}>
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {currentStep > 0 && currentStep < STEPS.length - 2 && (
          <div className="flex justify-between mt-10 pt-6 border-t border-white/[0.06]">
            <button onClick={prevStep}
              className="px-6 py-3 rounded-xl border border-white/[0.08] text-[var(--t2)] hover:bg-white/[0.03] transition font-medium">
              {isEs ? '\u2190 Anterior' : '\u2190 Back'}
            </button>
            <button onClick={nextStep}
              className="px-6 py-3 rounded-xl font-semibold text-white transition"
              style={{ background: accent }}>
              {isEs ? 'Siguiente \u2192' : 'Next \u2192'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DAFOPage() {
  return (
    <LangProvider>
      <DAFOInner />
    </LangProvider>
  );
}
