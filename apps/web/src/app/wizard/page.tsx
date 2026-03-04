'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  ChevronRight, ChevronLeft, Check, Users, Clock, Lightbulb,
  HandCoins, BarChart3, Vote, FileText, Download, X
} from 'lucide-react';
import Link from 'next/link';

/* ── Types ─────────────────────────────────────────── */
type Step = 'intro' | 'r1q1' | 'r1q2' | 'r1q3' | 'r1_results' | 'r2q4' | 'r2q5' | 'r2q6' | 'r2_results' | 'final';

interface Respuesta {
  userId: string;
  nombre: string;
  r1: { tiempo: string; horarios: string; ideas: string[]; ideaOtra: string; aportaciones: string[]; aportacionOtra: string };
  r2: { inversion: string; decision: string; reparto: string };
}

/* ── Demo partners ────────────────────────────────── */
const SOCIOS = [
  { id: 'david', nombre: 'David', email: 'david@ovosfera.com', avatar: '🏠' },
  { id: 'jesus', nombre: 'Jesús', email: 'jesus@ovosfera.com', avatar: '🍳' },
  { id: 'fran', nombre: 'Fran', email: 'fran@ovosfera.com', avatar: '💻' },
];

const TIEMPOS = ['< 2 horas', '2-5 horas', '5-10 horas', '10-20 horas', 'Dedicación completa'];
const IDEAS = [
  'Capones gourmet para Navidad (producción estacional, alto margen)',
  'Huevos ecológicos venta directa (producción continua, margen medio)',
  'Picantones y pollos eco para restauración (producción continua, volumen)',
  'Conservación de razas autóctonas + genética (nicho, prestigio)',
  'Agroturismo: visitas a la granja + venta in situ',
  'Formación: cursos de avicultura extensiva',
  'Todo lo anterior (diversificación máxima)',
];
const APORTACIONES = [
  'Terreno y espacio',
  'Conocimiento ganadero / agrícola',
  'Capital para inversión inicial',
  'Mano de obra diaria',
  'Contactos comerciales (restaurantes, tiendas, mercados)',
  'Tecnología y digitalización',
  'Cocina y transformación (elaborados)',
  'Marketing y ventas',
];
const INVERSIONES = ['0€', '< 500€', '500-1.000€', '1.000-3.000€', '> 3.000€'];
const DECISIONES = ['Mayoría simple', 'El que más sabe del tema', 'Rotativo mensual', 'Siempre David (dueño del terreno)'];
const REPARTOS = ['Partes iguales (33/33/33)', 'Proporcional a dedicación', 'Proporcional a inversión'];

/* ── Simulated responses from other socios ────────── */
const SIMULATED: Record<string, Respuesta> = {
  david: {
    userId: 'david', nombre: 'David',
    r1: {
      tiempo: '10-20 horas', horarios: 'En la finca, mañanas y tardes entre semana',
      ideas: ['Capones gourmet para Navidad (producción estacional, alto margen)', 'Huevos ecológicos venta directa (producción continua, margen medio)'],
      ideaOtra: '',
      aportaciones: ['Terreno y espacio', 'Conocimiento ganadero / agrícola', 'Mano de obra diaria'],
      aportacionOtra: '',
    },
    r2: { inversion: '1.000-3.000€', decision: 'Mayoría simple', reparto: 'Proporcional a dedicación' },
  },
  jesus: {
    userId: 'jesus', nombre: 'Jesús',
    r1: {
      tiempo: '5-10 horas', horarios: 'Cocina y fines de semana, alguna tarde',
      ideas: ['Capones gourmet para Navidad (producción estacional, alto margen)', 'Huevos ecológicos venta directa (producción continua, margen medio)', 'Agroturismo: visitas a la granja + venta in situ'],
      ideaOtra: '',
      aportaciones: ['Cocina y transformación (elaborados)', 'Contactos comerciales (restaurantes, tiendas, mercados)', 'Capital para inversión inicial'],
      aportacionOtra: '',
    },
    r2: { inversion: '500-1.000€', decision: 'El que más sabe del tema', reparto: 'Partes iguales (33/33/33)' },
  },
  fran: {
    userId: 'fran', nombre: 'Fran',
    r1: {
      tiempo: '2-5 horas', horarios: 'Tech y remoto, flexible por la noche',
      ideas: ['Capones gourmet para Navidad (producción estacional, alto margen)', 'Conservación de razas autóctonas + genética (nicho, prestigio)'],
      ideaOtra: '',
      aportaciones: ['Tecnología y digitalización', 'Marketing y ventas'],
      aportacionOtra: '',
    },
    r2: { inversion: '500-1.000€', decision: 'Mayoría simple', reparto: 'Partes iguales (33/33/33)' },
  },
};

