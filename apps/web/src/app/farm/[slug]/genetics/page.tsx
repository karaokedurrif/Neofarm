'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Dna, Bird, Heart, Shield, Target,
  TrendingUp, AlertTriangle, ChevronRight,
  Users, Layers, ClipboardList, BookOpen,
  LayoutGrid, Sparkles, Download, Plus
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { loadProgram, saveProgram, programStats, setActiveFarm, createEmptyProgram } from '@/lib/genetics/store';
import type { SelectionProgram, SelectionAlert, Bird as BirdType } from '@/lib/genetics/types';
import { rankBirds } from '@/lib/genetics/services/scoring.service';
import { estimateOffspringCOI } from '@/lib/genetics/services/inbreeding.service';

/* ── Map API Ave → Genetics Bird ── */
function apiAveToBird(ave: any): BirdType {
  return {
    id: `api-${ave.id}`,
    anilla: ave.anilla || `AVE-${ave.id}`,
    nombre: ave.anilla || '',
    sexo: ave.sexo === 'H' ? 'F' : ave.sexo === 'M' ? 'M' : 'unknown',
    raza: ave.raza || 'Desconocida',
    linea: 'A',
    generacion: 'F0',
    padreId: null,
    madreId: null,
    origen: 'fundador',
    fechaNacimiento: ave.fecha_nac || new Date().toISOString().slice(0, 10),
    colorPlumaje: ave.color || '',
    pesoActual: ave.peso || 0,
    autoSexing: false,
    cincoDedos: false,
    patasEmplumadas: false,
    conformacionPecho: 3,
    conformacionMuslo: 3,
    docilidad: 3,
    lote: '',
    instalacion: ave.gallinero?.toString() || '',
    estadoProductivo: 'activo',
    estadoSeleccion: 'pendiente',
    estadoComercial: 'no_asignado',
    destinoRecomendado: 'reproductor',
    notas: ave.notas || '',
    fotos: ave.foto ? [ave.foto] : [],
  };
}

