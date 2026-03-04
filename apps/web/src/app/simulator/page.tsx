'use client';

import { useState, useCallback } from 'react';
import { Camera, Loader2, Clock, Download, Trash2, Star, X, Zap, Egg, Drumstick, Scale } from 'lucide-react';

/* ── Types ─────────────────────────────────────────── */
type Objetivo = 'capón' | 'ponedora' | 'doble_proposito' | 'picantón';

interface SimResult {
  id: string;
  imageUrl: string;
  galloRaza: string;
  gallinaRaza: string;
  objetivo: Objetivo;
  timestamp: string;
  caracteres: Caracteres;
}

interface Caracteres {
  pesoEstimado: string;
  rusticidad: number;  // 1-5
  postura: string;
  carne: string;
  heterosis: string;
  plumaje: string;
  temperamento: string;
}

/* ── Breed catalog ─────────────────────────────────── */
const RAZAS = [
  'Castellana Negra', 'Prat Leonada', 'Plymouth Rock', 'Sussex',
  'Mos (Galicia)', 'Empordanesa', 'Rhode Island Red', 'Wyandotte',
  'Brahma', 'Marans', 'Euskal Oiloa', 'Pendesenca', 'Sulmtaler',
  'Andaluza Azul', 'New Hampshire',
];

const OBJETIVOS: { value: Objetivo; label: string; icon: string }[] = [
  { value: 'capón', label: 'Capón (carne gourmet)', icon: '🍗' },
  { value: 'ponedora', label: 'Ponedora (huevos)', icon: '🥚' },
  { value: 'doble_proposito', label: 'Doble propósito', icon: '⚖️' },
  { value: 'picantón', label: 'Picantón (sacrificio temprano)', icon: '🐣' },
];

/* ── Character prediction (heuristic based on breed traits) ── */
const BREED_TRAITS: Record<string, { peso: number; postura: number; rusticidad: number; carne: number }> = {
  'Castellana Negra': { peso: 2.8, postura: 70, rusticidad: 5, carne: 3 },
  'Prat Leonada': { peso: 3.0, postura: 65, rusticidad: 4, carne: 4 },
  'Plymouth Rock': { peso: 3.8, postura: 75, rusticidad: 4, carne: 5 },
  'Sussex': { peso: 3.5, postura: 72, rusticidad: 4, carne: 4 },
  'Mos (Galicia)': { peso: 3.2, postura: 55, rusticidad: 5, carne: 4 },
  'Empordanesa': { peso: 2.5, postura: 60, rusticidad: 5, carne: 3 },
  'Rhode Island Red': { peso: 3.2, postura: 80, rusticidad: 4, carne: 4 },
  'Wyandotte': { peso: 3.5, postura: 70, rusticidad: 4, carne: 4 },
  'Brahma': { peso: 4.5, postura: 50, rusticidad: 3, carne: 5 },
  'Marans': { peso: 3.2, postura: 65, rusticidad: 4, carne: 4 },
  'Euskal Oiloa': { peso: 2.8, postura: 65, rusticidad: 5, carne: 3 },
  'Pendesenca': { peso: 2.5, postura: 60, rusticidad: 5, carne: 3 },
  'Sulmtaler': { peso: 3.0, postura: 65, rusticidad: 4, carne: 4 },
  'Andaluza Azul': { peso: 2.6, postura: 68, rusticidad: 5, carne: 3 },
  'New Hampshire': { peso: 3.4, postura: 75, rusticidad: 4, carne: 4 },
};

