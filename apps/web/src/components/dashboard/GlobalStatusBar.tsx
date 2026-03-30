'use client'
import { Thermometer, Droplets, Wind, Moon, Snowflake, Zap, Package } from 'lucide-react'

interface StatusItem {
  label: string
  value: string
  color: 'green' | 'amber' | 'red' | 'purple'
  icon: React.ElementType
}

const colorMap = {
  green:  { text: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
  amber:  { text: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  red:    { text: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
  purple: { text: '#a78bfa', bg: 'rgba(167,139,250,0.10)' },
}

const items: StatusItem[] = [
  { label: 'Viñedo',      value: '18.3 °C',     color: 'green',  icon: Thermometer },
  { label: 'Suelo HR',    value: '62 %',        color: 'green',  icon: Droplets },
  { label: 'Bodega',      value: '14.8 °C',     color: 'green',  icon: Thermometer },
  { label: 'CO₂',         value: '412 ppm',     color: 'amber',  icon: Wind },
  { label: 'Fase lunar',  value: '☽ Creciente', color: 'purple', icon: Moon },
  { label: 'Día tipo',    value: 'FRUTO',       color: 'purple', icon: Moon },
  { label: 'Antihelada',  value: 'Standby',     color: 'green',  icon: Snowflake },
  { label: 'kWh hoy',     value: '127 kWh',     color: 'amber',  icon: Zap },
  { label: 'Barricas',    value: '284 / 320',   color: 'green',  icon: Package },
]

export default function GlobalStatusBar() {
  return (
    <div
      className="flex items-center gap-4 px-4 py-1.5 rounded-lg font-mono text-[11px] overflow-x-auto"
      style={{ background: 'rgba(24,24,27,0.80)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)' }}
    >
      {items.map((item, i) => {
        const Icon = item.icon
        const c = colorMap[item.color]
        return (
          <div key={i} className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <Icon className="w-3 h-3" style={{ color: c.text }} />
            <span className="text-zinc-500">{item.label}</span>
            <span className="font-semibold px-1 py-0.5 rounded" style={{ color: c.text, background: c.bg }}>
              {item.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}
