'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Settings as SettingsIcon, Users, ChevronRight, ChevronLeft, Check,
  Clock, Lightbulb, HandCoins, BarChart3, Vote, FileText
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
  const currentUserId = user?.name?.toLowerCase() || 'david';

  /* ── localStorage persistence ── */
  const WIZARD_KEY = `wizard_${currentUserId}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WIZARD_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.step) setStep(d.step);
        if (d.tiempo) setTiempo(d.tiempo);
        if (d.horarios) setHorarios(d.horarios);
        if (d.ideas) setIdeas(d.ideas);
        if (d.ideaOtra) setIdeaOtra(d.ideaOtra);
        if (d.aportaciones) setAportaciones(d.aportaciones);
        if (d.aportacionOtra) setAportacionOtra(d.aportacionOtra);
        if (d.inversion) setInversion(d.inversion);
        if (d.decision) setDecision(d.decision);
        if (d.reparto) setReparto(d.reparto);
        if (d.objetivo1y) setObjetivo1y(d.objetivo1y);
        if (d.kpis) setKpis(d.kpis);
        if (d.riesgos) setRiesgos(d.riesgos);
        if (d.herramientas) setHerramientas(d.herramientas);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveProgress(nextStep: Step) {
    try {
      localStorage.setItem(WIZARD_KEY, JSON.stringify({
        step: nextStep, tiempo, horarios, ideas, ideaOtra,
        aportaciones, aportacionOtra, inversion, decision, reparto,
        objetivo1y, kpis, riesgos, herramientas,
      }));
    } catch {}
    setStep(nextStep);
  }

  /* ── Round completion checks ── */
  const r1Done = !!(tiempo && ideas.length > 0 && aportaciones.length > 0);
  const r2Done = !!(inversion && decision && reparto);
  const r3Done = !!(objetivo1y.length > 0 && kpis.length > 0 && riesgos.length > 0 && herramientas.length > 0);

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
            {/* Reset button */}
            {step !== 'intro' && (
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <button
                  onClick={() => {
                    if (!confirm('¿Resetear todas las respuestas del wizard? Se perderán tus respuestas guardadas.')) return;
                    setStep('intro');
                    setTiempo(''); setHorarios(''); setIdeas([]); setIdeaOtra('');
                    setAportaciones([]); setAportacionOtra(''); setInversion('');
                    setDecision(''); setReparto('');
                    setObjetivo1y([]); setKpis([]); setRiesgos([]); setHerramientas([]);
                    try { localStorage.removeItem(`wizard_${currentUserId}`); } catch {}
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--neutral-400)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  🔄 Resetear mis respuestas
                </button>
              </div>
            )}
          </div>

          {/* ── INTRO ── */}
          {step === 'intro' && (
            <div style={card}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🤝</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--neutral-900)' }}>Wizard de Socios</h2>
                <p style={{ color: 'var(--neutral-500)', fontSize: 14, lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
                  Responde las preguntas sobre tu visión, compromiso y aportaciones al proyecto.
                  Tus respuestas se guardan localmente. Cuando los 3 socios hayáis respondido,
                  se generará el informe comparativo.
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
                    <div style={{ fontSize: 11, color: s.id === currentUserId ? 'var(--primary-500)' : 'var(--neutral-400)' }}>
                      {s.id === currentUserId ? '← Tú' : '⏳ No ha respondido'}
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
                <button onClick={() => saveProgress('r1_results')} disabled={aportaciones.length === 0} style={{ ...btnP, opacity: aportaciones.length > 0 ? 1 : 0.5 }}>
                  Guardar y continuar <Check size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── R1 WAIT (unused — skip directly to results) ── */}

          {/* ── R1 RESULTS — Resumen de tus respuestas ── */}
          {step === 'r1_results' && (
            <div style={{ ...card, maxWidth: 850 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>Ronda 1 completada</h2>
                <p style={{ color: 'var(--neutral-500)', fontSize: 13 }}>Tus respuestas han sido guardadas</p>
              </div>

              {/* Tu resumen */}
              <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--neutral-800)' }}>⏰ Tu tiempo disponible</div>
                <div style={{ fontSize: 13, color: 'var(--primary-600)', fontWeight: 600 }}>{tiempo}</div>
                {horarios && <div style={{ fontSize: 12, color: 'var(--neutral-500)', marginTop: 4 }}>{horarios}</div>}
              </div>

              <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--neutral-800)' }}>💡 Tus ideas de negocio</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ideas.map(idea => (
                    <div key={idea} style={{ fontSize: 12, color: 'var(--neutral-700)', padding: '4px 0' }}>• {idea}</div>
                  ))}
                  {ideaOtra && <div style={{ fontSize: 12, color: 'var(--primary-600)', padding: '4px 0' }}>• {ideaOtra}</div>}
                </div>
              </div>

              <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--neutral-800)' }}>🤝 Tus aportaciones</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {aportaciones.map(a => (
                    <span key={a} style={{
                      background: 'rgba(139,92,246,0.1)', color: 'var(--primary-600)',
                      padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    }}>✅ {a}</span>
                  ))}
                </div>
              </div>

              {/* Esperando socios */}
              <div style={{
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>⏳</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--neutral-800)', marginBottom: 6 }}>Esperando a los otros socios</div>
                <p style={{ fontSize: 12, color: 'var(--neutral-500)', margin: 0, lineHeight: 1.6 }}>
                  Cuando Jesús y Fran completen la Ronda 1, podrás ver el análisis comparativo.
                  Mientras tanto, puedes continuar con la siguiente ronda.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => saveProgress('r2q4')} style={btnP}>
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
                <button onClick={() => saveProgress('r2_results')} disabled={!reparto} style={{ ...btnP, opacity: reparto ? 1 : 0.5 }}>
                  Guardar y continuar <Check size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── R2 WAIT — unused, skip directly ── */}

          {/* ── R2 RESULTS — Resumen de tus respuestas ── */}
          {step === 'r2_results' && (
            <div style={{ ...card, maxWidth: 850 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>Ronda 2 completada</h2>
                <p style={{ color: 'var(--neutral-500)', fontSize: 13 }}>Tus respuestas han sido guardadas</p>
              </div>

              <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--neutral-800)' }}>💰 Tu inversión</div>
                <div style={{ fontSize: 13, color: 'var(--primary-600)', fontWeight: 600 }}>{inversion}</div>
              </div>

              <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--neutral-800)' }}>🗳️ Toma de decisiones</div>
                <div style={{ fontSize: 13, color: 'var(--primary-600)', fontWeight: 600 }}>{decision}</div>
              </div>

              <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--neutral-800)' }}>📊 Reparto de beneficios</div>
                <div style={{ fontSize: 13, color: 'var(--primary-600)', fontWeight: 600 }}>{reparto}</div>
              </div>

              {/* Esperando socios */}
              <div style={{
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>⏳</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--neutral-800)', marginBottom: 6 }}>Esperando a los otros socios</div>
                <p style={{ fontSize: 12, color: 'var(--neutral-500)', margin: 0, lineHeight: 1.6 }}>
                  Cuando Jesús y Fran completen la Ronda 2, podrás ver las comparativas.
                  Mientras tanto, continúa con la última ronda.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => saveProgress('r3q7')} style={btnP}>
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
                <button onClick={() => saveProgress('r3_results')} disabled={herramientas.length === 0} style={{ ...btnP, opacity: herramientas.length > 0 ? 1 : 0.5 }}>
                  Guardar y finalizar <Check size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── R3 WAIT — unused, skip directly ── */}

          {/* ── R3 RESULTS — Resumen final de tus respuestas ── */}
          {step === 'r3_results' && (
            <div style={{ ...card, maxWidth: 850 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>Ronda 3 completada</h2>
                <p style={{ color: 'var(--neutral-500)', fontSize: 13 }}>Tus respuestas de inteligencia de negocio</p>
              </div>

              <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--neutral-800)' }}>🎯 Tus objetivos a 1 año</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {objetivo1y.map(o => (
                    <div key={o} style={{ fontSize: 12, color: 'var(--neutral-700)' }}>• {o}</div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--neutral-800)' }}>📊 KPIs que priorizas</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {kpis.map(k => (
                    <span key={k} style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: 'rgba(22,163,74,0.1)', color: 'var(--ok)',
                      border: '1px solid rgba(22,163,74,0.2)',
                    }}>{k}</span>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--neutral-800)' }}>⚠️ Riesgos que te preocupan</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {riesgos.map(r => (
                    <div key={r} style={{ fontSize: 12, color: 'var(--neutral-700)' }}>• {r}</div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--neutral-800)' }}>🛠️ Herramientas prioritarias</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {herramientas.map(h => (
                    <span key={h} style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: 'rgba(139,92,246,0.1)', color: 'var(--primary-600)',
                      border: '1px solid rgba(139,92,246,0.2)',
                    }}>{h}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => saveProgress('final')} style={btnP}>
                  Ver resumen final <FileText size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── FINAL — Resumen completo + esperando socios ── */}
          {step === 'final' && (
            <div style={{ ...card, maxWidth: 850 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: 'var(--neutral-900)' }}>¡Has completado las 3 rondas!</h2>
                <p style={{ color: 'var(--neutral-500)', fontSize: 13 }}>Resumen de todas tus respuestas</p>
              </div>

              {/* Resumen compacto de las 3 rondas */}
              <div style={{
                background: 'var(--neutral-50)', borderRadius: 12, padding: 20, marginBottom: 16,
                border: '1px solid var(--neutral-200)', fontSize: 13, lineHeight: 1.8, color: 'var(--neutral-700)',
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, color: 'var(--neutral-900)' }}>Ronda 1 — Visión y compromiso</h3>
                <div style={{ padding: '4px 0' }}><strong>Tiempo semanal:</strong> {tiempo}</div>
                {horarios && <div style={{ padding: '4px 0' }}><strong>Horarios:</strong> {horarios}</div>}
                <div style={{ padding: '4px 0' }}><strong>Ideas:</strong> {ideas.join(', ')}</div>
                {ideaOtra && <div style={{ padding: '4px 0' }}><strong>Otra idea:</strong> {ideaOtra}</div>}
                <div style={{ padding: '4px 0' }}><strong>Aportaciones:</strong> {aportaciones.join(', ')}</div>
                {aportacionOtra && <div style={{ padding: '4px 0' }}><strong>Otra aportación:</strong> {aportacionOtra}</div>}

                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '16px 0 12px', color: 'var(--neutral-900)' }}>Ronda 2 — Organización</h3>
                <div style={{ padding: '4px 0' }}><strong>Inversión:</strong> {inversion}</div>
                <div style={{ padding: '4px 0' }}><strong>Decisiones:</strong> {decision}</div>
                <div style={{ padding: '4px 0' }}><strong>Reparto:</strong> {reparto}</div>

                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '16px 0 12px', color: 'var(--neutral-900)' }}>Ronda 3 — Inteligencia de negocio</h3>
                <div style={{ padding: '4px 0' }}><strong>Objetivos 1 año:</strong> {objetivo1y.join(', ')}</div>
                <div style={{ padding: '4px 0' }}><strong>KPIs:</strong> {kpis.join(', ')}</div>
                <div style={{ padding: '4px 0' }}><strong>Riesgos:</strong> {riesgos.join(', ')}</div>
                <div style={{ padding: '4px 0' }}><strong>Herramientas:</strong> {herramientas.join(', ')}</div>
              </div>

              {/* Estado de los socios */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(139,92,246,0.06))',
                border: '1px solid rgba(245,158,11,0.15)', borderRadius: 12, padding: 20, marginBottom: 20,
              }}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--neutral-900)' }}>Esperando a los demás socios</div>
                  <p style={{ fontSize: 13, color: 'var(--neutral-500)', margin: '8px 0 0' }}>
                    Cuando Jesús y Fran completen sus 3 rondas, Seedy IA generará el informe comparativo
                    y la propuesta de acuerdo de socios.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  {SOCIOS.map(s => (
                    <div key={s.id} style={{
                      padding: '12px 16px', borderRadius: 12, textAlign: 'center',
                      background: s.id === currentUserId ? 'rgba(34,197,94,0.1)' : 'var(--neutral-50)',
                      border: `1px solid ${s.id === currentUserId ? 'var(--ok)' : 'var(--neutral-200)'}`,
                      minWidth: 100,
                    }}>
                      <div style={{ fontSize: 28 }}>{s.avatar}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4, color: 'var(--neutral-800)' }}>{s.nombre}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: s.id === currentUserId ? 'var(--ok)' : '#F59E0B' }}>
                        {s.id === currentUserId ? '✅ Completado' : '⏳ No ha respondido'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Link href="/dashboard" style={{ ...btnP, textDecoration: 'none' }}>
                  Ir al Dashboard <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
