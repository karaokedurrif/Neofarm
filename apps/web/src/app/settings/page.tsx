'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Settings as SettingsIcon, Users, ChevronRight, ChevronLeft, Check,
  Clock, Lightbulb, HandCoins, BarChart3, Vote, FileText, Lock
} from 'lucide-react';
import Link from 'next/link';

/* ══════════════════════════════════════════════════════
   WIZARD TYPES & DATA
   ══════════════════════════════════════════════════════ */
type Step = 'intro' | 'r1q1' | 'r1q2' | 'r1q3' | 'r1_wait' | 'r1_results' | 'r2q4' | 'r2q5' | 'r2q6' | 'r2_wait' | 'r2_results' | 'r3q7' | 'r3q8' | 'r3q9' | 'r3q10' | 'r3_wait' | 'r3_results' | 'final';

interface Respuesta {
  userId: string; nombre: string;
  r1: { tiempo: string; horarios: string; ideas: string[]; ideaOtra: string; aportaciones: string[]; aportacionOtra: string };
  r2: { inversion: string; decision: string; reparto: string };
  r3: { objetivo1y: string[]; kpis: string[]; riesgos: string[]; herramientas: string[] };
}

const SOCIOS = [
  { id: 'david', nombre: 'David', avatar: '🏠' },
  { id: 'jesus', nombre: 'Jesús', avatar: '🍳' },
  { id: 'fran', nombre: 'Fran', avatar: '💻' },
];

const TIEMPOS = ['< 2 horas', '2-5 horas', '5-10 horas', '10-20 horas', 'Dedicación completa'];
const IDEAS = [
  'Capones gourmet para Navidad (producción estacional, alto margen)',
  'Huevos ecológicos venta directa (producción continua, margen medio)',
  'Picantones y pollos eco para restauración (producción continua, volumen)',
  'Conservación de razas autóctonas + genética (nicho, prestigio)',
  'Agroturismo: visitas a la granja + venta in situ',
  'Formación: cursos de avicultura extensiva',
  'Como hobby o pasión personal (sin ánimo de lucro inmediato)',
  'Buscando un proyecto sostenible y de impacto medioambiental',
  'Todo lo anterior (diversificación máxima)',
];
const APORTACIONES = [
  'Terreno y espacio', 'Conocimiento ganadero / agrícola',
  'Capital para inversión inicial', 'Mano de obra diaria',
  'Contactos comerciales (restaurantes, tiendas, mercados)',
  'Tecnología y digitalización', 'Cocina y transformación (elaborados)',
  'Marketing y ventas',
];
const INVERSIONES = ['0€', '< 500€', '500-1.000€', '1.000-3.000€', '> 3.000€'];
const DECISIONES = ['Mayoría simple', 'El que más sabe del tema', 'Rotativo mensual', 'Siempre David (dueño del terreno)'];
const REPARTOS = ['Partes iguales (33/33/33)', 'Proporcional a dedicación', 'Proporcional a inversión'];

/* ── R3 Data (Business Intelligence) ── */
const OBJETIVOS_1Y = [
  'Primer lote de capones vendido en Navidad',
  'Producción estable de huevos ecológicos',
  'Registro ecológico y certificación',
  'Marca comercial registrada',
  'Red de 5+ restaurantes compradores',
  'Breakeven (cubrir costes operativos)',
  'Infraestructura básica completada',
  'Web/tienda online operativa',
];
const KPIS_OPTIONS = [
  'Rentabilidad por ave (€/ave)', 'Tasa de mortalidad (%)',
  'Coste de pienso por kg producido', 'Índice de conversión alimenticia',
  'Satisfacción del cliente (NPS)', 'Ingresos mensuales',
  'Huella de carbono neta', 'Diversidad genética del plantel',
];
const RIESGOS_OPTIONS = [
  'Enfermedades / epidemia aviar', 'Falta de tiempo de los socios',
  'No encontrar mercado / clientes', 'Burocracia y permisos',
  'Conflictos entre socios', 'Costes superiores a lo previsto',
  'Depredadores (zorros, etc.)', 'Climatología adversa',
];
const HERRAMIENTAS_OPTIONS = [
  'Dashboard de producción en tiempo real', 'Alertas automáticas (salud, stock)',
  'Registro digital de trazabilidad', 'Análisis genético / recomendador IA',
  'Gestión financiera / ERP', 'Calendario y planificación compartida',
  'Módulo de ventas y facturación', 'Simulador de escenarios',
];

