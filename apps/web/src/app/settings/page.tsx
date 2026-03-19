'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Settings as SettingsIcon, Users, ChevronRight, ChevronLeft, Check,
  Clock, Lightbulb, HandCoins, BarChart3, Vote, FileText,
  Timer, Lock, Sparkles, Loader2, AlertTriangle, ShieldCheck
} from 'lucide-react';

/* ══════════════════════════════════════════════════════
   WIZARD TYPES & DATA
   ══════════════════════════════════════════════════════ */
type Step =
  | 'intro'
  | 'r1q1' | 'r1q2' | 'r1q3' | 'r1done'
  | 'r2q1' | 'r2q2' | 'r2q3' | 'r2done'
  | 'r3q1' | 'r3q2' | 'r3q3' | 'r3q4' | 'r3done'
  | 'waiting' | 'final';

const ALL_STEPS: Step[] = [
  'intro',
  'r1q1','r1q2','r1q3','r1done',
  'r2q1','r2q2','r2q3','r2done',
  'r3q1','r3q2','r3q3','r3q4','r3done',
  'waiting','final',
];

const SOCIOS = [
  { id: 'david', nombre: 'David', avatar: '🏠', email: 'david@ovosfera.com' },
  { id: 'jesus', nombre: 'Jesús', avatar: '🍳', email: 'jesus@ovosfera.com' },
  { id: 'fran', nombre: 'Fran', avatar: '💻', email: 'fran@ovosfera.com' },
];

/* ── R1: Vision & Commitment ── */
const DISPONIBILIDAD = ['< 2 horas/semana', '2-5 horas/semana', '5-10 horas/semana', '10-20 horas/semana', 'Dedicación completa'];
const MOTIVACIONES = [
  'Producción gourmet de alta calidad (capones, pulardas)',
  'Conservación de razas autóctonas españolas',
  'Proyecto de vida rural y sostenibilidad',
  'Negocio rentable en nicho premium',
  'Hobby serio con potencial de crecimiento',
  'Investigación genética y mejora avícola',
  'Agroturismo y educación ambiental',
  'Todo lo anterior: diversificación máxima',
];
const EXPERIENCIAS = [
  'Sin experiencia previa en avicultura',
  'Conocimientos teóricos (libros, cursos)',
  'Experiencia personal con pocas aves',
  'Experiencia profesional en ganadería',
  'Formación técnica agrícola/veterinaria',
  'Experiencia empresarial (no agraria)',
];

/* ── R2: Organization & Economy ── */
const INVERSIONES = ['0€ (solo trabajo)', '< 500€', '500-1.500€', '1.500-3.000€', '3.000-5.000€', '> 5.000€'];
const DECISIONES = [
  'Consenso total (los 3 de acuerdo)',
  'Mayoría simple (2 de 3)',
  'Cada socio decide en su área de expertise',
  'Un socio director + consejo (los otros 2)',
  'Rotaciones trimestrales de liderazgo',
];
const REPARTOS = [
  'Partes iguales (33/33/33)',
  'Proporcional a horas dedicadas',
  'Proporcional a inversión económica',
  'Mixto: base igual + bonus por dedicación',
  '50% reinvertir, 50% repartir a partes iguales',
];
const DEDICACIONES = [
  'Trabajo diario presencial (mañanas)',
  'Trabajo diario presencial (tardes)',
  'Solo fines de semana',
  'Teletrabajo + visitas puntuales',
  'Disponibilidad flexible según necesidad',
  'Gestión administrativa/comercial remota',
];

/* ── R3: Strategy & Business ── */
const LINEAS_NEGOCIO = [
  'Capones gourmet de Navidad (estacional, alto margen)',
  'Pollos eco y picantones para restauración',
  'Huevos ecológicos venta directa',
  'Genética: venta de huevos fecundados y reproductores',
  'Formación y consultoría avícola',
  'Agroturismo y experiencias gastronómicas',
  'Marca de alimentación heritage (varias líneas)',
];
const CLIENTES = [
  'Restaurantes de alta gama locales',
  'Venta directa a consumidor particular',
  'Tiendas gourmet y delicatessen',
  'Marketplaces online de producto eco',
  'Cooperativas y grupos de consumo',
  'Distribuidores horeca regionales',
  'Mercados de productores y ferias',
];
const OBJETIVOS_1Y = [
  'Primer lote de capones vendido',
  'Marca registrada y web operativa',
  'Registro ecológico obtenido',
  'Red de 5+ clientes recurrentes',
  'Cubrir costes operativos (breakeven)',
  'Infraestructura básica completada (gallineros, cercados)',
  'Plantel reproductor estable (≥30 aves)',
  'Primera facturación > 1.000€',
];
const RIESGOS_OPT = [
  'Enfermedades y epidemia aviar',
  'Falta de tiempo real de los socios',
  'No encontrar mercado / clientes suficientes',
  'Burocracia y permisos interminables',
  'Conflictos entre socios por visión diferente',
  'Costes superiores a lo previsto',
  'Depredadores (zorros, rapaces)',
  'Climatología adversa en Segovia',
];

/* ── Countdown: 10 hours ── */
const COUNTDOWN_MS = 10 * 60 * 60 * 1000;
const DL_KEY = 'wizard_socios_deadline';
const RPT_KEY = 'wizard_socios_report';
const AGR_KEY = 'wizard_socios_agreement';

function fmtCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

/* ── Markdown renderer ── */
function MdRender({ text }: { text: string }) {
  const lines = text.split('\n');
  const elems: React.ReactNode[] = [];
  let listItems: string[] = [];
  let paraLines: string[] = [];
  const flushList = () => { if (listItems.length) { elems.push(<ul key={`ul-${elems.length}`} style={{ margin:'6px 0 10px 16px',padding:0,listStyleType:'disc' }}>{listItems.map((li,i)=><li key={i} style={{fontSize:13,lineHeight:1.7,color:'var(--neutral-700)',marginBottom:2}} dangerouslySetInnerHTML={{__html:inl(li)}}/>)}</ul>); listItems=[]; }};
  const flushPara = () => { if (paraLines.length) { const j=paraLines.join(' ').trim(); if(j) elems.push(<p key={`p-${elems.length}`} style={{fontSize:13,lineHeight:1.7,color:'var(--neutral-700)',margin:'0 0 10px'}} dangerouslySetInnerHTML={{__html:inl(j)}}/>); paraLines=[]; }};
  function inl(s: string): string {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>');
  }
  for (let i=0;i<lines.length;i++) {
    const l=lines[i];
    if (l.startsWith('## ')) { flushList();flushPara(); elems.push(<h2 key={`h2-${i}`} style={{fontSize:16,fontWeight:700,color:'#8B5CF6',margin:'20px 0 8px',paddingBottom:6,borderBottom:'2px solid rgba(139,92,246,0.15)'}} dangerouslySetInnerHTML={{__html:inl(l.slice(3))}}/>);}
    else if (l.startsWith('### ')) { flushList();flushPara(); elems.push(<h3 key={`h3-${i}`} style={{fontSize:14,fontWeight:700,color:'#3B82F6',margin:'14px 0 6px',paddingLeft:10,borderLeft:'3px solid #3B82F6'}} dangerouslySetInnerHTML={{__html:inl(l.slice(4))}}/>);}
    else if (/^[-*] /.test(l)) { flushPara(); listItems.push(l.replace(/^[-*] /,'')); }
    else if (l.trim()==='') { flushList();flushPara(); }
    else { flushList(); paraLines.push(l); }
  }
  flushList();flushPara();
  return <>{elems}</>;
}

