'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LangProvider, useLang } from '@/config/LangContext';

/* ─── Types ─── */
type Vertical = 'vacuno' | 'porcino' | 'avicultura' | 'otro';
type FarmType = 'extensivo' | 'intensivo' | 'mixto';

interface WizardData {
  /* Step 1 */
  vertical: Vertical | '';
  farmType: FarmType | '';
  /* Step 2 */
  farmName: string;
  contactName: string;
  email: string;
  country: string;
  province: string;
  headCount: number;
  hectares: number;
  /* Step 3 */
  modules: string[];
  /* Step 4 – summary only */
}

const VERTICALS: { value: Vertical; label: string; labelEn: string; emoji: string; color: string; hub: string }[] = [
  { value: 'vacuno',      label: 'Vacuno',      labelEn: 'Cattle',    emoji: '🐄', color: '#3D7A5F', hub: 'https://hub.vacasdata.com/dashboard' },
  { value: 'porcino',     label: 'Porcino',     labelEn: 'Swine',     emoji: '🐖', color: '#3B6B82', hub: 'https://hub.porcdata.com/dashboard' },
  { value: 'avicultura',  label: 'Avicultura',  labelEn: 'Poultry',   emoji: '🐔', color: '#B07D2B', hub: 'https://hub.ovosfera.com/dashboard' },
  { value: 'otro',        label: 'Otro',        labelEn: 'Other',     emoji: '🌾', color: '#6B7280', hub: 'https://neofarm.io' },
];

const FARM_TYPES: { value: FarmType; es: string; en: string; emoji: string }[] = [
  { value: 'extensivo', es: 'Extensivo', en: 'Extensive', emoji: '🏔️' },
  { value: 'intensivo', es: 'Intensivo', en: 'Intensive', emoji: '🏭' },
  { value: 'mixto',     es: 'Mixto',     en: 'Mixed',     emoji: '🔄' },
];

