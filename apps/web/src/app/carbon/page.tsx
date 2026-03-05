'use client';

import { useState, useMemo } from 'react';
import { Leaf, Search, Loader2, MapPin, TreePine, Bird, RefreshCw, BarChart3, TrendingDown, Award } from 'lucide-react';

/* ── demo production lots (mirrors production page) ── */
const PRODUCTION_LOTS = [
  { id: 'LOT-2025-001', aves: 12 },
  { id: 'LOT-2025-002', aves: 8 },
  { id: 'LOT-2025-003', aves: 6 },
  { id: 'LOT-2025-004', aves: 5 },
  { id: 'LOT-2025-005', aves: 4 },
  { id: 'LOT-2025-006', aves: 3 },
  { id: 'LOT-2025-007', aves: 10 },
  { id: 'LOT-2025-008', aves: 7 },
];

export default function CarbonPage() {
  const [aves, setAves] = useState(40);
  const [hectareas, setHectareas] = useState(0.5);
  const [catRef, setCatRef] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState('');
  const [catData, setCatData] = useState<any>(null);
  const [synced, setSynced] = useState(false);

  /* ── Emission model (detailed) ── */
  const emisionPienso = 4.5;   // kg CO₂e/ave/año (feed production + transport)
  const emisionGallinaza = 5.2; // kg CO₂e/ave/año (N₂O mainly)
  const emisionEnergia = 1.8;  // kg CO₂e/ave/año (heating, lighting)
  const emisionTransporte = 0.5;// kg CO₂e/ave/año (local transport)
  const emisionesPorAve = emisionPienso + emisionGallinaza + emisionEnergia + emisionTransporte;
  const emisionesTotal = aves * emisionesPorAve;
  const secuestroPasto = 1500;
  const secuestroTotal = hectareas * secuestroPasto;
  const balance = secuestroTotal - emisionesTotal;
  const rating = balance > 200 ? 'A+' : balance > 0 ? 'A' : balance > -200 ? 'B' : balance > -500 ? 'C' : 'D';
  const ratingColor = balance > 0 ? 'var(--ok)' : balance > -200 ? 'var(--warn)' : 'var(--alert)';

  /* ── Emission breakdown for donut ── */
  const emissionSources = useMemo(() => [
    { label: 'Pienso', value: aves * emisionPienso, color: '#EF4444', pct: (emisionPienso / emisionesPorAve * 100) },
    { label: 'Gallinaza', value: aves * emisionGallinaza, color: '#F59E0B', pct: (emisionGallinaza / emisionesPorAve * 100) },
    { label: 'Energía', value: aves * emisionEnergia, color: '#6366F1', pct: (emisionEnergia / emisionesPorAve * 100) },
    { label: 'Transporte', value: aves * emisionTransporte, color: '#8B5CF6', pct: (emisionTransporte / emisionesPorAve * 100) },
  ], [aves, emisionPienso, emisionGallinaza, emisionEnergia, emisionTransporte, emisionesPorAve]);

  /* ── Sync from production lots ── */
  function syncFromProduction() {
    const total = PRODUCTION_LOTS.reduce((s, l) => s + l.aves, 0);
    setAves(total);
    setSynced(true);
    setTimeout(() => setSynced(false), 3000);
  }

  /* ── Donut chart SVG helper ── */
  function DonutChart({ data }: { data: typeof emissionSources }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    let acc = 0;
    const r = 60, cx = 80, cy = 80, sw = 18;
    const arcs = data.map(d => {
      const start = acc / total;
      acc += d.value;
      const end = acc / total;
      const startAngle = start * 2 * Math.PI - Math.PI / 2;
      const endAngle = end * 2 * Math.PI - Math.PI / 2;
      const largeArc = (end - start) > 0.5 ? 1 : 0;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      return { ...d, path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}` };
    });
    return (
      <svg width={160} height={160} viewBox="0 0 160 160">
        {arcs.map((a, i) => (
          <path key={i} d={a.path} fill="none" stroke={a.color} strokeWidth={sw} strokeLinecap="round" />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={20} fontWeight={800} fill="var(--neutral-800)">
          {Math.round(total)}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fill="var(--neutral-500)">
          kg CO₂e/año
        </text>
      </svg>
    );
  }

  async function consultaCatastro() {
    if (!catRef || catRef.length < 14) { setCatError('Mínimo 14 caracteres'); return; }
    setCatLoading(true); setCatError('');
    try {
      const res = await fetch(`/api/catastro?rc=${encodeURIComponent(catRef)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al consultar catastro');
      const ha = data.superficie_m2 / 10000;
      setHectareas(+ha.toFixed(2));
      setCatData(data);
    } catch (e: any) {
      setCatError(e.message || 'Error al consultar catastro');
    }
    setCatLoading(false);
  }

  return (
    <div className="nf-content" style={{ padding: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Leaf size={22} style={{ color: 'var(--ok)' }} />
        Huella de Carbono Avícola
      </h1>
      <p style={{ color: 'var(--neutral-500)', fontSize: 13, margin: '4px 0 20px' }}>
        Cálculo de emisiones y secuestro de carbono — sistema extensivo/ecológico
      </p>

      {/* ── Catastro input ── */}
      <div style={{
        background: 'white', borderRadius: 12, padding: 16, marginBottom: 16,
        border: '1px solid var(--neutral-100)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={14} style={{ color: 'var(--primary-500)' }} /> Mi Parcela Catastro
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <input
              className="nf-input" value={catRef}
              onChange={e => setCatRef(e.target.value)}
              placeholder="Referencia catastral (ej: 29900A01200039)"
              style={{ width: '100%' }}
            />
          </div>
          <button onClick={consultaCatastro} className="nf-btn primary" disabled={catLoading} style={{ whiteSpace: 'nowrap' }}>
            {catLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            {catLoading ? ' ...' : ' Consultar'}
          </button>
        </div>
        {catError && <div style={{ fontSize: 11, color: 'var(--alert)', marginTop: 6 }}>{catError}</div>}
        {catData && (
          <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'start' }}>
            <img src={catData.wms} alt="Catastro" style={{ width: 200, height: 140, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--neutral-200)' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div style={{ fontSize: 12, color: 'var(--neutral-600)', lineHeight: 1.6 }}>
              <div><strong>Superficie:</strong> {(catData.superficie_m2/10000).toFixed(2)} ha ({catData.superficie_m2.toLocaleString()} m²)</div>
              <div><strong>Coordenadas:</strong> {catData.lat.toFixed(5)}, {catData.lon.toFixed(5)}</div>
              {catData.descripcion && <div><strong>Descripción:</strong> {catData.descripcion}</div>}
              <div style={{ marginTop: 4, fontSize: 11, color: 'var(--ok)' }}>✓ Hectáreas actualizadas automáticamente</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Parámetros editables ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{
          background: 'white', borderRadius: 10, padding: '12px 16px', flex: 1,
          border: '1px solid var(--neutral-100)',
        }}>
          <label style={{ fontSize: 11, color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            <Bird size={12} />Nº Aves
            <button onClick={syncFromProduction} title="Sincronizar desde lotes de producción"
              style={{ marginLeft: 'auto', cursor: 'pointer', border: 'none', background: synced ? 'var(--ok)' : 'var(--primary-500)', color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <RefreshCw size={10} /> {synced ? '✓ Sincronizado' : 'Sync Producción'}
            </button>
          </label>
          <input className="nf-input" type="number" value={aves} onChange={e => setAves(+e.target.value)} style={{ width: '100%', fontSize: 18, fontWeight: 800 }} />
        </div>
        <div style={{
          background: 'white', borderRadius: 10, padding: '12px 16px', flex: 1,
          border: '1px solid var(--neutral-100)',
        }}>
          <label style={{ fontSize: 11, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>
            <TreePine size={12} style={{ display: 'inline', marginRight: 4 }} />Hectáreas pasto
          </label>
          <input className="nf-input" type="number" step="0.1" value={hectareas} onChange={e => setHectareas(+e.target.value)} style={{ width: '100%', fontSize: 18, fontWeight: 800 }} />
        </div>
      </div>

      {/* ── Rating + Balance ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
        <div style={{
          background: balance > 0 ? 'rgba(22,163,74,0.08)' : 'rgba(217,119,6,0.08)',
          borderRadius: 14, padding: 28, textAlign: 'center',
          border: `1px solid ${ratingColor}30`,
        }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--neutral-500)', marginBottom: 8 }}>Rating Ambiental</div>
          <div style={{ fontSize: 64, fontWeight: 900, color: ratingColor, lineHeight: 1 }}>{rating}</div>
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 8, color: ratingColor }}>
            {balance > 0 ? '✓ Sumidero neto de carbono' : '⚠️ Emisor neto'}
          </div>
        </div>

        <div style={{
          background: 'white', borderRadius: 14, overflow: 'hidden',
          border: '1px solid var(--neutral-100)',
        }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--neutral-100)', fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>
            Balance de Carbono <span style={{ fontWeight: 400, color: 'var(--neutral-400)', fontSize: 11 }}>kg CO₂e / año</span>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(220,38,38,0.06)', borderRadius: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-700)' }}>❌ Emisiones ({aves} aves × {emisionesPorAve.toFixed(1)})</span>
              <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--alert)' }}>+{emisionesTotal}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(22,163,74,0.06)', borderRadius: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-700)' }}>✓ Secuestro ({hectareas} ha × {secuestroPasto})</span>
              <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--ok)' }}>−{secuestroTotal}</span>
            </div>
            <div style={{ borderTop: '2px solid var(--neutral-100)', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--neutral-800)' }}>Balance Neto</span>
              <span style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)', color: ratingColor }}>
                {balance > 0 ? '−' : '+'}{Math.abs(balance)} kg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desglose Emisiones (donut) + Secuestro ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--neutral-100)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--neutral-100)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart3 size={14} style={{ color: 'var(--alert)' }} /> Desglose Emisiones
            </div>
            <div style={{ fontSize: 11, color: 'var(--neutral-400)' }}>{aves} aves × {emisionesPorAve.toFixed(1)} kg CO₂e/ave</div>
          </div>
          <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
            <DonutChart data={emissionSources} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {emissionSources.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-700)' }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--neutral-400)' }}>{s.pct.toFixed(0)}%</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--neutral-800)' }}>
                    {Math.round(s.value)} kg
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--neutral-100)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--neutral-100)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>Secuestro de Carbono</div>
          </div>
          <div style={{ padding: 16, fontSize: 13, lineHeight: 1.8, color: 'var(--neutral-700)' }}>
            <div><strong>Pasto gestionado:</strong> 0,5–2 t CO₂/ha/año</div>
            <div><strong>Arbolado:</strong> Si hay encinas/frutales → 2-4 t CO₂/ha/año</div>
            <div><strong>Gallinaza como abono:</strong> Mejora SOC (carbono orgánico suelo)</div>
            <div><strong>Pastoreo rotacional:</strong> Mejora captura</div>
            <div style={{ marginTop: 10, padding: 10, background: 'var(--ok)', color: 'white', borderRadius: 6 }}>
              <strong>Tu granja:</strong> {hectareas} ha × {secuestroPasto} = {secuestroTotal} kg CO₂/año
            </div>
          </div>
        </div>
      </div>

      {/* ── Recommendations ── */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--neutral-100)', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--neutral-100)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingDown size={14} style={{ color: 'var(--ok)' }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>Recomendaciones de Mejora</div>
        </div>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { icon: '🌿', title: 'Pienso eco local', desc: 'Reduce emisiones de transporte un 30%. Usa cereales de lonjas locales.', saving: '-15%' },
            { icon: '♻️', title: 'Compostaje gallinaza', desc: 'Compostaje aeróbico reduce N₂O un 40-60%. Vender como abono eco.', saving: '-25%' },
            { icon: '☀️', title: 'Solar + LED', desc: 'Placas solares + iluminación LED elimina emisiones energéticas.', saving: '-15%' },
            { icon: '🌳', title: 'Plantar arbolado', desc: 'Cada encina captura ~22 kg CO₂/año. 20 árboles = 440 kg extra.', saving: '+440 kg' },
            { icon: '🔄', title: 'Pastoreo rotacional', desc: 'Mejora SOC un 10-20%, incrementando secuestro de carbono.', saving: '+10%' },
            { icon: '📋', title: 'Certificación ecológica', desc: 'Accede a primas PAC y mercado premium con menor huella.', saving: 'Premium' },
          ].map(r => (
            <div key={r.title} style={{ padding: 14, borderRadius: 10, border: '1px solid var(--neutral-100)', background: 'var(--neutral-25)' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{r.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 4 }}>{r.title}</div>
              <div style={{ fontSize: 11, color: 'var(--neutral-500)', lineHeight: 1.5, marginBottom: 6 }}>{r.desc}</div>
              <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, backgroundColor: 'rgba(22,163,74,0.1)', color: 'var(--ok)', fontSize: 11, fontWeight: 700 }}>
                {r.saving}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
