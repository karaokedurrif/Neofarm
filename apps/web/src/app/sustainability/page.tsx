'use client'
import PageShell from '@/components/shared/PageShell'
import { Leaf, Droplets, Zap, Recycle } from 'lucide-react'

const metrics = [
  { label: 'Huella carbono', value: '0.42 kg CO₂/btl', target: '< 0.50', status: 'ok', icon: Leaf },
  { label: 'Consumo agua', value: '3.2 L/kg uva', target: '< 4.0', status: 'ok', icon: Droplets },
  { label: 'Energía renovable', value: '68%', target: '> 60%', status: 'ok', icon: Zap },
  { label: 'Residuos reciclados', value: '92%', target: '> 85%', status: 'ok', icon: Recycle },
]

const actions = [
  { area: 'Viñedo', action: 'Cubierta vegetal entre filas', status: 'Activo', impact: 'Alta', co2: '-120 kg/año' },
  { area: 'Viñedo', action: 'Riego deficitario controlado', status: 'Activo', impact: 'Alta', co2: '-80 kg/año' },
  { area: 'Bodega', action: 'Panel solar 15kW', status: 'Activo', impact: 'Alta', co2: '-450 kg/año' },
  { area: 'Bodega', action: 'Recuperación CO₂ fermentación', status: 'Planificado', impact: 'Media', co2: '-60 kg/año' },
  { area: 'Logística', action: 'Botella ligera 360g', status: 'Activo', impact: 'Media', co2: '-200 kg/año' },
  { area: 'Logística', action: 'Embalaje reciclado 100%', status: 'Activo', impact: 'Media', co2: '-90 kg/año' },
]

export default function SustainabilityPage() {
  return (
    <PageShell title="Sostenibilidad" subtitle="Indicadores ambientales · Campaña 2025/2026">
      <div className="grid grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
            <m.icon className="w-5 h-5 text-[#22C55E] mb-2" />
            <p className="text-lg font-bold">{m.value}</p>
            <p className="text-xs text-[#9CA3AF]">{m.label}</p>
            <p className="text-xs text-[#4ADE80] mt-1">Objetivo: {m.target}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
        <h3 className="font-medium mb-4">Resumen de impacto anual</h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-[#22C55E]">-1.000</p>
            <p className="text-xs text-[#9CA3AF]">kg CO₂ evitados</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#3B82F6]">-15%</p>
            <p className="text-xs text-[#9CA3AF]">Consumo agua vs 2024</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#D4A843]">92%</p>
            <p className="text-xs text-[#9CA3AF]">Tasa reciclaje</p>
          </div>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#333]"><h3 className="font-medium">Acciones de sostenibilidad</h3></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#9CA3AF] text-xs border-b border-[#333]">
              <th className="px-4 py-2 text-left">Área</th>
              <th className="px-4 py-2 text-left">Acción</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Impacto</th>
              <th className="px-4 py-2 text-left">CO₂ reducido</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((a, i) => (
              <tr key={i} className="border-b border-[#222] hover:bg-[#262626]">
                <td className="px-4 py-2">{a.area}</td>
                <td className="px-4 py-2">{a.action}</td>
                <td className="px-4 py-2">
                  <span className={a.status === 'Activo' ? 'text-[#4ADE80]' : 'text-[#3B82F6]'}>{a.status}</span>
                </td>
                <td className="px-4 py-2">{a.impact}</td>
                <td className="px-4 py-2 text-[#22C55E]">{a.co2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