/* ══════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════ */
export default function WizardPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('intro');

  // My responses
  const [tiempo, setTiempo] = useState('');
  const [horarios, setHorarios] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [ideaOtra, setIdeaOtra] = useState('');
  const [aportaciones, setAportaciones] = useState<string[]>([]);
  const [aportacionOtra, setAportacionOtra] = useState('');
  const [inversion, setInversion] = useState('');
  const [decision, setDecision] = useState('');
  const [reparto, setReparto] = useState('');

  // Simulated waiting
  const [waiting, setWaiting] = useState(false);

  const currentUserId = user?.name?.toLowerCase() || 'david';
  const otherSocios = SOCIOS.filter(s => s.id !== currentUserId);

  function simulateWait(next: Step) {
    setWaiting(true);
    setTimeout(() => { setWaiting(false); setStep(next); }, 2000);
  }

  // Get all responses for display
  function getAllR1(): Respuesta[] {
    const mine: Respuesta = {
      userId: currentUserId, nombre: user?.name || 'Tú',
      r1: { tiempo, horarios, ideas, ideaOtra, aportaciones, aportacionOtra },
      r2: { inversion, decision, reparto },
    };
    return SOCIOS.map(s => s.id === currentUserId ? mine : SIMULATED[s.id]);
  }

  function getAllR2(): Respuesta[] {
    return getAllR1(); // same data merged
  }

  // Count idea votes
  function countIdeas() {
    const all = getAllR1();
    const counts: Record<string, number> = {};
    IDEAS.forEach(idea => { counts[idea] = 0; });
    all.forEach(r => r.r1.ideas.forEach(i => { counts[i] = (counts[i] || 0) + 1; }));
    return Object.entries(counts).filter(([_, c]) => c > 0).sort((a, b) => b[1] - a[1]);
  }

  /* ── Styles ──────────────────────────────────────── */
  const cardStyle: React.CSSProperties = {
    background: 'var(--neutral-800)', borderRadius: 16, padding: 24,
    border: '1px solid var(--neutral-700)', maxWidth: 700, margin: '0 auto',
  };
  const btnPrimary: React.CSSProperties = {
    background: 'var(--primary-500)', color: '#fff', border: 'none',
    borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontSize: 14,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
  };
  const optionBtn = (selected: boolean): React.CSSProperties => ({
    padding: '10px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left' as const,
    background: selected ? 'var(--primary-500)18' : 'var(--neutral-900)',
    border: `1px solid ${selected ? 'var(--primary-500)' : 'var(--neutral-600)'}`,
    color: selected ? 'var(--primary-300)' : 'var(--neutral-200)',
    fontWeight: selected ? 600 : 400, fontSize: 13, width: '100%',
    transition: 'all .15s',
  });

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--neutral-950)',
      padding: '40px 20px', color: 'var(--neutral-100)',
    }}>
      {/* Progress bar */}
      <div style={{ maxWidth: 700, margin: '0 auto 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--neutral-500)', marginBottom: 6 }}>
          <span>Wizard de Socios</span>
          <span>{['intro','r1q1','r1q2','r1q3','r1_results','r2q4','r2q5','r2q6','r2_results','final'].indexOf(step) + 1}/10</span>
        </div>
        <div style={{ height: 4, background: 'var(--neutral-700)', borderRadius: 2 }}>
          <div style={{
            height: '100%', borderRadius: 2, background: 'var(--primary-500)',
            width: `${((['intro','r1q1','r1q2','r1q3','r1_results','r2q4','r2q5','r2q6','r2_results','final'].indexOf(step) + 1) / 10) * 100}%`,
            transition: 'width .3s',
          }} />
        </div>
      </div>

      {/* Waiting overlay */}
      {waiting && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          <div style={{ fontSize: 32 }}>⏳</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Esperando respuestas de los otros socios…</div>
          <div style={{ fontSize: 13, color: 'var(--neutral-400)' }}>
            {otherSocios.map(s => s.avatar + ' ' + s.nombre).join(', ')} están respondiendo
          </div>
          <div style={{ width: 100, height: 4, background: 'var(--neutral-700)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: 'var(--primary-500)', borderRadius: 2, width: '60%',
              animation: 'progressSlide 1.5s ease-in-out infinite',
            }} />
          </div>
        </div>
      )}

      {/* ── INTRO ───────────────────────────────── */}
      {step === 'intro' && (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🤝</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Wizard de Socios</h1>
            <p style={{ color: 'var(--neutral-400)', fontSize: 14, lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
              Antes de empezar con la granja, los 3 socios debéis responder unas preguntas
              sobre vuestra visión, compromiso y aportaciones. Las respuestas son <strong>individuales y privadas</strong> hasta que los 3 hayáis contestado.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            {SOCIOS.map(s => (
              <div key={s.id} style={{
                padding: '12px 16px', borderRadius: 12, textAlign: 'center',
                background: s.id === currentUserId ? 'var(--primary-500)18' : 'var(--neutral-900)',
                border: `1px solid ${s.id === currentUserId ? 'var(--primary-500)' : 'var(--neutral-700)'}`,
                minWidth: 100,
              }}>
                <div style={{ fontSize: 28 }}>{s.avatar}</div>
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4 }}>{s.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--neutral-400)' }}>
                  {s.id === currentUserId ? '← Tú' : 'Pendiente'}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => setStep('r1q1')} style={btnPrimary}>
              Empezar Ronda 1 <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── R1 Q1: Tiempo ────────────────────────── */}
      {step === 'r1q1' && (
        <div style={cardStyle}>
          <div style={{ fontSize: 11, color: 'var(--primary-400)', fontWeight: 700, marginBottom: 8 }}>RONDA 1 — Pregunta 1/3</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
            <Clock size={20} style={{ display: 'inline', marginRight: 8 }} />
            ¿Cuánto tiempo semanal puedes dedicar?
          </h2>
          <p style={{ color: 'var(--neutral-400)', fontSize: 13, marginBottom: 16 }}>Sé honesto/a. Mejor prometer menos y cumplir más.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {TIEMPOS.map(t => (
              <button key={t} onClick={() => setTiempo(t)} style={optionBtn(tiempo === t)}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--neutral-400)', display: 'block', marginBottom: 4 }}>
              ¿En qué horarios/días preferentemente?
            </label>
            <input value={horarios} onChange={e => setHorarios(e.target.value)}
              placeholder="Ej: Fines de semana, tardes entre semana…"
              className="nf-input" style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep('intro')} style={{ ...btnPrimary, background: 'var(--neutral-700)' }}>
              <ChevronLeft size={16} /> Atrás
            </button>
            <button onClick={() => setStep('r1q2')} disabled={!tiempo} style={{ ...btnPrimary, opacity: tiempo ? 1 : 0.5 }}>
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── R1 Q2: Ideas de negocio ──────────────── */}
      {step === 'r1q2' && (
        <div style={cardStyle}>
          <div style={{ fontSize: 11, color: 'var(--primary-400)', fontWeight: 700, marginBottom: 8 }}>RONDA 1 — Pregunta 2/3</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
            <Lightbulb size={20} style={{ display: 'inline', marginRight: 8 }} />
            ¿Cuál es tu idea de negocio?
          </h2>
          <p style={{ color: 'var(--neutral-400)', fontSize: 13, marginBottom: 16 }}>Puedes seleccionar varias opciones.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {IDEAS.map(idea => (
              <button
                key={idea}
                onClick={() => setIdeas(ideas.includes(idea) ? ideas.filter(i => i !== idea) : [...ideas, idea])}
                style={optionBtn(ideas.includes(idea))}
              >
                {ideas.includes(idea) ? '☑' : '☐'} {idea}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--neutral-400)', display: 'block', marginBottom: 4 }}>Otra idea:</label>
            <input value={ideaOtra} onChange={e => setIdeaOtra(e.target.value)}
              placeholder="Tu propuesta…" className="nf-input" style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep('r1q1')} style={{ ...btnPrimary, background: 'var(--neutral-700)' }}>
              <ChevronLeft size={16} /> Atrás
            </button>
            <button onClick={() => setStep('r1q3')} disabled={ideas.length === 0} style={{ ...btnPrimary, opacity: ideas.length > 0 ? 1 : 0.5 }}>
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── R1 Q3: Aportaciones ─────────────────── */}
      {step === 'r1q3' && (
        <div style={cardStyle}>
          <div style={{ fontSize: 11, color: 'var(--primary-400)', fontWeight: 700, marginBottom: 8 }}>RONDA 1 — Pregunta 3/3</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
            <HandCoins size={20} style={{ display: 'inline', marginRight: 8 }} />
            ¿Qué aportas tú al proyecto?
          </h2>
          <p style={{ color: 'var(--neutral-400)', fontSize: 13, marginBottom: 16 }}>Marca todas las que apliquen.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
            {APORTACIONES.map(ap => (
              <button
                key={ap}
                onClick={() => setAportaciones(aportaciones.includes(ap) ? aportaciones.filter(a => a !== ap) : [...aportaciones, ap])}
                style={optionBtn(aportaciones.includes(ap))}
              >
                {aportaciones.includes(ap) ? '☑' : '☐'} {ap}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--neutral-400)', display: 'block', marginBottom: 4 }}>Otra aportación:</label>
            <input value={aportacionOtra} onChange={e => setAportacionOtra(e.target.value)}
              placeholder="…" className="nf-input" style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep('r1q2')} style={{ ...btnPrimary, background: 'var(--neutral-700)' }}>
              <ChevronLeft size={16} /> Atrás
            </button>
            <button
              onClick={() => simulateWait('r1_results')}
              disabled={aportaciones.length === 0}
              style={{ ...btnPrimary, opacity: aportaciones.length > 0 ? 1 : 0.5 }}
            >
              Enviar y esperar socios <Check size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── R1 RESULTS ───────────────────────────── */}
      {step === 'r1_results' && (
        <div style={{ ...cardStyle, maxWidth: 850 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Resultados Ronda 1</h2>
            <p style={{ color: 'var(--neutral-400)', fontSize: 13 }}>Los 3 socios han respondido</p>
          </div>

          {/* Time comparison */}
          <div style={{ background: 'var(--neutral-900)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>⏰ Tiempo disponible</div>
            {getAllR1().map(r => (
              <div key={r.userId} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', fontSize: 13 }}>
                <span style={{ width: 70, fontWeight: 600 }}>{r.nombre}:</span>
                <span style={{ color: 'var(--primary-400)' }}>{r.r1.tiempo}</span>
                <span style={{ color: 'var(--neutral-500)', fontSize: 11 }}>({r.r1.horarios})</span>
              </div>
            ))}
          </div>

          {/* Ideas consensus */}
          <div style={{ background: 'var(--neutral-900)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>💡 Ideas de negocio (consenso)</div>
            {countIdeas().map(([idea, count]) => (
              <div key={idea} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', fontSize: 12 }}>
                <span style={{
                  color: count === 3 ? 'var(--ok)' : count === 2 ? '#F59E0B' : 'var(--neutral-400)',
                  fontWeight: 700, minWidth: 20,
                }}>
                  {count === 3 ? '✅' : count === 2 ? '⚠️' : '○'} {count}/3
                </span>
                <span>{idea}</span>
              </div>
            ))}
          </div>

          {/* Contributions */}
          <div style={{ background: 'var(--neutral-900)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>🤝 Aportaciones</div>
            {getAllR1().map(r => (
              <div key={r.userId} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                  {SOCIOS.find(s => s.id === r.userId)?.avatar} {r.nombre}:
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {r.r1.aportaciones.map(a => (
                    <span key={a} style={{
                      background: 'var(--primary-500)15', color: 'var(--primary-300)',
                      padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    }}>✅ {a}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* AI Analysis */}
          <div style={{
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 12, padding: 16, marginBottom: 20,
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'start', marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>🤖</span>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Análisis de Seedy IA</div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--neutral-200)', margin: '0 0 12px' }}>
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
                  padding: '10px 12px', background: 'var(--neutral-800)', borderRadius: 10,
                }}>
                  <span style={{ fontSize: 24 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{r.nombre} → <span style={{ color: 'var(--primary-400)' }}>{r.rol}</span></div>
                    <div style={{ fontSize: 11, color: 'var(--neutral-400)' }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => setStep('r2q4')} style={btnPrimary}>
              Continuar a Ronda 2 <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── R2 Q4: Inversión ─────────────────────── */}
      {step === 'r2q4' && (
        <div style={cardStyle}>
          <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700, marginBottom: 8 }}>RONDA 2 — Pregunta 4/6</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
            <HandCoins size={20} style={{ display: 'inline', marginRight: 8 }} />
            ¿Cuánto puedes invertir inicialmente?
          </h2>
          <p style={{ color: 'var(--neutral-400)', fontSize: 13, marginBottom: 16 }}>Sé realista con tu presupuesto disponible.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {INVERSIONES.map(i => (
              <button key={i} onClick={() => setInversion(i)} style={optionBtn(inversion === i)}>{i}</button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep('r1_results')} style={{ ...btnPrimary, background: 'var(--neutral-700)' }}>
              <ChevronLeft size={16} /> Atrás
            </button>
            <button onClick={() => setStep('r2q5')} disabled={!inversion} style={{ ...btnPrimary, opacity: inversion ? 1 : 0.5 }}>
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── R2 Q5: Decisiones ────────────────────── */}
      {step === 'r2q5' && (
        <div style={cardStyle}>
          <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700, marginBottom: 8 }}>RONDA 2 — Pregunta 5/6</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
            <Vote size={20} style={{ display: 'inline', marginRight: 8 }} />
            ¿Quién decide si no hay consenso?
          </h2>
          <p style={{ color: 'var(--neutral-400)', fontSize: 13, marginBottom: 16 }}>Definir esto ahora evita conflictos futuros.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {DECISIONES.map(d => (
              <button key={d} onClick={() => setDecision(d)} style={optionBtn(decision === d)}>{d}</button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep('r2q4')} style={{ ...btnPrimary, background: 'var(--neutral-700)' }}>
              <ChevronLeft size={16} /> Atrás
            </button>
            <button onClick={() => setStep('r2q6')} disabled={!decision} style={{ ...btnPrimary, opacity: decision ? 1 : 0.5 }}>
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── R2 Q6: Reparto ───────────────────────── */}
      {step === 'r2q6' && (
        <div style={cardStyle}>
          <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700, marginBottom: 8 }}>RONDA 2 — Pregunta 6/6</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
            <BarChart3 size={20} style={{ display: 'inline', marginRight: 8 }} />
            Reparto de beneficios
          </h2>
          <p style={{ color: 'var(--neutral-400)', fontSize: 13, marginBottom: 16 }}>¿Cómo se deben repartir los beneficios (cuando los haya)?</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {REPARTOS.map(r => (
              <button key={r} onClick={() => setReparto(r)} style={optionBtn(reparto === r)}>{r}</button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep('r2q5')} style={{ ...btnPrimary, background: 'var(--neutral-700)' }}>
              <ChevronLeft size={16} /> Atrás
            </button>
            <button
              onClick={() => simulateWait('r2_results')}
              disabled={!reparto}
              style={{ ...btnPrimary, opacity: reparto ? 1 : 0.5 }}
            >
              Enviar y esperar socios <Check size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── R2 RESULTS ───────────────────────────── */}
      {step === 'r2_results' && (
        <div style={{ ...cardStyle, maxWidth: 850 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Resultados Ronda 2</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            {getAllR2().map(r => (
              <div key={r.userId} style={{
                background: 'var(--neutral-900)', borderRadius: 12, padding: 14,
                border: '1px solid var(--neutral-700)',
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, textAlign: 'center' }}>
                  {SOCIOS.find(s => s.id === r.userId)?.avatar} {r.nombre}
                </div>
                {[
                  { l: 'Inversión', v: r.r2.inversion },
                  { l: 'Decisiones', v: r.r2.decision },
                  { l: 'Reparto', v: r.r2.reparto },
                ].map(item => (
                  <div key={item.l} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>{item.l}</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{item.v}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => setStep('final')} style={btnPrimary}>
              Ver acuerdo final <FileText size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── FINAL AGREEMENT ──────────────────────── */}
      {step === 'final' && (
        <div style={{ ...cardStyle, maxWidth: 850 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🤝</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Acuerdo de Socios</h2>
            <p style={{ color: 'var(--neutral-400)', fontSize: 13 }}>Granja Los Capones — OvoSfera</p>
          </div>

          <div style={{
            background: 'var(--neutral-900)', borderRadius: 12, padding: 20, marginBottom: 20,
            border: '1px solid var(--neutral-700)', fontSize: 13, lineHeight: 1.8,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>1. Socios y roles</h3>
            {[
              { n: 'David', rol: 'Director de producción', tiempo: SIMULATED.david.r1.tiempo, inv: SIMULATED.david.r2.inversion },
              { n: 'Jesús', rol: 'Director comercial', tiempo: SIMULATED.jesus.r1.tiempo, inv: SIMULATED.jesus.r2.inversion },
              { n: 'Fran', rol: 'Director de tecnología', tiempo: SIMULATED.fran.r1.tiempo, inv: SIMULATED.fran.r2.inversion },
            ].map(s => (
              <div key={s.n} style={{ padding: '6px 0' }}>
                <strong>{s.n}</strong> — {s.rol} · {s.tiempo}/sem · Inversión: {s.inv}
              </div>
            ))}

            <h3 style={{ fontSize: 16, fontWeight: 800, margin: '16px 0 12px' }}>2. Modelo de negocio</h3>
            <p>Consenso: <strong>Capones gourmet para Navidad</strong> (3/3 de acuerdo) + 
              <strong> Huevos ecológicos venta directa</strong> (2/3).</p>

            <h3 style={{ fontSize: 16, fontWeight: 800, margin: '16px 0 12px' }}>3. Toma de decisiones</h3>
            <p>Mayoría simple (2 de 3). En caso de empate, decide el responsable del área afectada según su rol.</p>

            <h3 style={{ fontSize: 16, fontWeight: 800, margin: '16px 0 12px' }}>4. Reparto de beneficios</h3>
            <p>Se aplicará el modelo de <strong>partes iguales (33/33/33)</strong>, revisable cada 6 meses
              según la dedicación real de cada socio.</p>

            <h3 style={{ fontSize: 16, fontWeight: 800, margin: '16px 0 12px' }}>5. Próximos pasos</h3>
            <ol style={{ paddingLeft: 20 }}>
              <li>Configurar la granja en OvoSfera Hub (gallineros, aves)</li>
              <li>Adquirir primeros reproductores (Castellana Negra + Plymouth Rock)</li>
              <li>Planificar primer lote de incubación (febrero-marzo)</li>
              <li>Registrar marca "Los Capones" / solicitar certificación ecológica</li>
              <li>Contactar restaurantes locales para preventa de capones Navidad</li>
            </ol>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/dashboard" style={{
              ...btnPrimary, textDecoration: 'none',
            }}>
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
  );
}
