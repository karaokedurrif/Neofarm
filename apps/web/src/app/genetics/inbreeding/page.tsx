'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Shield, AlertTriangle, Bird, ChevronRight, Dna, Heart } from 'lucide-react';
import { loadProgram, getActiveFarm } from '@/lib/genetics/store';
import type { SelectionProgram, Bird as BirdType } from '@/lib/genetics/types';
import { calculateCOI, estimateOffspringCOI, classifyInbreedingRisk, coiColor, coiLabel, explainRisk } from '@/lib/genetics/services/inbreeding.service';
import { calculateBreedContribution, findCommonAncestors } from '@/lib/genetics/services/pedigree.service';

/* ── Heatmap cell ── */
function HeatCell({ val, label }: { val: number; label: string }) {
  const bg = val === -1 ? 'transparent' :
    val < 0.03125 ? '#16A34A22' :
    val < 0.0625  ? '#F59E0B22' :
    val < 0.125   ? '#F9731622' : '#DC262622';
  const fg = val === -1 ? 'transparent' :
    val < 0.03125 ? '#16A34A' :
    val < 0.0625  ? '#F59E0B' :
    val < 0.125   ? '#F97316' : '#DC2626';
  return (
    <div title={label} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: bg, borderRadius: 4, fontSize: 8, fontWeight: 700, color: fg, cursor: val >= 0 ? 'pointer' : 'default' }}>
      {val >= 0 ? `${(val * 100).toFixed(1)}` : ''}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
 *  MAIN — Inbreeding Observatory
 * ══════════════════════════════════════════════════════════════════ */

