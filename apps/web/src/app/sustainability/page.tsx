'use client'
import { useState } from 'react'
import PageShell from '@/components/shared/PageShell'
import { Leaf, Droplets, Zap, Recycle, Download, TreePine, BarChart3 } from 'lucide-react'

const metrics = [
  { label: 'CO₂ / botella', value: '0.42 kg', target: '< 0.50', icon: Leaf, color: 'var(--success)' },
  { label: 'Agua / botella', value: '2.1 L', target: '< 3.0', icon: Droplets, color: 'var(--info)' },
  { label: 'kWh / botella', value: '0.38', target: '< 0.50', icon: Zap, color: 'var(--warning)' },
  { label: 'Reciclaje', value: '92%', target: '> 85%', icon: Recycle, color: 'var(--accent)' },
  { label: 'Índice SWfCP', value: '87/100', target: '> 80', icon: BarChart3, color: 'var(--success)' },
  { label: 'CO₂ secuestrado', value: '2.4 t/año', target: '> 2.0', icon: TreePine, color: 'var(--success)' },
]

/* CO2 Alcance breakdown */
const co2Breakdown = [
  { scope: 'Alcance 1', label: 'Emisiones directas', value: 0.12, pct: 29, color: '#ef4444' },
  { scope: 'Alcance 2', label: 'Electricidad', value: 0.08, pct: 19, color: '#f59e0b' },
  { scope: 'Alcance 3', label: 'Cadena de valor', value: 0.22, pct: 52, color: '#6366f1' },
]

/* Monthly CO2 evolution data */
const monthlyData = [
  { month: 'Ene', co2: 0.52, target: 0.50 },
  { month: 'Feb', co2: 0.49, target: 0.50 },
  { month: 'Mar', co2: 0.48, target: 0.50 },
  { month: 'Abr', co2: 0.46, target: 0.50 },
  { month: 'May', co2: 0.45, target: 0.50 },
  { month: 'Jun', co2: 0.44, target: 0.48 },
  { month: 'Jul', co2: 0.43, target: 0.48 },
  { month: 'Ago', co2: 0.42, target: 0.48 },
  { month: 'Sep', co2: 0.41, target: 0.45 },
  { month: 'Oct', co2: 0.40, target: 0.45 },
  { month: 'Nov', co2: 0.39, target: 0.45 },
  { month: 'Dic', co2: 0.38, target: 0.45 },
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
    <PageShell title="Sostenibilidad" subtitle="Indicadores SWfCP · Campaña 2025/2026">
      {/* Export button */}
      <div className="flex justify-end">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
          style={{ background: 'var(--sidebar-active)', color: '#fff' }}
          onClick={() => {
            const data = {
              campaign: '2025/2026',
              metrics: metrics.map(m => ({ label: m.label, value: m.value, target: m.target })),
              co2Breakdown,
              monthlyData,
              actions,
              generatedAt: new Date().toISOString(),
            }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `swfcp-report-${new Date().toISOString().slice(0,10)}.json`
            a.click()
            URL.revokeObjectURL(url)
          }}
        >
          <Download className="w-3.5 h-3.5" />
          Exportar informe SWfCP
        </button>
      </div>

      {/* SWfCP KPIs */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {metrics.map((m, i) => (
          <div key={m.label} className="card p-4 animate-in" style={{ animationDelay: `${i * 60}ms` }}>
            <m.icon className="w-5 h-5 mb-2" style={{ color: m.color }} />
            <p className="text-lg font-bold">{m.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--success)' }}>Obj: {m.target}</p>
          </div>
        ))}
      </div>

      {/* CO2 Alcance Breakdown + Monthly Chart side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CO2 Breakdown by Scope */}
        <div className="card-flat p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Leaf className="w-4 h-4" style={{ color: 'var(--success)' }} />
            Desglose CO₂ / botella por Alcance
          </h3>
          <div className="space-y-3">
            {co2Breakdown.map(s => (
              <div key={s.scope}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{s.scope} <span className="text-[var(--text-muted)]">— {s.label}</span></span>
                  <span className="font-mono font-bold">{s.value} kg <span className="text-[var(--text-muted)]">({s.pct}%)</span></span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-hover)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
            <div className="pt-2 mt-2 flex items-center justify-between text-xs font-medium" style={{ borderTop: '1px solid var(--border)' }}>
              <span>Total</span>
              <span className="font-mono font-bold">0.42 kg CO₂/btl</span>
            </div>
          </div>
        </div>

        {/* Monthly Evolution Chart */}
        <div className="card-flat p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            Evolución mensual CO₂/btl
          </h3>
          <div className="flex items-end gap-1 h-32">
            {monthlyData.map((d, i) => {
              const maxVal = 0.55
              const h = (d.co2 / maxVal) * 128
              const targetH = (d.target / maxVal) * 128
              const onTarget = d.co2 <= d.target
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5 relative group">
                  <div className="w-full rounded-t relative" style={{ height: h, background: onTarget ? 'var(--success)' : 'var(--warning)', opacity: 0.7 }}>
                    {/* Target line */}
                    <div className="absolute w-full" style={{ bottom: targetH - h + h, height: 1, background: 'var(--danger)', opacity: 0.5 }} />
                  </div>
                  <span className="text-[8px] font-mono text-[var(--text-muted)]">{d.month}</span>
                  <div className="absolute -top-6 hidden group-hover:block text-[9px] font-mono px-1 py-0.5 rounded z-10 whitespace-nowrap" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    {d.co2} kg
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} /> En objetivo</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--warning)' }} /> Sobre objetivo</span>
            <span className="flex items-center gap-1"><span className="w-6 h-px" style={{ background: 'var(--danger)' }} /> Objetivo</span>
          </div>
        </div>
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
