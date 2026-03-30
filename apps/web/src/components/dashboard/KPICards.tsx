'use client'
import { Leaf, Droplets, Thermometer, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useMemo } from 'react'

/* ─── Mini sparkline SVG ─── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80
  const h = 28
  const pad = 2

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')

  const gradientId = `sp-${color.replace('#', '')}`

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${pad},${h} ${points} ${w - pad},${h}`}
        fill={`url(#${gradientId})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface KPI {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'flat'
  icon: typeof Leaf
  color: string
  spark: number[]
}

const kpis: KPI[] = [
  {
    label: 'Rendimiento Est.',
    value: '6,200 kg/ha',
    change: '+12%',
    trend: 'up',
    icon: Leaf,
    color: 'var(--success)',
    spark: [4800, 5100, 5000, 5400, 5800, 5700, 6000, 6200],
  },
  {
    label: 'Eficiencia Hídrica',
    value: '87%',
    change: '+5%',
    trend: 'up',
    icon: Droplets,
    color: 'var(--info)',
    spark: [72, 74, 78, 76, 80, 83, 85, 87],
  },
  {
    label: 'Temp. Bodega',
    value: '15.2°C',
    change: 'Óptima',
    trend: 'flat',
    icon: Thermometer,
    color: 'var(--accent)',
    spark: [15.5, 15.3, 15.4, 15.2, 15.1, 15.3, 15.2, 15.2],
  },
  {
    label: 'Barricas Activas',
    value: '52 / 60',
    change: '87%',
    trend: 'up',
    icon: BarChart3,
    color: 'var(--primary-light)',
    spark: [40, 42, 44, 46, 48, 50, 51, 52],
  },
]

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'flat' }) => {
  if (trend === 'up') return <TrendingUp className="w-3 h-3" />
  if (trend === 'down') return <TrendingDown className="w-3 h-3" />
  return <Minus className="w-3 h-3" />
}

export default function KPICards() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon
        return (
          <div key={kpi.label} className="card p-4 animate-in group" style={{ animationDelay: `${idx * 60}ms` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${kpi.color} 15%, transparent)` }}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-medium">{kpi.label}</span>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold tracking-tight count-up">{kpi.value}</p>
                <div className="flex items-center gap-1 mt-1" style={{ color: kpi.color }}>
                  <TrendIcon trend={kpi.trend} />
                  <span className="text-xs font-medium">{kpi.change}</span>
                </div>
              </div>
              <Sparkline data={kpi.spark} color={kpi.color} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
