'use client'
import { Leaf, Droplets, Thermometer, BarChart3 } from 'lucide-react'

const kpis = [
  { label: 'Rendimiento Est.', value: '6,200 kg/ha', change: '+12%', icon: Leaf, color: '#22C55E' },
  { label: 'Eficiencia Hídrica', value: '87%', change: '+5%', icon: Droplets, color: '#60A5FA' },
  { label: 'Temp. Bodega', value: '15.2°C', change: 'Óptima', icon: Thermometer, color: '#D4A843' },
  { label: 'Barricas Activas', value: '52 / 60', change: '87%', icon: BarChart3, color: '#7C3AED' },
]

export default function KPICards() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <div key={kpi.label} className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#9CA3AF] uppercase tracking-wide">{kpi.label}</span>
              <Icon className="w-4 h-4" style={{ color: kpi.color }} />
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs mt-1" style={{ color: kpi.color }}>{kpi.change}</p>
          </div>
        )
      })}
    </div>
  )
}