const MODULES_MAP: Record<Vertical, { id: string; es: string; en: string; emoji: string; desc_es: string; desc_en: string }[]> = {
  vacuno: [
    { id: 'genetics',     es: 'Genética',        en: 'Genetics',       emoji: '🧬', desc_es: 'EPDs, apareamientos, consanguinidad', desc_en: 'EPDs, breeding, inbreeding' },
    { id: 'health',       es: 'Sanidad',         en: 'Health',         emoji: '💊', desc_es: 'Protocolo vacunal, tratamientos', desc_en: 'Vaccination, treatments' },
    { id: 'nutrition',    es: 'Nutrición',       en: 'Nutrition',      emoji: '🌿', desc_es: 'Planes alimenticios, GMD, IC', desc_en: 'Feed plans, ADG, FCR' },
    { id: 'traceability', es: 'Trazabilidad',    en: 'Traceability',   emoji: '📋', desc_es: 'SITRAN, REGA, movimientos', desc_en: 'SITRAN, REGA, movements' },
    { id: 'carbon',       es: 'Carbono',         en: 'Carbon',         emoji: '🌍', desc_es: 'Huella de carbono, certificación', desc_en: 'Carbon footprint, certification' },
    { id: 'iot',          es: 'IoT',             en: 'IoT',            emoji: '📡', desc_es: 'Sensores ambientales, GPS collars', desc_en: 'Environmental sensors, GPS collars' },
    { id: 'geotwin',      es: 'GeoTwin',         en: 'GeoTwin',        emoji: '🗺️', desc_es: 'Gemelo digital de parcelas NDVI', desc_en: 'NDVI parcel digital twin' },
  ],
  porcino: [
    { id: 'barn_iot',     es: 'IoT Naves',       en: 'Barn IoT',       emoji: '🌡️', desc_es: 'Sensores T°/HR/NH₃/CO₂', desc_en: 'T°/RH/NH₃/CO₂ sensors' },
    { id: 'health',       es: 'Sanidad',         en: 'Health',         emoji: '💊', desc_es: 'SIGE digital, bioseguridad', desc_en: 'Digital SIGE, biosecurity' },
    { id: 'nutrition',    es: 'Nutrición',       en: 'Nutrition',      emoji: '🌿', desc_es: 'Índice Conversión, dietas', desc_en: 'FCR, feed formulation' },
    { id: 'traceability', es: 'Trazabilidad',    en: 'Traceability',   emoji: '📋', desc_es: 'Lotes, movimientos, REGA', desc_en: 'Batches, movements, REGA' },
    { id: 'purines',      es: 'Purines',         en: 'Waste Mgmt',     emoji: '♻️', desc_es: 'SmartPurín, biogás, nitrógeno', desc_en: 'SmartSlurry, biogas, nitrogen' },
    { id: 'carbon',       es: 'Carbono',         en: 'Carbon',         emoji: '🌍', desc_es: 'Huella de carbono, MRV', desc_en: 'Carbon footprint, MRV' },
  ],
  avicultura: [
    { id: 'barn_iot',     es: 'IoT Naves',       en: 'Barn IoT',       emoji: '🌡️', desc_es: 'Sensores T°/HR/CO₂/luz', desc_en: 'T°/RH/CO₂/light sensors' },
    { id: 'health',       es: 'Sanidad',         en: 'Health',         emoji: '💊', desc_es: 'Mortalidad, vacunas, alertas', desc_en: 'Mortality, vaccines, alerts' },
    { id: 'production',   es: 'Producción',      en: 'Production',     emoji: '🥚', desc_es: 'Puesta, clasificación, calidad', desc_en: 'Laying, grading, quality' },
    { id: 'traceability', es: 'Trazabilidad',    en: 'Traceability',   emoji: '📋', desc_es: 'Lotes, huevos, normativa', desc_en: 'Batches, eggs, regulation' },
    { id: 'energy',       es: 'Energía',         en: 'Energy',         emoji: '⚡', desc_es: 'Consumo eléctrico, solar', desc_en: 'Electricity, solar' },
    { id: 'carbon',       es: 'Carbono',         en: 'Carbon',         emoji: '🌍', desc_es: 'Huella de carbono, MRV', desc_en: 'Carbon footprint, MRV' },
  ],
  otro: [
    { id: 'iot',          es: 'IoT',             en: 'IoT',            emoji: '📡', desc_es: 'Sensores genéricos', desc_en: 'Generic sensors' },
    { id: 'health',       es: 'Sanidad',         en: 'Health',         emoji: '💊', desc_es: 'Gestión sanitaria', desc_en: 'Health management' },
    { id: 'traceability', es: 'Trazabilidad',    en: 'Traceability',   emoji: '📋', desc_es: 'Movimientos, registros', desc_en: 'Movements, records' },
    { id: 'carbon',       es: 'Carbono',         en: 'Carbon',         emoji: '🌍', desc_es: 'Huella de carbono', desc_en: 'Carbon footprint' },
  ],
};

const COUNTRIES = ['España', 'Portugal', 'Francia', 'Italia', 'Alemania', 'Otro'];

/* ─── Steps config ─── */
const STEPS = [
  { id: 1, es: 'Tipo de Explotación', en: 'Operation Type',   icon: '🏡' },
  { id: 2, es: 'Datos Básicos',       en: 'Basic Data',       icon: '📝' },
  { id: 3, es: 'Módulos',             en: 'Modules',          icon: '⚙️' },
  { id: 4, es: 'Resumen',             en: 'Summary',          icon: '🚀' },
];

