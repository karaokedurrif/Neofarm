'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTenant } from '@/contexts/TenantContext';
import EmptyState, { HoverGuide } from '@/components/tenant/EmptyState';
import {
  BarChart3, Package, Home, Egg, Heart, Activity,
  Plus, ChevronRight, Zap, TrendingUp, ArrowRight,
  Calendar, Dna, Leaf
} from 'lucide-react';

/* ── Quick action cards ─────────────────────────────── */
const QUICK_ACTIONS = [
  {
    icon: Home,
    emoji: '🏠',
    label: 'Crear tu primer gallinero',
    description: 'Define un espacio: ponedoras, engorde, cría o mixto.',
    href: 'gallineros',
    tip: 'Un gallinero es una zona con capacidad, m² y sensores',
  },
  {
    icon: Package,
    emoji: '🐔',
    label: 'Registrar tus aves',
    description: 'Añade gallinas, gallos, capones... con raza, peso y anilla.',
    href: 'aves',
    tip: 'Cada ave tiene pasaporte: OVS-AAAA-NNNN',
  },
  {
    icon: Egg,
    emoji: '🥚',
    label: 'Registrar producción',
    description: 'Recogida de huevos, pesajes, lotes de engorde.',
    href: 'production',
    tip: 'La producción se vincula automáticamente a las aves de cada gallinero',
  },
  {
    icon: Heart,
    emoji: '💉',
    label: 'Plan sanitario',
    description: 'Vacunas, desparasitaciones, revisiones veterinarias.',
    href: 'health',
    tip: 'Configura alertas para recordatorios de vacunación',
  },
];

/* ── Onboarding steps ───────────────────────────────── */
const STEPS = [
  { step: 1, label: 'Crear gallineros', done: false, page: 'gallineros' },
  { step: 2, label: 'Registrar aves', done: false, page: 'aves' },
  { step: 3, label: 'Apuntar producción', done: false, page: 'production' },
  { step: 4, label: 'Plan sanitario', done: false, page: 'health' },
  { step: 5, label: 'Configurar sensores', done: false, page: 'devices' },
];

export default function TenantDashboardPage() {
  const { farm } = useTenant();
  const params = useParams();
  const slug = params?.slug as string;

  return (
    <div className="nf-content" style={{ paddingTop: 24, paddingBottom: 48 }}>
      {/* Welcome header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--neutral-900)' }}>
          {farm?.avatar} {farm?.name}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--neutral-500)', marginTop: 6 }}>
          Dashboard de tu granja — empieza configurando tus gallineros y registrando aves.
        </p>
      </div>

      {/* Onboarding progress */}
      <div className="nf-card" style={{ marginBottom: 24 }}>
        <div className="nf-card-hd" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="nf-card-title">🚀 Primeros pasos</div>
            <div className="nf-card-meta">Completa estos pasos para tener tu granja operativa</div>
          </div>
          <span style={{
            padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
            background: 'rgba(59,130,246,0.1)', color: '#3B82F6',
          }}>
            0 / {STEPS.length}
          </span>
        </div>
        <div className="nf-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {STEPS.map(s => (
            <Link
              key={s.step}
              href={`/farm/${slug}/${s.page}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                background: s.done ? 'rgba(22,163,74,0.06)' : 'var(--neutral-25)',
                border: s.done ? '1px solid rgba(22,163,74,0.15)' : 'var(--border-default)',
                textDecoration: 'none',
                transition: 'all 160ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = s.done ? 'rgba(22,163,74,0.1)' : 'var(--neutral-50)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = s.done ? 'rgba(22,163,74,0.06)' : 'var(--neutral-25)'; }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
                background: s.done ? 'var(--ok)' : 'var(--neutral-200)',
                color: s.done ? '#fff' : 'var(--neutral-600)',
              }}>
                {s.done ? '✓' : s.step}
              </div>
              <span style={{
                flex: 1, fontSize: 13, fontWeight: 600,
                color: s.done ? 'var(--ok)' : 'var(--neutral-700)',
                textDecoration: s.done ? 'line-through' : 'none',
              }}>
                {s.label}
              </span>
              <ChevronRight size={14} style={{ color: 'var(--neutral-400)' }} />
            </Link>
          ))}
        </div>
      </div>

      {/* KPIs — all empty */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 14,
        marginBottom: 24,
      }}>
        {[
          { label: 'Total Aves', icon: Activity, value: '0' },
          { label: 'Gallineros', icon: Home, value: '0' },
          { label: 'Huevos/día', icon: Egg, value: '0' },
          { label: 'Tasa Postura', icon: TrendingUp, value: '—' },
          { label: 'Score Granja', icon: Zap, value: '—' },
        ].map(kpi => (
          <HoverGuide key={kpi.label} tip={`Registra datos para ver "${kpi.label}" actualizado`}>
            <div className="nf-kbox" style={{ opacity: 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <kpi.icon size={16} style={{ color: 'var(--neutral-400)' }} />
                <span className="nf-kbox-v" style={{ fontSize: 22 }}>{kpi.value}</span>
              </div>
              <span className="nf-kbox-label">{kpi.label}</span>
            </div>
          </HoverGuide>
        ))}
      </div>

      {/* Quick action cards */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 14 }}>
        ¿Qué quieres hacer?
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        {QUICK_ACTIONS.map(qa => (
          <HoverGuide key={qa.label} tip={qa.tip}>
            <Link
              href={`/farm/${slug}/${qa.href}`}
              className="nf-card"
              style={{
                padding: '20px',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                transition: 'all 160ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
            >
              <span style={{ fontSize: 28 }}>{qa.emoji}</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--neutral-800)' }}>
                {qa.label}
              </span>
              <span style={{ fontSize: 13, color: 'var(--neutral-500)', lineHeight: 1.5 }}>
                {qa.description}
              </span>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 600, color: 'var(--primary-600)',
                marginTop: 4,
              }}>
                Empezar <ArrowRight size={12} />
              </span>
            </Link>
          </HoverGuide>
        ))}
      </div>

      {/* Tip box */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(176,125,43,0.06)',
        border: '1px solid rgba(176,125,43,0.15)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <span style={{ fontSize: 20 }}>🐣</span>
        <div>
          <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary-800)' }}>
            Consejo: Empieza por los gallineros
          </p>
          <p style={{ fontSize: 12, color: 'var(--primary-700)', marginTop: 4, lineHeight: 1.6 }}>
            Define primero tus zonas (ponedoras, engorde, cría, exterior). Luego registra aves asignándolas
            a cada gallinero. La producción, sanidad y nutrición se calculan automáticamente por zona.
          </p>
        </div>
      </div>
    </div>
  );
}
