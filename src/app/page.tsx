'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LangProvider, useLang } from '@/config/LangContext';
import dynamic from 'next/dynamic';
import VerticalCard from '@/components/VerticalCard';

const GeoTwinHero = dynamic(() => import('@/components/GeoTwinHero'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-2xl bg-[#090e16]" style={{ aspectRatio: '1.2/1', maxHeight: '500px' }} />
  ),
});

function ScrollReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

function AnimatedCounter({ end, suffix = '' }: { end: string; suffix?: string }) {
  const [val, setVal] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const num = parseInt(end.replace(/[.,]/g, ''));
        const dur = 1500;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const current = Math.round(num * eased);
          setVal(end.includes('.') ? current.toLocaleString('es-ES') : end.includes(',') ? current.toLocaleString('en-US') : current.toString());
          if (p < 1) requestAnimationFrame(tick);
          else setVal(end);
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref} className="mono-data text-3xl lg:text-4xl font-bold">{val}{suffix}</span>;
}

/* ─── NAV ─── */
function Navbar() {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-3 bg-[#070A0F]/80' : 'py-5 bg-transparent'}`}
      style={{ backdropFilter: 'blur(40px)' }}>
      <div className="section-container flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[22px] tracking-tight" style={{ fontFamily: 'var(--fb)' }}>
            <span className="font-extrabold text-white">Neo</span>
            <span className="font-light" style={{ color: 'var(--neon)' }}>Farm</span>
          </span>
          <span className="text-[10px] font-mono tracking-widest text-[var(--t3)] hidden md:inline">IoT HUB</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#platform" className="text-sm text-[var(--t2)] hover:text-[var(--t1)] transition-colors">{t('navPlatform')}</a>
          <a href="#verticals" className="text-sm text-[var(--t2)] hover:text-[var(--t1)] transition-colors">{t('navVerticals')}</a>
          <a href="#ecosystem" className="text-sm text-[var(--t2)] hover:text-[var(--t1)] transition-colors">{t('navDev')}</a>

          <div className="flex items-center gap-1 text-sm font-mono">
            <button onClick={() => setLang('es')} className={`px-2 py-1 rounded transition-colors ${lang === 'es' ? 'text-[var(--t1)]' : 'text-[var(--t3)] hover:text-[var(--t2)]'}`}>ES</button>
            <span className="text-[var(--t3)]">|</span>
            <button onClick={() => setLang('en')} className={`px-2 py-1 rounded transition-colors ${lang === 'en' ? 'text-[var(--t1)]' : 'text-[var(--t3)] hover:text-[var(--t2)]'}`}>EN</button>
          </div>

          <a href="#cta" className="btn-neon text-sm !px-5 !py-2.5">{t('navDemo')}</a>
        </div>
      </div>
    </nav>
  );
}