function predictCharacteres(padre: string, madre: string, obj: Objetivo): Caracteres {
  const p = BREED_TRAITS[padre] || { peso: 3.0, postura: 65, rusticidad: 4, carne: 4 };
  const m = BREED_TRAITS[madre] || { peso: 3.0, postura: 65, rusticidad: 4, carne: 4 };
  const isPure = padre === madre;
  const heterosisBonus = isPure ? 0 : 0.15;

  const avgPeso = ((p.peso + m.peso) / 2) * (1 + heterosisBonus * 0.3);
  const avgPostura = ((p.postura + m.postura) / 2) * (1 + heterosisBonus * 0.2);
  const avgRust = Math.round((p.rusticidad + m.rusticidad) / 2 + (isPure ? 0 : 0.5));
  const avgCarne = Math.round((p.carne + m.carne) / 2 + (isPure ? 0 : 0.5));

  let pesoStr: string;
  switch (obj) {
    case 'capón': pesoStr = `${(avgPeso * 1.4).toFixed(1)} kg (capón 24sem)`; break;
    case 'picantón': pesoStr = `${(avgPeso * 0.35).toFixed(1)} kg (6-8sem)`; break;
    default: pesoStr = `${avgPeso.toFixed(1)} kg (adulto)`; break;
  }

  const plumajes: Record<string, string> = {
    'Castellana Negra': 'negro irisado',
    'Plymouth Rock': 'barrado blanco/negro',
    'Prat Leonada': 'leonado dorado',
    'Sussex': 'blanco con collar negro',
    'Brahma': 'claro con marcas oscuras',
    'Marans': 'cobrizo oscuro',
    'Empordanesa': 'negro/rubio',
  };
  const plumPadre = plumajes[padre] || 'variado';
  const plumMadre = plumajes[madre] || 'variado';

  return {
    pesoEstimado: pesoStr,
    rusticidad: Math.min(avgRust, 5),
    postura: `~${Math.round(avgPostura)} huevos/año`,
    carne: `${'★'.repeat(Math.min(avgCarne, 5))}${'☆'.repeat(5 - Math.min(avgCarne, 5))}`,
    heterosis: isPure ? '0% (puro)' : `~${Math.round(heterosisBonus * 100)}%`,
    plumaje: isPure ? plumPadre : `Mezcla: ${plumPadre} × ${plumMadre}`,
    temperamento: avgRust >= 4 ? 'Dócil, buen forrajeo' : 'Tranquilo, adaptable',
  };
}

/* ── Cache key ─────────────────────────────────────── */
function cacheKey(g: string, h: string, o: Objetivo) {
  return `${g}|${h}|${o}`;
}

