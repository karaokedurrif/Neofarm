'use client';

import { useState } from 'react';
import {
  BarChart3, Thermometer, AlertCircle, TrendingUp, TrendingDown,
  Egg, Eye, Layers, Activity, Zap, ChevronRight,
  Home, TreePine, Baby, X, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

/* ── Types ─────────────────────────────────────────── */
type Layer = 'estado' | 'temperatura' | 'ocupacion';

interface ZonaTwin {
  id: string;
  name: string;
  tipo: string;
  aves: number;
  capacidad: number;
  m2: number;
  temp: number;
  humedad: number;
  co2: number;
  luz: number;
  estado: 'ok' | 'warn' | 'alert';
  huevosHoy: number;
  consumoKg: number;
  sensores: number;
  ultimoEvento: string;
  ultimoEventoTime: string;
  recomendacion: string;
}

/* ── Data ──────────────────────────────────────────── */
const KPIS = [
  { value: '38', label: 'Total Aves', change: '+2', trend: 'up' as const, icon: Activity },
  { value: '4', label: 'Huevos/día', change: '', trend: 'stable' as const, icon: Egg },
  { value: '22.2%', label: 'Tasa Postura', change: '-1%', trend: 'down' as const, icon: TrendingDown },
  { value: '2.6%', label: 'Mortalidad', change: '=', trend: 'stable' as const, icon: AlertCircle },
  { value: '82', label: 'Score Granja', change: '+3', trend: 'up' as const, icon: Zap },
];

const ZONAS: ZonaTwin[] = [
  {
    id: 'G1', name: 'Gallinero Principal', tipo: 'Ponedoras',
    aves: 18, capacidad: 25, m2: 30, temp: 18.2, humedad: 62, co2: 420, luz: 85,
    estado: 'ok', huevosHoy: 4, consumoKg: 4.6, sensores: 2,
    ultimoEvento: 'Recogida 4 huevos', ultimoEventoTime: 'Hace 2h',
    recomendacion: 'Revisar comedero — nivel bajo de pienso.',
  },
  {
    id: 'G2', name: 'Zona Capones', tipo: 'Engorde',
    aves: 12, capacidad: 20, m2: 24, temp: 19.1, humedad: 58, co2: 380, luz: 75,
    estado: 'ok', huevosHoy: 0, consumoKg: 5.2, sensores: 1,
    ultimoEvento: 'Pesaje lote — media 3.2 kg', ultimoEventoTime: 'Ayer',
    recomendacion: 'Semana 20 — programar revisión sanitaria pre-sacrificio.',
  },
  {
    id: 'G3', name: 'Zona Cría', tipo: 'Cría',
    aves: 6, capacidad: 10, m2: 10, temp: 32.0, humedad: 55, co2: 350, luz: 90,
    estado: 'warn', huevosHoy: 0, consumoKg: 0.8, sensores: 1,
    ultimoEvento: 'Temperatura alta detectada', ultimoEventoTime: 'Hace 30m',
    recomendacion: 'Reducir lámpara de calor — pollitos 3 semanas.',
  },
  {
    id: 'G4', name: 'Parque Exterior', tipo: 'Exterior',
    aves: 38, capacidad: 500, m2: 2000, temp: 14.3, humedad: 45, co2: 280, luz: 100,
    estado: 'ok', huevosHoy: 0, consumoKg: 0, sensores: 0,
    ultimoEvento: 'Apertura trampillas 8:00', ultimoEventoTime: 'Hoy 8:00',
    recomendacion: 'NDVI parcela bueno — mantener rotación de parques.',
  },
];

const ALERTAS = [
  { icon: '🟢', text: 'Vacunación Newcastle al día', tipo: 'ok', time: 'Hoy' },
  { icon: '🟡', text: 'Stock pienso: 12 días restantes', tipo: 'warn', time: 'Hace 2h' },
  { icon: '🟡', text: 'Lote 1 capones: 20 semanas (revisar)', tipo: 'warn', time: 'Ayer' },
  { icon: '🟢', text: 'Sensores G1 y G2 operativos', tipo: 'ok', time: 'Hace 5m' },
];

const PRODUCCION_7D = [
  { dia: 'Lun', huevos: 5 },
  { dia: 'Mar', huevos: 4 },
  { dia: 'Mié', huevos: 6 },
  { dia: 'Jue', huevos: 4 },
  { dia: 'Vie', huevos: 5 },
  { dia: 'Sáb', huevos: 3 },
  { dia: 'Dom', huevos: 4 },
];

const maxHuevos = Math.max(...PRODUCCION_7D.map(d => d.huevos));

const LAYERS: { key: Layer; label: string; icon: any }[] = [
  { key: 'estado', label: 'Estado', icon: Eye },
  { key: 'temperatura', label: 'Temperatura', icon: Thermometer },
  { key: 'ocupacion', label: 'Ocupación', icon: Activity },
];

/* ── Color helpers ─────────────────────────────────── */
function estadoColor(e: string): string {
  return e === 'ok' ? '#16A34A' : e === 'warn' ? '#D97706' : '#DC2626';
}
function estadoBg(e: string): string {
  return e === 'ok' ? 'rgba(22,163,74,0.12)' : e === 'warn' ? 'rgba(217,119,6,0.12)' : 'rgba(220,38,38,0.12)';
}
function tempColor(t: number): string {
  if (t > 30) return '#DC2626';
  if (t > 24) return '#D97706';
  if (t >= 14) return '#16A34A';
  return '#3B82F6';
}
function tempBg(t: number): string {
  if (t > 30) return 'rgba(220,38,38,0.12)';
  if (t > 24) return 'rgba(217,119,6,0.12)';
  if (t >= 14) return 'rgba(22,163,74,0.12)';
  return 'rgba(59,130,246,0.12)';
}
function occColor(pct: number): string {
  if (pct > 85) return '#DC2626';
  if (pct > 65) return '#D97706';
  return '#16A34A';
}
function occBg(pct: number): string {
  if (pct > 85) return 'rgba(220,38,38,0.12)';
  if (pct > 65) return 'rgba(217,119,6,0.12)';
  return 'rgba(22,163,74,0.12)';
}

/* ── Zone icon by type ─────────────────────────────── */
function ZoneIcon({ tipo }: { tipo: string }) {
  if (tipo === 'Ponedoras') return <Home size={20} />;
  if (tipo === 'Engorde') return <BarChart3 size={20} />;
  if (tipo === 'Cría') return <Baby size={20} />;
  return <TreePine size={20} />;
}

/* ── SVG Zone in the digital twin ────────────────── */
interface ZoneSVGProps {
  zona: ZonaTwin;
  x: number; y: number; w: number; h: number;
  layer: Layer;
  selected: boolean;
  hovered: boolean;
  onSelect: () => void;
  onHover: (h: boolean) => void;
}

function ZoneSVG({ zona, x, y, w, h, layer, selected, hovered, onSelect, onHover }: ZoneSVGProps) {
  const occ = Math.round((zona.aves / zona.capacidad) * 100);

  let fillColor: string, borderColor: string;
  if (layer === 'estado') {
    fillColor = estadoBg(zona.estado);
    borderColor = estadoColor(zona.estado);
  } else if (layer === 'temperatura') {
    fillColor = tempBg(zona.temp);
    borderColor = tempColor(zona.temp);
  } else {
    fillColor = occBg(occ);
    borderColor = occColor(occ);
  }

  const layerValue = layer === 'estado'
    ? (zona.estado === 'ok' ? '✓ OK' : zona.estado === 'warn' ? '⚠ Atención' : '🔴 Alerta')
    : layer === 'temperatura'
    ? `${zona.temp}°C`
    : `${occ}%`;

  return (
    <g
      style={{ cursor: 'pointer' }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <rect
        x={x} y={y} width={w} height={h}
        rx={8} ry={8}
        fill={fillColor}
        stroke={borderColor}
        strokeWidth={selected ? 3 : hovered ? 2.5 : 1.5}
        strokeDasharray={zona.estado === 'warn' && layer === 'estado' ? '6,3' : undefined}
        style={{ transition: 'all 0.2s ease' }}
      />
      {selected && (
        <rect
          x={x - 2} y={y - 2} width={w + 4} height={h + 4}
          rx={10} ry={10}
          fill="none"
          stroke="#B07D2B"
          strokeWidth={2}
          strokeDasharray="4,4"
          opacity={0.6}
        />
      )}
      <rect x={x + 8} y={y + 8} width={32} height={18} rx={4} fill={borderColor} opacity={0.85} />
      <text x={x + 24} y={y + 21} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={700} fontFamily="var(--font-mono)">
        {zona.id}
      </text>
      <text x={x + w / 2} y={y + h / 2 - 14} textAnchor="middle" fill="#2C2418" fontSize={13} fontWeight={700}>
        {zona.name}
      </text>
      <text x={x + w / 2} y={y + h / 2 + 2} textAnchor="middle" fill="#6B5D4B" fontSize={10} fontWeight={500}>
        {zona.tipo} · {zona.aves} aves · {zona.m2} m²
      </text>
      <text x={x + w / 2} y={y + h / 2 + 22} textAnchor="middle" fill={borderColor} fontSize={14} fontWeight={800} fontFamily="var(--font-mono)">
        {layerValue}
      </text>
      {zona.sensores > 0 && (
        <>
          <circle cx={x + w - 18} cy={y + 17} r={6} fill="#3B82F6" opacity={0.8} />
          <text x={x + w - 18} y={y + 20} textAnchor="middle" fill="#fff" fontSize={8} fontWeight={700}>
            {zona.sensores}
          </text>
        </>
      )}
      {hovered && !selected && (
        <g>
          <rect x={x + w / 2 - 80} y={y - 40} width={160} height={32} rx={6} fill="#2C2418" opacity={0.92} />
          <text x={x + w / 2} y={y - 20} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>
            {zona.aves}/{zona.capacidad} aves · {zona.temp}°C
          </text>
        </g>
      )}
    </g>
  );
}

/* ── Attention Panel (right side) ────────────────── */
function AttentionPanel({ zona, onClose }: { zona: ZonaTwin; onClose: () => void }) {
  const occ = Math.round((zona.aves / zona.capacidad) * 100);
  const density = (zona.aves / zona.m2).toFixed(2);

  return (
    <div className="nf-card" style={{ borderColor: 'var(--primary-300)', height: 'fit-content' }}>
      <div className="nf-card-hd" style={{ background: 'var(--primary-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="nf-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ZoneIcon tipo={zona.tipo} />
            {zona.name}
          </div>
          <div className="nf-card-meta">{zona.tipo} · {zona.id}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)', padding: 4 }}>
          <X size={18} />
        </button>
      </div>
      <div className="nf-card-pad">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span className={`nf-dot ${zona.estado}`} />
          <span style={{ fontSize: 12, fontWeight: 600, color: estadoColor(zona.estado) }}>
            {zona.estado === 'ok' ? 'Estado normal' : zona.estado === 'warn' ? 'Atención requerida' : 'Alerta activa'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Aves', value: `${zona.aves}/${zona.capacidad}`, icon: '🐔' },
            { label: 'm²', value: zona.m2.toLocaleString(), icon: '📐' },
            { label: 'Densidad', value: `${density} av/m²`, icon: '📊' },
            { label: 'Temp', value: `${zona.temp}°C`, icon: '🌡️', color: tempColor(zona.temp) },
            { label: 'Humedad', value: `${zona.humedad}%`, icon: '💧' },
            { label: 'Ocupación', value: `${occ}%`, icon: '📈', color: occColor(occ) },
          ].map((kpi) => (
            <div key={kpi.label} style={{
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              background: 'var(--neutral-50)', border: 'var(--border-default)',
            }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--neutral-500)', marginBottom: 4 }}>
                {kpi.icon} {kpi.label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)', color: kpi.color || 'var(--neutral-900)' }}>
                {kpi.value}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          padding: '10px 12px', borderRadius: 'var(--radius-md)',
          background: 'var(--neutral-50)', border: 'var(--border-default)', marginBottom: 12,
        }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--neutral-400)', marginBottom: 4 }}>
            📋 Último evento
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{zona.ultimoEvento}</div>
          <div style={{ fontSize: 11, color: 'var(--neutral-400)', marginTop: 2 }}>{zona.ultimoEventoTime}</div>
        </div>
        <div style={{
          padding: '10px 12px', borderRadius: 'var(--radius-md)',
          background: 'rgba(176,125,43,0.06)', border: '1px solid rgba(176,125,43,0.15)', marginBottom: 16,
        }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-600)', marginBottom: 4 }}>
            💡 Siguiente paso recomendado
          </div>
          <div style={{ fontSize: 12, color: 'var(--neutral-800)', lineHeight: 1.5 }}>{zona.recomendacion}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/gallineros" className="nf-btn primary" style={{ flex: 1, textDecoration: 'none', textAlign: 'center', fontSize: 12 }}>
            Gestionar <ArrowRight size={14} />
          </Link>
          <Link href="/aves" className="nf-btn" style={{ flex: 1, textDecoration: 'none', textAlign: 'center', fontSize: 12 }}>
            Ver Aves
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Legend component ─────────────────────────────── */
function Legend({ layer }: { layer: Layer }) {
  const items = layer === 'estado'
    ? [
        { color: '#16A34A', label: 'OK — normal' },
        { color: '#D97706', label: 'Atención' },
        { color: '#DC2626', label: 'Alerta' },
      ]
    : layer === 'temperatura'
    ? [
        { color: '#3B82F6', label: '< 14°C Frío' },
        { color: '#16A34A', label: '14-24°C Óptimo' },
        { color: '#D97706', label: '24-30°C Caliente' },
        { color: '#DC2626', label: '> 30°C Peligro' },
      ]
    : [
        { color: '#16A34A', label: '< 65% Baja' },
        { color: '#D97706', label: '65-85% Media' },
        { color: '#DC2626', label: '> 85% Alta' },
      ];

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 8 }}>
      {items.map((it) => (
        <span key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--neutral-500)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: it.color, display: 'inline-block' }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [layer, setLayer] = useState<Layer>('estado');
  const [selected, setSelected] = useState<ZonaTwin | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="nf-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart3 size={24} />
          Dashboard
        </h1>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
        {KPIS.map((kpi) => (
          <div key={kpi.label} className="nf-kbox" style={{ position: 'relative' }}>
            <kpi.icon size={14} style={{ position: 'absolute', top: 12, right: 12, color: 'var(--neutral-300)' }} />
            <div className="nf-kbox-v">{kpi.value}</div>
            <div className="nf-kbox-label">{kpi.label}</div>
            {kpi.change && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: kpi.trend === 'up' ? 'var(--ok)' : kpi.trend === 'down' ? 'var(--alert)' : 'var(--neutral-500)' }}>
                {kpi.trend === 'up' && <TrendingUp size={12} />}
                {kpi.trend === 'down' && <TrendingDown size={12} />}
                {kpi.change}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ═══ COCKPIT: 12-col grid, 8/4 layout ═══ */}
      <div className="nf-grid12" style={{ marginBottom: 20, alignItems: 'start' }}>
        {/* Twin — 8 cols (or 12 if no selection) */}
        <div style={{ gridColumn: selected ? 'span 8' : 'span 12' }}>
          <div className="nf-card">
            <div className="nf-card-hd">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="nf-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={16} />
                    Digital Twin — Capa: {LAYERS.find(l => l.key === layer)?.label}
                  </div>
                  <div className="nf-card-meta">Click en zona para inspeccionar</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 4, background: 'var(--neutral-100)', borderRadius: 'var(--radius-md)', padding: 3 }}>
                    {LAYERS.map(l => (
                      <button
                        key={l.key}
                        onClick={() => setLayer(l.key)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                          fontSize: 11, fontWeight: layer === l.key ? 700 : 500,
                          background: layer === l.key ? 'var(--neutral-0)' : 'transparent',
                          border: 'none', borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer', boxShadow: layer === l.key ? 'var(--shadow-card)' : 'none',
                          color: layer === l.key ? 'var(--primary-700)' : 'var(--neutral-500)',
                          transition: 'var(--transition-fast)',
                        }}
                      >
                        <l.icon size={13} /> {l.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className="nf-dot ok" style={{ width: 6, height: 6 }} />
                    <span style={{ fontSize: 10, color: 'var(--ok)', fontWeight: 700, letterSpacing: '0.08em' }}>LIVE</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="nf-card-pad" style={{ padding: '20px 24px' }}>
              {/* SVG Farm Twin */}
              <svg
                viewBox="0 0 800 420"
                width="100%"
                style={{ maxHeight: 380, borderRadius: 'var(--radius-lg)', background: 'var(--neutral-25)' }}
              >
                <rect x={0} y={0} width={800} height={420} rx={10} fill="#F7F4EF" />
                {/* Parque Exterior (big background) */}
                <ZoneSVG
                  zona={ZONAS[3]} x={16} y={16} w={768} h={388}
                  layer={layer}
                  selected={selected?.id === ZONAS[3].id}
                  hovered={hovered === ZONAS[3].id}
                  onSelect={() => setSelected(selected?.id === ZONAS[3].id ? null : ZONAS[3])}
                  onHover={(h) => setHovered(h ? ZONAS[3].id : null)}
                />
                {/* Inner buildings */}
                <ZoneSVG
                  zona={ZONAS[0]} x={40} y={50} w={340} h={160}
                  layer={layer}
                  selected={selected?.id === ZONAS[0].id}
                  hovered={hovered === ZONAS[0].id}
                  onSelect={() => setSelected(selected?.id === ZONAS[0].id ? null : ZONAS[0])}
                  onHover={(h) => setHovered(h ? ZONAS[0].id : null)}
                />
                <ZoneSVG
                  zona={ZONAS[1]} x={420} y={50} w={340} h={160}
                  layer={layer}
                  selected={selected?.id === ZONAS[1].id}
                  hovered={hovered === ZONAS[1].id}
                  onSelect={() => setSelected(selected?.id === ZONAS[1].id ? null : ZONAS[1])}
                  onHover={(h) => setHovered(h ? ZONAS[1].id : null)}
                />
                <ZoneSVG
                  zona={ZONAS[2]} x={230} y={240} w={340} h={140}
                  layer={layer}
                  selected={selected?.id === ZONAS[2].id}
                  hovered={hovered === ZONAS[2].id}
                  onSelect={() => setSelected(selected?.id === ZONAS[2].id ? null : ZONAS[2])}
                  onHover={(h) => setHovered(h ? ZONAS[2].id : null)}
                />
                {/* Decorative paths */}
                <line x1={210} y1={210} x2={400} y2={240} stroke="#B8AB98" strokeWidth={1} strokeDasharray="4,4" opacity={0.5} />
                <line x1={590} y1={210} x2={400} y2={240} stroke="#B8AB98" strokeWidth={1} strokeDasharray="4,4" opacity={0.5} />
                <text x={150} y={232} fill="#8A7D6A" fontSize={9} fontStyle="italic">camino</text>
                <text x={640} y={232} fill="#8A7D6A" fontSize={9} fontStyle="italic">camino</text>
                {/* Compass */}
                <g transform="translate(750, 380)">
                  <circle cx={0} cy={0} r={16} fill="#FFFFFF" stroke="#B8AB98" strokeWidth={1} opacity={0.8} />
                  <text x={0} y={-4} textAnchor="middle" fill="#57493A" fontSize={8} fontWeight={700}>N</text>
                  <text x={0} y={8} textAnchor="middle" fill="#8A7D6A" fontSize={7}>S</text>
                </g>
              </svg>
              <Legend layer={layer} />
            </div>
          </div>
        </div>

        {/* Attention Panel — 4 cols (only when selected) */}
        {selected && (
          <div style={{ gridColumn: 'span 4' }}>
            <AttentionPanel zona={selected} onClose={() => setSelected(null)} />
          </div>
        )}
      </div>

      {/* ═══ Below cockpit: 3-col grid ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        {/* Production Chart */}
        <div className="nf-card">
          <div className="nf-card-hd">
            <div className="nf-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Egg size={14} /> Producción — 7 días
            </div>
          </div>
          <div className="nf-card-pad">
            <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-around', height: 100, gap: 6 }}>
              {PRODUCCION_7D.map((d) => (
                <div key={d.dia} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: 3 }}>{d.huevos}</div>
                  <div style={{
                    width: '100%', height: (d.huevos / maxHuevos) * 65 + 6,
                    background: 'linear-gradient(to top, var(--primary-500), var(--primary-300))',
                    borderRadius: '3px 3px 0 0', transition: 'height 0.3s',
                  }} />
                  <div style={{ fontSize: 10, color: 'var(--neutral-500)', marginTop: 4 }}>{d.dia}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="nf-card">
          <div className="nf-card-hd">
            <div className="nf-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={14} /> Alertas
            </div>
          </div>
          <div className="nf-card-pad">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ALERTAS.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '6px 0', borderBottom: i < ALERTAS.length - 1 ? 'var(--border-default)' : 'none' }}>
                  <span style={{ fontSize: 13 }}>{a.icon}</span>
                  <span style={{ flex: 1, lineHeight: 1.3 }}>{a.text}</span>
                  <span style={{ fontSize: 10, color: 'var(--neutral-400)', whiteSpace: 'nowrap' }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="nf-card">
          <div className="nf-card-hd">
            <div className="nf-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} /> Accesos Rápidos
            </div>
          </div>
          <div className="nf-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[
              { href: '/aves', label: 'Registrar Ave', icon: '🐔' },
              { href: '/production', label: 'Producción', icon: '🥚' },
              { href: '/health', label: 'Sanidad', icon: '💊' },
              { href: '/genetics', label: 'Cruces IA', icon: '🧬' },
              { href: '/simulator', label: 'Simulador', icon: '📸' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="nf-nav-item" style={{
                textDecoration: 'none', color: 'var(--neutral-700)', padding: '7px 10px',
                borderRadius: 'var(--radius-md)', border: 'var(--border-default)', fontSize: 12,
              }}>
                <span>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                <ChevronRight size={13} style={{ color: 'var(--neutral-400)' }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
