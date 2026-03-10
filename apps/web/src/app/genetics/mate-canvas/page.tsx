'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart, Bird, Shield, ChevronRight, Plus, X, AlertTriangle,
  Check, Trash2, Dna, Layers, ArrowRight
} from 'lucide-react';
import { loadProgram, saveProgram, addBreedingPair, updateBreedingPair } from '@/lib/genetics/store';
import type { SelectionProgram, Bird as BirdType, BreedingPair } from '@/lib/genetics/types';
import { calculateCOI, classifyInbreedingRisk, coiColor, coiLabel, estimateOffspringCOI } from '@/lib/genetics/services/inbreeding.service';
import { calculateSelectionScore, scoreColor } from '@/lib/genetics/services/scoring.service';

/* ── Bird chip (draggable-looking) ── */
function BirdChip({ bird, score, onClick, selected }: { bird: BirdType; score: number; onClick: () => void; selected?: boolean }) {
  return (
    <div onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
        background: selected ? 'rgba(var(--primary-rgb,180,130,50),0.15)' : 'rgba(var(--primary-rgb,180,130,50),0.03)',
        border: `1px solid ${selected ? 'var(--primary)' : 'var(--neutral-800)'}`,
        transition: 'all 0.15s', userSelect: 'none' }}>
      <span style={{ fontSize: 14, color: bird.sexo === 'M' ? '#3B82F6' : '#EC4899' }}>
        {bird.sexo === 'M' ? '♂' : '♀'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-200)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {bird.nombre || bird.anilla}
        </div>
        <div style={{ fontSize: 9, color: 'var(--neutral-500)' }}>{bird.generacion} · {bird.raza}</div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: scoreColor(score) }}>{score.toFixed(0)}</span>
    </div>
  );
}