const SIMULATED: Record<string, Respuesta> = {
  david: {
    userId: 'david', nombre: 'David',
    r1: { tiempo: '10-20 horas', horarios: 'En la finca, mañanas y tardes entre semana',
      ideas: ['Capones gourmet para Navidad (producción estacional, alto margen)', 'Huevos ecológicos venta directa (producción continua, margen medio)'],
      ideaOtra: '', aportaciones: ['Terreno y espacio', 'Conocimiento ganadero / agrícola', 'Mano de obra diaria'], aportacionOtra: '' },
    r2: { inversion: '1.000-3.000€', decision: 'Mayoría simple', reparto: 'Proporcional a dedicación' },
    r3: { objetivo1y: ['Primer lote de capones vendido en Navidad', 'Infraestructura básica completada'], kpis: ['Rentabilidad por ave (€/ave)', 'Tasa de mortalidad (%)'], riesgos: ['Enfermedades / epidemia aviar', 'Depredadores (zorros, etc.)'], herramientas: ['Dashboard de producción en tiempo real', 'Alertas automáticas (salud, stock)'] },
  },
  jesus: {
    userId: 'jesus', nombre: 'Jesús',
    r1: { tiempo: '5-10 horas', horarios: 'Cocina y fines de semana, alguna tarde',
      ideas: ['Capones gourmet para Navidad (producción estacional, alto margen)', 'Huevos ecológicos venta directa (producción continua, margen medio)', 'Agroturismo: visitas a la granja + venta in situ'],
      ideaOtra: '', aportaciones: ['Cocina y transformación (elaborados)', 'Contactos comerciales (restaurantes, tiendas, mercados)', 'Capital para inversión inicial'], aportacionOtra: '' },
    r2: { inversion: '500-1.000€', decision: 'El que más sabe del tema', reparto: 'Partes iguales (33/33/33)' },
    r3: { objetivo1y: ['Primer lote de capones vendido en Navidad', 'Red de 5+ restaurantes compradores'], kpis: ['Satisfacción del cliente (NPS)', 'Ingresos mensuales'], riesgos: ['No encontrar mercado / clientes', 'Costes superiores a lo previsto'], herramientas: ['Módulo de ventas y facturación', 'Registro digital de trazabilidad'] },
  },
  fran: {
    userId: 'fran', nombre: 'Fran',
    r1: { tiempo: '2-5 horas', horarios: 'Tech y remoto, flexible por la noche',
      ideas: ['Capones gourmet para Navidad (producción estacional, alto margen)', 'Conservación de razas autóctonas + genética (nicho, prestigio)'],
      ideaOtra: '', aportaciones: ['Tecnología y digitalización', 'Marketing y ventas'], aportacionOtra: '' },
    r2: { inversion: '500-1.000€', decision: 'Mayoría simple', reparto: 'Partes iguales (33/33/33)' },
    r3: { objetivo1y: ['Web/tienda online operativa', 'Marca comercial registrada'], kpis: ['Huella de carbono neta', 'Diversidad genética del plantel'], riesgos: ['Falta de tiempo de los socios', 'Burocracia y permisos'], herramientas: ['Análisis genético / recomendador IA', 'Simulador de escenarios'] },
  },
};

