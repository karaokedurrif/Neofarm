'use client'
import PageShell from '@/components/shared/PageShell'
import { Leaf, Droplets, Zap, Recycle } from 'lucide-react'

const metrics = [
  { label: 'Huella carbono', value: '0.42 kg CO₂/btl', target: '< 0.50', icon: Leaf },
  { label: 'Consumo agua', value: '3.2 L/kg uva', target: '< 4.0', icon: Droplets },
  { label: 'Energía renovable', value: '68%', target: '> 60%', icon: Zap },
  { label: 'Residuos reciclados', value: '92%', target: '> 85%', icon: Recycle },
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
      <div className="grid grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <div key={m.label} className="card p-4 animate-in" style={{ animationDelay: `${i * 60}ms` }}>
            <m.icon className="w-5 h-5 mb-2" style={{ color: 'var(--success)' }} />
            <p className="text-lg font-bold">{m.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--success)' }}>Objetivo: {m.target}</p>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h3 className="font-medium mb-4">Resumen de impacto anual</h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold" style={{ color: 'var(--success)' }}>-1.000</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>kg CO₂ evitados</p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ color: 'var(--info)' }}>-15%</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Consumo agua vs 2024</p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>92%</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tasa reciclaje</p>
          </div>
        </div>
      </div>

      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}><h3 className="font-medium">Acciones de sostenibilidad</h3></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-medium" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
              <th className="px-4 py-2.5 text-left">Área</th>
              <th className="px-4 py-2.5 text-left">Acción</th>
              <th className="px-4 py-2.5 text-left">Estado</th>
              <th className="px-4 py-2.5 text-left">Impacto</th>
              <th className="px-4 py-2.5 text-left">CO₂ reducido</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((a, i) => (
              <tr key={i} className="table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td className="px-4 py-2.5">{a.area}</td>
                <td className="px-4 py-2.5">{a.action}</td>
                <td className="px-4 py-2.5">
                  <span style={{ color: a.status === 'Activo' ? 'var(--success)' : 'var(--info)' }}>{a.status}</span>
                </td>
                <td className="px-4 py-2.5">{a.impact}</td>
                <td className="px-4 py-2.5" style={{ color: 'var(--success)' }}>{a.co2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