/* ── Pair card ── */
function PairCard({ pair, prog, onRemove }: { pair: BreedingPair; prog: SelectionProgram; onRemove: () => void }) {
  const macho = prog.birds.find(b => b.id === pair.machoId);
  const hembra = prog.birds.find(b => b.id === pair.hembraId);
  const coi = estimateOffspringCOI(pair.machoId, pair.hembraId, prog.birds);
  const risk = classifyInbreedingRisk(coi);
  const desc = macho && hembra ? prog.breedingPairs.find(bp => bp.id === pair.id)?.notas : '';

  return (
    <div className="nf-card" style={{ padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Heart size={14} style={{ color: '#EC4899' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-200)', flex: 1 }}>
          {macho?.nombre || macho?.anilla || '?'} × {hembra?.nombre || hembra?.anilla || '?'}
        </span>
        {pair.activo && <span className="nf-tag" style={{ fontSize: 9, background: '#16A34A22', color: '#16A34A' }}>Activa</span>}
        {!pair.activo && <span className="nf-tag" style={{ fontSize: 9 }}>Inactiva</span>}
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-500)', padding: 2 }}>
          <Trash2 size={12} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
        <div style={{ flex: 1, padding: '4px 8px', borderRadius: 6, background: '#3B82F611' }}>
          <span style={{ color: '#3B82F6' }}>♂</span> {macho?.anilla} · {macho?.generacion} · {macho?.pesoActual}kg
        </div>
        <ArrowRight size={14} style={{ color: 'var(--neutral-600)', alignSelf: 'center' }} />
        <div style={{ flex: 1, padding: '4px 8px', borderRadius: 6, background: '#EC489911' }}>
          <span style={{ color: '#EC4899' }}>♀</span> {hembra?.anilla} · {hembra?.generacion} · {hembra?.pesoActual}kg
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10 }}>
        <span>COI hijos: <b style={{ color: coiColor(coi) }}>{(coi * 100).toFixed(2)}%</b></span>
        <span>Riesgo: <b style={{ color: coiColor(coi) }}>{risk}</b></span>
        <span>Objetivo: <b style={{ color: 'var(--neutral-300)' }}>{pair.objetivo || '—'}</b></span>
        <span>Hijos: <b style={{ color: 'var(--neutral-200)' }}>{pair.descendientes?.length || 0}</b></span>
      </div>

      {desc && <div style={{ marginTop: 6, fontSize: 10, color: 'var(--neutral-500)', fontStyle: 'italic' }}>{desc}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
 *  MAIN — Mate Canvas
 * ══════════════════════════════════════════════════════════════════ */

export default function MateCanvasPage() {
  const [prog, setProg] = useState<SelectionProgram | null>(null);
  const [selectedMale, setSelectedMale] = useState<string | null>(null);
  const [selectedFemale, setSelectedFemale] = useState<string | null>(null);
  const [filterGen, setFilterGen] = useState<string>('all');
  const [objective, setObjective] = useState('exploracion');

  useEffect(() => { setProg(loadProgram()); }, []);

  /* Available males & females */
  const males = useMemo(() => {
    if (!prog) return [];
    return prog.birds.filter(b => b.sexo === 'M' && b.estadoProductivo === 'activo')
      .filter(b => filterGen === 'all' || b.generacion === filterGen)
      .map(b => ({ bird: b, score: calculateSelectionScore(b, prog.birds, prog.measurements, prog.evaluations, prog.selectionWeights).total }))
      .sort((a, b) => b.score - a.score);
  }, [prog, filterGen]);

  const females = useMemo(() => {
    if (!prog) return [];
    return prog.birds.filter(b => b.sexo === 'F' && b.estadoProductivo === 'activo')
      .filter(b => filterGen === 'all' || b.generacion === filterGen)
      .map(b => ({ bird: b, score: calculateSelectionScore(b, prog.birds, prog.measurements, prog.evaluations, prog.selectionWeights).total }))
      .sort((a, b) => b.score - a.score);
  }, [prog, filterGen]);

  /* Preview COI */
  const previewCOI = useMemo(() => {
    if (!selectedMale || !selectedFemale || !prog) return null;
    return estimateOffspringCOI(selectedMale, selectedFemale, prog.birds);
  }, [selectedMale, selectedFemale, prog]);

  const handleCreatePair = () => {
    if (!selectedMale || !selectedFemale || !prog) return;
    const newPair: BreedingPair = {
      id: `bp-${Date.now()}`, machoId: selectedMale, hembraId: selectedFemale,
      fechaInicio: new Date().toISOString().slice(0, 10), activo: true,
      objetivo: objective as BreedingPair['objetivo'], descendientes: [],
      notas: `Cruce creado desde Mate Canvas. COI estimado: ${previewCOI !== null ? (previewCOI * 100).toFixed(2) : '?'}%`,
    };
    const updated = addBreedingPair(prog, newPair);
    setProg(updated);
    setSelectedMale(null);
    setSelectedFemale(null);
  };

  const handleRemovePair = (pairId: string) => {
    if (!prog) return;
    const updated = { ...prog, breedingPairs: prog.breedingPairs.filter(bp => bp.id !== pairId) };
    saveProgram(updated);
    setProg(updated);
  };

  const generations = useMemo(() => [...new Set(prog?.birds.map(b => b.generacion) || [])].sort(), [prog]);

  if (!prog) return <div style={{ padding: 32, color: 'var(--neutral-400)' }}>Cargando…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 4 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/genetics" style={{ color: 'var(--neutral-400)', textDecoration: 'none', fontSize: 12 }}>← Programa</Link>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--neutral-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Heart size={20} style={{ color: '#EC4899' }} /> Mate Canvas
        </h1>
      </div>

      <div style={{ fontSize: 12, color: 'var(--neutral-400)' }}>
        Selecciona un macho y una hembra para crear una pareja de cría. El sistema calcula el COI previsto.
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <select className="nf-input" value={filterGen} onChange={e => setFilterGen(e.target.value)} style={{ height: 32, width: 120 }}>
          <option value="all">Todas gens</option>
          {generations.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="nf-input" value={objective} onChange={e => setObjective(e.target.value)} style={{ height: 32, width: 160 }}>
          <option value="mejora_sabor">Mejora sabor</option>
          <option value="mejora_talla">Mejora talla</option>
          <option value="exploracion">Exploración</option>
          <option value="backcross">Backcross</option>
          <option value="fijacion">Fijación rasgos</option>
        </select>
      </div>

      {/* Selection area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16 }}>
        {/* Males */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6', marginBottom: 8 }}>♂ Machos ({males.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 400, overflowY: 'auto' }}>
            {males.map(m => (
              <BirdChip key={m.bird.id} bird={m.bird} score={m.score}
                selected={selectedMale === m.bird.id}
                onClick={() => setSelectedMale(selectedMale === m.bird.id ? null : m.bird.id)} />
            ))}
          </div>
        </div>

        {/* Center: Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minWidth: 160 }}>
          <div className="nf-card" style={{ textAlign: 'center', padding: 16, minWidth: 140 }}>
            <Heart size={24} style={{ color: selectedMale && selectedFemale ? '#EC4899' : 'var(--neutral-700)' }} />
            {selectedMale && selectedFemale ? (
              <>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-200)', marginTop: 8 }}>
                  COI Previsto
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: previewCOI !== null ? coiColor(previewCOI) : 'var(--neutral-500)', marginTop: 4 }}>
                  {previewCOI !== null ? `${(previewCOI * 100).toFixed(2)}%` : '—'}
                </div>
                <div style={{ fontSize: 10, color: previewCOI !== null ? coiColor(previewCOI) : 'var(--neutral-500)', marginTop: 2 }}>
                  {previewCOI !== null ? coiLabel(previewCOI) : ''}
                </div>
                <button className="nf-btn" onClick={handleCreatePair}
                  style={{ marginTop: 12, width: '100%', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Plus size={14} /> Crear Pareja
                </button>
              </>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--neutral-500)', marginTop: 8 }}>
                Selecciona un ♂ y una ♀
              </div>
            )}
          </div>
        </div>

        {/* Females */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#EC4899', marginBottom: 8 }}>♀ Hembras ({females.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 400, overflowY: 'auto' }}>
            {females.map(f => (
              <BirdChip key={f.bird.id} bird={f.bird} score={f.score}
                selected={selectedFemale === f.bird.id}
                onClick={() => setSelectedFemale(selectedFemale === f.bird.id ? null : f.bird.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* Existing pairs */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-200)' }}>
          <Layers size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          Parejas de Cría ({prog.breedingPairs.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {prog.breedingPairs.map(bp => (
            <PairCard key={bp.id} pair={bp} prog={prog} onRemove={() => handleRemovePair(bp.id)} />
          ))}
          {prog.breedingPairs.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--neutral-500)', textAlign: 'center', padding: 20 }}>
              No hay parejas creadas. Selecciona un macho y una hembra arriba.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