/* ══════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'granja' | 'wizard'>('granja');

  /* ── Wizard state ── */
  const [step, setStep] = useState<Step>('intro');
  const [tiempo, setTiempo] = useState('');
  const [horarios, setHorarios] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [ideaOtra, setIdeaOtra] = useState('');
  const [aportaciones, setAportaciones] = useState<string[]>([]);
  const [aportacionOtra, setAportacionOtra] = useState('');
  const [inversion, setInversion] = useState('');
  const [decision, setDecision] = useState('');
  const [reparto, setReparto] = useState('');
  const [objetivo1y, setObjetivo1y] = useState<string[]>([]);
  const [kpis, setKpis] = useState<string[]>([]);
  const [riesgos, setRiesgos] = useState<string[]>([]);
  const [herramientas, setHerramientas] = useState<string[]>([]);
  const [claudeReport, setClaudeReport] = useState('');
  const [claudeLoading, setClaudeLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const currentUserId = user?.name?.toLowerCase() || 'david';
  const otherSocios = SOCIOS.filter(s => s.id !== currentUserId);

  function simulateWait(waitStep: Step, next: Step) {
    setStep(waitStep);
    setWaiting(true);
    setTimeout(() => { setWaiting(false); setStep(next); }, 3000);
  }

  function getAllR1(): Respuesta[] {
    const mine: Respuesta = {
      userId: currentUserId, nombre: user?.name || 'Tú',
      r1: { tiempo, horarios, ideas, ideaOtra, aportaciones, aportacionOtra },
      r2: { inversion, decision, reparto },
      r3: { objetivo1y, kpis, riesgos, herramientas },
    };
    return SOCIOS.map(s => s.id === currentUserId ? mine : SIMULATED[s.id]);
  }

  function countIdeas() {
    const all = getAllR1();
    const counts: Record<string, number> = {};
    IDEAS.forEach(idea => { counts[idea] = 0; });
    all.forEach(r => r.r1.ideas.forEach(i => { counts[i] = (counts[i] || 0) + 1; }));
    return Object.entries(counts).filter(([_, c]) => c > 0).sort((a, b) => b[1] - a[1]);
  }

  /* ── Styles ── */
  const card: React.CSSProperties = {
    background: 'white', borderRadius: 16, padding: 24,
    border: '1px solid var(--neutral-100)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    maxWidth: 700, margin: '0 auto',
  };
  const btnP: React.CSSProperties = {
    background: 'var(--primary-500)', color: '#fff', border: 'none',
    borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontSize: 14,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
  };
  const btnBack: React.CSSProperties = { ...btnP, background: 'var(--neutral-200)', color: 'var(--neutral-700)' };
  const optBtn = (sel: boolean): React.CSSProperties => ({
    padding: '10px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left' as const,
    background: sel ? 'rgba(139,92,246,0.08)' : 'var(--neutral-50)',
    border: `1px solid ${sel ? 'var(--primary-500)' : 'var(--neutral-200)'}`,
    color: sel ? 'var(--primary-700)' : 'var(--neutral-700)',
    fontWeight: sel ? 600 : 400, fontSize: 13, width: '100%', transition: 'all .15s',
  });

  /* ── Tabs ── */
  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px', borderRadius: '10px 10px 0 0', border: 'none', fontWeight: 700,
    fontSize: 14, cursor: 'pointer', transition: 'all .15s',
    background: active ? 'white' : 'transparent',
    color: active ? 'var(--primary-600)' : 'var(--neutral-500)',
    borderBottom: active ? '2px solid var(--primary-500)' : '2px solid transparent',
  });

  return (
    <div className="nf-content" style={{ padding: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <SettingsIcon size={22} />
        Configuración
      </h1>
      <p style={{ color: 'var(--neutral-500)', fontSize: 13, margin: '4px 0 16px' }}>
        Ajustes de la granja y configuración de socios
      </p>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--neutral-200)', marginBottom: 20 }}>
        <button onClick={() => setTab('granja')} style={tabStyle(tab === 'granja')}>
          <SettingsIcon size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          Granja
        </button>
        <button onClick={() => setTab('wizard')} style={tabStyle(tab === 'wizard')}>
          <Users size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          Wizard de Socios
        </button>
      </div>

      {/* ═══ TAB: Granja ═══ */}
      {tab === 'granja' && (
        <div>
          <div className="nf-card" style={{ marginBottom: 24 }}>
            <div className="nf-card-hd"><div className="nf-card-title">Información de la Granja</div></div>
            <div className="nf-card-pad">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label className="nf-label">Nombre</label><input className="nf-input" defaultValue="Granja Los Capones" /></div>
                <div><label className="nf-label">Código REGA</label><input className="nf-input" defaultValue="ES123456789" /></div>
                <div><label className="nf-label">Ubicación</label><input className="nf-input" defaultValue="Castilla y León" /></div>
                <div>
                  <label className="nf-label">Tipo Explotación</label>
                  <select className="nf-input">
                    <option>Ecológico certificado</option><option>Extensivo</option><option>Campero</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="nf-card">
            <div className="nf-card-hd"><div className="nf-card-title">Notificaciones</div></div>
            <div className="nf-card-pad">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /><span>Alertas de vacunación</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /><span>Stock de pienso bajo</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" /><span>Resumen diario producción</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: Wizard de Socios ═══ */}
      {tab === 'wizard' && (
        <div>
          {/* Progress bar */}
          <div style={{ maxWidth: 700, margin: '0 auto 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--neutral-500)', marginBottom: 6 }}>
              <span>Wizard de Socios</span>
              <span>{Math.min((['intro','r1q1','r1q2','r1q3','r1_wait','r1_results','r2q4','r2q5','r2q6','r2_wait','r2_results','r3q7','r3q8','r3q9','r3q10','r3_wait','r3_results','final'].indexOf(step) + 1), 17)}/17</span>
            </div>
            <div style={{ height: 4, background: 'var(--neutral-200)', borderRadius: 2 }}>
              <div style={{
                height: '100%', borderRadius: 2, background: 'var(--primary-500)',
                width: `${((['intro','r1q1','r1q2','r1q3','r1_wait','r1_results','r2q4','r2q5','r2q6','r2_wait','r2_results','r3q7','r3q8','r3q9','r3q10','r3_wait','r3_results','final'].indexOf(step) + 1) / 17) * 100}%`,
                transition: 'width .3s',
              }} />
            </div>
          </div>

          {/* ── INTRO ── */}
          {step === 'intro' && (
            <div style={card}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🤝</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--neutral-900)' }}>Wizard de Socios</h2>
                <p style={{ color: 'var(--neutral-500)', fontSize: 14, lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
                  Antes de empezar con la granja, los 3 socios debéis responder unas preguntas
                  sobre vuestra visión, compromiso y aportaciones. Las respuestas son <strong>individuales y privadas</strong> hasta que los 3 hayáis contestado cada ronda.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
                {SOCIOS.map(s => (
                  <div key={s.id} style={{
                    padding: '12px 16px', borderRadius: 12, textAlign: 'center',
                    background: s.id === currentUserId ? 'rgba(139,92,246,0.08)' : 'var(--neutral-50)',
                    border: `1px solid ${s.id === currentUserId ? 'var(--primary-500)' : 'var(--neutral-200)'}`,
                    minWidth: 100,
                  }}>
                    <div style={{ fontSize: 28 }}>{s.avatar}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4, color: 'var(--neutral-800)' }}>{s.nombre}</div>
                    <div style={{ fontSize: 11, color: s.id === currentUserId ? 'var(--primary-500)' : 'var(--neutral-500)' }}>
                      {s.id === currentUserId ? '← Tú' : 'Pendiente'}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => setStep('r1q1')} style={btnP}>
                  Empezar Ronda 1 <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── R1 Q1: Tiempo ── */}
          {step === 'r1q1' && (
            <div style={card}>
              <div style={{ fontSize: 11, color: 'var(--primary-500)', fontWeight: 700, marginBottom: 8 }}>RONDA 1 — Pregunta 1/3</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>
                <Clock size={20} style={{ display: 'inline', marginRight: 8 }} />
                ¿Cuánto tiempo semanal puedes dedicar?
              </h2>
              <p style={{ color: 'var(--neutral-500)', fontSize: 13, marginBottom: 16 }}>Sé honesto/a. Mejor prometer menos y cumplir más.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {TIEMPOS.map(t => (
                  <button key={t} onClick={() => setTiempo(t)} style={optBtn(tiempo === t)}>{t}</button>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>¿En qué horarios/días preferentemente?</label>
                <input value={horarios} onChange={e => setHorarios(e.target.value)} placeholder="Ej: Fines de semana, tardes entre semana…" className="nf-input" style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep('intro')} style={btnBack}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={() => setStep('r1q2')} disabled={!tiempo} style={{ ...btnP, opacity: tiempo ? 1 : 0.5 }}>Siguiente <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* ── R1 Q2: Ideas ── */}
          {step === 'r1q2' && (
            <div style={card}>
              <div style={{ fontSize: 11, color: 'var(--primary-500)', fontWeight: 700, marginBottom: 8 }}>RONDA 1 — Pregunta 2/3</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>
                <Lightbulb size={20} style={{ display: 'inline', marginRight: 8 }} />
                ¿Cuál es tu idea de negocio?
              </h2>
              <p style={{ color: 'var(--neutral-500)', fontSize: 13, marginBottom: 16 }}>Puedes seleccionar varias opciones.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {IDEAS.map(idea => (
                  <button key={idea} onClick={() => setIdeas(ideas.includes(idea) ? ideas.filter(i => i !== idea) : [...ideas, idea])} style={optBtn(ideas.includes(idea))}>
                    {ideas.includes(idea) ? '☑' : '☐'} {idea}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>Otra idea:</label>
                <input value={ideaOtra} onChange={e => setIdeaOtra(e.target.value)} placeholder="Tu propuesta…" className="nf-input" style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep('r1q1')} style={btnBack}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={() => setStep('r1q3')} disabled={ideas.length === 0} style={{ ...btnP, opacity: ideas.length > 0 ? 1 : 0.5 }}>Siguiente <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* ── R1 Q3: Aportaciones ── */}
          {step === 'r1q3' && (
            <div style={card}>
              <div style={{ fontSize: 11, color: 'var(--primary-500)', fontWeight: 700, marginBottom: 8 }}>RONDA 1 — Pregunta 3/3</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>
                <HandCoins size={20} style={{ display: 'inline', marginRight: 8 }} />
                ¿Qué aportas tú al proyecto?
              </h2>
              <p style={{ color: 'var(--neutral-500)', fontSize: 13, marginBottom: 16 }}>Marca todas las que apliquen.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
                {APORTACIONES.map(ap => (
                  <button key={ap} onClick={() => setAportaciones(aportaciones.includes(ap) ? aportaciones.filter(a => a !== ap) : [...aportaciones, ap])} style={optBtn(aportaciones.includes(ap))}>
                    {aportaciones.includes(ap) ? '☑' : '☐'} {ap}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>Otra aportación:</label>
                <input value={aportacionOtra} onChange={e => setAportacionOtra(e.target.value)} placeholder="…" className="nf-input" style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep('r1q2')} style={btnBack}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={() => simulateWait('r1_wait', 'r1_results')} disabled={aportaciones.length === 0} style={{ ...btnP, opacity: aportaciones.length > 0 ? 1 : 0.5 }}>
                  Enviar y esperar socios <Check size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── R1 WAIT (locked — can't see responses) ── */}
          {step === 'r1_wait' && (
            <div style={card}>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Lock size={48} style={{ color: 'var(--primary-500)', marginBottom: 16 }} />
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--neutral-900)' }}>Ronda 1 enviada</h2>
                <p style={{ color: 'var(--neutral-500)', fontSize: 14, lineHeight: 1.6, maxWidth: 400, margin: '0 auto 20px' }}>
                  Tus respuestas han sido registradas. Las respuestas de los demás socios permanecen <strong>ocultas</strong> hasta que todos hayan respondido.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
                  {SOCIOS.map(s => (
                    <div key={s.id} style={{
                      padding: '10px 14px', borderRadius: 10, textAlign: 'center',
                      background: s.id === currentUserId ? 'rgba(34,197,94,0.1)' : 'var(--neutral-50)',
                      border: `1px solid ${s.id === currentUserId ? 'var(--ok)' : 'var(--neutral-200)'}`,
                      minWidth: 80,
                    }}>
                      <div style={{ fontSize: 24 }}>{s.avatar}</div>
                      <div style={{ fontWeight: 600, fontSize: 12, marginTop: 2, color: 'var(--neutral-800)' }}>{s.nombre}</div>
                      <div style={{ fontSize: 11, color: s.id === currentUserId ? 'var(--ok)' : '#F59E0B', fontWeight: 600 }}>
                        {s.id === currentUserId ? '✅ Enviado' : '⏳ Pendiente'}
                      </div>
                    </div>
                  ))}
                </div>
                {waiting ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 14, color: 'var(--neutral-500)' }}>Esperando respuestas…</div>
                    <div style={{ width: 120, height: 4, background: 'var(--neutral-200)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', background: 'var(--primary-500)', borderRadius: 2, width: '60%',
                        animation: 'progressSlide 1.5s ease-in-out infinite',
                      }} />
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--neutral-400)', fontSize: 13 }}>
                    No podrás ver las respuestas de los otros socios hasta la siguiente ronda.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── R1 RESULTS ── */}
          {step === 'r1_results' && (
            <div style={{ ...card, maxWidth: 850 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>Resultados Ronda 1</h2>
                <p style={{ color: 'var(--neutral-500)', fontSize: 13 }}>Los 3 socios han respondido</p>
              </div>

              {/* Time comparison */}
              <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--neutral-800)' }}>⏰ Tiempo disponible</div>
                {getAllR1().map(r => (
                  <div key={r.userId} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', fontSize: 13 }}>
                    <span style={{ width: 70, fontWeight: 600, color: 'var(--neutral-800)' }}>{r.nombre}:</span>
                    <span style={{ color: 'var(--primary-600)' }}>{r.r1.tiempo}</span>
                    <span style={{ color: 'var(--neutral-500)', fontSize: 11 }}>({r.r1.horarios})</span>
                  </div>
                ))}
              </div>

              {/* Ideas consensus */}
              <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--neutral-800)' }}>💡 Ideas de negocio (consenso)</div>
                {countIdeas().map(([idea, count]) => (
                  <div key={idea} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', fontSize: 12 }}>
                    <span style={{
                      color: count === 3 ? 'var(--ok)' : count === 2 ? '#F59E0B' : 'var(--neutral-400)',
                      fontWeight: 700, minWidth: 20,
                    }}>
                      {count === 3 ? '✅' : count === 2 ? '⚠️' : '○'} {count}/3
                    </span>
                    <span style={{ color: 'var(--neutral-700)' }}>{idea}</span>
                  </div>
                ))}
              </div>

              {/* Contributions */}
              <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--neutral-800)' }}>🤝 Aportaciones</div>
                {getAllR1().map(r => (
                  <div key={r.userId} style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: 'var(--neutral-800)' }}>
                      {SOCIOS.find(s => s.id === r.userId)?.avatar} {r.nombre}:
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {r.r1.aportaciones.map(a => (
                        <span key={a} style={{
                          background: 'rgba(139,92,246,0.1)', color: 'var(--primary-600)',
                          padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        }}>✅ {a}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Analysis */}
              <div style={{
                background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)',
                borderRadius: 12, padding: 16, marginBottom: 20,
              }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'start', marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>🤖</span>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--neutral-800)' }}>Análisis de Seedy IA</div>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--neutral-600)', margin: '0 0 12px' }}>
                  "Buen equipo complementario. David aporta la base operativa (terreno + conocimiento + tiempo),
                  Jesús el valor añadido comercial (cocina + contactos), y Fran la digitalización.
                  Recomiendo los siguientes roles:"
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { icon: '🏠', nombre: 'David', rol: 'Director de producción', desc: 'Día a día de la granja, decisiones técnicas de manejo' },
                    { icon: '🍳', nombre: 'Jesús', rol: 'Director comercial y producto', desc: 'Relación restaurantes, diseño de producto final, elaborados' },
                    { icon: '💻', nombre: 'Fran', rol: 'Director de tecnología', desc: 'Plataforma OvoSfera, automatización, análisis de datos' },
                  ].map(r => (
                    <div key={r.nombre} style={{
                      display: 'flex', gap: 10, alignItems: 'center',
                      padding: '10px 12px', background: 'var(--neutral-50)', borderRadius: 10, border: '1px solid var(--neutral-200)',
                    }}>
                      <span style={{ fontSize: 24 }}>{r.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--neutral-800)' }}>{r.nombre} → <span style={{ color: 'var(--primary-600)' }}>{r.rol}</span></div>
                        <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>{r.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => setStep('r2q4')} style={btnP}>
                  Continuar a Ronda 2 <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── R2 Q4: Inversión ── */}
          {step === 'r2q4' && (
            <div style={card}>
              <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700, marginBottom: 8 }}>RONDA 2 — Pregunta 4/6</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>
                <HandCoins size={20} style={{ display: 'inline', marginRight: 8 }} />
                ¿Cuánto puedes invertir inicialmente?
              </h2>
              <p style={{ color: 'var(--neutral-500)', fontSize: 13, marginBottom: 16 }}>Sé realista con tu presupuesto disponible.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {INVERSIONES.map(i => (
                  <button key={i} onClick={() => setInversion(i)} style={optBtn(inversion === i)}>{i}</button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep('r1_results')} style={btnBack}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={() => setStep('r2q5')} disabled={!inversion} style={{ ...btnP, opacity: inversion ? 1 : 0.5 }}>Siguiente <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* ── R2 Q5: Decisiones ── */}
          {step === 'r2q5' && (
            <div style={card}>
              <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700, marginBottom: 8 }}>RONDA 2 — Pregunta 5/6</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>
                <Vote size={20} style={{ display: 'inline', marginRight: 8 }} />
                ¿Quién decide si no hay consenso?
              </h2>
              <p style={{ color: 'var(--neutral-500)', fontSize: 13, marginBottom: 16 }}>Definir esto ahora evita conflictos futuros.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {DECISIONES.map(d => (
                  <button key={d} onClick={() => setDecision(d)} style={optBtn(decision === d)}>{d}</button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep('r2q4')} style={btnBack}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={() => setStep('r2q6')} disabled={!decision} style={{ ...btnP, opacity: decision ? 1 : 0.5 }}>Siguiente <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* ── R2 Q6: Reparto ── */}
          {step === 'r2q6' && (
            <div style={card}>
              <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700, marginBottom: 8 }}>RONDA 2 — Pregunta 6/6</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>
                <BarChart3 size={20} style={{ display: 'inline', marginRight: 8 }} />
                Reparto de beneficios
              </h2>
              <p style={{ color: 'var(--neutral-500)', fontSize: 13, marginBottom: 16 }}>¿Cómo se deben repartir los beneficios (cuando los haya)?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {REPARTOS.map(r => (
                  <button key={r} onClick={() => setReparto(r)} style={optBtn(reparto === r)}>{r}</button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep('r2q5')} style={btnBack}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={() => simulateWait('r2_wait', 'r2_results')} disabled={!reparto} style={{ ...btnP, opacity: reparto ? 1 : 0.5 }}>
                  Enviar y esperar socios <Check size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── R2 WAIT (locked) ── */}
          {step === 'r2_wait' && (
            <div style={card}>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Lock size={48} style={{ color: '#F59E0B', marginBottom: 16 }} />
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--neutral-900)' }}>Ronda 2 enviada</h2>
                <p style={{ color: 'var(--neutral-500)', fontSize: 14, lineHeight: 1.6, maxWidth: 400, margin: '0 auto 20px' }}>
                  Tus respuestas han sido registradas. Las respuestas de los otros socios permanecen <strong>ocultas</strong> hasta que todos hayan respondido.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
                  {SOCIOS.map(s => (
                    <div key={s.id} style={{
                      padding: '10px 14px', borderRadius: 10, textAlign: 'center',
                      background: s.id === currentUserId ? 'rgba(34,197,94,0.1)' : 'var(--neutral-50)',
                      border: `1px solid ${s.id === currentUserId ? 'var(--ok)' : 'var(--neutral-200)'}`,
                      minWidth: 80,
                    }}>
                      <div style={{ fontSize: 24 }}>{s.avatar}</div>
                      <div style={{ fontWeight: 600, fontSize: 12, marginTop: 2, color: 'var(--neutral-800)' }}>{s.nombre}</div>
                      <div style={{ fontSize: 11, color: s.id === currentUserId ? 'var(--ok)' : '#F59E0B', fontWeight: 600 }}>
                        {s.id === currentUserId ? '✅ Enviado' : '⏳ Pendiente'}
                      </div>
                    </div>
                  ))}
                </div>
                {waiting ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 14, color: 'var(--neutral-500)' }}>Esperando respuestas…</div>
                    <div style={{ width: 120, height: 4, background: 'var(--neutral-200)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', background: '#F59E0B', borderRadius: 2, width: '60%',
                        animation: 'progressSlide 1.5s ease-in-out infinite',
                      }} />
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--neutral-400)', fontSize: 13 }}>
                    No podrás ver las respuestas hasta la siguiente ronda.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── R2 RESULTS ── */}
          {step === 'r2_results' && (
            <div style={{ ...card, maxWidth: 850 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>Resultados Ronda 2</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                {getAllR1().map(r => (
                  <div key={r.userId} style={{
                    background: 'var(--neutral-50)', borderRadius: 12, padding: 14,
                    border: '1px solid var(--neutral-200)',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, textAlign: 'center', color: 'var(--neutral-800)' }}>
                      {SOCIOS.find(s => s.id === r.userId)?.avatar} {r.nombre}
                    </div>
                    {[
                      { l: 'Inversión', v: r.r2.inversion },
                      { l: 'Decisiones', v: r.r2.decision },
                      { l: 'Reparto', v: r.r2.reparto },
                    ].map(item => (
                      <div key={item.l} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>{item.l}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-800)' }}>{item.v}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => setStep('r3q7')} style={btnP}>
                  Continuar a Ronda 3 <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── R3 Q7: Objetivos 1 año ── */}
          {step === 'r3q7' && (
            <div style={card}>
              <div style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginBottom: 8 }}>RONDA 3 — Pregunta 7/10</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>
                🎯 Objetivos a 1 año
              </h2>
              <p style={{ color: 'var(--neutral-500)', fontSize: 13, marginBottom: 16 }}>¿Qué quieres haber conseguido en 12 meses? Selecciona los más importantes.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {OBJETIVOS_1Y.map(o => (
                  <button key={o} onClick={() => setObjetivo1y(objetivo1y.includes(o) ? objetivo1y.filter(x => x !== o) : [...objetivo1y, o])} style={optBtn(objetivo1y.includes(o))}>
                    {objetivo1y.includes(o) ? '☑' : '☐'} {o}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep('r2_results')} style={btnBack}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={() => setStep('r3q8')} disabled={objetivo1y.length === 0} style={{ ...btnP, opacity: objetivo1y.length > 0 ? 1 : 0.5 }}>Siguiente <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* ── R3 Q8: KPIs ── */}
          {step === 'r3q8' && (
            <div style={card}>
              <div style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginBottom: 8 }}>RONDA 3 — Pregunta 8/10</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>
                📊 KPIs clave para tu negocio
              </h2>
              <p style={{ color: 'var(--neutral-500)', fontSize: 13, marginBottom: 16 }}>¿Qué métricas deben estar en el dashboard?</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16 }}>
                {KPIS_OPTIONS.map(k => (
                  <button key={k} onClick={() => setKpis(kpis.includes(k) ? kpis.filter(x => x !== k) : [...kpis, k])} style={optBtn(kpis.includes(k))}>
                    {kpis.includes(k) ? '☑' : '☐'} {k}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep('r3q7')} style={btnBack}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={() => setStep('r3q9')} disabled={kpis.length === 0} style={{ ...btnP, opacity: kpis.length > 0 ? 1 : 0.5 }}>Siguiente <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* ── R3 Q9: Riesgos ── */}
          {step === 'r3q9' && (
            <div style={card}>
              <div style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginBottom: 8 }}>RONDA 3 — Pregunta 9/10</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>
                ⚠️ Riesgos que te preocupan
              </h2>
              <p style={{ color: 'var(--neutral-500)', fontSize: 13, marginBottom: 16 }}>Identificarlos ahora permite preparar mitigaciones.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16 }}>
                {RIESGOS_OPTIONS.map(r => (
                  <button key={r} onClick={() => setRiesgos(riesgos.includes(r) ? riesgos.filter(x => x !== r) : [...riesgos, r])} style={optBtn(riesgos.includes(r))}>
                    {riesgos.includes(r) ? '☑' : '☐'} {r}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep('r3q8')} style={btnBack}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={() => setStep('r3q10')} disabled={riesgos.length === 0} style={{ ...btnP, opacity: riesgos.length > 0 ? 1 : 0.5 }}>Siguiente <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* ── R3 Q10: Herramientas ── */}
          {step === 'r3q10' && (
            <div style={card}>
              <div style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginBottom: 8 }}>RONDA 3 — Pregunta 10/10</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>
                🛠️ Herramientas digitales prioritarias
              </h2>
              <p style={{ color: 'var(--neutral-500)', fontSize: 13, marginBottom: 16 }}>¿Qué funciones de OvoSfera Hub serían más valiosas?</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16 }}>
                {HERRAMIENTAS_OPTIONS.map(h => (
                  <button key={h} onClick={() => setHerramientas(herramientas.includes(h) ? herramientas.filter(x => x !== h) : [...herramientas, h])} style={optBtn(herramientas.includes(h))}>
                    {herramientas.includes(h) ? '☑' : '☐'} {h}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep('r3q9')} style={btnBack}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={() => simulateWait('r3_wait', 'r3_results')} disabled={herramientas.length === 0} style={{ ...btnP, opacity: herramientas.length > 0 ? 1 : 0.5 }}>
                  Enviar y generar informe IA <Check size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── R3 WAIT ── */}
          {step === 'r3_wait' && (
            <div style={card}>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Lock size={48} style={{ color: '#10B981', marginBottom: 16 }} />
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--neutral-900)' }}>Ronda 3 enviada</h2>
                <p style={{ color: 'var(--neutral-500)', fontSize: 14, lineHeight: 1.6, maxWidth: 400, margin: '0 auto 20px' }}>
                  Esperando a que los 3 socios completen la ronda de inteligencia de negocio…
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
                  {SOCIOS.map(s => (
                    <div key={s.id} style={{
                      padding: '10px 14px', borderRadius: 10, textAlign: 'center',
                      background: s.id === currentUserId ? 'rgba(34,197,94,0.1)' : 'var(--neutral-50)',
                      border: `1px solid ${s.id === currentUserId ? 'var(--ok)' : 'var(--neutral-200)'}`,
                      minWidth: 80,
                    }}>
                      <div style={{ fontSize: 24 }}>{s.avatar}</div>
                      <div style={{ fontWeight: 600, fontSize: 12, marginTop: 2, color: 'var(--neutral-800)' }}>{s.nombre}</div>
                      <div style={{ fontSize: 11, color: s.id === currentUserId ? 'var(--ok)' : '#F59E0B', fontWeight: 600 }}>
                        {s.id === currentUserId ? '✅ Enviado' : '⏳ Pendiente'}
                      </div>
                    </div>
                  ))}
                </div>
                {waiting && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 14, color: 'var(--neutral-500)' }}>🤖 Seedy IA está generando el informe…</div>
                    <div style={{ width: 120, height: 4, background: 'var(--neutral-200)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#10B981', borderRadius: 2, width: '60%', animation: 'progressSlide 1.5s ease-in-out infinite' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── R3 RESULTS (Claude Report) ── */}
          {step === 'r3_results' && (
            <div style={{ ...card, maxWidth: 900 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🤖</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>Informe Seedy IA — Ronda 3</h2>
                <p style={{ color: 'var(--neutral-500)', fontSize: 13 }}>Análisis de inteligencia de negocio basado en las respuestas de los 3 socios</p>
              </div>

              {/* Objetivos consensus */}
              <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--neutral-800)' }}>🎯 Objetivos a 1 año (consenso)</div>
                {(() => {
                  const counts: Record<string, number> = {};
                  getAllR1().forEach(r => r.r3.objetivo1y.forEach(o => { counts[o] = (counts[o] || 0) + 1; }));
                  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([obj, count]) => (
                    <div key={obj} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', fontSize: 12 }}>
                      <span style={{ color: count === 3 ? 'var(--ok)' : count === 2 ? '#F59E0B' : 'var(--neutral-400)', fontWeight: 700, minWidth: 20 }}>
                        {count === 3 ? '✅' : count === 2 ? '⚠️' : '○'} {count}/3
                      </span>
                      <span style={{ color: 'var(--neutral-700)' }}>{obj}</span>
                    </div>
                  ));
                })()}
              </div>

              {/* KPIs priority */}
              <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--neutral-800)' }}>📊 KPIs prioritarios</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(() => {
                    const counts: Record<string, number> = {};
                    getAllR1().forEach(r => r.r3.kpis.forEach(k => { counts[k] = (counts[k] || 0) + 1; }));
                    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([kpi, count]) => (
                      <span key={kpi} style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: count >= 2 ? 'rgba(22,163,74,0.1)' : 'var(--neutral-100)',
                        color: count >= 2 ? 'var(--ok)' : 'var(--neutral-600)',
                        border: `1px solid ${count >= 2 ? 'rgba(22,163,74,0.2)' : 'var(--neutral-200)'}`,
                      }}>
                        {kpi} ({count}/3)
                      </span>
                    ));
                  })()}
                </div>
              </div>

              {/* Risk matrix */}
              <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--neutral-800)' }}>⚠️ Matriz de riesgos</div>
                {(() => {
                  const counts: Record<string, number> = {};
                  getAllR1().forEach(r => r.r3.riesgos.forEach(ri => { counts[ri] = (counts[ri] || 0) + 1; }));
                  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([risk, count]) => (
                    <div key={risk} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: count === 3 ? 'var(--alert)' : count === 2 ? '#F59E0B' : 'var(--neutral-300)',
                      }} />
                      <span style={{ fontSize: 13, color: 'var(--neutral-700)', flex: 1 }}>{risk}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                        background: count === 3 ? 'rgba(220,38,38,0.1)' : count === 2 ? 'rgba(245,158,11,0.1)' : 'var(--neutral-100)',
                        color: count === 3 ? 'var(--alert)' : count === 2 ? '#F59E0B' : 'var(--neutral-500)',
                      }}>
                        {count === 3 ? 'ALTO' : count === 2 ? 'MEDIO' : 'BAJO'}
                      </span>
                    </div>
                  ));
                })()}
              </div>

              {/* AI Strategic Report */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(176,125,43,0.05), rgba(139,92,246,0.05))',
                border: '1px solid rgba(176,125,43,0.15)', borderRadius: 12, padding: 20, marginBottom: 20,
              }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 24 }}>🌱</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--neutral-900)' }}>Informe Estratégico de Seedy IA</div>
                    <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>Generado a partir de las respuestas de los 3 socios</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--neutral-700)' }}>
                  <p style={{ margin: '0 0 12px' }}>
                    <strong>Diagnóstico:</strong> Equipo con fuerte complementariedad. David aporta la base productiva
                    (terreno + conocimiento + dedicación máxima), Jesús conecta con el mercado final (cocina + restauración),
                    y Fran digitaliza y optimiza. Existe consenso claro en el producto estrella: <strong>capones gourmet para Navidad</strong>.
                  </p>
                  <p style={{ margin: '0 0 12px' }}>
                    <strong>Fortalezas:</strong> Diferenciación por calidad (producto artesanal y ecológico),
                    mercado con demanda insatisfecha en segmento premium navideño, y plataforma tecnológica OvoSfera Hub
                    como ventaja competitiva para trazabilidad y gestión.
                  </p>
                  <p style={{ margin: '0 0 12px' }}>
                    <strong>Riesgos críticos:</strong> La sanidad aviar es el riesgo #1 que coincidís todos.
                    Recomiendo: programa de bioseguridad desde el día 1, veterinario de referencia, y protocolo
                    de cuarentena para nuevas incorporaciones al plantel.
                  </p>
                  <p style={{ margin: '0 0 12px' }}>
                    <strong>Roadmap recomendado (12 meses):</strong>
                  </p>
                  <ol style={{ paddingLeft: 20, margin: '0 0 12px' }}>
                    <li><strong>Mes 1-2:</strong> Infraestructura básica + adquisición de reproductores seleccionados (Castellana Negra × Plymouth Rock)</li>
                    <li><strong>Mes 2-3:</strong> Primera incubación, registro ecológico iniciado</li>
                    <li><strong>Mes 3-6:</strong> Cría y selección, marca "Los Capones" registrada, preventa a restaurantes</li>
                    <li><strong>Mes 6-9:</strong> Caponización, engorde con plan nutricional optimizado</li>
                    <li><strong>Mes 9-11:</strong> Acabado/finición con receta premium (castañas + leche)</li>
                    <li><strong>Mes 11-12:</strong> Venta navideña, primer cierre económico, lecciones aprendidas</li>
                  </ol>
                  <p style={{ margin: '0 0 12px' }}>
                    <strong>Inversión estimada:</strong> ~4.000-6.000€ entre los 3 socios (infraestructura 2.500€ + animales 1.000€ + pienso 800€ + certificación 500€ + imprevistos 500€).
                    Breakeven estimado en el primer ciclo navideño si se venden 30+ capones a precio premium (25-35€/kg).
                  </p>
                  <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--primary-600)' }}>
                    "Tenéis todos los ingredientes: tierra, conocimiento, cocina, tecnología y sobre todo, la pasión.
                    OvoSfera Hub os ayudará a convertir esas respuestas en resultados medibles. ¡Adelante!" — Seedy 🌱
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => setStep('final')} style={btnP}>
                  Ver acuerdo final <FileText size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── FINAL AGREEMENT ── */}
          {step === 'final' && (
            <div style={{ ...card, maxWidth: 850 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🤝</div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>Acuerdo de Socios</h2>
                <p style={{ color: 'var(--neutral-500)', fontSize: 13 }}>Granja Los Capones — OvoSfera</p>
              </div>
              <div style={{
                background: 'var(--neutral-50)', borderRadius: 12, padding: 20, marginBottom: 20,
                border: '1px solid var(--neutral-200)', fontSize: 13, lineHeight: 1.8, color: 'var(--neutral-700)',
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, color: 'var(--neutral-900)' }}>1. Socios y roles</h3>
                {[
                  { n: 'David', rol: 'Director de producción', tiempo: SIMULATED.david.r1.tiempo, inv: SIMULATED.david.r2.inversion },
                  { n: 'Jesús', rol: 'Director comercial', tiempo: SIMULATED.jesus.r1.tiempo, inv: SIMULATED.jesus.r2.inversion },
                  { n: 'Fran', rol: 'Director de tecnología', tiempo: SIMULATED.fran.r1.tiempo, inv: SIMULATED.fran.r2.inversion },
                ].map(s => (
                  <div key={s.n} style={{ padding: '6px 0' }}>
                    <strong>{s.n}</strong> — {s.rol} · {s.tiempo}/sem · Inversión: {s.inv}
                  </div>
                ))}

                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '16px 0 12px', color: 'var(--neutral-900)' }}>2. Modelo de negocio</h3>
                <p>Consenso: <strong>Capones gourmet para Navidad</strong> (3/3 de acuerdo) +
                  <strong> Huevos ecológicos venta directa</strong> (2/3).</p>

                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '16px 0 12px', color: 'var(--neutral-900)' }}>3. Toma de decisiones</h3>
                <p>Mayoría simple (2 de 3). En caso de empate, decide el responsable del área afectada según su rol.</p>

                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '16px 0 12px', color: 'var(--neutral-900)' }}>4. Reparto de beneficios</h3>
                <p>Se aplicará el modelo de <strong>partes iguales (33/33/33)</strong>, revisable cada 6 meses
                  según la dedicación real de cada socio.</p>

                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '16px 0 12px', color: 'var(--neutral-900)' }}>5. Próximos pasos</h3>
                <ol style={{ paddingLeft: 20 }}>
                  <li>Configurar la granja en OvoSfera Hub (gallineros, aves)</li>
                  <li>Adquirir primeros reproductores (Castellana Negra + Plymouth Rock)</li>
                  <li>Planificar primer lote de incubación (febrero-marzo)</li>
                  <li>Registrar marca "Los Capones" / solicitar certificación ecológica</li>
                  <li>Contactar restaurantes locales para preventa de capones Navidad</li>
                </ol>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Link href="/dashboard" style={{ ...btnP, textDecoration: 'none' }}>
                  Ir al Dashboard <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          )}

          <style jsx>{`
            @keyframes progressSlide {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(300%); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
