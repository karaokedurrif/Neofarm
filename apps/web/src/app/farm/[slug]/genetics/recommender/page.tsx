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
import { calculateCOI } from '@/lib/genetics/services/inbreeding.service';
import { BREED_CATALOG } from '@/lib/genetics/breeds';
import type { SelectionProgram, Bird as BirdType } from '@/lib/genetics/types';

/* ── Simple Markdown → JSX renderer ── */
function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let paraLines: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} style={{ margin: '6px 0 10px 16px', padding: 0, listStyleType: 'disc' }}>
          {listItems.map((li, i) => <li key={i} style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--neutral-700)', marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: inlineMd(li) }} />)}
        </ul>
      );
      listItems = [];
    }
  };

  const flushPara = () => {
    if (paraLines.length > 0) {
      const joined = paraLines.join(' ').trim();
      if (joined) {
        elements.push(
          <p key={`p-${elements.length}`} style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--neutral-700)', margin: '0 0 10px' }} dangerouslySetInnerHTML={{ __html: inlineMd(joined) }} />
        );
      }
      paraLines = [];
    }
  };

  function inlineMd(s: string): string {
    return s
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:rgba(139,92,246,0.08);padding:1px 5px;border-radius:4px;font-size:12px">$1</code>');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      flushList();
      flushPara();
      elements.push(
        <h2 key={`h2-${i}`} style={{
          fontSize: 16, fontWeight: 700, color: '#8B5CF6', margin: '20px 0 8px',
          paddingBottom: 6, borderBottom: '2px solid rgba(139,92,246,0.15)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Sparkles size={15} style={{ color: '#8B5CF6', flexShrink: 0 }} />
          <span dangerouslySetInnerHTML={{ __html: inlineMd(line.slice(3)) }} />
        </h2>
      );
    } else if (line.startsWith('### ')) {
      flushList();
      flushPara();
      elements.push(
        <h3 key={`h3-${i}`} style={{
          fontSize: 14, fontWeight: 700, color: '#3B82F6', margin: '16px 0 6px',
          paddingLeft: 10, borderLeft: '3px solid #3B82F6',
        }}>
          <span dangerouslySetInnerHTML={{ __html: inlineMd(line.slice(4)) }} />
        </h3>
      );
    } else if (/^[-*] /.test(line)) {
      flushPara();
      listItems.push(line.replace(/^[-*] /, ''));
    } else if (line.trim() === '') {
      flushList();
      flushPara();
    } else {
      flushList();
      paraLines.push(line);
    }
  }
  flushList();
  flushPara();

  return <>{elements}</>;
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
  const [recommendation, setRecommendation] = useState<string | null>(null);
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
    setRecommendation(null);

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
      setRecommendation(data.recommendation || data.error || 'Sin respuesta');
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
            {loading ? 'Claude analizando...' : recommendation ? 'Regenerar Plan' : 'Generar Plan de Cría'}
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

      {/* ═══════ RESULTS (Markdown) ═══════ */}
      {recommendation && !loading && (
        <div className="nf-card" style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.03), rgba(236,72,153,0.03))',
          border: '1px solid rgba(139,92,246,0.12)',
          padding: '20px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#8B5CF6' }}>Plan de Cría IA</span>
            <span style={{ fontSize: 11, color: 'var(--neutral-400)', marginLeft: 'auto' }}>
              Generado por Claude · {enrichedBirds.length} aves analizadas
            </span>
          </div>
          <div style={{ borderTop: '1px solid rgba(139,92,246,0.1)', paddingTop: 12 }}>
            <MarkdownRenderer text={recommendation} />
          </div>
        </div>
      )}

      {/* Initial state — prompt to generate */}
      {!recommendation && !loading && !error && (
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
