'use client';

import { Leaf } from 'lucide-react';

export default function CarbonPage() {
  const aves = 40;
  const emisionesPorAve = 12; // kg CO₂e/año
  const emisionesTotal = aves * emisionesPorAve;
  const hectareas = 0.5;
  const secuestroPasto = 1500; // kg CO₂/ha/año
  const secuestroTotal = hectareas * secuestroPasto;
  const balance = secuestroTotal - emisionesTotal;
  const rating = balance > 0 ? 'A' : balance > -200 ? 'B' : balance > -500 ? 'C' : 'D';

  return (
    <div className="nf-content">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
        <Leaf size={24} style={{ display: 'inline', marginRight: 8, color: 'var(--ok)' }} />
        Huella de Carbono Avícola
      </h1>
      <p style={{ color: 'var(--neutral-500)', marginBottom: 24 }}>
        Cálculo de emisiones y secuestro de carbono en sistema extensivo/ecológico
      </p>

      {/* Rating */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 24 }}>
        <div className="nf-card" style={{ background: balance > 0 ? 'rgba(22,163,74,0.1)' : 'rgba(217,119,6,0.1)' }}>
          <div className="nf-card-pad" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--neutral-500)', marginBottom: 8 }}>
              Rating Ambiental
            </div>
            <div style={{ fontSize: 72, fontWeight: 900, color: balance > 0 ? 'var(--ok)' : 'var(--warn)', lineHeight: 1 }}>
              {rating}
            </div>
            <div style={{ fontSize: 13, marginTop: 8, color: balance > 0 ? 'var(--ok)' : 'var(--warn)' }}>
              {balance > 0 ? '✓ Sumidero neto' : '⚠️ Emisor neto'}
            </div>
          </div>
        </div>

        <div className="nf-card">
          <div className="nf-card-hd">
            <div className="nf-card-title">Balance de Carbono</div>
            <div className="nf-card-meta">kg CO₂e / año</div>
          </div>
          <div className="nf-card-pad">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: 'rgba(220,38,38,0.1)', borderRadius: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>❌ Emisiones</span>
                <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--alert)' }}>
                  +{emisionesTotal}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: 'rgba(22,163,74,0.1)', borderRadius: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>✓ Secuestro</span>
                <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--ok)' }}>
                  −{secuestroTotal}
                </span>
              </div>
              <div style={{ borderTop: '2px solid var(--neutral-200)', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>Balance Neto</span>
                <span style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-mono)', color: balance > 0 ? 'var(--ok)' : 'var(--alert)' }}>
                  {balance > 0 ? '−' : '+'}{Math.abs(balance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detalles emisiones */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="nf-card">
          <div className="nf-card-hd">
            <div className="nf-card-title">Emisiones Avícola</div>
            <div className="nf-card-meta">Mucho menor que vacuno</div>
          </div>
          <div className="nf-card-pad">
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <div><strong>CO₂ pienso:</strong> ~1,5 kg CO₂e / kg pienso eco</div>
              <div><strong>N₂O gallinaza:</strong> ~0,02 kg N₂O / ave / año × GWP(298) = ~6 kg CO₂e/ave</div>
              <div><strong>CH₄ gallinaza:</strong> Despreciable en extensivo (compostaje aeróbico)</div>
              <div><strong>Energía:</strong> Calefacción pollitos, iluminación, transporte</div>
              <div style={{ marginTop: 12, padding: 12, background: 'var(--neutral-50)', borderRadius: 6 }}>
                <strong>Total:</strong> ~8-15 kg CO₂e / ave / año (extensivo)
              </div>
            </div>
          </div>
        </div>

        <div className="nf-card">
          <div className="nf-card-hd">
            <div className="nf-card-title">Secuestro de Carbono</div>
          </div>
          <div className="nf-card-pad">
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <div><strong>Pasto gestionado:</strong> 0,5–2 t CO₂/ha/año</div>
              <div><strong>Arbolado:</strong> Si hay encinas/frutales → 2-4 t CO₂/ha/año</div>
              <div><strong>Gallinaza como abono:</strong> Mejora SOC (carbono orgánico suelo)</div>
              <div><strong>Pastoreo rotacional:</strong> Mejora captura</div>
              <div style={{ marginTop: 12, padding: 12, background: 'var(--ok)', color: 'white', borderRadius: 6 }}>
                <strong>Tu granja:</strong> {hectareas} ha × {secuestroPasto} = {secuestroTotal} kg CO₂/año
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
