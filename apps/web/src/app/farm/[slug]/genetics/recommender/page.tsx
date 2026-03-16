'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Dna, Sparkles, ArrowLeft, Loader2, Bird, Heart, Shield,
  Target, TreePine, Egg, BarChart3, ChevronRight, RefreshCw,
  Home, AlertTriangle, CheckCircle, Calendar, Utensils, MapPin
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { loadProgram, setActiveFarm } from '@/lib/genetics/store';
import { calculateSelectionScore } from '@/lib/genetics/services/scoring.service';
import { calculateCOI, estimateOffspringCOI } from '@/lib/genetics/services/inbreeding.service';
import { BREED_CATALOG } from '@/lib/genetics/breeds';
import type { SelectionProgram, Bird as BirdType } from '@/lib/genetics/types';

/* ── Types ── */
interface GallineroRecomendado {
  id: string;
  nombre: string;
  objetivo: string;
  gallo: { anilla: string; raza: string; justificacion: string };
  gallinas: { anilla: string; raza: string; justificacion: string }[];
  ratio: string;
  rasgos_prioritarios: string[];
  f1_esperado: string;
  riesgos: string[];
}

interface GalloSinAsignar {
  anilla: string;
  rol: string;
  motivo: string;
}

interface PlanCria {
  resumen_ejecutivo: string;
  num_gallineros_cria: number;
  gallineros: GallineroRecomendado[];
  gallos_sin_asignar: GalloSinAsignar[];
  plan_consanguinidad: {
    coi_medio_actual: number;
    estrategia: string;
    rotaciones_previstas: string;
  };
  roadmap: { generacion: string; cruces: string; seleccion: string; objetivo: string }[];
  nutricion_reproductores: string;
  calendario: { mejor_epoca_incubacion: string; duracion_ciclo: string; notas: string };
  raw_response?: string;
  parse_error?: boolean;
  error?: string;
}

/* ── Color helpers ── */
function scoreColor(s: number) {
  if (s >= 60) return '#16A34A';
  if (s >= 45) return '#D97706';
  return '#DC2626';
}