/* ─── Wizard Inner (inside LangProvider) ─── */
function WizardInner() {
  const { lang, setLang, t } = useLang();
  const isEs = lang === 'es';

  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    vertical: '',
    farmType: '',
    farmName: '',
    contactName: '',
    email: '',
    country: 'España',
    province: '',
    headCount: 0,
    hectares: 0,
    modules: [],
  });
  const [submitted, setSubmitted] = useState(false);

  const update = useCallback(<K extends keyof WizardData>(key: K, val: WizardData[K]) => {
    setData(prev => ({ ...prev, [key]: val }));
  }, []);

  const toggleModule = (id: string) => {
    setData(prev => ({
      ...prev,
      modules: prev.modules.includes(id)
        ? prev.modules.filter(m => m !== id)
        : [...prev.modules, id],
    }));
  };

  const canNext = (): boolean => {
    switch (step) {
      case 1: return !!data.vertical && !!data.farmType;
      case 2: return !!data.farmName && !!data.email && data.headCount > 0;
      case 3: return data.modules.length > 0;
      default: return true;
    }
  };

  const handleComplete = () => {
    setSubmitted(true);
    // Store in localStorage for DAFO integration
    if (typeof window !== 'undefined') {
      localStorage.setItem('neofarm_setup', JSON.stringify(data));
    }
    // Redirect after 3s
    const vert = VERTICALS.find(v => v.value === data.vertical);
    setTimeout(() => {
      if (vert) window.location.href = vert.hub;
    }, 3000);
  };

  const vertColor = VERTICALS.find(v => v.value === data.vertical)?.color ?? '#14B8A6';

  /* ─── Glass Card wrapper ─── */
  const Glass = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 ${className}`}>
      {children}
    </div>
  );

  /* ─── Select Button ─── */
  const SelectBtn = ({ selected, onClick, children, color = '#14B8A6' }: {
    selected: boolean; onClick: () => void; children: React.ReactNode; color?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full text-left p-5 rounded-xl border-2 transition-all duration-200"
      style={{
        borderColor: selected ? color : 'rgba(255,255,255,0.06)',
        background: selected ? `${color}10` : 'rgba(255,255,255,0.02)',
      }}
    >
      {children}
      {selected && (
        <span className="absolute top-3 right-3 text-lg" style={{ color }}>✓</span>
      )}
    </button>
  );

  /* ─── STEP 1: Vertical + Farm Type ─── */
  const Step1 = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-bold text-[var(--t1)] mb-2">
          {isEs ? 'Selecciona tu vertical' : 'Select your vertical'}
        </h2>
        <p className="text-[var(--t3)]">
          {isEs ? '¿Con qué especie trabajas principalmente?' : 'What species do you primarily work with?'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {VERTICALS.map(v => (
          <SelectBtn key={v.value} selected={data.vertical === v.value} onClick={() => update('vertical', v.value)} color={v.color}>
            <div className="text-3xl mb-2">{v.emoji}</div>
            <div className="font-semibold text-[var(--t1)]">{isEs ? v.label : v.labelEn}</div>
          </SelectBtn>
        ))}
      </div>

      {data.vertical && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-lg font-semibold text-[var(--t1)] mb-3">
            {isEs ? 'Modelo productivo' : 'Production model'}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {FARM_TYPES.map(ft => (
              <SelectBtn key={ft.value} selected={data.farmType === ft.value} onClick={() => update('farmType', ft.value)} color={vertColor}>
                <div className="text-2xl mb-1">{ft.emoji}</div>
                <div className="text-sm font-semibold text-[var(--t1)]">{isEs ? ft.es : ft.en}</div>
              </SelectBtn>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );

  /* ─── STEP 2: Basic Data ─── */
  const Step2 = () => {
    const inputCls = "w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[var(--t1)] placeholder:text-[var(--t3)]/50 focus:border-[var(--neon)] focus:ring-1 focus:ring-[var(--neon)]/20 outline-none transition-all font-body";
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-heading font-bold text-[var(--t1)]">
          {isEs ? 'Datos de tu explotación' : 'Your operation data'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">
              {isEs ? 'Nombre de la explotación *' : 'Farm name *'}
            </label>
            <input type="text" value={data.farmName} onChange={e => update('farmName', e.target.value)} placeholder={isEs ? 'Ej: Dehesa Los Alcornoques' : 'Ex: Oak Grove Ranch'} className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">
              {isEs ? 'Nombre de contacto' : 'Contact name'}
            </label>
            <input type="text" value={data.contactName} onChange={e => update('contactName', e.target.value)} placeholder={isEs ? 'Tu nombre' : 'Your name'} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">Email *</label>
            <input type="email" value={data.email} onChange={e => update('email', e.target.value)} placeholder="tucorreo@ejemplo.com" className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">
              {isEs ? 'País' : 'Country'}
            </label>
            <select value={data.country} onChange={e => update('country', e.target.value)} className={inputCls}>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">
              {isEs ? 'Provincia / Región' : 'Province / Region'}
            </label>
            <input type="text" value={data.province} onChange={e => update('province', e.target.value)} placeholder={isEs ? 'Cáceres' : 'Province'} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">
              {isEs ? 'Nº de cabezas / animales *' : 'Head count *'}
            </label>
            <input type="number" value={data.headCount || ''} onChange={e => update('headCount', parseInt(e.target.value) || 0)} min={1} placeholder="500" className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--t2)] mb-2">
              {isEs ? 'Hectáreas (aprox.)' : 'Hectares (approx.)'}
            </label>
            <input type="number" value={data.hectares || ''} onChange={e => update('hectares', parseInt(e.target.value) || 0)} min={0} placeholder="150" className={inputCls} />
          </div>
        </div>
      </div>
    );
  };

  /* ─── STEP 3: Modules ─── */
  const Step3 = () => {
    const modules = data.vertical ? MODULES_MAP[data.vertical as Vertical] : [];
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-[var(--t1)] mb-2">
            {isEs ? 'Selecciona módulos de interés' : 'Select modules of interest'}
          </h2>
          <p className="text-[var(--t3)]">
            {isEs ? 'Podrás cambiarlos después. Selecciona al menos uno.' : 'You can change these later. Select at least one.'}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {modules.map(m => {
            const sel = data.modules.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleModule(m.id)}
                className="relative text-left p-5 rounded-xl border-2 transition-all duration-200"
                style={{
                  borderColor: sel ? vertColor : 'rgba(255,255,255,0.06)',
                  background: sel ? `${vertColor}10` : 'rgba(255,255,255,0.02)',
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{m.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-[var(--t1)]">{isEs ? m.es : m.en}</h3>
                    <p className="text-sm text-[var(--t3)] mt-1">{isEs ? m.desc_es : m.desc_en}</p>
                  </div>
                  {sel && <span className="text-lg" style={{ color: vertColor }}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  /* ─── STEP 4: Summary ─── */
  const Step4 = () => {
    const vert = VERTICALS.find(v => v.value === data.vertical);
    const modules = data.vertical ? MODULES_MAP[data.vertical as Vertical].filter(m => data.modules.includes(m.id)) : [];
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-heading font-bold text-[var(--t1)]">
          {isEs ? 'Resumen de tu configuración' : 'Your configuration summary'}
        </h2>

        <Glass className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{vert?.emoji}</span>
            <div>
              <div className="font-bold text-[var(--t1)] text-lg">{data.farmName}</div>
              <div className="text-sm text-[var(--t3)]">{isEs ? vert?.label : vert?.labelEn} · {isEs ? FARM_TYPES.find(f => f.value === data.farmType)?.es : FARM_TYPES.find(f => f.value === data.farmType)?.en}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[var(--t3)]">{isEs ? 'Contacto' : 'Contact'}:</span>
              <span className="text-[var(--t1)] ml-2">{data.contactName || '—'}</span>
            </div>
            <div>
              <span className="text-[var(--t3)]">Email:</span>
              <span className="text-[var(--t1)] ml-2">{data.email}</span>
            </div>
            <div>
              <span className="text-[var(--t3)]">{isEs ? 'Ubicación' : 'Location'}:</span>
              <span className="text-[var(--t1)] ml-2">{data.province ? `${data.province}, ` : ''}{data.country}</span>
            </div>
            <div>
              <span className="text-[var(--t3)]">{isEs ? 'Cabezas' : 'Head count'}:</span>
              <span className="text-[var(--t1)] ml-2">{data.headCount.toLocaleString()}</span>
            </div>
            {data.hectares > 0 && (
              <div>
                <span className="text-[var(--t3)]">{isEs ? 'Hectáreas' : 'Hectares'}:</span>
                <span className="text-[var(--t1)] ml-2">{data.hectares.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <h4 className="text-sm font-semibold text-[var(--t2)] mb-3">
              {isEs ? 'Módulos seleccionados' : 'Selected modules'} ({modules.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {modules.map(m => (
                <span key={m.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ background: `${vertColor}20`, color: vertColor }}>
                  {m.emoji} {isEs ? m.es : m.en}
                </span>
              ))}
            </div>
          </div>
        </Glass>

        <div className="p-4 rounded-xl border border-[var(--neon)]/20 bg-[var(--neon)]/5">
          <p className="text-sm text-[var(--t2)]">
            {isEs
              ? '🎉 Al completar, se creará tu hub personalizado y serás redirigido al dashboard.'
              : '🎉 Upon completion, your personalized hub will be created and you\'ll be redirected to the dashboard.'}
          </p>
        </div>
      </div>
    );
  };

  /* ─── Submitted state ─── */
  if (submitted) {
    const vert = VERTICALS.find(v => v.value === data.vertical);
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-heading font-bold text-[var(--t1)] mb-4">
            {isEs ? '¡Hub creado!' : 'Hub created!'}
          </h1>
          <p className="text-[var(--t3)] mb-6">
            {isEs
              ? `Redirigiendo a ${vert?.label ?? 'tu'} hub...`
              : `Redirecting to ${vert?.labelEn ?? 'your'} hub...`}
          </p>
          <div className="w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: vertColor }}
              initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3 }} />
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─── Main Layout ─── */
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
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
              {isEs ? 'Paso' : 'Step'} {step}/4
            </span>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="w-full h-0.5 bg-white/[0.04]">
        <motion.div className="h-full" style={{ background: vertColor || '#14B8A6' }}
          animate={{ width: `${(step / 4) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      {/* Step indicators */}
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-4">
        <div className="flex justify-between items-center">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1.5 transition-all duration-200"
                  style={{
                    background: s.id <= step ? vertColor || '#14B8A6' : 'rgba(255,255,255,0.04)',
                    color: s.id <= step ? '#fff' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {s.id < step ? '✓' : s.icon}
                </div>
                <span className="text-xs text-[var(--t3)] hidden sm:block text-center">
                  {isEs ? s.es : s.en}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="h-0.5 flex-1 mx-3 rounded"
                  style={{ background: s.id < step ? vertColor || '#14B8A6' : 'rgba(255,255,255,0.06)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
            {step === 4 && <Step4 />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-12 pt-8 border-t border-white/[0.06]">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : window.location.href = '/'}
            className="px-6 py-3 rounded-xl border border-white/[0.08] text-[var(--t2)] hover:bg-white/[0.03] transition font-medium"
          >
            {step > 1 ? (isEs ? '← Anterior' : '← Back') : (isEs ? '← Inicio' : '← Home')}
          </button>

          {step < 4 ? (
            <button
              onClick={() => canNext() && setStep(step + 1)}
              disabled={!canNext()}
              className="px-8 py-3 rounded-xl font-semibold text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: canNext() ? (vertColor || '#14B8A6') : 'rgba(255,255,255,0.06)' }}
            >
              {isEs ? 'Siguiente →' : 'Next →'}
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-8 py-3 rounded-xl font-bold text-white transition shadow-lg"
              style={{ background: `linear-gradient(135deg, ${vertColor || '#14B8A6'}, ${vertColor || '#14B8A6'}cc)` }}
            >
              {isEs ? '🚀 Crear mi Hub' : '🚀 Create my Hub'}
            </button>
          )}
        </div>
      </div>

      {/* Footer link to DAFO */}
      <div className="text-center pb-12">
        <a href="/dafo" className="text-sm text-[var(--t3)] hover:text-[var(--neon)] transition underline underline-offset-4">
          {isEs ? '¿Prefieres un diagnóstico DAFO primero?' : 'Prefer a SWOT analysis first?'}
        </a>
      </div>
    </div>
  );
}

/* ─── Page Export (with LangProvider) ─── */
export default function SetupPage() {
  return (
    <LangProvider>
      <WizardInner />
    </LangProvider>
  );
}