/* ══════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'granja' | 'wizard'>('granja');

  const currentUserId = (() => {
    const e = user?.email?.toLowerCase() || '';
    if (e.includes('david')) return 'david';
    if (e.includes('jesus') || e.includes('jesús')) return 'jesus';
    if (e.includes('fran')) return 'fran';
    return user?.name?.toLowerCase() || 'david';
  })();

  /* ── Wizard state ── */
  const [step, setStep] = useState<Step>('intro');
  const [r1Disp, setR1Disp] = useState('');
  const [r1Hor, setR1Hor] = useState('');
  const [r1Mot, setR1Mot] = useState<string[]>([]);
  const [r1Exp, setR1Exp] = useState('');
  const [r2Inv, setR2Inv] = useState('');
  const [r2Dec, setR2Dec] = useState('');
  const [r2Rep, setR2Rep] = useState('');
  const [r2Ded, setR2Ded] = useState('');
  const [r3Lin, setR3Lin] = useState<string[]>([]);
  const [r3Cli, setR3Cli] = useState<string[]>([]);
  const [r3Obj, setR3Obj] = useState<string[]>([]);
  const [r3Rie, setR3Rie] = useState<string[]>([]);
  const [r3Cue, setR3Cue] = useState('');

  const [deadline, setDeadline] = useState<number|null>(null);
  const [remaining, setRemaining] = useState(COUNTDOWN_MS);
  const [expired, setExpired] = useState(false);
  const [report, setReport] = useState<string|null>(null);
  const [rptLoading, setRptLoading] = useState(false);
  const [rptError, setRptError] = useState<string|null>(null);
  const [agreements, setAgreements] = useState<Record<string,boolean>>({});
  const [sociosStatus, setSociosStatus] = useState<Record<string, { done: boolean; step: string }>>({});

  const WK = `wizard_v2_${currentUserId}`;

  /* ── Sync helper: post to shared server store ── */
  const syncToServer = useCallback(async (payload: any) => {
    try { await fetch('/api/wizard-status', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }); } catch {}
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/wizard-status');
      if (res.ok) {
        const data = await res.json();
        const st: Record<string, { done: boolean; step: string }> = {};
        for (const s of SOCIOS) {
          if (data.socios?.[s.id]) st[s.id] = { done: data.socios[s.id].done, step: data.socios[s.id].step };
        }
        setSociosStatus(st);
        if (data.deadline) setDeadline(data.deadline);
        if (data.report) setReport(data.report);
        if (data.agreements) setAgreements(data.agreements);
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Load own answers from localStorage (fast, confidential)
    try {
      const s = localStorage.getItem(WK);
      if (s) {
        const d = JSON.parse(s);
        if (d.step) setStep(d.step);
        if (d.r1Disp) setR1Disp(d.r1Disp);
        if (d.r1Hor) setR1Hor(d.r1Hor);
        if (d.r1Mot) setR1Mot(d.r1Mot);
        if (d.r1Exp) setR1Exp(d.r1Exp);
        if (d.r2Inv) setR2Inv(d.r2Inv);
        if (d.r2Dec) setR2Dec(d.r2Dec);
        if (d.r2Rep) setR2Rep(d.r2Rep);
        if (d.r2Ded) setR2Ded(d.r2Ded);
        if (d.r3Lin) setR3Lin(d.r3Lin);
        if (d.r3Cli) setR3Cli(d.r3Cli);
        if (d.r3Obj) setR3Obj(d.r3Obj);
        if (d.r3Rie) setR3Rie(d.r3Rie);
        if (d.r3Cue) setR3Cue(d.r3Cue);
        // Auto-sync existing local answers to server (first time migration)
        const answers = {
          r1Disp:d.r1Disp||'', r1Hor:d.r1Hor||'', r1Mot:d.r1Mot||[], r1Exp:d.r1Exp||'',
          r2Inv:d.r2Inv||'', r2Dec:d.r2Dec||'', r2Rep:d.r2Rep||'', r2Ded:d.r2Ded||'',
          r3Lin:d.r3Lin||[], r3Cli:d.r3Cli||[], r3Obj:d.r3Obj||[], r3Rie:d.r3Rie||[], r3Cue:d.r3Cue||'',
        };
        syncToServer({ socioId: currentUserId, step: d.step, answers });
      }
      // Sync deadline from localStorage to server too
      const dl = localStorage.getItem(DL_KEY);
      if (dl) syncToServer({ type: 'deadline', value: parseInt(dl,10) });
    } catch {}
    // Load shared state from server (deadline, completion status, report, agreements)
    refreshStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll server every 30s to see if other socios have completed
  useEffect(() => {
    const iv = setInterval(refreshStatus, 30000);
    return () => clearInterval(iv);
  }, [refreshStatus]);

  useEffect(() => {
    if (!deadline) return;
    const tick = () => { const r=deadline-Date.now(); setRemaining(Math.max(0,r)); if(r<=0)setExpired(true); };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [deadline]);

  function save(next: Step) {
    const answers = { r1Disp,r1Hor,r1Mot,r1Exp, r2Inv,r2Dec,r2Rep,r2Ded, r3Lin,r3Cli,r3Obj,r3Rie,r3Cue };
    try { localStorage.setItem(WK, JSON.stringify({ step:next, ...answers })); } catch {}
    syncToServer({ socioId: currentUserId, step: next, answers });
    setSociosStatus(prev => ({ ...prev, [currentUserId]: { done: ['r3done','waiting','final'].includes(next), step: next } }));
    setStep(next);
  }

  function startWizard() {
    const dl = Date.now() + COUNTDOWN_MS;
    try { localStorage.setItem(DL_KEY, dl.toString()); } catch {}
    syncToServer({ type: 'deadline', value: dl });
    setDeadline(dl);
    setStep('r1q1');
  }

  function resetWizard() {
    if (!confirm('¿Resetear TODAS las respuestas? Se borrará todo y el contador se reiniciará.')) return;
    setStep('intro');
    setR1Disp('');setR1Hor('');setR1Mot([]);setR1Exp('');
    setR2Inv('');setR2Dec('');setR2Rep('');setR2Ded('');
    setR3Lin([]);setR3Cli([]);setR3Obj([]);setR3Rie([]);setR3Cue('');
    setReport(null);setRptError(null);setAgreements({});
    setDeadline(null);setExpired(false);setRemaining(COUNTDOWN_MS);
    try {
      localStorage.removeItem(WK);
      localStorage.removeItem(DL_KEY);
      localStorage.removeItem(RPT_KEY);
      localStorage.removeItem(AGR_KEY);
      SOCIOS.forEach(s => localStorage.removeItem(`wizard_v2_${s.id}`));
    } catch {}
    syncToServer({ type: 'reset' });
    setSociosStatus({});
  }

  const genReport = useCallback(async () => {
    setRptLoading(true); setRptError(null);
    try {
      // Fetch all socios' answers from server
      const statusRes = await fetch('/api/wizard-status');
      const serverData = statusRes.ok ? await statusRes.json() : { socios: {} };
      const sociosData = SOCIOS.map(s => {
        const d = serverData.socios?.[s.id]?.answers;
        if (!d) return { nombre:s.nombre, r1:null, r2:null, r3:null };
        return {
          nombre: s.nombre,
          r1: { disponibilidad:d.r1Disp||'', horarios:d.r1Hor||'', motivacion:(d.r1Mot||[]).join(', '), experiencia:d.r1Exp||'' },
          r2: { inversion:d.r2Inv||'', decisiones:d.r2Dec||'', reparto:d.r2Rep||'', dedicacion:d.r2Ded||'' },
          r3: { linea_negocio:(d.r3Lin||[]).join(', '), cliente:(d.r3Cli||[]).join(', '), objetivo_1y:(d.r3Obj||[]).join(', '), riesgo:(d.r3Rie||[]).join(', '), cuestiones:d.r3Cue||'' },
        };
      });
      const res = await fetch('/api/wizard-report', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ socios: sociosData }),
      });
      if (!res.ok) { const e=await res.json().catch(()=>({error:'Error'})); throw new Error(e.error||`HTTP ${res.status}`); }
      const data = await res.json();
      const rp = data.report || 'Sin informe';
      setReport(rp);
      try { localStorage.setItem(RPT_KEY, rp); } catch {}
      syncToServer({ type: 'report', value: rp });
    } catch (e:any) { setRptError(e.message); }
    finally { setRptLoading(false); }
  }, [syncToServer]);

  function toggleAgreement() {
    const newVal = !agreements[currentUserId];
    const next = { ...agreements, [currentUserId]: newVal };
    setAgreements(next);
    try { localStorage.setItem(AGR_KEY, JSON.stringify(next)); } catch {}
    syncToServer({ type: 'agreement', socioId: currentUserId, value: newVal });
  }

  const allAgreed = SOCIOS.every(s => agreements[s.id]);
  const stepIdx = ALL_STEPS.indexOf(step);

  const isDone = (sid: string) => {
    return sociosStatus[sid]?.done || false;
  };

  /* ── Styles ── */
  const card: React.CSSProperties = { background:'white',borderRadius:16,padding:24,border:'1px solid var(--neutral-100)',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',maxWidth:700,margin:'0 auto' };
  const btnP: React.CSSProperties = { background:'var(--primary-500)',color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',fontWeight:700,fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',gap:8 };
  const btnB: React.CSSProperties = { ...btnP, background:'var(--neutral-200)', color:'var(--neutral-700)' };
  const opt = (sel:boolean): React.CSSProperties => ({
    padding:'10px 14px',borderRadius:10,cursor:'pointer',textAlign:'left' as const,
    background:sel?'rgba(139,92,246,0.08)':'var(--neutral-50)',
    border:`1px solid ${sel?'var(--primary-500)':'var(--neutral-200)'}`,
    color:sel?'var(--primary-700)':'var(--neutral-700)',
    fontWeight:sel?600:400,fontSize:13,width:'100%',transition:'all .15s',
  });
  const tabSt = (a:boolean): React.CSSProperties => ({
    padding:'10px 20px',borderRadius:'10px 10px 0 0',border:'none',fontWeight:700,fontSize:14,cursor:'pointer',
    background:a?'white':'transparent',color:a?'var(--primary-600)':'var(--neutral-500)',
    borderBottom:a?'2px solid var(--primary-500)':'2px solid transparent',
  });

  const CountdownBar = () => {
    if (!deadline || step==='intro') return null;
    const pct = Math.max(0,Math.min(100,(remaining/COUNTDOWN_MS)*100));
    const urg = remaining < 3600000;
    return (
      <div style={{ maxWidth:700,margin:'0 auto 16px',background:expired?'rgba(34,197,94,0.06)':urg?'rgba(239,68,68,0.06)':'rgba(59,130,246,0.06)',border:`1px solid ${expired?'rgba(34,197,94,0.2)':urg?'rgba(239,68,68,0.2)':'rgba(59,130,246,0.2)'}`,borderRadius:12,padding:'12px 16px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <Timer size={18} style={{ color:expired?'#16A34A':urg?'#DC2626':'#3B82F6' }} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12,fontWeight:700,color:expired?'#16A34A':urg?'#DC2626':'#3B82F6' }}>
              {expired ? '⏰ Tiempo completado — ¡Listo para generar informe IA!' : `Tiempo restante: ${fmtCountdown(remaining)}`}
            </div>
            {!expired && <div style={{ height:4,background:'var(--neutral-200)',borderRadius:2,marginTop:4 }}><div style={{ height:'100%',borderRadius:2,transition:'width 1s',background:urg?'#DC2626':'#3B82F6',width:`${pct}%` }}/></div>}
          </div>
          <div style={{ fontSize:20,fontWeight:800,fontFamily:'monospace',color:expired?'#16A34A':urg?'#DC2626':'#3B82F6' }}>
            {expired ? '✅' : fmtCountdown(remaining)}
          </div>
        </div>
      </div>
    );
  };

  const CBadge = () => (
    <div style={{ display:'inline-flex',alignItems:'center',gap:6,fontSize:11,fontWeight:600,color:'#D97706',background:'rgba(245,158,11,0.08)',padding:'4px 10px',borderRadius:6,border:'1px solid rgba(245,158,11,0.15)',marginBottom:12 }}>
      <Lock size={12} /> Tus respuestas son CONFIDENCIALES — Solo tú puedes verlas
    </div>
  );

  return (
    <div className="nf-content" style={{ padding:20 }}>
      <h1 style={{ fontSize:22,fontWeight:800,color:'var(--neutral-900)',margin:0,display:'flex',alignItems:'center',gap:8 }}>
        <SettingsIcon size={22} /> Configuración
      </h1>
      <p style={{ color:'var(--neutral-500)',fontSize:13,margin:'4px 0 16px' }}>Ajustes de la granja y wizard de socios</p>

      <div style={{ display:'flex',gap:4,borderBottom:'1px solid var(--neutral-200)',marginBottom:20 }}>
        <button onClick={()=>setTab('granja')} style={tabSt(tab==='granja')}><SettingsIcon size={14} style={{ display:'inline',marginRight:6,verticalAlign:'middle' }} />Granja</button>
        <button onClick={()=>setTab('wizard')} style={tabSt(tab==='wizard')}><Users size={14} style={{ display:'inline',marginRight:6,verticalAlign:'middle' }} />Wizard de Socios</button>
      </div>

      {/* ═══ TAB: Granja ═══ */}
      {tab === 'granja' && (
        <div>
          <div className="nf-card" style={{ marginBottom:24 }}>
            <div className="nf-card-hd"><div className="nf-card-title">Información de la Granja</div></div>
            <div className="nf-card-pad">
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
                <div><label className="nf-label">Nombre</label><input className="nf-input" defaultValue="Granja Los Capones" /></div>
                <div><label className="nf-label">Código REGA</label><input className="nf-input" defaultValue="ES123456789" /></div>
                <div><label className="nf-label">Ubicación</label><input className="nf-input" defaultValue="Castilla y León" /></div>
                <div><label className="nf-label">Tipo Explotación</label><select className="nf-input"><option>Ecológico certificado</option><option>Extensivo</option><option>Campero</option></select></div>
              </div>
            </div>
          </div>
          <div className="nf-card">
            <div className="nf-card-hd"><div className="nf-card-title">Notificaciones</div></div>
            <div className="nf-card-pad">
              <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
                <label style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer' }}><input type="checkbox" defaultChecked /><span>Alertas de vacunación</span></label>
                <label style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer' }}><input type="checkbox" defaultChecked /><span>Stock de pienso bajo</span></label>
                <label style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer' }}><input type="checkbox" /><span>Resumen diario producción</span></label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: Wizard de Socios ═══ */}
      {tab === 'wizard' && (
        <div>
          {/* Progress */}
          <div style={{ maxWidth:700,margin:'0 auto 12px' }}>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--neutral-500)',marginBottom:6 }}>
              <span>Wizard de Socios</span><span>{Math.min(stepIdx+1,ALL_STEPS.length)}/{ALL_STEPS.length}</span>
            </div>
            <div style={{ height:4,background:'var(--neutral-200)',borderRadius:2 }}>
              <div style={{ height:'100%',borderRadius:2,background:'var(--primary-500)',width:`${((stepIdx+1)/ALL_STEPS.length)*100}%`,transition:'width .3s' }}/>
            </div>
            {step !== 'intro' && (
              <div style={{ textAlign:'right',marginTop:6 }}>
                <button onClick={resetWizard} style={{ background:'none',border:'none',cursor:'pointer',fontSize:11,color:'var(--neutral-400)',display:'inline-flex',alignItems:'center',gap:4 }}>🔄 Resetear wizard</button>
              </div>
            )}
          </div>

          <CountdownBar />

          {/* ── INTRO ── */}
          {step === 'intro' && (
            <div style={card}>
              <div style={{ textAlign:'center',marginBottom:24 }}>
                <div style={{ fontSize:48,marginBottom:12 }}>🤝</div>
                <h2 style={{ fontSize:22,fontWeight:800,marginBottom:8,color:'var(--neutral-900)' }}>Wizard de Socios</h2>
                <p style={{ color:'var(--neutral-500)',fontSize:14,lineHeight:1.6,maxWidth:520,margin:'0 auto' }}>
                  Cada socio responde a 3 rondas de preguntas de forma <strong>confidencial</strong>.
                  Solo tú ves tus respuestas. Al iniciar se activará un <strong>contador de 10 horas</strong>.
                  Cuando expire, la IA analizará las respuestas y generará un informe con recomendaciones y un borrador de acuerdo.
                </p>
              </div>
              <div style={{ background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.15)',borderRadius:12,padding:16,textAlign:'center',marginBottom:20 }}>
                <Timer size={28} style={{ color:'#3B82F6',marginBottom:8 }} />
                <div style={{ fontSize:32,fontWeight:800,fontFamily:'monospace',color:'#3B82F6' }}>10:00:00</div>
                <div style={{ fontSize:12,color:'var(--neutral-500)',marginTop:4 }}>Se activará al pulsar "Empezar"</div>
              </div>
              <div style={{ display:'flex',gap:12,justifyContent:'center',marginBottom:20 }}>
                {SOCIOS.map(s=>(
                  <div key={s.id} style={{ padding:'12px 16px',borderRadius:12,textAlign:'center',background:s.id===currentUserId?'rgba(139,92,246,0.08)':'var(--neutral-50)',border:`1px solid ${s.id===currentUserId?'var(--primary-500)':'var(--neutral-200)'}`,minWidth:100 }}>
                    <div style={{ fontSize:28 }}>{s.avatar}</div>
                    <div style={{ fontWeight:700,fontSize:13,marginTop:4,color:'var(--neutral-800)' }}>{s.nombre}</div>
                    <div style={{ fontSize:11,color:s.id===currentUserId?'var(--primary-500)':'var(--neutral-400)' }}>{s.id===currentUserId?'← Tú':''}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:24 }}>
                {[{icon:'🔒',t:'Confidencial',d:'Solo ves tus respuestas'},{icon:'⏱️',t:'10 horas',d:'Para completar las 3 rondas'},{icon:'🤖',t:'Informe IA',d:'Análisis + acuerdo automático'}].map(f=>(
                  <div key={f.t} style={{ textAlign:'center',padding:12,borderRadius:10,background:'var(--neutral-50)' }}>
                    <div style={{ fontSize:24,marginBottom:4 }}>{f.icon}</div>
                    <div style={{ fontSize:12,fontWeight:700,color:'var(--neutral-800)' }}>{f.t}</div>
                    <div style={{ fontSize:11,color:'var(--neutral-500)' }}>{f.d}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex',justifyContent:'center' }}>
                <button onClick={startWizard} style={{ ...btnP,background:'linear-gradient(135deg,#8B5CF6,#3B82F6)',boxShadow:'0 4px 12px rgba(59,130,246,0.3)' }}>
                  <Timer size={16} /> Empezar — Activar contador 10h
                </button>
              </div>
            </div>
          )}

          {/* ══ R1Q1 ══ */}
          {step === 'r1q1' && (
            <div style={card}>
              <CBadge />
              <div style={{ fontSize:11,color:'var(--primary-500)',fontWeight:700,marginBottom:8 }}>RONDA 1 — Pregunta 1/3</div>
              <h2 style={{ fontSize:20,fontWeight:800,marginBottom:4,color:'var(--neutral-900)' }}><Clock size={20} style={{ display:'inline',marginRight:8 }} />¿Cuánto tiempo semanal puedes dedicar?</h2>
              <p style={{ color:'var(--neutral-500)',fontSize:13,marginBottom:16 }}>Sé honesto/a. Mejor prometer menos y cumplir más.</p>
              <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:16 }}>
                {DISPONIBILIDAD.map(t=><button key={t} onClick={()=>setR1Disp(t)} style={opt(r1Disp===t)}>{t}</button>)}
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12,color:'var(--neutral-500)',display:'block',marginBottom:4 }}>¿En qué horarios/días?</label>
                <input value={r1Hor} onChange={e=>setR1Hor(e.target.value)} placeholder="Ej: Fines de semana…" className="nf-input" style={{ width:'100%' }} />
              </div>
              <div style={{ display:'flex',justifyContent:'space-between' }}>
                <button onClick={()=>setStep('intro')} style={btnB}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={()=>setStep('r1q2')} disabled={!r1Disp} style={{ ...btnP,opacity:r1Disp?1:0.5 }}>Siguiente <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* ══ R1Q2 ══ */}
          {step === 'r1q2' && (
            <div style={card}>
              <CBadge />
              <div style={{ fontSize:11,color:'var(--primary-500)',fontWeight:700,marginBottom:8 }}>RONDA 1 — Pregunta 2/3</div>
              <h2 style={{ fontSize:20,fontWeight:800,marginBottom:4,color:'var(--neutral-900)' }}><Lightbulb size={20} style={{ display:'inline',marginRight:8 }} />¿Cuál es tu motivación principal?</h2>
              <p style={{ color:'var(--neutral-500)',fontSize:13,marginBottom:16 }}>Selecciona las que se ajusten a tu visión.</p>
              <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:16 }}>
                {MOTIVACIONES.map(m=><button key={m} onClick={()=>setR1Mot(r1Mot.includes(m)?r1Mot.filter(x=>x!==m):[...r1Mot,m])} style={opt(r1Mot.includes(m))}>{r1Mot.includes(m)?'☑':'☐'} {m}</button>)}
              </div>
              <div style={{ display:'flex',justifyContent:'space-between' }}>
                <button onClick={()=>setStep('r1q1')} style={btnB}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={()=>setStep('r1q3')} disabled={r1Mot.length===0} style={{ ...btnP,opacity:r1Mot.length>0?1:0.5 }}>Siguiente <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* ══ R1Q3 ══ */}
          {step === 'r1q3' && (
            <div style={card}>
              <CBadge />
              <div style={{ fontSize:11,color:'var(--primary-500)',fontWeight:700,marginBottom:8 }}>RONDA 1 — Pregunta 3/3</div>
              <h2 style={{ fontSize:20,fontWeight:800,marginBottom:4,color:'var(--neutral-900)' }}><HandCoins size={20} style={{ display:'inline',marginRight:8 }} />¿Cuál es tu experiencia previa?</h2>
              <p style={{ color:'var(--neutral-500)',fontSize:13,marginBottom:16 }}>Cada perfil aporta valor distinto.</p>
              <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:16 }}>
                {EXPERIENCIAS.map(e=><button key={e} onClick={()=>setR1Exp(e)} style={opt(r1Exp===e)}>{e}</button>)}
              </div>
              <div style={{ display:'flex',justifyContent:'space-between' }}>
                <button onClick={()=>setStep('r1q2')} style={btnB}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={()=>save('r1done')} disabled={!r1Exp} style={{ ...btnP,opacity:r1Exp?1:0.5 }}>Guardar Ronda 1 <Check size={16} /></button>
              </div>
            </div>
          )}

          {/* ══ R1DONE ══ */}
          {step === 'r1done' && (
            <div style={card}>
              <div style={{ textAlign:'center',marginBottom:16 }}><div style={{ fontSize:36,marginBottom:8 }}>✅</div><h2 style={{ fontSize:22,fontWeight:800,marginBottom:4,color:'var(--neutral-900)' }}>Ronda 1 completada</h2><p style={{ color:'var(--neutral-500)',fontSize:13 }}>Guardadas de forma confidencial</p></div>
              <CBadge />
              <div style={{ background:'var(--neutral-50)',borderRadius:12,padding:16,marginBottom:16,fontSize:12,lineHeight:1.8,color:'var(--neutral-600)' }}>
                <div><strong>Disponibilidad:</strong> {r1Disp}</div>
                {r1Hor && <div><strong>Horarios:</strong> {r1Hor}</div>}
                <div><strong>Motivación:</strong> {r1Mot.join(', ')}</div>
                <div><strong>Experiencia:</strong> {r1Exp}</div>
              </div>
              <div style={{ display:'flex',justifyContent:'center' }}><button onClick={()=>save('r2q1')} style={btnP}>Continuar a Ronda 2 <ChevronRight size={16} /></button></div>
            </div>
          )}

          {/* ══ R2Q1 ══ */}
          {step === 'r2q1' && (
            <div style={card}>
              <CBadge />
              <div style={{ fontSize:11,color:'#F59E0B',fontWeight:700,marginBottom:8 }}>RONDA 2 — Pregunta 1/3</div>
              <h2 style={{ fontSize:20,fontWeight:800,marginBottom:4,color:'var(--neutral-900)' }}><HandCoins size={20} style={{ display:'inline',marginRight:8 }} />¿Cuánto puedes invertir?</h2>
              <p style={{ color:'var(--neutral-500)',fontSize:13,marginBottom:16 }}>Capital disponible para la puesta en marcha.</p>
              <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:16 }}>
                {INVERSIONES.map(i=><button key={i} onClick={()=>setR2Inv(i)} style={opt(r2Inv===i)}>{i}</button>)}
              </div>
              <div style={{ display:'flex',justifyContent:'space-between' }}>
                <button onClick={()=>setStep('r1done')} style={btnB}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={()=>setStep('r2q2')} disabled={!r2Inv} style={{ ...btnP,opacity:r2Inv?1:0.5 }}>Siguiente <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* ══ R2Q2 ══ */}
          {step === 'r2q2' && (
            <div style={card}>
              <CBadge />
              <div style={{ fontSize:11,color:'#F59E0B',fontWeight:700,marginBottom:8 }}>RONDA 2 — Pregunta 2/3</div>
              <h2 style={{ fontSize:20,fontWeight:800,marginBottom:4,color:'var(--neutral-900)' }}><Vote size={20} style={{ display:'inline',marginRight:8 }} />¿Cómo prefieres tomar las decisiones?</h2>
              <p style={{ color:'var(--neutral-500)',fontSize:13,marginBottom:16 }}>Definir la gobernanza evita conflictos.</p>
              <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:16 }}>
                {DECISIONES.map(d=><button key={d} onClick={()=>setR2Dec(d)} style={opt(r2Dec===d)}>{d}</button>)}
              </div>
              <div style={{ display:'flex',justifyContent:'space-between' }}>
                <button onClick={()=>setStep('r2q1')} style={btnB}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={()=>setStep('r2q3')} disabled={!r2Dec} style={{ ...btnP,opacity:r2Dec?1:0.5 }}>Siguiente <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* ══ R2Q3 ══ */}
          {step === 'r2q3' && (
            <div style={card}>
              <CBadge />
              <div style={{ fontSize:11,color:'#F59E0B',fontWeight:700,marginBottom:8 }}>RONDA 2 — Pregunta 3/3</div>
              <h2 style={{ fontSize:20,fontWeight:800,marginBottom:4,color:'var(--neutral-900)' }}><BarChart3 size={20} style={{ display:'inline',marginRight:8 }} />Reparto y dedicación</h2>
              <p style={{ color:'var(--neutral-500)',fontSize:13,marginBottom:12 }}>¿Cómo se reparten beneficios?</p>
              <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:20 }}>
                {REPARTOS.map(r=><button key={r} onClick={()=>setR2Rep(r)} style={opt(r2Rep===r)}>{r}</button>)}
              </div>
              <p style={{ color:'var(--neutral-500)',fontSize:13,marginBottom:12 }}>¿Tu modelo de dedicación?</p>
              <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:16 }}>
                {DEDICACIONES.map(d=><button key={d} onClick={()=>setR2Ded(d)} style={opt(r2Ded===d)}>{d}</button>)}
              </div>
              <div style={{ display:'flex',justifyContent:'space-between' }}>
                <button onClick={()=>setStep('r2q2')} style={btnB}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={()=>save('r2done')} disabled={!r2Rep||!r2Ded} style={{ ...btnP,opacity:r2Rep&&r2Ded?1:0.5 }}>Guardar Ronda 2 <Check size={16} /></button>
              </div>
            </div>
          )}

          {/* ══ R2DONE ══ */}
          {step === 'r2done' && (
            <div style={card}>
              <div style={{ textAlign:'center',marginBottom:16 }}><div style={{ fontSize:36,marginBottom:8 }}>✅</div><h2 style={{ fontSize:22,fontWeight:800,marginBottom:4,color:'var(--neutral-900)' }}>Ronda 2 completada</h2><p style={{ color:'var(--neutral-500)',fontSize:13 }}>Guardadas de forma confidencial</p></div>
              <CBadge />
              <div style={{ background:'var(--neutral-50)',borderRadius:12,padding:16,marginBottom:16,fontSize:12,lineHeight:1.8,color:'var(--neutral-600)' }}>
                <div><strong>Inversión:</strong> {r2Inv}</div>
                <div><strong>Decisiones:</strong> {r2Dec}</div>
                <div><strong>Reparto:</strong> {r2Rep}</div>
                <div><strong>Dedicación:</strong> {r2Ded}</div>
              </div>
              <div style={{ display:'flex',justifyContent:'center' }}><button onClick={()=>save('r3q1')} style={btnP}>Continuar a Ronda 3 <ChevronRight size={16} /></button></div>
            </div>
          )}

          {/* ══ R3Q1 ══ */}
          {step === 'r3q1' && (
            <div style={card}>
              <CBadge />
              <div style={{ fontSize:11,color:'#10B981',fontWeight:700,marginBottom:8 }}>RONDA 3 — Pregunta 1/4</div>
              <h2 style={{ fontSize:20,fontWeight:800,marginBottom:4,color:'var(--neutral-900)' }}>🎯 Línea de negocio prioritaria</h2>
              <p style={{ color:'var(--neutral-500)',fontSize:13,marginBottom:16 }}>¿Dónde deberíamos enfocarnos?</p>
              <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:16 }}>
                {LINEAS_NEGOCIO.map(l=><button key={l} onClick={()=>setR3Lin(r3Lin.includes(l)?r3Lin.filter(x=>x!==l):[...r3Lin,l])} style={opt(r3Lin.includes(l))}>{r3Lin.includes(l)?'☑':'☐'} {l}</button>)}
              </div>
              <div style={{ display:'flex',justifyContent:'space-between' }}>
                <button onClick={()=>setStep('r2done')} style={btnB}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={()=>setStep('r3q2')} disabled={r3Lin.length===0} style={{ ...btnP,opacity:r3Lin.length>0?1:0.5 }}>Siguiente <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* ══ R3Q2 ══ */}
          {step === 'r3q2' && (
            <div style={card}>
              <CBadge />
              <div style={{ fontSize:11,color:'#10B981',fontWeight:700,marginBottom:8 }}>RONDA 3 — Pregunta 2/4</div>
              <h2 style={{ fontSize:20,fontWeight:800,marginBottom:4,color:'var(--neutral-900)' }}>👥 Cliente objetivo</h2>
              <p style={{ color:'var(--neutral-500)',fontSize:13,marginBottom:16 }}>¿A quién vendemos?</p>
              <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:16 }}>
                {CLIENTES.map(c=><button key={c} onClick={()=>setR3Cli(r3Cli.includes(c)?r3Cli.filter(x=>x!==c):[...r3Cli,c])} style={opt(r3Cli.includes(c))}>{r3Cli.includes(c)?'☑':'☐'} {c}</button>)}
              </div>
              <div style={{ display:'flex',justifyContent:'space-between' }}>
                <button onClick={()=>setStep('r3q1')} style={btnB}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={()=>setStep('r3q3')} disabled={r3Cli.length===0} style={{ ...btnP,opacity:r3Cli.length>0?1:0.5 }}>Siguiente <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* ══ R3Q3 ══ */}
          {step === 'r3q3' && (
            <div style={card}>
              <CBadge />
              <div style={{ fontSize:11,color:'#10B981',fontWeight:700,marginBottom:8 }}>RONDA 3 — Pregunta 3/4</div>
              <h2 style={{ fontSize:20,fontWeight:800,marginBottom:4,color:'var(--neutral-900)' }}>📊 Objetivos a 1 año y riesgos</h2>
              <p style={{ color:'var(--neutral-500)',fontSize:13,marginBottom:12 }}>¿Qué lograr en 12 meses?</p>
              <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:20 }}>
                {OBJETIVOS_1Y.map(o=><button key={o} onClick={()=>setR3Obj(r3Obj.includes(o)?r3Obj.filter(x=>x!==o):[...r3Obj,o])} style={opt(r3Obj.includes(o))}>{r3Obj.includes(o)?'☑':'☐'} {o}</button>)}
              </div>
              <p style={{ color:'var(--neutral-500)',fontSize:13,marginBottom:12 }}>¿Qué riesgos te preocupan?</p>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:16 }}>
                {RIESGOS_OPT.map(r=><button key={r} onClick={()=>setR3Rie(r3Rie.includes(r)?r3Rie.filter(x=>x!==r):[...r3Rie,r])} style={opt(r3Rie.includes(r))}>{r3Rie.includes(r)?'☑':'☐'} {r}</button>)}
              </div>
              <div style={{ display:'flex',justifyContent:'space-between' }}>
                <button onClick={()=>setStep('r3q2')} style={btnB}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={()=>setStep('r3q4')} disabled={r3Obj.length===0||r3Rie.length===0} style={{ ...btnP,opacity:r3Obj.length>0&&r3Rie.length>0?1:0.5 }}>Siguiente <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* ══ R3Q4 — CUESTIONES ABIERTAS ══ */}
          {step === 'r3q4' && (
            <div style={card}>
              <CBadge />
              <div style={{ fontSize:11,color:'#10B981',fontWeight:700,marginBottom:8 }}>RONDA 3 — Pregunta 4/4 (última)</div>
              <h2 style={{ fontSize:20,fontWeight:800,marginBottom:4,color:'var(--neutral-900)' }}>💬 Cuestiones adicionales</h2>
              <p style={{ color:'var(--neutral-500)',fontSize:13,marginBottom:16 }}>
                ¿Hay algo que no se haya preguntado? Preocupaciones, propuestas, condiciones, ideas… Escribe todo lo que consideres importante.
              </p>
              <textarea value={r3Cue} onChange={e=>setR3Cue(e.target.value)} placeholder="Escribe aquí cualquier cuestión que no esté recogida en las preguntas anteriores…" className="nf-input" style={{ width:'100%',minHeight:150,resize:'vertical',fontFamily:'inherit',lineHeight:1.6 }} />
              <div style={{ fontSize:11,color:'var(--neutral-400)',marginTop:4,marginBottom:16 }}>Opcional pero recomendable. La IA lo tendrá en cuenta.</div>
              <div style={{ display:'flex',justifyContent:'space-between' }}>
                <button onClick={()=>setStep('r3q3')} style={btnB}><ChevronLeft size={16} /> Atrás</button>
                <button onClick={()=>save('r3done')} style={{ ...btnP,background:'linear-gradient(135deg,#10B981,#059669)' }}>Finalizar las 3 rondas <Check size={16} /></button>
              </div>
            </div>
          )}

          {/* ══ R3DONE ══ */}
          {step === 'r3done' && (
            <div style={card}>
              <div style={{ textAlign:'center',marginBottom:16 }}><div style={{ fontSize:48,marginBottom:8 }}>🎉</div><h2 style={{ fontSize:22,fontWeight:800,marginBottom:4,color:'var(--neutral-900)' }}>¡Las 3 rondas completadas!</h2><p style={{ color:'var(--neutral-500)',fontSize:13 }}>Tus respuestas están guardadas confidencialmente</p></div>
              <CBadge />
              <div style={{ background:'var(--neutral-50)',borderRadius:12,padding:16,marginBottom:16,fontSize:12,lineHeight:1.8,color:'var(--neutral-600)' }}>
                <h3 style={{ fontSize:14,fontWeight:700,color:'var(--neutral-900)',marginBottom:8 }}>R1 — Visión</h3>
                <div><strong>Disponibilidad:</strong> {r1Disp}</div><div><strong>Motivación:</strong> {r1Mot.join(', ')}</div><div><strong>Experiencia:</strong> {r1Exp}</div>
                <h3 style={{ fontSize:14,fontWeight:700,color:'var(--neutral-900)',margin:'12px 0 8px' }}>R2 — Organización</h3>
                <div><strong>Inversión:</strong> {r2Inv}</div><div><strong>Decisiones:</strong> {r2Dec}</div><div><strong>Reparto:</strong> {r2Rep}</div><div><strong>Dedicación:</strong> {r2Ded}</div>
                <h3 style={{ fontSize:14,fontWeight:700,color:'var(--neutral-900)',margin:'12px 0 8px' }}>R3 — Estrategia</h3>
                <div><strong>Línea negocio:</strong> {r3Lin.join(', ')}</div><div><strong>Clientes:</strong> {r3Cli.join(', ')}</div><div><strong>Objetivos:</strong> {r3Obj.join(', ')}</div><div><strong>Riesgos:</strong> {r3Rie.join(', ')}</div>
                {r3Cue && <div><strong>Cuestiones:</strong> {r3Cue}</div>}
              </div>
              <div style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.06),rgba(139,92,246,0.06))',border:'1px solid rgba(139,92,246,0.15)',borderRadius:12,padding:20,marginBottom:20 }}>
                <div style={{ fontWeight:700,fontSize:14,marginBottom:12,color:'var(--neutral-800)',textAlign:'center' }}>Estado de los socios</div>
                <div style={{ display:'flex',gap:12,justifyContent:'center' }}>
                  {SOCIOS.map(s=>{const d=isDone(s.id);return(
                    <div key={s.id} style={{ padding:'12px 16px',borderRadius:12,textAlign:'center',background:d?'rgba(34,197,94,0.1)':'var(--neutral-50)',border:`1px solid ${d?'var(--ok)':'var(--neutral-200)'}`,minWidth:100 }}>
                      <div style={{ fontSize:28 }}>{s.avatar}</div>
                      <div style={{ fontWeight:700,fontSize:13,marginTop:4,color:'var(--neutral-800)' }}>{s.nombre}</div>
                      <div style={{ fontSize:11,fontWeight:600,color:d?'var(--ok)':'#F59E0B' }}>{d?'✅ Completado':'⏳ Pendiente'}</div>
                    </div>
                  );})}
                </div>
              </div>
              {expired ? (
                <div style={{ display:'flex',justifyContent:'center' }}>
                  <button onClick={()=>save('final')} style={{ ...btnP,background:'linear-gradient(135deg,#8B5CF6,#EC4899)',boxShadow:'0 4px 12px rgba(139,92,246,0.3)' }}>
                    <Sparkles size={16} /> Ver resultado final e informe IA
                  </button>
                </div>
              ) : (
                <div style={{ textAlign:'center',padding:16,borderRadius:12,background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.15)' }}>
                  <Timer size={20} style={{ color:'#3B82F6',marginBottom:4 }} />
                  <div style={{ fontSize:13,fontWeight:600,color:'#3B82F6' }}>Esperando al contador… Cuando pasen las 10 horas, podrás generar el informe IA.</div>
                </div>
              )}
            </div>
          )}

          {/* ══ WAITING ══ */}
          {step === 'waiting' && (
            <div style={card}><div style={{ textAlign:'center' }}>
              <Timer size={40} style={{ color:'#3B82F6',marginBottom:12 }} />
              <h2 style={{ fontSize:20,fontWeight:800,color:'var(--neutral-900)',marginBottom:8 }}>Esperando…</h2>
              <p style={{ fontSize:13,color:'var(--neutral-500)',marginBottom:16 }}>Cuando el contador expire se generará el informe IA.</p>
              {expired && <button onClick={()=>save('final')} style={btnP}><Sparkles size={16} /> Ir al resultado final</button>}
            </div></div>
          )}

          {/* ══════════════════════════════
               FINAL — AI REPORT + AGREEMENT
             ══════════════════════════════ */}
          {step === 'final' && (
            <div style={{ maxWidth:850,margin:'0 auto' }}>
              <div style={{ textAlign:'center',marginBottom:24 }}>
                <div style={{ fontSize:48,marginBottom:8 }}>📋</div>
                <h2 style={{ fontSize:24,fontWeight:800,marginBottom:4,color:'var(--neutral-900)' }}>Resultado Final — Informe IA</h2>
                <p style={{ color:'var(--neutral-500)',fontSize:13 }}>Análisis comparativo + recomendaciones + borrador de acuerdo</p>
              </div>

              {!report && !rptLoading && (
                <div style={{ ...card,textAlign:'center',marginBottom:20,background:'linear-gradient(135deg,rgba(139,92,246,0.03),rgba(236,72,153,0.03))' }}>
                  <Sparkles size={40} style={{ color:'#8B5CF6',marginBottom:12 }} />
                  <p style={{ fontSize:15,fontWeight:700,color:'var(--neutral-800)',marginBottom:8 }}>Generar informe con IA</p>
                  <p style={{ fontSize:13,color:'var(--neutral-500)',maxWidth:480,margin:'0 auto 20px',lineHeight:1.6 }}>
                    Claude analizará las respuestas confidenciales de los 3 socios y generará un informe con análisis comparativo, recomendaciones y borrador de acuerdo.
                  </p>
                  <button onClick={genReport} style={{ ...btnP,display:'inline-flex',background:'linear-gradient(135deg,#8B5CF6,#EC4899)',boxShadow:'0 4px 12px rgba(139,92,246,0.3)' }}>
                    <Sparkles size={16} /> Generar Informe IA
                  </button>
                </div>
              )}

              {rptLoading && (
                <div style={{ ...card,textAlign:'center',marginBottom:20 }}>
                  <Loader2 size={28} style={{ color:'#8B5CF6',animation:'spin 1s linear infinite',marginBottom:12 }} />
                  <div style={{ fontSize:15,fontWeight:700,color:'var(--neutral-800)' }}>Claude analizando respuestas…</div>
                  <div style={{ fontSize:12,color:'var(--neutral-400)',marginTop:4 }}>Generando informe, recomendaciones y borrador de acuerdo</div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {rptError && (
                <div className="nf-card" style={{ background:'#FEF2F2',border:'1px solid #FECACA',padding:16,marginBottom:20 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8 }}><AlertTriangle size={16} style={{ color:'#DC2626' }} /><span style={{ fontSize:13,fontWeight:600,color:'#DC2626' }}>Error: {rptError}</span></div>
                  <button onClick={genReport} style={{ ...btnP,marginTop:12,fontSize:12,padding:'8px 16px' }}>Reintentar</button>
                </div>
              )}

              {report && (
                <>
                  <div className="nf-card" style={{ background:'linear-gradient(135deg,rgba(139,92,246,0.03),rgba(236,72,153,0.03))',border:'1px solid rgba(139,92,246,0.12)',padding:'20px 24px',marginBottom:20 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
                      <div style={{ background:'linear-gradient(135deg,#8B5CF6,#EC4899)',borderRadius:8,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center' }}><Sparkles size={14} color="#fff" /></div>
                      <span style={{ fontSize:15,fontWeight:700,color:'#8B5CF6' }}>Informe IA — Análisis de Socios</span>
                      <button onClick={genReport} disabled={rptLoading} style={{ marginLeft:'auto',background:'none',border:'1px solid var(--neutral-200)',borderRadius:6,padding:'4px 10px',fontSize:11,cursor:'pointer',color:'var(--neutral-500)' }}>🔄 Regenerar</button>
                    </div>
                    <div style={{ borderTop:'1px solid rgba(139,92,246,0.1)',paddingTop:12 }}><MdRender text={report} /></div>
                  </div>

                  {/* ══ ACUERDO DIGITAL DE CABALLEROS ══ */}
                  <div className="nf-card" style={{ background:'linear-gradient(135deg,rgba(34,197,94,0.04),rgba(59,130,246,0.04))',border:'1px solid rgba(34,197,94,0.15)',padding:24,marginBottom:20 }}>
                    <div style={{ textAlign:'center',marginBottom:20 }}>
                      <ShieldCheck size={40} style={{ color:'#16A34A',marginBottom:8 }} />
                      <h3 style={{ fontSize:20,fontWeight:800,color:'var(--neutral-900)',marginBottom:4 }}>Acuerdo Digital de Caballeros</h3>
                      <p style={{ fontSize:13,color:'var(--neutral-500)',maxWidth:500,margin:'0 auto',lineHeight:1.6 }}>
                        Si los 3 socios estáis de acuerdo con las recomendaciones, podéis firmarlo digitalmente como compromiso de buena fe.
                      </p>
                    </div>
                    <div style={{ display:'flex',gap:16,justifyContent:'center',marginBottom:20 }}>
                      {SOCIOS.map(s=>{const ag=agreements[s.id];const me=s.id===currentUserId;return(
                        <div key={s.id} onClick={me?toggleAgreement:undefined} style={{ padding:'16px 20px',borderRadius:14,textAlign:'center',background:ag?'rgba(34,197,94,0.08)':'var(--neutral-50)',border:`2px solid ${ag?'#16A34A':'var(--neutral-200)'}`,minWidth:120,cursor:me?'pointer':'default',transition:'all .2s' }}>
                          <div style={{ fontSize:32,marginBottom:6 }}>{s.avatar}</div>
                          <div style={{ fontWeight:700,fontSize:14,color:'var(--neutral-800)' }}>{s.nombre}</div>
                          {ag ? (
                            <div style={{ fontSize:12,fontWeight:700,color:'#16A34A',marginTop:4 }}>✅ De acuerdo</div>
                          ) : me ? (
                            <button style={{ marginTop:6,background:'#16A34A',color:'#fff',border:'none',borderRadius:8,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer' }}>Firmar acuerdo</button>
                          ) : (
                            <div style={{ fontSize:11,color:'var(--neutral-400)',marginTop:6 }}>Pendiente de firma</div>
                          )}
                        </div>
                      );})}
                    </div>
                    {allAgreed && (
                      <div style={{ textAlign:'center',padding:20,borderRadius:12,background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)' }}>
                        <div style={{ fontSize:40,marginBottom:8 }}>🎉🤝🎉</div>
                        <div style={{ fontSize:18,fontWeight:800,color:'#16A34A',marginBottom:4 }}>¡Acuerdo firmado por los 3 socios!</div>
                        <div style={{ fontSize:13,color:'var(--neutral-600)',marginBottom:8 }}>{new Date().toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
                        <div style={{ fontSize:12,color:'var(--neutral-500)' }}>David 🏠 • Jesús 🍳 • Fran 💻 — OvoSfera Hub — Palazuelos de Eresma, Segovia</div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