export default function RecommenderPage() {
  const { slug, farm } = useTenant();
  const base = `/farm/${slug}/genetics`;

  const [prog, setProg] = useState<SelectionProgram | null>(null);
  const [plan, setPlan] = useState<PlanCria | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  setActiveFarm(slug);

  useEffect(() => {
    setProg(loadProgram());
    setLoaded(true);
  }, [slug]);

  // Enrich birds with scores + COI
  const enrichedBirds = useMemo(() => {
    if (!prog) return [];
    return prog.birds
      .filter(b => b.estadoProductivo === 'activo')
      .map(b => ({
        ...b,
        selectionScore: calculateSelectionScore(b, prog.birds, prog.measurements, prog.evaluations, prog.selectionWeights).total,
        coi: calculateCOI(b.id, prog.birds),
      }));
  }, [prog]);

  const machos = useMemo(() => enrichedBirds.filter(b => b.sexo === 'M'), [enrichedBirds]);
  const hembras = useMemo(() => enrichedBirds.filter(b => b.sexo === 'F'), [enrichedBirds]);
  const razas = useMemo(() => [...new Set(enrichedBirds.map(b => b.raza))], [enrichedBirds]);

  const runRecommendation = useCallback(async () => {
    if (!prog) return;
    setLoading(true);
    setError(null);
    setPlan(null);

    try {
      const catalogSummary = BREED_CATALOG.map(b => ({
        nombre: b.nombre,
        origen: b.origen,
        peso_macho: b.pesoMachoKg,
        peso_hembra: b.pesoHembraKg,
        huevos: b.huevosAnuales,
        canal: b.rendimientoCanal,
        crecimiento: b.crecimiento,
        rusticidad: b.rusticidad,
        docilidad: b.docilidad,
        rasgos: b.rasgosEspeciales,
      }));

      const res = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birds: enrichedBirds,
          weights: prog.selectionWeights,
          traits: prog.traits,
          breeds_catalog: catalogSummary,
          objectives: {
            objetivo_principal: 'Capón gourmet heritage de carne infiltrada',
            ubicacion: 'Palazuelos de Eresma, Segovia (1000m altitud, continental)',
            num_machos: machos.length,
            num_hembras: hembras.length,
            razas_presentes: razas,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setPlan(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [prog, enrichedBirds, machos, hembras, razas]);

  if (!loaded) {
    return <div className="nf-content"><p style={{ color: 'var(--neutral-500)' }}>Cargando...</p></div>;
  }

  if (enrichedBirds.length === 0) {
    return (
      <div className="nf-content" style={{ padding: 20 }}>
        <Link href={base} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--neutral-500)', textDecoration: 'none', marginBottom: 16 }}>
          <ArrowLeft size={14} /> Volver a Genética
        </Link>
        <div className="nf-card" style={{ textAlign: 'center', padding: 48 }}>
          <Bird size={48} style={{ color: 'var(--neutral-300)', marginBottom: 12 }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-700)' }}>Sin aves en el programa</p>
          <p style={{ fontSize: 13, color: 'var(--neutral-400)' }}>Importa aves del censo desde la página de Genética para usar el recomendador IA.</p>
        </div>
      </div>
    );
  }

  // Find a bird by anilla across our enriched birds
  const findBird = (anilla: string) => enrichedBirds.find(b => b.anilla === anilla);

  return (
    <div className="nf-content" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <Link href={base} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--neutral-500)', textDecoration: 'none', marginBottom: 8 }}>
          <ArrowLeft size={14} /> Volver a Genética
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', borderRadius: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--neutral-900)' }}>
              Recomendador IA de Cruces
            </h1>
            <p style={{ fontSize: 12, color: 'var(--neutral-400)', margin: 0 }}>
              Claude analiza tu cabaña y recomienda gallineros de cría optimizados
            </p>
          </div>
          <button
            onClick={runRecommendation}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, border: 'none',
              background: loading ? 'var(--neutral-200)' : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: loading ? 'wait' : 'pointer',
              boxShadow: loading ? 'none' : '0 2px 8px rgba(139,92,246,0.3)',
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? 'Claude analizando...' : plan ? 'Regenerar Plan' : 'Generar Plan de Cría'}
          </button>
        </div>
      </div>

      {/* Census overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
        {[
          { icon: Bird, label: 'Aves Activas', value: enrichedBirds.length, color: 'var(--primary)' },
          { icon: Target, label: 'Gallos', value: machos.length, color: '#3B82F6' },
          { icon: Heart, label: 'Gallinas', value: hembras.length, color: '#EC4899' },
          { icon: Dna, label: 'Razas', value: razas.length, color: '#8B5CF6' },
          { icon: BarChart3, label: 'Score Medio', value: (enrichedBirds.reduce((s, b) => s + (b.selectionScore || 0), 0) / enrichedBirds.length).toFixed(1), color: '#16A34A' },
        ].map(k => (
          <div key={k.label} className="nf-kbox">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <k.icon size={14} style={{ color: k.color }} />
              <span style={{ fontSize: 11, color: 'var(--neutral-400)' }}>{k.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--neutral-900)' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Roosters + Hens summary table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="nf-card">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Target size={14} /> Gallos ({machos.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
            {machos.sort((a, b) => (b.selectionScore || 0) - (a.selectionScore || 0)).map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: 'var(--neutral-800)', minWidth: 100 }}>{m.anilla}</span>
                <span style={{ color: 'var(--neutral-500)', fontSize: 11, flex: 1 }}>{m.raza}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--neutral-500)' }}>{m.pesoActual}kg</span>
                <span style={{ fontWeight: 700, color: scoreColor(m.selectionScore || 0), minWidth: 28, textAlign: 'right' }}>
                  {(m.selectionScore || 0).toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="nf-card">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#EC4899', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Heart size={14} /> Gallinas ({hembras.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
            {hembras.sort((a, b) => (b.selectionScore || 0) - (a.selectionScore || 0)).map(h => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: 'var(--neutral-800)', minWidth: 100 }}>{h.anilla}</span>
                <span style={{ color: 'var(--neutral-500)', fontSize: 11, flex: 1 }}>{h.raza}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--neutral-500)' }}>{h.pesoActual}kg</span>
                <span style={{ fontWeight: 700, color: scoreColor(h.selectionScore || 0), minWidth: 28, textAlign: 'right' }}>
                  {(h.selectionScore || 0).toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="nf-card" style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} style={{ color: '#DC2626' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#DC2626' }}>Error: {error}</span>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="nf-card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <Loader2 size={24} style={{ color: '#8B5CF6', animation: 'spin 1s linear infinite' }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--neutral-800)' }}>Claude analizando {enrichedBirds.length} aves...</div>
              <div style={{ fontSize: 12, color: 'var(--neutral-400)', marginTop: 4 }}>
                Evaluando métricas genéticas, consanguinidad y complementariedad de rasgos
              </div>
            </div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ═══════ RESULTS ═══════ */}
      {plan && !plan.parse_error && !plan.error && (
        <>
          {/* Executive summary */}
          <div className="nf-card" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(236,72,153,0.05))', border: '1px solid rgba(139,92,246,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Sparkles size={16} style={{ color: '#8B5CF6' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#8B5CF6' }}>Plan de Cría IA</span>
              <span className="nf-tag" style={{ background: '#8B5CF6', color: '#fff', fontSize: 10 }}>
                {plan.num_gallineros_cria} gallineros
              </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--neutral-700)', margin: 0 }}>
              {plan.resumen_ejecutivo}
            </p>
          </div>

          {/* Breeding pens */}
          {plan.gallineros?.map((g, i) => {
            const galloData = findBird(g.gallo?.anilla);
            return (
              <div key={g.id || i} className="nf-card" style={{ border: '1px solid var(--neutral-100)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: ['#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'][i % 6],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 14, fontWeight: 800,
                  }}>
                    {g.id || `L${i + 1}`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--neutral-900)' }}>{g.nombre}</div>
                    <div style={{ fontSize: 11, color: 'var(--neutral-400)' }}>{g.objetivo}</div>
                  </div>
                  <span className="nf-tag" style={{ fontSize: 11, fontWeight: 700 }}>Ratio {g.ratio}</span>
                </div>

                {/* Rooster */}
                <div style={{ background: 'rgba(59,130,246,0.04)', borderRadius: 10, padding: 12, marginBottom: 10, border: '1px solid rgba(59,130,246,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>🐓</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>GALLO: {g.gallo?.anilla}</span>
                    <span style={{ fontSize: 11, color: 'var(--neutral-500)' }}>— {g.gallo?.raza}</span>
                    {galloData && (
                      <span style={{ fontWeight: 700, fontSize: 12, color: scoreColor(galloData.selectionScore || 0), marginLeft: 'auto' }}>
                        Score {(galloData.selectionScore || 0).toFixed(0)} · {galloData.pesoActual}kg
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--neutral-600)', lineHeight: 1.5 }}>{g.gallo?.justificacion}</div>
                </div>

                {/* Hens */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {g.gallinas?.map((h, j) => {
                    const henData = findBird(h.anilla);
                    const coiWithRooster = galloData && henData
                      ? estimateOffspringCOI(galloData.id, henData.id, prog?.birds || [])
                      : 0;
                    return (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, background: 'rgba(236,72,153,0.03)', border: '1px solid rgba(236,72,153,0.08)' }}>
                        <span style={{ fontSize: 14 }}>🐔</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#DB2777', minWidth: 90 }}>{h.anilla}</span>
                        <span style={{ fontSize: 11, color: 'var(--neutral-500)', flex: 1 }}>{h.raza}</span>
                        {henData && (
                          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--neutral-500)' }}>
                            {henData.pesoActual}kg
                          </span>
                        )}
                        {henData && (
                          <span style={{ fontWeight: 700, fontSize: 11, color: scoreColor(henData.selectionScore || 0) }}>
                            {(henData.selectionScore || 0).toFixed(0)}
                          </span>
                        )}
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                          background: coiWithRooster < 0.03 ? '#DCFCE7' : coiWithRooster < 0.06 ? '#FEF3C7' : '#FEE2E2',
                          color: coiWithRooster < 0.03 ? '#16A34A' : coiWithRooster < 0.06 ? '#D97706' : '#DC2626',
                        }}>
                          COI {(coiWithRooster * 100).toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Priority traits */}
                {g.rasgos_prioritarios?.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {g.rasgos_prioritarios.map(r => (
                      <span key={r} className="nf-tag" style={{ fontSize: 10, background: 'rgba(139,92,246,0.1)', color: '#7C3AED' }}>{r}</span>
                    ))}
                  </div>
                )}

                {/* F1 expected + risks */}
                {g.f1_esperado && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--neutral-600)', lineHeight: 1.5 }}>
                    <strong style={{ color: '#16A34A' }}>F1 esperada:</strong> {g.f1_esperado}
                  </div>
                )}
                {g.riesgos?.length > 0 && (
                  <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {g.riesgos.map((r, k) => (
                      <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#D97706' }}>
                        <AlertTriangle size={11} /> {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Unassigned roosters */}
          {plan.gallos_sin_asignar?.length > 0 && (
            <div className="nf-card">
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--neutral-800)' }}>
                🐓 Gallos sin asignar
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {plan.gallos_sin_asignar.map((g, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, background: 'var(--neutral-25)', fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: 'var(--neutral-800)', minWidth: 100 }}>{g.anilla}</span>
                    <span className="nf-tag" style={{ fontSize: 10 }}>{g.rol}</span>
                    <span style={{ flex: 1, color: 'var(--neutral-500)', fontSize: 11 }}>{g.motivo}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consanguinity plan */}
          {plan.plan_consanguinidad && (
            <div className="nf-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Shield size={16} style={{ color: '#6366F1' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#6366F1' }}>Plan de Consanguinidad</span>
                {plan.plan_consanguinidad.coi_medio_actual !== undefined && (
                  <span className="nf-tag" style={{ fontSize: 10 }}>COI medio: {(plan.plan_consanguinidad.coi_medio_actual * 100).toFixed(1)}%</span>
                )}
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--neutral-600)', margin: '0 0 8px' }}>
                <strong>Estrategia:</strong> {plan.plan_consanguinidad.estrategia}
              </p>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--neutral-600)', margin: 0 }}>
                <strong>Rotaciones:</strong> {plan.plan_consanguinidad.rotaciones_previstas}
              </p>
            </div>
          )}

          {/* Roadmap */}
          {plan.roadmap?.length > 0 && (
            <div className="nf-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Dna size={16} style={{ color: '#8B5CF6' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#8B5CF6' }}>Roadmap Generacional</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.roadmap.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--neutral-25)', border: '1px solid var(--neutral-100)' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0,
                    }}>
                      {r.generacion}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-900)', marginBottom: 2 }}>{r.objetivo}</div>
                      <div style={{ fontSize: 11, color: 'var(--neutral-500)', lineHeight: 1.5 }}>
                        <strong>Cruces:</strong> {r.cruces}<br />
                        <strong>Selección:</strong> {r.seleccion}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar + Nutrition */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {plan.calendario && (
              <div className="nf-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Calendar size={16} style={{ color: '#F59E0B' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>Calendario</span>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--neutral-600)' }}>
                  <div><strong>Mejor época:</strong> {plan.calendario.mejor_epoca_incubacion}</div>
                  <div><strong>Ciclo:</strong> {plan.calendario.duracion_ciclo}</div>
                  {plan.calendario.notas && <div style={{ marginTop: 6 }}>{plan.calendario.notas}</div>}
                </div>
              </div>
            )}
            {plan.nutricion_reproductores && (
              <div className="nf-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Utensils size={16} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>Nutrición Reproductores</span>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--neutral-600)' }}>
                  {plan.nutricion_reproductores}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Raw response fallback */}
      {plan?.parse_error && plan?.raw_response && (
        <div className="nf-card">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#D97706' }}>
            <AlertTriangle size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Respuesta de Claude (formato libre)
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--neutral-600)', whiteSpace: 'pre-wrap' }}>
            {plan.raw_response}
          </div>
        </div>
      )}

      {/* Initial state — prompt to generate */}
      {!plan && !loading && !error && (
        <div className="nf-card" style={{ textAlign: 'center', padding: 48, background: 'linear-gradient(135deg, rgba(139,92,246,0.02), rgba(236,72,153,0.02))' }}>
          <Sparkles size={40} style={{ color: '#8B5CF6', marginBottom: 12 }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--neutral-800)', margin: '0 0 8px' }}>
            Listo para analizar tu cabaña
          </p>
          <p style={{ fontSize: 13, color: 'var(--neutral-400)', maxWidth: 500, margin: '0 auto 20px' }}>
            Claude analizará tus {machos.length} gallos y {hembras.length} gallinas con sus scores genéticos,
            razas y parentesco para recomendar el plan de cría óptimo: cuántos gallineros, qué gallo con qué gallinas,
            y el roadmap generacional F1→F3.
          </p>
          <button
            onClick={runRecommendation}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
            }}
          >
            <Sparkles size={18} /> Generar Plan de Cría con IA
          </button>
        </div>
      )}
    </div>
  );
}
