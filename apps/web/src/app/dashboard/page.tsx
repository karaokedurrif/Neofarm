'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Leaf, Warehouse, Package, Thermometer, Droplets, Wind, Sun,
  Moon, Snowflake, Zap, Box, LayoutGrid, Cloud, AlertTriangle,
  Activity, Clock, ArrowRight, Wifi
} from 'lucide-react'
import VineyardPlane from '@/components/dashboard/VineyardPlane'
import CellarPlane from '@/components/dashboard/CellarPlane'
import BarrelPlane from '@/components/dashboard/BarrelPlane'
import KPICards from '@/components/dashboard/KPICards'

const DigitalTwinManager = dynamic(
  () => import('@/components/digital-twin/DigitalTwinManager'),
  { ssr: false, loading: () => (
    <div className="h-[600px] card flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        <p className="text-sm text-[var(--text-muted)]">Cargando Gemelo Digital 3D…</p>
      </div>
    </div>
  )}
)

const tabs = [
  { id: 'vineyard', label: 'Viñedo', icon: Leaf },
  { id: 'cellar', label: 'Bodega', icon: Warehouse },
  { id: 'barrels', label: 'Barricas', icon: Package },
]

/* ─── Weather widget ─── */
function WeatherWidget() {
  return (
    <div className="card p-4 animate-in" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center gap-2 mb-3">
        <Cloud className="w-4 h-4 text-[var(--info)]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Meteo</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <Sun className="w-8 h-8 text-[var(--warning)] mx-auto mb-1" />
          <p className="text-2xl font-bold">19°C</p>
          <p className="text-[10px] text-[var(--text-muted)]">Soleado</p>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <Droplets className="w-3.5 h-3.5 text-[var(--info)] mx-auto mb-0.5" />
            <p className="font-mono font-bold">68%</p>
            <p className="text-[10px] text-[var(--text-muted)]">HR</p>
          </div>
          <div>
            <Wind className="w-3.5 h-3.5 text-[var(--text-muted)] mx-auto mb-0.5" />
            <p className="font-mono font-bold">12</p>
            <p className="text-[10px] text-[var(--text-muted)]">km/h NW</p>
          </div>
          <div>
            <Zap className="w-3.5 h-3.5 text-[var(--warning)] mx-auto mb-0.5" />
            <p className="font-mono font-bold">UV 4</p>
            <p className="text-[10px] text-[var(--text-muted)]">Medio</p>
          </div>
        </div>
      </div>
      {/* 3-day mini forecast */}
      <div className="border-t mt-3 pt-3 grid grid-cols-3 gap-2 text-center text-xs"
        style={{ borderColor: 'var(--border)' }}>
        {[
          { day: 'Mar', icon: Sun, temp: '21/9' },
          { day: 'Mié', icon: Cloud, temp: '18/7' },
          { day: 'Jue', icon: Snowflake, temp: '12/1' },
        ].map(d => {
          const I = d.icon
          return (
            <div key={d.day}>
              <p className="text-[var(--text-muted)]">{d.day}</p>
              <I className="w-3.5 h-3.5 mx-auto my-1 text-[var(--text-secondary)]" />
              <p className="font-mono">{d.temp}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Alert feed ─── */
function AlertFeed() {
  const alerts = [
    { id: 1, text: 'Trasiego vencido: Barricas A3, B2', time: '10 min', type: 'danger' as const },
    { id: 2, text: 'Sensor Pileta pH sin conexión 2h', time: '2h', type: 'warning' as const },
    { id: 3, text: 'Zona SE: riesgo helada mañana -2.1°C', time: '4h', type: 'danger' as const },
    { id: 4, text: 'Depósito 01 temp > 16°C', time: '6h', type: 'warning' as const },
  ]
  const colors = { danger: 'var(--danger)', warning: 'var(--warning)', info: 'var(--info)' }
  return (
    <div className="card p-4 animate-in" style={{ animationDelay: '360ms' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Alertas</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
          style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}>
          {alerts.length}
        </span>
      </div>
      <div className="space-y-2">
        {alerts.map(a => (
          <div key={a.id} className="flex items-start gap-2 text-xs">
            <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: colors[a.type] }} />
            <p className="flex-1 leading-relaxed">{a.text}</p>
            <span className="text-[var(--text-muted)] shrink-0 font-mono">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Activity timeline ─── */
function ActivityTimeline() {
  const events = [
    { time: '14:30', text: 'Vuelo dron completado — NDVI parcela 1', icon: Activity, color: 'var(--info)' },
    { time: '12:15', text: 'Trasiego D05 → Barrica A5 completado', icon: ArrowRight, color: 'var(--success)' },
    { time: '09:45', text: 'Análisis laboratorio: pH 3.54, Ac. total 5.2', icon: Zap, color: 'var(--accent)' },
    { time: '08:00', text: 'Sistema antihelada desactivado (zona SE)', icon: Snowflake, color: 'var(--info)' },
    { time: 'Ayer', text: 'Robot UGV: poda parcela 1 completada', icon: Wifi, color: 'var(--success)' },
  ]
  return (
    <div className="card p-4 animate-in" style={{ animationDelay: '420ms' }}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-[var(--accent)]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Actividad</span>
      </div>
      <div className="space-y-3">
        {events.map((e, i) => {
          const I = e.icon
          return (
            <div key={i} className="flex items-start gap-3 text-xs">
              <span className="font-mono text-[var(--text-muted)] w-10 shrink-0 pt-0.5">{e.time}</span>
              <div className="relative flex items-center justify-center">
                <span className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${e.color} 15%, transparent)` }}>
                  <I className="w-2.5 h-2.5" style={{ color: e.color }} />
                </span>
                {i < events.length - 1 && (
                  <span className="absolute top-5 left-1/2 -translate-x-1/2 w-px h-4"
                    style={{ background: 'var(--border)' }} />
                )}
              </div>
              <p className="flex-1 leading-relaxed pt-0.5">{e.text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Quick status badges ─── */
function StatusBadges() {
  const badges = [
    { icon: Moon, label: 'Día FRUTO', sub: '☽ Creciente', color: 'var(--accent)' },
    { icon: Snowflake, label: 'Helada: OK', sub: 'Min 1.5°C', color: 'var(--success)' },
    { icon: Wifi, label: 'IoT 7/8', sub: '1 offline', color: 'var(--success)' },
  ]
  return (
    <div className="flex items-center gap-2">
      {badges.map(b => {
        const I = b.icon
        return (
          <div key={b.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <I className="w-3.5 h-3.5" style={{ color: b.color }} />
            <span style={{ color: b.color }} className="font-medium">{b.label}</span>
            <span className="text-[var(--text-muted)] hidden md:inline">{b.sub}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('vineyard')
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d')

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Bodega del Duero — Ribera del Duero · Parcela Piloto 1ha</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadges />
          {/* 2D / 3D Toggle */}
          <div className="flex items-center rounded-lg p-0.5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                viewMode === '3d' ? 'text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-white'
              }`}
              style={viewMode === '3d' ? { background: 'var(--sidebar-active)' } : undefined}
            >
              <Box className="w-3.5 h-3.5" /> 3D
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                viewMode === '2d' ? 'text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-white'
              }`}
              style={viewMode === '2d' ? { background: 'var(--sidebar-active)' } : undefined}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> 2D
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Main grid: scene + sidebar widgets */}
      <div className="grid grid-cols-[1fr_320px] gap-4">
        {/* Left: Scene */}
        <div className="space-y-4">
          {viewMode === '3d' && <DigitalTwinManager />}

          {viewMode === '2d' && (
            <>
              <div className="flex gap-1 rounded-xl p-1 w-fit"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.id ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                      }`}
                      style={activeTab === tab.id ? { background: 'var(--sidebar-active)' } : undefined}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              <div className="card-flat overflow-hidden">
                {activeTab === 'vineyard' && <VineyardPlane />}
                {activeTab === 'cellar' && <CellarPlane />}
                {activeTab === 'barrels' && <BarrelPlane />}
              </div>
            </>
          )}
        </div>

        {/* Right sidebar: widgets */}
        <div className="space-y-4">
          <WeatherWidget />
          <AlertFeed />
          <ActivityTimeline />
        </div>
      </div>
    </div>
  )
}