function QuickNav({ href, Icon, label, desc, badge }: { href: string; Icon: any; label: string; desc: string; badge?: string }) {
  return (
    <Link href={href} className="nf-card" style={{ textDecoration: 'none', display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px', transition: 'all 0.15s', cursor: 'pointer' }}>
      <div style={{ background: 'rgba(var(--primary-rgb,180,130,50),0.1)', borderRadius: 8, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} style={{ color: 'var(--primary)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-900)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--neutral-400)', marginTop: 1 }}>{desc}</div>
      </div>
      {badge && <span className="nf-tag" style={{ fontSize: 10 }}>{badge}</span>}
      <ChevronRight size={14} style={{ color: 'var(--neutral-500)', flexShrink: 0 }} />
    </Link>
  );
}

export default function TenantGeneticsPage() {
  const { slug, farm } = useTenant();
  const base = `/farm/${slug}/genetics`;
  const [prog, setProg] = useState<SelectionProgram | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  // Set active farm SYNCHRONOUSLY during render so all child effects/calls use correct key
  setActiveFarm(slug);

  useEffect(() => {
    setProg(loadProgram());
    setLoaded(true);
  }, [slug]);

  const stats = useMemo(() => prog ? programStats(prog) : null, [prog]);
  const hasBirds = (prog?.birds.length ?? 0) > 0;

  /* ── Import aves from API census ── */
  const importFromCensus = useCallback(async () => {
    setImporting(true);
    setImportMsg('');
    try {
      const res = await fetch(`/api/ovosfera/farms/${encodeURIComponent(slug)}/aves`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const aves: any[] = await res.json();
      if (aves.length === 0) { setImportMsg('No hay aves en el censo. Añade aves primero desde el módulo Aves.'); return; }

      let p = loadProgram();
      if (farm) {
        p.nombre = `Programa Genético — ${farm.name}`;
        p.ubicacion = farm.name;
      }
      const existingAnillas = new Set(p.birds.map(b => b.anilla));
      let added = 0;
      for (const ave of aves) {
        const bird = apiAveToBird(ave);
        if (!existingAnillas.has(bird.anilla)) {
          p.birds.push(bird);
          existingAnillas.add(bird.anilla);
          added++;
        }
      }
      saveProgram(p);
      setProg({ ...p });
      setImportMsg(`Importadas ${added} aves (${aves.length - added} ya existían).`);
    } catch (e: any) {
      setImportMsg(`Error: ${e.message}`);
    } finally {
      setImporting(false);
    }
  }, [slug, farm]);

  const alerts = useMemo<SelectionAlert[]>(() => {
    if (!prog || !hasBirds) return [];
    const a: SelectionAlert[] = [];
    const f2Pending = prog.birds.filter(b => b.generacion === 'F2' && b.estadoSeleccion === 'pendiente');
    if (f2Pending.length > 10) {
      a.push({ id: 'a1', tipo: 'evaluacion_pendiente', severidad: 'warning', titulo: 'Evaluaciones pendientes',
        descripcion: `${f2Pending.length} aves F2 pendientes de evaluación`, fecha: new Date().toISOString().slice(0, 10) });
    }
    const activePairs = prog.breedingPairs.filter(bp => bp.activo);
    for (const bp of activePairs) {
      const coi = estimateOffspringCOI(bp.machoId, bp.hembraId, prog.birds);
      if (coi > 0.0625) {
        a.push({ id: `a-coi-${bp.id}`, tipo: 'consanguinidad_alta', severidad: 'danger', titulo: 'COI elevado',
          descripcion: `Pareja ${bp.machoId} × ${bp.hembraId} tiene COI ${(coi * 100).toFixed(1)}%`, fecha: new Date().toISOString().slice(0, 10) });
      }
    }
    return a;
  }, [prog, hasBirds]);

  const topBirds = useMemo(() => {
    if (!prog || !hasBirds) return [];
    const active = prog.birds.filter(b => b.estadoSeleccion !== 'descartado');
    return rankBirds(active, prog.birds, prog.measurements, prog.evaluations, prog.selectionWeights).slice(0, 5);
  }, [prog, hasBirds]);

  if (!loaded) return <div className="nf-content"><p style={{ color: 'var(--neutral-500)' }}>Cargando genética…</p></div>;

  /* ── Empty state: no birds yet ── */
  if (!hasBirds) {
    return (
      <div className="nf-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), #8B5CF6)', borderRadius: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Dna size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--neutral-900)' }}>Centro de Genética</h1>
            <p style={{ fontSize: 12, color: 'var(--neutral-400)', margin: 0 }}>{farm?.name || slug} — Programa vacío, listo para empezar</p>
          </div>
        </div>

        <div className="nf-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Bird size={48} style={{ color: 'var(--neutral-300)', marginBottom: 12 }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-700)', margin: '0 0 6px' }}>Sin aves en el programa genético</p>
          <p style={{ fontSize: 13, color: 'var(--neutral-400)', maxWidth: 440, margin: '0 auto 20px' }}>
            Importa las aves del censo de tu explotación como fundadoras (F0), o añade aves manualmente desde el registro.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={importFromCensus} disabled={importing}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, border: 'none',
                background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: importing ? 'wait' : 'pointer', opacity: importing ? 0.7 : 1 }}>
              <Download size={15} />
              {importing ? 'Importando…' : 'Importar del Censo'}
            </button>
            <Link href={`${base}/quick-entry`}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, border: '1px solid var(--neutral-200)',
                background: 'var(--neutral-25)', color: 'var(--neutral-700)', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
              <Plus size={15} />
              Entrada Manual
            </Link>
          </div>
          {importMsg && (
            <p style={{ fontSize: 12, color: importMsg.startsWith('Error') ? '#DC2626' : '#16A34A', marginTop: 12 }}>{importMsg}</p>
          )}
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-800)' }}>
            <LayoutGrid size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Módulos disponibles
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            <QuickNav href={`${base}/birds`} Icon={Bird} label="Registro de Aves" desc="Censo, fichas, filtros avanzados" />
            <QuickNav href={`${base}/mate-canvas`} Icon={Heart} label="Mate Canvas" desc="Planificar cruces con drag & drop" />
            <QuickNav href={`${base}/generations`} Icon={Layers} label="Generaciones" desc="Dashboard F0→F5, progreso por gen" />
            <QuickNav href={`${base}/inbreeding`} Icon={Shield} label="Observatorio COI" desc="Consanguinidad, mapa de calor" />
            <QuickNav href={`${base}/quick-entry`} Icon={ClipboardList} label="Entrada Rápida" desc="Pesajes, evaluaciones, eventos" />
            <QuickNav href={`${base}/catalog`} Icon={BookOpen} label="Catálogo" desc="Razas heritage, parámetros zootécnicos" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Full dashboard with birds ── */
  return (
    <div className="nf-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), #8B5CF6)', borderRadius: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Dna size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--neutral-900)' }}>{prog!.nombre}</h1>
          <div style={{ fontSize: 12, color: 'var(--neutral-400)' }}>{prog!.descripcion}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={importFromCensus} disabled={importing}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--neutral-200)',
              background: 'var(--neutral-25)', color: 'var(--neutral-700)', fontSize: 11, fontWeight: 600, cursor: importing ? 'wait' : 'pointer' }}>
            <Download size={12} />{importing ? 'Importando…' : 'Sincronizar Censo'}
          </button>
        </div>
      </div>
      {importMsg && <p style={{ fontSize: 12, color: importMsg.startsWith('Error') ? '#DC2626' : '#16A34A', margin: '-8px 0 0' }}>{importMsg}</p>}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Aves Activas', value: stats!.activeBirds, icon: Bird, color: 'var(--primary)' },
          { label: 'Machos / Hembras', value: `${stats!.males} / ${stats!.females}`, icon: Users, color: '#3B82F6' },
          { label: 'Parejas Activas', value: stats!.breedingPairsActive, icon: Heart, color: '#EC4899' },
          { label: 'Razas Base', value: stats!.breeds, icon: Layers, color: '#8B5CF6' },
          { label: 'Evaluaciones', value: stats!.evaluations, icon: Target, color: '#16A34A' },
        ].map(kpi => (
          <div key={kpi.label} className="nf-kbox">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <kpi.icon size={14} style={{ color: kpi.color }} />
              <span style={{ fontSize: 11, color: 'var(--neutral-400)' }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--neutral-900)' }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Alerts + Top birds */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="nf-card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-800)' }}>
            <AlertTriangle size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Alertas
          </div>
          {alerts.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--neutral-500)', padding: 12, textAlign: 'center' }}>Sin alertas activas ✓</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {alerts.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '6px 8px', borderRadius: 6, background: 'rgba(var(--primary-rgb,180,130,50),0.03)' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: a.severidad === 'danger' ? '#DC2626' : a.severidad === 'warning' ? '#F59E0B' : '#3B82F6', marginRight: 4, marginTop: 4, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--neutral-700)', lineHeight: 1.4 }}>{a.descripcion}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="nf-card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-800)' }}>
            <Sparkles size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Top Aves
          </div>
          {topBirds.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--neutral-500)', padding: 12, textAlign: 'center' }}>Sin aves evaluadas aún</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {topBirds.map((r, i) => (
                <Link key={r.id} href={`${base}/birds`}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 6, textDecoration: 'none', fontSize: 12 }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i === 0 ? 'var(--primary)' : 'var(--neutral-200)', color: i === 0 ? '#fff' : 'var(--neutral-700)', fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                  <span style={{ color: 'var(--neutral-800)', fontWeight: 500 }}>{r.anilla}</span>
                  <span style={{ color: 'var(--neutral-400)' }}>{r.sexo === 'M' ? '♂' : '♀'} {r.pesoActual ? `${r.pesoActual}kg` : ''}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, color: r.score >= 70 ? '#16A34A' : r.score >= 50 ? '#F59E0B' : '#DC2626' }}>{r.score.toFixed(0)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--neutral-800)' }}>
          <LayoutGrid size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Módulos del Programa
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          <QuickNav href={`${base}/birds`} Icon={Bird} label="Registro de Aves" desc="Censo, fichas, filtros avanzados" badge={`${stats!.totalBirds}`} />
          <QuickNav href={`${base}/mate-canvas`} Icon={Heart} label="Mate Canvas" desc="Planificar cruces con drag & drop" badge={`${stats!.breedingPairsActive} activos`} />
          <QuickNav href={`${base}/generations`} Icon={Layers} label="Generaciones" desc="Dashboard F0→F5, progreso por gen" />
          <QuickNav href={`${base}/inbreeding`} Icon={Shield} label="Observatorio COI" desc="Consanguinidad, mapa de calor" />
          <QuickNav href={`${base}/quick-entry`} Icon={ClipboardList} label="Entrada Rápida" desc="Pesajes, evaluaciones, eventos" />
          <QuickNav href={`${base}/catalog`} Icon={BookOpen} label="Catálogo" desc="Razas heritage, parámetros zootécnicos" />
          <QuickNav href={`${base}/recommender`} Icon={Sparkles} label="Cruces IA" desc="Recomendador inteligente con Claude" />
        </div>
      </div>
    </div>
  );
}