export default function InbreedingPage() {
  const [prog, setProg] = useState<SelectionProgram | null>(null);
  const [selectedPair, setSelectedPair] = useState<{ m: string; f: string } | null>(null);

  useEffect(() => { setProg(loadProgram()); }, []);

  const geneticsBase = getActiveFarm() ? `/farm/${getActiveFarm()}/genetics` : '/genetics';
  const males = useMemo(() =>
    prog?.birds.filter(b => b.sexo === 'M' && b.estadoProductivo === 'activo').sort((a, b) => a.anilla.localeCompare(b.anilla)) || [],
    [prog]
  );
  const females = useMemo(() =>
    prog?.birds.filter(b => b.sexo === 'F' && b.estadoProductivo === 'activo').sort((a, b) => a.anilla.localeCompare(b.anilla)) || [],
    [prog]
  );

  /* COI heatmap matrix */
  const matrix = useMemo(() => {
    if (!prog) return [];
    return males.map(m => females.map(f => estimateOffspringCOI(m.id, f.id, prog.birds)));
  }, [prog, males, females]);

  /* Selected pair detail */
  const pairDetail = useMemo(() => {
    if (!selectedPair || !prog) return null;
    const coi = estimateOffspringCOI(selectedPair.m, selectedPair.f, prog.birds);
    const risk = classifyInbreedingRisk(coi);
    const commonAnc = findCommonAncestors(selectedPair.m, selectedPair.f, prog.birds);
    const macho = prog.birds.find(b => b.id === selectedPair.m);
    const hembra = prog.birds.find(b => b.id === selectedPair.f);
    const explain = macho && hembra ? explainRisk(macho, hembra, coi, commonAnc) : '';
    return { coi, risk, explain, commonAnc, macho, hembra };
  }, [selectedPair, prog]);

  /* Per-bird COI summary — include all active birds (F0 founders show 0% = clean genetics) */
  const birdCOIs = useMemo(() => {
    if (!prog) return [];
    return prog.birds
      .filter(b => b.estadoProductivo === 'activo')
      .map(b => ({
        bird: b,
        coi: calculateCOI(b.id, prog.birds),
      }))
      .sort((a, b) => b.coi - a.coi);
  }, [prog]);

  if (!prog) return <div style={{ padding: 32, color: 'var(--neutral-400)' }}>Cargando…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 4 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href={geneticsBase} style={{ color: 'var(--neutral-400)', textDecoration: 'none', fontSize: 12 }}>← Programa</Link>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--neutral-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={20} style={{ color: '#F59E0B' }} /> Observatorio de Consanguinidad
        </h1>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--neutral-400)', flexWrap: 'wrap' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#16A34A22', border: '1px solid #16A34A', marginRight: 4 }} /> Seguro (&lt;3.13%)</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#F59E0B22', border: '1px solid #F59E0B', marginRight: 4 }} /> Monitor (3.13-6.25%)</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#F9731622', border: '1px solid #F97316', marginRight: 4 }} /> Precaución (6.25-12.5%)</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#DC262622', border: '1px solid #DC2626', marginRight: 4 }} /> Peligro (&ge;12.5%)</span>
      </div>

      {/* Heatmap */}
      <div className="nf-card" style={{ overflowX: 'auto' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-800)' }}>
          <Heart size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          Mapa de Calor — COI Previsto (♂ × ♀)
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {/* Y labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 38, marginRight: 4 }}>
            {males.map(m => (
              <div key={m.id} style={{ height: 36, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: 9, color: '#3B82F6', fontWeight: 500, paddingRight: 4, whiteSpace: 'nowrap' }}>
                ♂ {m.nombre || m.anilla}
              </div>
            ))}
          </div>
          <div>
            {/* X labels */}
            <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
              {females.map(f => (
                <div key={f.id} style={{ width: 36, fontSize: 8, color: '#EC4899', fontWeight: 500, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  title={f.nombre || f.anilla}>
                  ♀ {(f.nombre || f.anilla).slice(0, 4)}
                </div>
              ))}
            </div>
            {/* Matrix */}
            {matrix.map((row, mi) => (
              <div key={males[mi].id} style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                {row.map((val, fi) => (
                  <div key={females[fi].id} onClick={() => setSelectedPair({ m: males[mi].id, f: females[fi].id })}>
                    <HeatCell val={val} label={`${males[mi].anilla} × ${females[fi].anilla}: ${(val * 100).toFixed(2)}%`} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected pair detail */}
      {pairDetail && (
        <div className="nf-card" style={{ borderLeft: `4px solid ${coiColor(pairDetail.coi)}` }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-800)' }}>
            <Dna size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            {pairDetail.macho?.nombre || pairDetail.macho?.anilla} × {pairDetail.hembra?.nombre || pairDetail.hembra?.anilla}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 10 }}>
            <div className="nf-kbox">
              <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>COI Previsto</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: coiColor(pairDetail.coi) }}>
                {(pairDetail.coi * 100).toFixed(2)}%
              </div>
            </div>
            <div className="nf-kbox">
              <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>Riesgo</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: coiColor(pairDetail.coi) }}>
                {pairDetail.risk.toUpperCase()}
              </div>
            </div>
            <div className="nf-kbox">
              <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>Ancestros Comunes</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--neutral-900)' }}>
                {pairDetail.commonAnc.length}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--neutral-700)', lineHeight: 1.6, padding: '8px 10px', borderRadius: 6, background: 'rgba(var(--primary-rgb,180,130,50),0.03)' }}>
            {pairDetail.explain}
          </div>
          {pairDetail.commonAnc.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--neutral-400)' }}>
              <b>Ancestros comunes:</b>{' '}
              {pairDetail.commonAnc.map(a => {
                return `${a.ancestor.nombre || a.ancestor.anilla} (${(a.contribution * 100).toFixed(1)}%)`;
              }).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Per-bird COI table */}
      <div className="nf-card" style={{ padding: 0, overflow: 'auto' }}>
        <div style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--neutral-800)' }}>
          <Shield size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          COI por Ave (aves con pedigrí)
        </div>
        <table className="nf-table" style={{ width: '100%', fontSize: 11 }}>
          <thead>
            <tr><th>Anilla</th><th>Gen</th><th>COI</th><th>Riesgo</th></tr>
          </thead>
          <tbody>
            {birdCOIs.slice(0, 30).map(r => (
              <tr key={r.bird.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/genetics/birds/${r.bird.id}`}>
                <td style={{ fontWeight: 500, color: 'var(--neutral-800)' }}>{r.bird.anilla}</td>
                <td style={{ color: 'var(--neutral-400)' }}>{r.bird.generacion}</td>
                <td style={{ fontWeight: 700, color: coiColor(r.coi) }}>{(r.coi * 100).toFixed(2)}%</td>
                <td style={{ color: coiColor(r.coi) }}>{coiLabel(r.coi)}</td>
              </tr>
            ))}
            {birdCOIs.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--neutral-500)', padding: 20 }}>
                Todos los F0 son fundadores (COI = 0 por definición)
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
