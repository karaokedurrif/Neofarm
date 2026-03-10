'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Bird, TrendingUp, Egg, Target, Shield, Dna } from 'lucide-react';
import { BREED_CATALOG } from '@/lib/genetics/breeds';
import type { GompertzParams, BreedCatalogEntry } from '@/lib/genetics/types';
import { gompertzWeight, gompertzCurve } from '@/lib/genetics/services/gompertz.service';

/* ── Mini growth SVG ── */
function MiniGrowth({ params, color = 'var(--primary)' }: { params: GompertzParams; color?: string }) {
  const curve = gompertzCurve(params, 250);
  const maxW = Math.max(...curve.map(p => p.w), 1);
  return (
    <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none" style={{ borderRadius: 4 }}>
      <polyline fill="none" stroke={color} strokeWidth={1.5} opacity={0.7}
        points={curve.filter((_, i) => i % 10 === 0).map(p => `${(p.t / 250) * 100},${40 - (p.w / maxW) * 36}`).join(' ')} />
    </svg>
  );
}

/* ── Star rating ── */
function Stars({ val, max = 5 }: { val: number; max?: number }) {
  return <span style={{ color: '#F59E0B', fontSize: 12 }}>{'★'.repeat(val)}{'☆'.repeat(max - val)}</span>;
}

/* ══════════════════════════════════════════════════════════════════
 *  Breed Card
 * ══════════════════════════════════════════════════════════════════ */

function BreedCard({ breed }: { breed: BreedCatalogEntry }) {
  const gM = breed.gompertzMacho;
  const gF = breed.gompertzHembra;
  const w150M = gompertzWeight(gM, 150);
  const w150F = gompertzWeight(gF, 150);

  return (
    <div className="nf-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(var(--primary-rgb,180,130,50),0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bird size={18} style={{ color: 'var(--primary)' }} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--neutral-100)' }}>{breed.nombre}</div>
          <div style={{ fontSize: 10, color: 'var(--neutral-400)' }}>{breed.origen}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11 }}>
        <div style={{ padding: '4px 6px', borderRadius: 4, background: 'rgba(var(--primary-rgb,180,130,50),0.03)' }}>
          <span style={{ color: 'var(--neutral-500)' }}>♂ Peso adulto:</span>{' '}
          <b style={{ color: 'var(--neutral-200)' }}>{breed.pesoMachoKg} kg</b>
        </div>
        <div style={{ padding: '4px 6px', borderRadius: 4, background: 'rgba(var(--primary-rgb,180,130,50),0.03)' }}>
          <span style={{ color: 'var(--neutral-500)' }}>♀ Peso adulto:</span>{' '}
          <b style={{ color: 'var(--neutral-200)' }}>{breed.pesoHembraKg} kg</b>
        </div>
        <div style={{ padding: '4px 6px', borderRadius: 4, background: 'rgba(var(--primary-rgb,180,130,50),0.03)' }}>
          <span style={{ color: 'var(--neutral-500)' }}>Huevos/año:</span>{' '}
          <b style={{ color: 'var(--neutral-200)' }}>{breed.huevosAnuales}</b>
        </div>
        <div style={{ padding: '4px 6px', borderRadius: 4, background: 'rgba(var(--primary-rgb,180,130,50),0.03)' }}>
          <span style={{ color: 'var(--neutral-500)' }}>Rto. canal:</span>{' '}
          <b style={{ color: 'var(--neutral-200)' }}>{breed.rendimientoCanal}%</b>
        </div>
      </div>

      {/* Ratings */}
      <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
        <span><span style={{ color: 'var(--neutral-500)' }}>Crecimiento:</span> <span style={{ color: 'var(--neutral-200)', fontWeight: 500 }}>{breed.crecimiento}</span></span>
        <span><span style={{ color: 'var(--neutral-500)' }}>Rusticidad:</span> <Stars val={breed.rusticidad} /></span>
        <span><span style={{ color: 'var(--neutral-500)' }}>Docilidad:</span> <Stars val={breed.docilidad} /></span>
      </div>

      {/* Special traits */}
      {breed.rasgosEspeciales.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {breed.rasgosEspeciales.map(r => (
            <span key={r} className="nf-tag" style={{ fontSize: 9 }}>{r}</span>
          ))}
        </div>
      )}

      {/* Mini growth curves */}
      <div>
        <div style={{ fontSize: 10, color: 'var(--neutral-500)', marginBottom: 2 }}>
          Curva Gompertz (♂ azul, ♀ rosa) — W₁₅₀: ♂{w150M.toFixed(1)}kg · ♀{w150F.toFixed(1)}kg
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{ flex: 1 }}><MiniGrowth params={gM} color="#3B82F6" /></div>
          <div style={{ flex: 1 }}><MiniGrowth params={gF} color="#EC4899" /></div>
        </div>
      </div>

      {/* Gompertz params */}
      <div style={{ fontSize: 9, color: 'var(--neutral-500)', fontFamily: 'monospace' }}>
        ♂ A={gM.A} k={gM.k} t₀={gM.t0} | ♀ A={gF.A} k={gF.k} t₀={gF.t0}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
 *  MAIN — Catalog
 * ══════════════════════════════════════════════════════════════════ */

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState<'capón' | 'ponedora' | 'doble_propósito' | 'all'>('all');

  const filtered = useMemo(() => {
    let list = [...BREED_CATALOG];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.nombre.toLowerCase().includes(q) || b.origen.toLowerCase().includes(q) ||
        b.rasgosEspeciales.some(r => r.toLowerCase().includes(q))
      );
    }
    if (profile !== 'all') {
      list = list.filter(b => {
        if (profile === 'capón') return b.pesoMachoKg >= 3.5 && b.crecimiento !== 'lento';
        if (profile === 'ponedora') return b.huevosAnuales >= 200;
        return b.pesoMachoKg >= 2.5 && b.huevosAnuales >= 150;
      });
    }
    return list;
  }, [search, profile]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/genetics" style={{ color: 'var(--neutral-400)', textDecoration: 'none', fontSize: 12 }}>← Programa</Link>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--neutral-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={20} style={{ color: 'var(--primary)' }} /> Catálogo de Razas Heritage
        </h1>
        <span style={{ fontSize: 11, color: 'var(--neutral-400)' }}>{BREED_CATALOG.length} razas</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-500)' }} />
          <input className="nf-input" placeholder="Buscar raza…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 30, width: '100%', height: 34 }} />
        </div>
        {(['all', 'capón', 'ponedora', 'doble_propósito'] as const).map(p => (
          <button key={p} onClick={() => setProfile(p)}
            className={`nf-btn nf-btn-sm${profile === p ? '' : ' nf-btn-ghost'}`}
            style={{ fontSize: 11, height: 34 }}>
            {p === 'all' ? 'Todas' : p === 'capón' ? '🍗 Capón' : p === 'ponedora' ? '🥚 Ponedora' : '🔄 Doble propósito'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {filtered.map(b => <BreedCard key={b.nombre} breed={b} />)}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--neutral-500)', fontSize: 13 }}>
          No se encontraron razas con esos filtros
        </div>
      )}
    </div>
  );
}
