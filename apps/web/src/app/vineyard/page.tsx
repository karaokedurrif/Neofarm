'use client'
import PageShell from '@/components/shared/PageShell'
import { Leaf, Thermometer, Droplets, MapPin, TrendingUp } from 'lucide-react'

const sensors = [
  { id: 1, name: 'Sensor T/HR Campo', type: 'Temp + Humedad', value: '19°C / 68%', status: 'ok', battery: 87, color: 'var(--info)' },
  { id: 2, name: 'Sonda Suelo 30cm', type: 'Humedad suelo', value: '57%', status: 'ok', battery: 92, color: 'var(--success)' },
  { id: 3, name: 'Hoja Sensor', type: 'Humectación foliar', value: 'Seco', status: 'ok', battery: 75, color: 'var(--warning)' },
  { id: 4, name: 'Estación Meteo', type: 'Multiparámetro', value: '19°C UV4 12km/h', status: 'ok', battery: 100, color: 'var(--accent)' },
]

const rows = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1, label: `F${String(i + 1).padStart(2, '0')}`,
  ndvi: (0.5 + Math.sin(i * 0.7) * 0.2 + 0.15).toFixed(2),
  phenology: ['Brotación', 'Floración', 'Envero', 'Maduración'][i % 4],
  stress: i % 5 === 3 ? 'Medio' : 'Bajo',
}))

export default function VineyardPage() {
  return (
    <PageShell title="Viñedo" subtitle="Parcela Piloto 1ha — Tempranillo · Espaldera · Ribera del Duero">
      {/* Sensor cards */}
      <div className="grid grid-cols-4 gap-3">
        {sensors.map((s, idx) => (
          <div key={s.id} className="card p-4 animate-in" style={{ animationDelay: `${idx * 60}ms` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-muted)] font-medium">{s.type}</span>
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />
            </div>
            <p className="font-bold text-lg">{s.value}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[var(--text-muted)]">{s.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  background: s.battery < 80 ? 'var(--warning-muted)' : 'var(--surface-hover)',
                  color: s.battery < 80 ? 'var(--warning)' : 'var(--text-muted)',
                }}>
                {s.battery}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* NDVI average bar */}
      <div className="card-flat p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--success)' }} />
          <span className="text-sm font-semibold">NDVI medio: 0.72</span>
        </div>
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-hover)' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: '72%', background: 'var(--success)' }} />
        </div>
        <span className="text-xs font-mono text-[var(--text-muted)]">Último vuelo: 25/03/2026</span>
      </div>

      {/* Table */}
      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-medium flex items-center gap-2">
            <Leaf className="w-4 h-4" style={{ color: 'var(--success)' }} /> Filas del viñedo
          </h3>
          <span className="text-xs text-[var(--text-muted)]">20 filas</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
              <th className="px-4 py-2.5 text-left font-medium">Fila</th>
              <th className="px-4 py-2.5 text-left font-medium">NDVI</th>
              <th className="px-4 py-2.5 text-left font-medium">Fenología</th>
              <th className="px-4 py-2.5 text-left font-medium">Estrés hídrico</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td className="px-4 py-2.5 font-mono text-xs">{r.label}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-hover)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${parseFloat(r.ndvi) * 100}%`,
                        background: parseFloat(r.ndvi) > 0.7 ? 'var(--success)' : parseFloat(r.ndvi) > 0.5 ? 'var(--warning)' : 'var(--danger)',
                      }} />
                    </div>
                    <span className="font-mono text-xs">{r.ndvi}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs">{r.phenology}</td>
                <td className="px-4 py-2.5">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{
                    background: r.stress === 'Bajo' ? 'var(--success-muted)' : 'var(--warning-muted)',
                    color: r.stress === 'Bajo' ? 'var(--success)' : 'var(--warning)',
                  }}>{r.stress}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
