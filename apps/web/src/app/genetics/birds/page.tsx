'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Bird, Search, Filter, ChevronRight, Plus, ArrowUpDown,
  Eye, Dna, X, ChevronDown
} from 'lucide-react';
import { loadProgram, programStats } from '@/lib/genetics/store';
import type { SelectionProgram, Bird as BirdType } from '@/lib/genetics/types';
import { calculateSelectionScore, scoreColor } from '@/lib/genetics/services/scoring.service';

/* ── Generation badge ── */
function GenBadge({ gen }: { gen: string }) {
  const colors: Record<string, string> = { F0: '#16A34A', F1: '#3B82F6', F2: '#8B5CF6', F3: '#EC4899', F4: '#F59E0B', 'F5+': '#DC2626' };
  return (
    <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700,
      background: `${colors[gen] || '#888'}22`, color: colors[gen] || '#888' }}>
      {gen}
    </span>
  );
}

/* ── Sex icon ── */
function SexIcon({ sex }: { sex: string }) {
  return (
    <span style={{ fontSize: 14, color: sex === 'M' ? '#3B82F6' : '#EC4899' }}>
      {sex === 'M' ? '♂' : '♀'}
    </span>
  );
}

/* ── Status dot ── */
function StatusDot({ status }: { status: string }) {
  const c: Record<string, string> = { activo: '#16A34A', sacrificado: '#DC2626', vendido: '#F59E0B', retirado: '#888', pendiente: '#8B5CF6' };
  return <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: c[status] || '#888' }} />;
}

/* ══════════════════════════════════════════════════════════════════
 *  MAIN — Bird Registry
 * ══════════════════════════════════════════════════════════════════ */

