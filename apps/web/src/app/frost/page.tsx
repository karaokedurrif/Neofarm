'use client'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import PageShell from '@/components/shared/PageShell'
import { Snowflake, Thermometer, Wind, AlertTriangle, ShieldCheck } from 'lucide-react'

const FrostVisualization3D = dynamic(
  () => import('@/components/frost/FrostVisualization3D'),
  { ssr: false, loading: () => (
    <div className="h-[420px] rounded-xl flex items-center justify-center" style={{ background: 'var(--surface)' }}>
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        <p className="text-xs text-[var(--text-muted)]">Cargando visualización 3D…</p>
      </div>
    </div>
  )}
)

const zones = [
  { name: 'Zona NE', risk: 'Bajo', temp: 3.2, minForecast: 1.5, aspersores: true, status: 'Standby' },
  { name: 'Zona NO', risk: 'Medio', temp: 1.8, minForecast: -0.5, aspersores: true, status: 'Alerta' },
  { name: 'Zona SE', risk: 'Alto', temp: 0.5, minForecast: -2.1, aspersores: true, status: 'Activo' },
  { name: 'Zona SO', risk: 'Medio', temp: 1.2, minForecast: -0.8, aspersores: true, status: 'Alerta' },
  { name: 'Centro', risk: 'Bajo', temp: 2.5, minForecast: 0.8, aspersores: false, status: 'Standby' },
]

const riskStyles: Record<string, { color: string; bg: string }> = {
  Bajo: { color: 'var(--success)', bg: 'var(--success-muted)' },
  Medio: { color: 'var(--warning)', bg: 'var(--warning-muted)' },
  Alto: { color: 'var(--danger)', bg: 'var(--danger-muted)' },
}

const statusStyles: Record<string, { color: string; bg: string }> = {
  Standby: { color: 'var(--text-muted)', bg: 'var(--surface-hover)' },
  Alerta: { color: 'var(--warning)', bg: 'var(--warning-muted)' },
  Activo: { color: 'var(--danger)', bg: 'var(--danger-muted)' },
}

const history = [
  { date: '15/03/2026', minTemp: -1.8, aspersores: true, duration: '3h 20min', damage: 'Sin daño' },
  { date: '22/02/2026', minTemp: -3.2, aspersores: true, duration: '5h 10min', damage: 'Daño leve F09' },
  { date: '10/01/2026', minTemp: -0.5, aspersores: false, duration: '—', damage: 'Sin daño' },
]

export default function FrostPage() {
  return (
    <PageShell title="Antihelada" subtitle="Sistema de protección activa · 4 zonas con aspersores">
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Snowflake, label: 'Min prevista (mañana)', value: '-2.1°C', color: 'var(--danger)' },
          { icon: Thermometer, label: 'Temp media actual', value: '1.8°C', color: 'var(--info)' },
          { icon: Wind, label: 'Viento', value: '5 km/h', color: 'var(--text-muted)' },
          { icon: AlertTriangle, label: 'Zona activa', value: '1', color: 'var(--warning)' },
        ].map((kpi, i) => {
          const I = kpi.icon
          return (
            <div key={kpi.label} className="card p-4 text-center animate-in" style={{ animationDelay: `${i * 60}ms` }}>
              <I className="w-5 h-5 mx-auto mb-2" style={{ color: kpi.color }} />
              <p className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
            </div>
          )
        })}
      </div>

      {/* 3D Frost Visualization */}
      <div className="card-flat p-4 relative">
        <Suspense fallback={null}>
          <FrostVisualization3D />
        </Suspense>
      </div>

      {/* 72h Prediction Chart */}
      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <Thermometer className="w-4 h-4" style={{ color: 'var(--info)' }} />
          <h3 className="font-medium">Predicción 72h</h3>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-end gap-1 h-24">
            {[3.2, 2.8, 1.5, 0.8, -0.2, -1.5, -2.1, -1.8, -0.5, 0.3, 1.2, 2.0, 2.8, 3.5, 4.0, 3.8, 3.2, 2.5, 1.8, 1.0, 0.2, -0.8, -1.2, -0.5].map((t, i) => {
              const h = Math.max(4, ((t + 3) / 7) * 96)
              const color = t < 0 ? 'var(--danger)' : t < 2 ? 'var(--warning)' : 'var(--success)'
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                  <div className="w-full rounded-t" style={{ height: h, background: color, opacity: 0.7, minHeight: 4 }} />
                  <span className="text-[8px] font-mono text-[var(--text-muted)]">{i * 3}h</span>
                  <div className="absolute -top-5 hidden group-hover:block text-[9px] font-mono px-1 py-0.5 rounded" style={{ background: 'var(--surface)', color, border: '1px solid var(--border)' }}>
                    {t.toFixed(1)}°
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--danger)' }} /> &lt; 0°C Helada</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--warning)' }} /> 0–2°C Riesgo</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} /> &gt; 2°C Seguro</span>
          </div>
        </div>
      </div>

      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <ShieldCheck className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <h3 className="font-medium">Zonas de protección</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-medium" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
              <th className="px-4 py-2.5 text-left">Zona</th>
              <th className="px-4 py-2.5 text-left">Riesgo</th>
              <th className="px-4 py-2.5 text-left">Temp actual</th>
              <th className="px-4 py-2.5 text-left">Min prevista</th>
              <th className="px-4 py-2.5 text-left">Aspersores</th>
              <th className="px-4 py-2.5 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {zones.map(z => (
              <tr key={z.name} className="table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td className="px-4 py-2.5 font-medium">{z.name}</td>
                <td className="px-4 py-2.5">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: riskStyles[z.risk].bg, color: riskStyles[z.risk].color }}>{z.risk}</span>
                </td>
                <td className="px-4 py-2.5 font-mono">{z.temp}°C</td>
                <td className="px-4 py-2.5">
                  <span className="font-mono" style={{ color: z.minForecast < 0 ? 'var(--danger)' : undefined, fontWeight: z.minForecast < 0 ? 700 : 400 }}>{z.minForecast}°C</span>
                </td>
                <td className="px-4 py-2.5">{z.aspersores ? <span style={{ color: 'var(--success)' }}>Sí</span> : 'No'}</td>
                <td className="px-4 py-2.5">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: statusStyles[z.status].bg, color: statusStyles[z.status].color }}>{z.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}><h3 className="font-medium">Historial de heladas</h3></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-medium" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
              <th className="px-4 py-2.5 text-left">Fecha</th>
              <th className="px-4 py-2.5 text-left">Temp min</th>
              <th className="px-4 py-2.5 text-left">Aspersores</th>
              <th className="px-4 py-2.5 text-left">Duración</th>
              <th className="px-4 py-2.5 text-left">Daño</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h.date} className="table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td className="px-4 py-2.5 font-mono text-xs">{h.date}</td>
                <td className="px-4 py-2.5 font-mono" style={{ color: 'var(--danger)' }}>{h.minTemp}°C</td>
                <td className="px-4 py-2.5">{h.aspersores ? <span style={{ color: 'var(--success)' }}>Sí</span> : 'No'}</td>
                <td className="px-4 py-2.5">{h.duration}</td>
                <td className="px-4 py-2.5">{h.damage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
