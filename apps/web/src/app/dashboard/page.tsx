'use client';

import { useState } from 'react';
import {
  BarChart3, Thermometer, Droplets, AlertCircle, TrendingUp, TrendingDown,
  Egg, Eye, Layers, Activity, Wifi, Sun, Moon, Wind, Zap, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

/* ── Types ─────────────────────────────────────────── */
type Layer = 'overview' | 'climate' | 'production' | 'alerts';

interface GallineroTwin {
  id: string;
  name: string;
  zona: string;
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
}

/* ── Data ──────────────────────────────────────────── */
const KPIS = [
  { value: '38', label: 'Total Aves', change: '+2', trend: 'up' as const, icon: Activity },
  { value: '4', label: 'Huevos/día', change: '', trend: 'stable' as const, icon: Egg },
  { value: '22.2%', label: 'Tasa Postura', change: '-1%', trend: 'down' as const, icon: TrendingDown },
  { value: '2.6%', label: 'Mortalidad', change: '=', trend: 'stable' as const, icon: AlertCircle },
  { value: '82', label: 'Score Granja', change: '+3', trend: 'up' as const, icon: Zap },
];

const GALLINEROS: GallineroTwin[] = [
  { id: 'G1', name: 'Gallinero Principal', zona: 'Ponedoras', aves: 18, capacidad: 25, m2: 30, temp: 18.2, humedad: 62, co2: 420, luz: 85, estado: 'ok', huevosHoy: 4, consumoKg: 4.6, sensores: 2 },
  { id: 'G2', name: 'Zona Capones', zona: 'Engorde', aves: 12, capacidad: 20, m2: 24, temp: 19.1, humedad: 58, co2: 380, luz: 75, estado: 'ok', huevosHoy: 0, consumoKg: 5.2, sensores: 1 },
  { id: 'G3', name: 'Zona Cría', zona: 'Cría', aves: 6, capacidad: 10, m2: 10, temp: 32.0, humedad: 55, co2: 350, luz: 90, estado: 'ok', huevosHoy: 0, consumoKg: 0.8, sensores: 1 },
  { id: 'G4', name: 'Parque Exterior', zona: 'Exterior', aves: 38, capacidad: 500, m2: 2000, temp: 14.3, humedad: 45, co2: 280, luz: 100, estado: 'ok', huevosHoy: 0, consumoKg: 0, sensores: 0 },
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
  { key: 'overview', label: 'General', icon: Eye },
  { key: 'climate', label: 'Clima', icon: Thermometer },
  { key: 'production', label: 'Producción', icon: Egg },
  { key: 'alerts', label: 'Alertas', icon: AlertCircle },
];

/* ── Component ─────────────────────────────────────── */
export default function DashboardPage() {
  const [layer, setLayer] = useState<Layer>('overview');
  const [selected, setSelected] = useState<GallineroTwin | null>(null);

  return (
    <div className="nf-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>
          <BarChart3 size={24} style={{ display: 'inline', marginRight: 8 }} />
          Dashboard
        </h1>
        <div style={{ display: 'flex', gap: 4, background: 'var(--neutral-100)', borderRadius: 'var(--radius-md)', padding: 3 }}>
          {LAYERS.map(l => (
            <button
              key={l.key}
              onClick={() => setLayer(l.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                fontSize: 12, fontWeight: layer === l.key ? 700 : 500,
                background: layer === l.key ? 'var(--neutral-0)' : 'transparent',
                border: 'none', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', boxShadow: layer === l.key ? 'var(--shadow-card)' : 'none',
                color: layer === l.key ? 'var(--primary-700)' : 'var(--neutral-500)',
                transition: 'var(--transition-fast)',
              }}
            >
              <l.icon size={14} /> {l.label}
            </button>
          ))}
        </div>
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

      {/* Main 8/4 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Left column: Digital Twin */}
        <div>
          <div className="nf-card" style={{ marginBottom: 20 }}>
            <div className="nf-card-hd">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="nf-card-title">
                    <Layers size={16} style={{ display: 'inline', marginRight: 6 }} />
                    Digital Twin — Capa: {LAYERS.find(l => l.key === layer)?.label}
                  </div>
                  <div className="nf-card-meta">Estado en tiempo real</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="nf-dot ok" />
                  <span style={{ fontSize: 11, color: 'var(--ok)', fontWeight: 600 }}>LIVE</span>
                </div>
              </div>
            </div>
            <div className="nf-card-pad">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {GALLINEROS.map((g) => {
                  const occ = Math.round((g.aves / g.capacidad) * 100);
                  const isSelected = selected?.id === g.id;
                  return (
                    <div
                      key={g.id}
                      onClick={() => setSelected(isSelected ? null : g)}
                      style={{
                        padding: 14,
                        border: isSelected ? '2px solid var(--primary-400)' : 'var(--border-default)',
                        borderRadius: 'var(--radius-lg)',
                        background: isSelected ? 'var(--primary-50)' : 'var(--neutral-25)',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{g.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>{g.zona} · {g.id}</div>
                        </div>
                        <span className={`nf-dot ${g.estado}`} />
                      </div>

                      {/* Layer-specific content */}
                      {layer === 'overview' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                          <div>
                            <div style={{ color: 'var(--neutral-500)', fontSize: 10, textTransform: 'uppercase' }}>Aves</div>
                            <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{g.aves}/{g.capacidad}</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--neutral-500)', fontSize: 10, textTransform: 'uppercase' }}>m²</div>
                            <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{g.m2.toLocaleString()}</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--neutral-500)', fontSize: 10, textTransform: 'uppercase' }}>Ocupación</div>
                            <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: occ > 85 ? 'var(--warn)' : 'var(--ok)' }}>{occ}%</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--neutral-500)', fontSize: 10, textTransform: 'uppercase' }}>Sensores</div>
                            <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{g.sensores}</div>
                          </div>
                        </div>
                      )}

                      {layer === 'climate' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Thermometer size={12} style={{ color: 'var(--neutral-500)' }} />
                            <div>
                              <div style={{ color: 'var(--neutral-500)', fontSize: 10 }}>Temp</div>
                              <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: g.temp > 30 ? 'var(--alert)' : 'var(--neutral-900)' }}>{g.temp}°C</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Droplets size={12} style={{ color: 'var(--neutral-500)' }} />
                            <div>
                              <div style={{ color: 'var(--neutral-500)', fontSize: 10 }}>Humedad</div>
                              <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{g.humedad}%</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Wind size={12} style={{ color: 'var(--neutral-500)' }} />
                            <div>
                              <div style={{ color: 'var(--neutral-500)', fontSize: 10 }}>CO₂</div>
                              <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{g.co2} ppm</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Sun size={12} style={{ color: 'var(--neutral-500)' }} />
                            <div>
                              <div style={{ color: 'var(--neutral-500)', fontSize: 10 }}>Luz</div>
                              <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{g.luz}%</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {layer === 'production' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                          <div>
                            <div style={{ color: 'var(--neutral-500)', fontSize: 10, textTransform: 'uppercase' }}>🥚 Huevos hoy</div>
                            <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--primary-600)' }}>{g.huevosHoy}</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--neutral-500)', fontSize: 10, textTransform: 'uppercase' }}>Consumo pienso</div>
                            <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{g.consumoKg} kg</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--neutral-500)', fontSize: 10, textTransform: 'uppercase' }}>Tasa postura</div>
                            <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                              {g.aves > 0 && g.huevosHoy > 0 ? ((g.huevosHoy / g.aves) * 100).toFixed(1) + '%' : '—'}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--neutral-500)', fontSize: 10, textTransform: 'uppercase' }}>Conversión</div>
                            <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                              {g.huevosHoy > 0 ? (g.consumoKg / g.huevosHoy * 10).toFixed(1) : '—'}
                            </div>
                          </div>
                        </div>
                      )}

                      {layer === 'alerts' && (
                        <div style={{ fontSize: 12, color: 'var(--neutral-600)' }}>
                          {g.estado === 'ok' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span className="nf-dot ok" /> Sin alertas
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--warn)' }}>
                              <AlertCircle size={14} /> Revisar condiciones
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Production Chart */}
          <div className="nf-card">
            <div className="nf-card-hd">
              <div className="nf-card-title">
                <Egg size={16} style={{ display: 'inline', marginRight: 6 }} />
                Producción — Últimos 7 días
              </div>
            </div>
            <div className="nf-card-pad">
              <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-around', height: 120, gap: 8 }}>
                {PRODUCCION_7D.map((d) => (
                  <div key={d.dia} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{d.huevos}</div>
                    <div style={{
                      width: '100%', height: (d.huevos / maxHuevos) * 80 + 8,
                      background: `linear-gradient(to top, var(--primary-500), var(--primary-300))`,
                      borderRadius: '4px 4px 0 0', transition: 'height 0.3s',
                    }} />
                    <div style={{ fontSize: 11, color: 'var(--neutral-500)', marginTop: 6 }}>{d.dia}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Detail panel + Alerts + Quick links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Selected gallinero detail */}
          {selected && (
            <div className="nf-card" style={{ borderColor: 'var(--primary-300)' }}>
              <div className="nf-card-hd" style={{ background: 'var(--primary-50)' }}>
                <div className="nf-card-title">{selected.name}</div>
                <div className="nf-card-meta">{selected.zona} · {selected.id}</div>
              </div>
              <div className="nf-card-pad">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ color: 'var(--neutral-500)', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Aves</div>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 16 }}>{selected.aves}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--neutral-500)', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Temp</div>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 16 }}>{selected.temp}°C</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--neutral-500)', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Humedad</div>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 16 }}>{selected.humedad}%</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--neutral-500)', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>CO₂</div>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 16 }}>{selected.co2} ppm</div>
                  </div>
                </div>
                <Link href="/gallineros" className="nf-btn" style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}>
                  Gestionar <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          )}

          {/* Alerts */}
          <div className="nf-card">
            <div className="nf-card-hd">
              <div className="nf-card-title">Alertas y Notificaciones</div>
            </div>
            <div className="nf-card-pad">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ALERTAS.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, padding: '8px 0', borderBottom: i < ALERTAS.length - 1 ? 'var(--border-default)' : 'none' }}>
                    <span style={{ fontSize: 14 }}>{a.icon}</span>
                    <span style={{ flex: 1 }}>{a.text}</span>
                    <span style={{ fontSize: 10, color: 'var(--neutral-400)', whiteSpace: 'nowrap' }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="nf-card">
            <div className="nf-card-hd">
              <div className="nf-card-title">Accesos Rápidos</div>
            </div>
            <div className="nf-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { href: '/aves', label: 'Registrar Ave', icon: '🐔' },
                { href: '/production', label: 'Registrar Producción', icon: '🥚' },
                { href: '/health', label: 'Sanidad', icon: '💊' },
                { href: '/genetics', label: 'Cruces IA', icon: '🧬' },
                { href: '/simulator', label: 'Simulador Fotos', icon: '📸' },
              ].map(item => (
                <Link key={item.href} href={item.href} className="nf-nav-item" style={{
                  textDecoration: 'none', color: 'var(--neutral-700)', padding: '8px 12px',
                  borderRadius: 'var(--radius-md)', border: 'var(--border-default)',
                  fontSize: 13,
                }}>
                  <span>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <ChevronRight size={14} style={{ color: 'var(--neutral-400)' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