/* ─── HERO ─── */
function Hero() {
  const { t } = useLang();
  return (
    <section className="min-h-screen flex items-center pt-24 pb-16 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #070A0F 0%, #0B1220 100%)' }}>
      <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono tracking-wider mb-8"
            style={{ border: '1px solid rgba(20,184,166,.15)', color: 'var(--neon)' }}>
            <span className="w-2 h-2 rounded-full bg-[var(--neon)] inline-block" style={{ boxShadow: '0 0 8px var(--neon)' }} />
            {t('heroBadge')}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] mb-6">
            {t('heroTitle')}{' '}
            <em className="italic" style={{ color: 'var(--neon)' }}>{t('heroTitleEm')}</em>
          </h1>

          <p className="text-lg text-[var(--t2)] mb-10 max-w-xl leading-relaxed">{t('heroSub')}</p>

          <div className="flex flex-col sm:flex-row gap-4 mb-14">
            <a href="#cta" className="btn-neon text-center">{t('ctaDemo')}</a>
            <a href="#platform" className="btn-ghost text-center">{t('ctaDocs')}</a>
          </div>

          <div className="flex flex-wrap gap-8">
            {[['metric1val', 'metric1label'], ['metric2val', 'metric2label'], ['metric3val', 'metric3label']].map(([vk, lk]) => (
              <div key={vk}>
                <AnimatedCounter end={t(vk)} />
                <div className="text-xs text-[var(--t3)] mt-1 font-mono tracking-wide uppercase">{t(lk)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <GeoTwinHero />

          {/* ── CSS IoT Data Nodes (overlay on top of Canvas) ── */}
          <div className="absolute inset-0 pointer-events-none hidden lg:block">
            {/* Status bar */}
            <div className="twin-status" style={{ top: 16, left: 16 }}>
              <span className="status-dot ok" />
              <span className="status-text">LIVE · 12 IoT Nodes · 30s refresh</span>
            </div>

            {/* TEMP */}
            <div className="dn" style={{ top: '15%', left: '8%' }}>
              <div className="dn-icon" style={{ background: 'rgba(20,184,166,.15)', color: '#14B8A6', fontFamily: 'var(--fm)', fontSize: '9px', fontWeight: 700 }}>T°</div>
              <div className="dn-data">
                <div className="dn-label">TEMP</div>
                <div className="dn-value">23.4°C</div>
              </div>
              <div className="dn-trend up">+0.8</div>
            </div>

            {/* NDVI */}
            <div className="dn" style={{ top: '8%', right: '15%' }}>
              <div className="dn-icon" style={{ background: 'rgba(22,163,74,.15)', color: '#16A34A', fontFamily: 'var(--fm)', fontSize: '8px', fontWeight: 700 }}>SAT</div>
              <div className="dn-data">
                <div className="dn-label">NDVI</div>
                <div className="dn-value" style={{ color: '#14B8A6' }}>0.72</div>
              </div>
            </div>

            {/* HEAD */}
            <div className="dn" style={{ bottom: '28%', left: '5%' }}>
              <div className="dn-icon" style={{ background: 'rgba(255,184,77,.15)', color: '#FFB84D', fontFamily: 'var(--fm)', fontSize: '8px', fontWeight: 700 }}>GPS</div>
              <div className="dn-data">
                <div className="dn-label">HEAD</div>
                <div className="dn-value">847</div>
              </div>
              <div className="dn-trend up">+12</div>
            </div>

            {/* CO₂ */}
            <div className="dn" style={{ bottom: '18%', right: '8%' }}>
              <div className="dn-icon" style={{ background: 'rgba(139,115,85,.15)', color: '#8B7355', fontFamily: 'var(--fm)', fontSize: '8px', fontWeight: 700 }}>MRV</div>
              <div className="dn-data">
                <div className="dn-label">CO₂</div>
                <div className="dn-value">412<small>ppm</small></div>
              </div>
            </div>

            {/* WATER */}
            <div className="dn" style={{ top: '42%', right: '3%' }}>
              <div className="dn-icon" style={{ background: 'rgba(8,145,178,.15)', color: '#0891B2', fontFamily: 'var(--fm)', fontSize: '8px', fontWeight: 700 }}>H₂O</div>
              <div className="dn-data">
                <div className="dn-label">WATER</div>
                <div className="dn-value">2.4<small>m³/d</small></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B1220] to-transparent" />
    </section>
  );
}

/* ─── PROBLEM ─── */
function ProblemSection() {
  const { t } = useLang();
  const cards = [
    { key: '1', icon: 'DB' },
    { key: '2', icon: 'IO' },
    { key: '3', icon: 'EU' },
  ];
  return (
    <section className="py-24 lg:py-32" style={{ background: 'var(--bg2)' }}>
      <div className="section-container">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl mb-4">{t('problemTitle')}</h2>
          <p className="text-[var(--t2)] max-w-2xl mx-auto text-lg">{t('problemSub')}</p>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <ScrollReveal key={c.key}>
              <div className="glass-card-hover p-8 h-full" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-mono font-bold mb-5" style={{ background: 'rgba(20,184,166,.08)', color: 'var(--neon)', border: '1px solid rgba(20,184,166,.15)' }}>{c.icon}</div>
                <h3 className="text-xl font-semibold mb-3 font-body">{t(`problem${c.key}Title`)}</h3>
                <p className="text-[var(--t2)] leading-relaxed">{t(`problem${c.key}Desc`)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PLATFORM LAYERS ─── */
function PlatformSection() {
  const { t } = useLang();
  const [active, setActive] = useState<number | null>(null);
  const layers = [
    { n: 4, color: 'var(--neon)', opacity: 1 },
    { n: 3, color: 'var(--cyan)', opacity: 0.85 },
    { n: 2, color: 'var(--amber)', opacity: 0.7 },
    { n: 1, color: 'var(--violet)', opacity: 0.55 },
  ];
  return (
    <section id="platform" className="py-24 lg:py-32" style={{ background: 'linear-gradient(180deg, var(--bg2), var(--bg3))' }}>
      <div className="section-container">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl mb-4">{t('platformTitle')}</h2>
          <p className="text-[var(--t2)] max-w-2xl mx-auto text-lg">{t('platformSub')}</p>
        </ScrollReveal>
        <div className="max-w-3xl mx-auto space-y-3">
          {layers.map((l, i) => (
            <ScrollReveal key={l.n}>
              <div
                className="glass-card p-6 cursor-pointer transition-all duration-300"
                style={{
                  borderColor: active === l.n ? l.color : 'rgba(255,255,255,.05)',
                  boxShadow: active === l.n ? `0 0 30px ${l.color}20` : 'none',
                  opacity: l.opacity,
                }}
                onMouseEnter={() => setActive(l.n)}
                onMouseLeave={() => setActive(null)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs tracking-widest mb-1" style={{ color: l.color }}>{t(`layer${l.n}Title`)}</div>
                    <div className="text-sm text-[var(--t2)]">{t(`layer${l.n}Desc`)}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color, boxShadow: `0 0 6px ${l.color}` }} />
                </div>
                {active === l.n && (
                  <p className="mt-4 text-sm text-[var(--t2)] leading-relaxed border-t border-white/5 pt-4">
                    {t(`layer${l.n}Detail`)}
                  </p>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── DIGITAL TWIN ─── */
function DigitalTwinSection() {
  const { t } = useLang();
  const items = [
    { key: '1', icon: '3D', color: 'var(--neon)' },
    { key: '2', icon: 'FC', color: 'var(--cyan)' },
    { key: '3', icon: 'CL', color: 'var(--amber)' },
    { key: '4', icon: 'SIM', color: 'var(--violet)' },
    { key: '5', icon: 'ROI', color: 'var(--rose)' },
    { key: '6', icon: 'CO₂', color: 'var(--neon2)' },
  ];
  return (
    <section className="py-24 lg:py-32" style={{ background: 'var(--bg3)' }}>
      <div className="section-container">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl mb-4">{t('dtTitle')}</h2>
          <p className="text-[var(--t2)] max-w-2xl mx-auto text-lg">{t('dtSub')}</p>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it, i) => (
            <ScrollReveal key={it.key}>
              <div className="glass-card-hover p-7 h-full group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-mono font-bold mb-4" style={{ background: `${it.color}12`, color: it.color, border: `1px solid ${it.color}25` }}>{it.icon}</div>
                <h3 className="text-lg font-semibold mb-2 font-body group-hover:text-[var(--neon)] transition-colors">{t(`dt${it.key}Title`)}</h3>
                <p className="text-sm text-[var(--t2)] leading-relaxed">{t(`dt${it.key}Desc`)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── ROI SIMULATOR ─── */
function ROISimulator() {
  const { t } = useLang();
  const [heads, setHeads] = useState(500);
  const [ha, setHa] = useState(100);
  const [type, setType] = useState('vacuno');

  const mult = type === 'vacuno' ? 1 : type === 'porcino' ? 1.4 : 0.9;
  const savings = Math.round((heads * 18 + ha * 42) * mult);
  const roi = Math.round((savings * 3) / (heads * 2.5 + 1200) * 100);
  const payback = Math.round((heads * 2.5 + 1200) / (savings / 12));

  return (
    <section className="py-24 lg:py-32" style={{ background: 'linear-gradient(180deg, var(--bg3), var(--bg4))' }}>
      <div className="section-container">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl mb-4">{t('roiTitle')}</h2>
          <p className="text-[var(--t2)] max-w-2xl mx-auto text-lg">{t('roiSub')}</p>
        </ScrollReveal>
        <ScrollReveal>
          <div className="glass-card max-w-2xl mx-auto p-8 lg:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2 block">{t('roiHeads')}</label>
                <input type="range" min={50} max={5000} step={50} value={heads} onChange={e => setHeads(+e.target.value)}
                  className="w-full accent-[var(--neon)]" />
                <div className="mono-data text-lg mt-1">{heads.toLocaleString()}</div>
              </div>
              <div>
                <label className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2 block">{t('roiHectares')}</label>
                <input type="range" min={10} max={2000} step={10} value={ha} onChange={e => setHa(+e.target.value)}
                  className="w-full accent-[var(--neon)]" />
                <div className="mono-data text-lg mt-1">{ha.toLocaleString()}</div>
              </div>
            </div>
            <div className="mb-8">
              <label className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-3 block">{t('roiType')}</label>
              <div className="flex gap-3">
                {[['vacuno', 'roiTypeVacuno'], ['porcino', 'roiTypePorcino'], ['avi', 'roiTypeAvi']].map(([v, k]) => (
                  <button key={v} onClick={() => setType(v)}
                    className={`px-4 py-2 rounded-lg text-sm font-mono transition-all ${type === v ? 'bg-[var(--neon)]/10 text-[var(--neon)] border border-[var(--neon)]/30' : 'text-[var(--t3)] border border-white/5 hover:border-white/10'}`}>
                    {t(k)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
              <div className="text-center">
                <div className="mono-data text-2xl lg:text-3xl font-bold">{roi}%</div>
                <div className="text-xs text-[var(--t3)] mt-1">{t('roiResult')}</div>
              </div>
              <div className="text-center">
                <div className="mono-data text-2xl lg:text-3xl font-bold">{savings.toLocaleString()}€</div>
                <div className="text-xs text-[var(--t3)] mt-1">{t('roiSavings')}</div>
              </div>
              <div className="text-center">
                <div className="mono-data text-2xl lg:text-3xl font-bold">{payback}</div>
                <div className="text-xs text-[var(--t3)] mt-1">{t('roiPayback')} ({t('roiMonths')})</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── VERTICALS ─── */
function VerticalsSection() {
  const { t } = useLang();
  const verts = [
    { key: 'vacas', color: 'var(--vacas)', rawColor: '#3D7A5F', url: 'https://hub.vacasdata.com/dashboard' },
    { key: 'porc', color: 'var(--porc)', rawColor: '#3B6B82', url: 'https://hub.porcdata.com/dashboard' },
    { key: 'ovo', color: 'var(--ovo)', rawColor: '#B07D2B', url: 'https://hub.ovosfera.com/dashboard' },
  ];
  return (
    <section id="verticals" className="py-24 lg:py-32" style={{ background: 'var(--bg4)' }}>
      <div className="section-container">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl mb-4">{t('vertTitle')}</h2>
          <p className="text-[var(--t2)] max-w-2xl mx-auto text-lg">{t('vertSub')}</p>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {verts.map((v) => (
            <ScrollReveal key={v.key}>
              <VerticalCard
                vertKey={v.key}
                color={v.rawColor}
                url={v.url}
                title={t(`${v.key}Title`)}
                desc={t(`${v.key}Desc`)}
                cta={t(`${v.key}Cta`)}
              />
            </ScrollReveal>
          ))}
        </div>
        <div className="text-center">
          <span className="text-xs font-mono text-[var(--t3)] tracking-widest uppercase">── {t('vertPowered')} ──</span>
        </div>
      </div>
    </section>
  );
}

/* ─── ECOSYSTEM ─── */
function EcosystemSection() {
  const { t } = useLang();
  const items = [
    { key: '1', icon: 'API', color: 'var(--neon)' },
    { key: '2', icon: 'HW', color: 'var(--cyan)' },
    { key: '3', icon: 'DEV', color: 'var(--amber)' },
  ];
  return (
    <section id="ecosystem" className="py-24 lg:py-32" style={{ background: 'linear-gradient(180deg, var(--bg4), var(--bg3))' }}>
      <div className="section-container">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl mb-4">{t('ecoTitle')}</h2>
          <p className="text-[var(--t2)] max-w-2xl mx-auto text-lg">{t('ecoSub')}</p>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((it) => (
            <ScrollReveal key={it.key}>
              <div className="glass-card-hover p-8 h-full">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-mono font-bold mb-5"
                  style={{ background: `${it.color}15`, color: it.color }}>{it.icon}</div>
                <h3 className="text-xl font-semibold mb-3 font-body">{t(`eco${it.key}Title`)}</h3>
                <p className="text-sm text-[var(--t2)] leading-relaxed">{t(`eco${it.key}Desc`)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── COMPLIANCE ─── */
function ComplianceSection() {
  const { t } = useLang();
  const regs = ['1', '2', '3', '4', '5'];
  return (
    <section className="py-24 lg:py-32" style={{ background: 'var(--bg3)' }}>
      <div className="section-container">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl mb-4">{t('compTitle')}</h2>
          <p className="text-[var(--t2)] max-w-2xl mx-auto text-lg">{t('compSub')}</p>
        </ScrollReveal>
        <ScrollReveal>
          <div className="glass-card max-w-3xl mx-auto p-8 lg:p-10">
            <div className="space-y-6">
              {regs.map((r) => (
                <div key={r} className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(20,184,166,.1)' }}>
                    <span className="text-[var(--neon)] text-sm">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--t1)] mb-1 font-body">{t(`comp${r}Title`)}</div>
                    <div className="text-sm text-[var(--t2)]">{t(`comp${r}Desc`)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTASection() {
  const { t } = useLang();
  return (
    <section id="cta" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(20,184,166,.06) 0%, transparent 70%)' }} />
      <div className="section-container relative z-10 text-center">
        <ScrollReveal>
          <h2 className="text-3xl lg:text-5xl mb-6 max-w-3xl mx-auto">{t('ctaTitle')}</h2>
          <p className="text-lg text-[var(--t2)] mb-10 max-w-xl mx-auto">{t('ctaSub')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/setup" className="btn-neon text-center">{t('ctaBtn1')}</a>
            <a href="mailto:hello@neofarm.io" className="btn-ghost text-center">{t('ctaBtn2')}</a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  const { t } = useLang();
  return (
    <footer className="pt-16 pb-8 border-t border-white/5" style={{ background: 'var(--bg)' }}>
      <div className="section-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="mb-4">
              <span className="text-[28px] tracking-tight" style={{ fontFamily: 'var(--fb)' }}>
                <span className="font-extrabold text-white">Neo</span>
                <span className="font-light" style={{ color: 'var(--neon)' }}>Farm</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[var(--t3)] ml-2">IoT HUB</span>
            </div>
            <p className="text-xs text-[var(--t3)] leading-relaxed mb-3">{t('footerTagline')}</p>
            <a href="https://geotwin.es" target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-[var(--neon)] hover:text-[var(--neon2)] transition-colors tracking-wider">GEOTWIN.ES</a>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--t1)] mb-4">{t('footerPlatform')}</h4>
            <ul className="space-y-2 text-xs text-[var(--t3)]">
              <li><a href="#platform" className="hover:text-[var(--t2)] transition-colors">{t('footerArch')}</a></li>
              <li><a href="#platform" className="hover:text-[var(--t2)] transition-colors">{t('footerDT')}</a></li>
              <li><a href="#platform" className="hover:text-[var(--t2)] transition-colors">{t('footerIoT')}</a></li>
              <li><a href="#platform" className="hover:text-[var(--t2)] transition-colors">{t('footerComp')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--t1)] mb-4">{t('footerVerts')}</h4>
            <ul className="space-y-2 text-xs text-[var(--t3)]">
              <li><a href="https://hub.vacasdata.com/dashboard" className="hover:text-[var(--t2)] transition-colors">VacasData</a></li>
              <li><a href="https://hub.porcdata.com/dashboard" className="hover:text-[var(--t2)] transition-colors">PorcData</a></li>
              <li><a href="https://hub.ovosfera.com/dashboard" className="hover:text-[var(--t2)] transition-colors">OvoSfera</a></li>
              <li><a href="#cta" className="hover:text-[var(--t2)] transition-colors">{t('footerYourVert')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--t1)] mb-4">{t('footerResources')}</h4>
            <ul className="space-y-2 text-xs text-[var(--t3)]">
              <li><a href="#" className="hover:text-[var(--t2)] transition-colors">{t('footerBlog')}</a></li>
              <li><a href="#" className="hover:text-[var(--t2)] transition-colors">{t('footerAPIDocs')}</a></li>
              <li><a href="#" className="hover:text-[var(--t2)] transition-colors">{t('footerGitHub')}</a></li>
              <li><a href="mailto:hello@neofarm.io" className="hover:text-[var(--t2)] transition-colors">{t('footerContact')}</a></li>
              <li><a href="/dafo" className="hover:text-[var(--t2)] transition-colors">{t('footerDAFO')}</a></li>
              <li><a href="https://geotwin.es" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--t2)] transition-colors">GeoTwin.es</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-white/5 text-center text-xs text-[var(--t3)]">
          {t('footerCopy')}
        </div>
      </div>
    </footer>
  );
}

/* ─── MAIN PAGE ─── */
export default function LandingPage() {
  return (
    <LangProvider>
      <Navbar />
      <Hero />
      <ProblemSection />
      <PlatformSection />
      <DigitalTwinSection />
      <ROISimulator />
      <VerticalsSection />
      <EcosystemSection />
      <ComplianceSection />
      <CTASection />
      <Footer />
    </LangProvider>
  );
}