/* ══════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════ */
export default function SimulatorPage() {
  const [galloRaza, setGalloRaza] = useState('Castellana Negra');
  const [gallinaRaza, setGallinaRaza] = useState('Prat Leonada');
  const [objetivo, setObjetivo] = useState<Objetivo>('capón');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<SimResult[]>([]);
  const [cache, setCache] = useState<Record<string, SimResult>>({});
  const [detailResult, setDetailResult] = useState<SimResult | null>(null);

  const handleSimulate = useCallback(async () => {
    const key = cacheKey(galloRaza, gallinaRaza, objetivo);

    // Check cache first
    if (cache[key]) {
      setResult(cache[key]);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/simulate-bird', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galloRaza, gallinaRaza, objetivo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error generando simulación');

      const newResult: SimResult = {
        id: `SIM-${Date.now()}`,
        imageUrl: data.imageUrl,
        galloRaza,
        gallinaRaza,
        objetivo,
        timestamp: new Date().toISOString(),
        caracteres: predictCharacteres(galloRaza, gallinaRaza, objetivo),
      };

      setResult(newResult);
      setHistory(prev => [newResult, ...prev]);
      setCache(prev => ({ ...prev, [key]: newResult }));
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [galloRaza, gallinaRaza, objetivo, cache]);

  const previewChars = predictCharacteres(galloRaza, gallinaRaza, objetivo);

  const modalBg: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 999,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  };
  const modalBox: React.CSSProperties = {
    background: 'var(--neutral-900)', borderRadius: 16, padding: 24,
    maxWidth: 600, width: '100%', maxHeight: '85vh', overflow: 'auto',
    border: '1px solid var(--neutral-700)',
  };

  return (
    <div className="nf-content" style={{ maxWidth: 1200 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
        <Camera size={24} style={{ display: 'inline', marginRight: 8 }} />
        Simulador de Cruces — IA
      </h1>
      <p style={{ color: 'var(--neutral-400)', fontSize: 13, marginBottom: 24 }}>
        Genera imágenes fotorrealistas y predicciones de caracteres para tus cruces avícolas.
        {Object.keys(cache).length > 0 && (
          <span style={{ color: 'var(--primary-400)', marginLeft: 8 }}>
            🗃️ {Object.keys(cache).length} en caché
          </span>
        )}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20 }}>
        {/* ── LEFT: Config Form ────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="nf-card">
            <div className="nf-card-hd">
              <div className="nf-card-title">Configuración del Cruce</div>
            </div>
            <div className="nf-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Padre */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-400)', marginBottom: 4, display: 'block' }}>
                  🐓 Raza Padre (Gallo)
                </label>
                <select className="nf-input" value={galloRaza} onChange={e => setGalloRaza(e.target.value)}
                  style={{ width: '100%' }}>
                  {RAZAS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Madre */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-400)', marginBottom: 4, display: 'block' }}>
                  🐔 Raza Madre (Gallina)
                </label>
                <select className="nf-input" value={gallinaRaza} onChange={e => setGallinaRaza(e.target.value)}
                  style={{ width: '100%' }}>
                  {RAZAS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Objetivo */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-400)', marginBottom: 6, display: 'block' }}>
                  🎯 Objetivo
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {OBJETIVOS.map(o => (
                    <button
                      key={o.value}
                      onClick={() => setObjetivo(o.value)}
                      style={{
                        background: objetivo === o.value ? 'var(--primary-500)22' : 'var(--neutral-800)',
                        border: `1px solid ${objetivo === o.value ? 'var(--primary-500)' : 'var(--neutral-700)'}`,
                        borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
                        color: objetivo === o.value ? 'var(--primary-400)' : 'var(--neutral-300)',
                        fontSize: 12, fontWeight: 600, textAlign: 'left',
                      }}
                    >
                      {o.icon} {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cache indicator */}
              {cache[cacheKey(galloRaza, gallinaRaza, objetivo)] && (
                <div style={{ fontSize: 11, color: 'var(--ok)', background: 'rgba(16,185,129,.1)', padding: '6px 10px', borderRadius: 8 }}>
                  ⚡ En caché — se mostrará instantáneamente
                </div>
              )}

              <button
                onClick={handleSimulate}
                disabled={loading}
                style={{
                  width: '100%', padding: '12px 16px',
                  background: loading ? 'var(--neutral-600)' : 'var(--primary-500)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontWeight: 700, fontSize: 14, cursor: loading ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Generando… (15-30s)
                  </>
                ) : (
                  <>
                    <Camera size={16} />
                    {cache[cacheKey(galloRaza, gallinaRaza, objetivo)] ? 'Ver resultado (caché)' : 'Simular Cruce F1'}
                  </>
                )}
              </button>

              {error && (
                <div style={{ padding: 10, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, color: 'var(--alert)', fontSize: 12 }}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>

          {/* Character preview */}
          <div className="nf-card">
            <div className="nf-card-hd">
              <div className="nf-card-title">Predicción de Caracteres</div>
              <div className="nf-card-meta">Estimación F1</div>
            </div>
            <div className="nf-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '⚖️', l: 'Peso estimado', v: previewChars.pesoEstimado },
                { icon: '🥚', l: 'Postura', v: previewChars.postura },
                { icon: '🍗', l: 'Calidad carne', v: previewChars.carne },
                { icon: '🧬', l: 'Heterosis', v: previewChars.heterosis },
                { icon: '🪶', l: 'Plumaje', v: previewChars.plumaje },
                { icon: '🌿', l: 'Temperamento', v: previewChars.temperamento },
                { icon: '💪', l: 'Rusticidad', v: `${'●'.repeat(previewChars.rusticidad)}${'○'.repeat(5 - previewChars.rusticidad)}` },
              ].map(c => (
                <div key={c.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                  <span style={{ fontSize: 12, color: 'var(--neutral-400)' }}>{c.icon} {c.l}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{c.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Result + History ─────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Result */}
          <div className="nf-card" style={{ flex: result ? 'none' : 1  }}>
            <div className="nf-card-hd">
              <div className="nf-card-title">Resultado — F1 Simulado</div>
              <div className="nf-card-meta">🤖 IA generativa (orientativa)</div>
            </div>
            <div className="nf-card-pad">
              {loading && (
                <div style={{
                  height: 320, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'var(--neutral-800)', borderRadius: 10,
                }}>
                  <Loader2 size={36} className="spin" style={{ color: 'var(--primary-500)', marginBottom: 12 }} />
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Generando imagen IA…</div>
                  <div style={{ fontSize: 12, color: 'var(--neutral-500)', marginTop: 4 }}>
                    SDXL · {galloRaza} × {gallinaRaza} · {objetivo}
                  </div>
                  {/* Progress bar */}
                  <div style={{
                    width: 200, height: 4, background: 'var(--neutral-700)',
                    borderRadius: 2, marginTop: 16, overflow: 'hidden',
                  }}>
                    <div className="progress-animate" style={{
                      height: '100%', background: 'var(--primary-500)',
                      borderRadius: 2, width: '30%',
                    }} />
                  </div>
                </div>
              )}

              {result && !loading && (
                <div>
                  <img
                    src={result.imageUrl}
                    alt={`Cruce ${result.galloRaza} × ${result.gallinaRaza}`}
                    style={{ width: '100%', borderRadius: 10, marginBottom: 12 }}
                  />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span style={{
                      background: 'var(--primary-500)22', color: 'var(--primary-400)',
                      padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    }}>♂ {result.galloRaza}</span>
                    <span style={{ color: 'var(--neutral-500)', lineHeight: '28px' }}>×</span>
                    <span style={{
                      background: 'var(--primary-500)22', color: 'var(--primary-400)',
                      padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    }}>♀ {result.gallinaRaza}</span>
                    <span style={{
                      background: 'var(--neutral-700)', color: 'var(--neutral-300)',
                      padding: '4px 10px', borderRadius: 8, fontSize: 12,
                    }}>{OBJETIVOS.find(o => o.value === result.objetivo)?.icon} {result.objetivo}</span>
                  </div>

                  {/* Character badges */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 6, marginBottom: 10 }}>
                    {[
                      { l: 'Peso', v: result.caracteres.pesoEstimado, c: '#F59E0B' },
                      { l: 'Postura', v: result.caracteres.postura, c: '#10B981' },
                      { l: 'Heterosis', v: result.caracteres.heterosis, c: '#8B5CF6' },
                      { l: 'Rusticidad', v: `${'●'.repeat(result.caracteres.rusticidad)}${'○'.repeat(5 - result.caracteres.rusticidad)}`, c: '#3B82F6' },
                    ].map(b => (
                      <div key={b.l} style={{
                        background: 'var(--neutral-800)', borderRadius: 8, padding: '6px 10px',
                        borderLeft: `3px solid ${b.c}`,
                      }}>
                        <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>{b.l}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{b.v}</div>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: 11, color: 'var(--neutral-500)', fontStyle: 'italic' }}>
                    <strong>Disclaimer:</strong> Imagen IA orientativa. El aspecto real varía según genética individual, alimentación y manejo.
                  </p>
                </div>
              )}

              {!result && !loading && (
                <div style={{
                  height: 300, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'var(--neutral-800)', borderRadius: 10,
                  color: 'var(--neutral-500)', textAlign: 'center', padding: 24,
                }}>
                  <Camera size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p style={{ margin: 0, fontSize: 14 }}>Configura el cruce y pulsa "Simular"</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12 }}>Usa Replicate SDXL para generar la imagen</p>
                </div>
              )}
            </div>
          </div>

          {/* ── History grid ──────────────────────── */}
          {history.length > 0 && (
            <div className="nf-card">
              <div className="nf-card-hd">
                <div className="nf-card-title">
                  <Clock size={14} style={{ display: 'inline', marginRight: 6 }} />
                  Historial de Simulaciones ({history.length})
                </div>
                <button
                  onClick={() => { setHistory([]); setCache({}); }}
                  style={{
                    background: 'none', border: '1px solid var(--neutral-600)',
                    borderRadius: 8, padding: '4px 10px', color: 'var(--neutral-400)',
                    fontSize: 11, cursor: 'pointer',
                  }}
                >
                  <Trash2 size={12} style={{ display: 'inline', marginRight: 4 }} /> Limpiar
                </button>
              </div>
              <div className="nf-card-pad">
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 10,
                }}>
                  {history.map(h => (
                    <div
                      key={h.id}
                      onClick={() => setDetailResult(h)}
                      style={{
                        borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                        border: '1px solid var(--neutral-700)',
                        background: 'var(--neutral-800)',
                        transition: 'transform .15s, border-color .15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-500)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'none';
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--neutral-700)';
                      }}
                    >
                      <img
                        src={h.imageUrl}
                        alt={`${h.galloRaza} × ${h.gallinaRaza}`}
                        style={{ width: '100%', height: 100, objectFit: 'cover' }}
                      />
                      <div style={{ padding: '6px 8px' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}>
                          {h.galloRaza} × {h.gallinaRaza}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>
                          {h.objetivo} · {new Date(h.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail modal ───────────────────────────── */}
      {detailResult && (
        <div style={modalBg} onClick={() => setDetailResult(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                {detailResult.galloRaza} × {detailResult.gallinaRaza}
              </h2>
              <button onClick={() => setDetailResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)' }}><X size={18} /></button>
            </div>
            <img
              src={detailResult.imageUrl}
              alt="Simulación"
              style={{ width: '100%', borderRadius: 10, marginBottom: 16 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { l: 'Objetivo', v: `${OBJETIVOS.find(o => o.value === detailResult.objetivo)?.icon} ${detailResult.objetivo}` },
                { l: 'Peso F1', v: detailResult.caracteres.pesoEstimado },
                { l: 'Postura', v: detailResult.caracteres.postura },
                { l: 'Calidad carne', v: detailResult.caracteres.carne },
                { l: 'Heterosis', v: detailResult.caracteres.heterosis },
                { l: 'Plumaje', v: detailResult.caracteres.plumaje },
                { l: 'Rusticidad', v: `${'●'.repeat(detailResult.caracteres.rusticidad)}${'○'.repeat(5 - detailResult.caracteres.rusticidad)}` },
                { l: 'Temperamento', v: detailResult.caracteres.temperamento },
              ].map(r => (
                <div key={r.l}>
                  <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>{r.l}</div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{r.v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>
              Generado: {new Date(detailResult.timestamp).toLocaleString('es')}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes progressSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .progress-animate {
          animation: progressSlide 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
