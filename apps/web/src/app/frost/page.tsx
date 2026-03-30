'use client'
import PageShell from '@/components/shared/PageShell'
import { Snowflake, Thermometer, Wind, AlertTriangle, ShieldCheck } from 'lucide-react'

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