export default function BirdRegistryPage() {
  const [prog, setProg] = useState<SelectionProgram | null>(null);
  const [search, setSearch] = useState('');
  const [filterGen, setFilterGen] = useState<string>('all');
  const [filterSex, setFilterSex] = useState<string>('all');
  const [filterLine, setFilterLine] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<'anilla' | 'peso' | 'gen' | 'score'>('anilla');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => { setProg(loadProgram()); }, []);

  /* Compute scores for all birds */
  const scoredBirds = useMemo(() => {
    if (!prog) return [];
    return prog.birds.map(b => ({
      bird: b,
      score: calculateSelectionScore(b, prog.birds, prog.measurements, prog.evaluations, prog.selectionWeights).total,
    }));
  }, [prog]);

  /* Filter + Sort */
  const filtered = useMemo(() => {
    let list = scoredBirds;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => r.bird.anilla.toLowerCase().includes(q) || (r.bird.nombre || '').toLowerCase().includes(q) || r.bird.raza.toLowerCase().includes(q));
    }
    if (filterGen !== 'all') list = list.filter(r => r.bird.generacion === filterGen);
    if (filterSex !== 'all') list = list.filter(r => r.bird.sexo === filterSex);
    if (filterLine !== 'all') list = list.filter(r => r.bird.linea === filterLine);
    if (filterStatus !== 'all') list = list.filter(r => r.bird.estadoProductivo === filterStatus);

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'anilla': cmp = a.bird.anilla.localeCompare(b.bird.anilla); break;
        case 'peso': cmp = (a.bird.pesoActual || 0) - (b.bird.pesoActual || 0); break;
        case 'gen': cmp = a.bird.generacion.localeCompare(b.bird.generacion); break;
        case 'score': cmp = a.score - b.score; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [scoredBirds, search, filterGen, filterSex, filterLine, filterStatus, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  /* Unique values for filters */
  const generations = useMemo(() => [...new Set(prog?.birds.map(b => b.generacion) || [])].sort(), [prog]);
  const lines = useMemo(() => [...new Set(prog?.birds.map(b => b.linea) || [])].sort(), [prog]);
  const activeFilters = [filterGen, filterSex, filterLine, filterStatus].filter(f => f !== 'all').length;

  if (!prog) return <div style={{ padding: 32, color: 'var(--neutral-400)' }}>Cargando…</div>;

  const stats = programStats(prog);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 4 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/genetics" style={{ color: 'var(--neutral-400)', textDecoration: 'none', fontSize: 12 }}>
          ← Programa
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--neutral-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bird size={20} style={{ color: 'var(--primary)' }} />
            Registro de Aves
          </h1>
          <div style={{ fontSize: 12, color: 'var(--neutral-400)' }}>
            {stats.totalBirds} aves · {stats.activeBirds} activas · {stats.males} ♂ · {stats.females} ♀
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', padding: '10px 14px', borderRadius: 10, background: 'var(--neutral-50)', border: '1px solid var(--neutral-100)' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-500)' }} />
          <input className="nf-input" placeholder="Buscar anilla, nombre, raza…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 30, width: '100%', height: 34 }} />
          {search && <X size={12} onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--neutral-400)' }} />}
        </div>

        <select className="nf-input" value={filterGen} onChange={e => setFilterGen(e.target.value)} style={{ height: 34, width: 90 }}>
          <option value="all">Gen: All</option>
          {generations.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select className="nf-input" value={filterSex} onChange={e => setFilterSex(e.target.value)} style={{ height: 34, width: 90 }}>
          <option value="all">Sexo: All</option>
          <option value="M">♂ Macho</option>
          <option value="F">♀ Hembra</option>
        </select>

        <select className="nf-input" value={filterLine} onChange={e => setFilterLine(e.target.value)} style={{ height: 34, width: 120 }}>
          <option value="all">Línea: All</option>
          {lines.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        <select className="nf-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ height: 34, width: 110 }}>
          <option value="all">Estado: All</option>
          <option value="activo">Activo</option>
          <option value="sacrificado">Sacrificado</option>
          <option value="vendido">Vendido</option>
          <option value="retirado">Retirado</option>
        </select>

        {activeFilters > 0 && (
          <button className="nf-btn nf-btn-sm" onClick={() => { setFilterGen('all'); setFilterSex('all'); setFilterLine('all'); setFilterStatus('all'); setSearch(''); }}
            style={{ fontSize: 11, height: 34 }}>
            <X size={12} /> Limpiar ({activeFilters})
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--neutral-400)' }}>
          {filtered.length} resultados
        </div>
      </div>

      {/* Table */}
      <div className="nf-card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="nf-table" style={{ width: '100%', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th onClick={() => toggleSort('anilla')} style={{ cursor: 'pointer' }}>
                Anilla <ArrowUpDown size={10} style={{ verticalAlign: -1, opacity: sortField === 'anilla' ? 1 : 0.3 }} />
              </th>
              <th>Nombre</th>
              <th>Sexo</th>
              <th onClick={() => toggleSort('gen')} style={{ cursor: 'pointer' }}>
                Gen <ArrowUpDown size={10} style={{ verticalAlign: -1, opacity: sortField === 'gen' ? 1 : 0.3 }} />
              </th>
              <th>Raza / Cruce</th>
              <th>Línea</th>
              <th onClick={() => toggleSort('peso')} style={{ cursor: 'pointer' }}>
                Peso <ArrowUpDown size={10} style={{ verticalAlign: -1, opacity: sortField === 'peso' ? 1 : 0.3 }} />
              </th>
              <th>Conf.</th>
              <th onClick={() => toggleSort('score')} style={{ cursor: 'pointer' }}>
                Score <ArrowUpDown size={10} style={{ verticalAlign: -1, opacity: sortField === 'score' ? 1 : 0.3 }} />
              </th>
              <th>Estado</th>
              <th style={{ width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map(({ bird: b, score }) => (
              <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/genetics/birds/${b.id}`}>
                <td><StatusDot status={b.estadoProductivo} /></td>
                <td style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--neutral-800)' }}>{b.anilla}</td>
                <td style={{ color: 'var(--neutral-700)' }}>{b.nombre || '—'}</td>
                <td><SexIcon sex={b.sexo} /></td>
                <td><GenBadge gen={b.generacion} /></td>
                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--neutral-400)' }}>{b.raza}</td>
                <td>
                  {b.linea && (
                    <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3,
                      background: b.linea === 'A' ? '#3B82F622' : b.linea === 'B' ? '#8B5CF622' : b.linea === 'Fusionada' ? '#EC489922' : '#16A34A22',
                      color: b.linea === 'A' ? '#3B82F6' : b.linea === 'B' ? '#8B5CF6' : b.linea === 'Fusionada' ? '#EC4899' : '#16A34A' }}>
                      {b.linea}
                    </span>
                  )}
                </td>
                <td style={{ fontWeight: 600, color: 'var(--neutral-800)' }}>{b.pesoActual ? `${b.pesoActual} kg` : '—'}</td>
                <td>
                  {b.conformacionPecho ? (
                    <span title={`Pecho: ${b.conformacionPecho}/5`}>
                      {'★'.repeat(b.conformacionPecho)}{'☆'.repeat(5 - b.conformacionPecho)}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: scoreColor(score) }}>{score.toFixed(0)}</span>
                </td>
                <td style={{ color: 'var(--neutral-400)' }}>
                  {b.estadoProductivo === 'activo' ? '🟢' : b.estadoProductivo === 'sacrificado' ? '🔴' : '🟡'}
                </td>
                <td>
                  <Link href={`/genetics/birds/${b.id}`} onClick={e => e.stopPropagation()}>
                    <Eye size={14} style={{ color: 'var(--primary)' }} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--neutral-500)', fontSize: 13 }}>
            No se encontraron aves con esos filtros
          </div>
        )}
        {filtered.length > 100 && (
          <div style={{ padding: 8, textAlign: 'center', fontSize: 11, color: 'var(--neutral-500)' }}>
            Mostrando 100 de {filtered.length} — Usa filtros para afinar
          </div>
        )}
      </div>
    </div>
  );
}
