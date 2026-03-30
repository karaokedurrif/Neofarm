'use client'
import PageShell from '@/components/shared/PageShell'
import { Grape } from 'lucide-react'

const samples = [
  { date: '28/03', baume: 12.8, ph: 3.45, at: 6.2, color: 85, phenols: 62, anthocyanins: 310, status: 'En curso' },
  { date: '25/03', baume: 12.2, ph: 3.42, at: 6.5, color: 78, phenols: 58, anthocyanins: 285, status: 'En curso' },
  { date: '21/03', baume: 11.5, ph: 3.38, at: 6.9, color: 70, phenols: 52, anthocyanins: 255, status: 'En curso' },
  { date: '18/03', baume: 10.8, ph: 3.35, at: 7.2, color: 62, phenols: 48, anthocyanins: 230, status: 'En curso' },
  { date: '14/03', baume: 10.0, ph: 3.30, at: 7.5, color: 55, phenols: 42, anthocyanins: 200, status: 'Envero' },
]

export default function MaturationPage() {
  const latest = samples[0]
  return (
    <PageShell title="Maduración" subtitle="Control de madurez · Tempranillo Parcela Piloto">
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Grape, label: 'Baumé', value: `${latest.baume}°`, color: 'var(--accent)' },
          { label: 'pH', value: `${latest.ph}`, color: undefined },
          { label: 'Acidez total', value: `${latest.at} g/L`, color: undefined },
          { label: 'Antocianos (mg/L)', value: `${latest.anthocyanins}`, color: undefined },
        ].map((kpi, i) => (
          <div key={kpi.label} className="card p-4 text-center animate-in" style={{ animationDelay: `${i * 60}ms` }}>
            {kpi.icon && <kpi.icon className="w-6 h-6 mx-auto mb-2" style={{ color: kpi.color }} />}
            <p className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h3 className="font-medium mb-4">Curva de maduración</h3>
        <div className="h-48 flex items-end gap-4 px-4">
          {[...samples].reverse().map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs" style={{ color: 'var(--accent)' }}>{s.baume}°</span>
              <div className="w-full rounded-t" style={{ height: `${(s.baume / 15) * 100}%`, background: 'linear-gradient(to top, var(--primary), var(--accent))' }} />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.date}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Objetivo vendimia: 13.5° Baumé</div>
      </div>

      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}><h3 className="font-medium">Muestras de campo</h3></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-medium" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
              <th className="px-4 py-2.5 text-left">Fecha</th>
              <th className="px-4 py-2.5 text-left">Baumé</th>
              <th className="px-4 py-2.5 text-left">pH</th>
              <th className="px-4 py-2.5 text-left">AT (g/L)</th>
              <th className="px-4 py-2.5 text-left">Color (%)</th>
              <th className="px-4 py-2.5 text-left">Fenoles</th>
              <th className="px-4 py-2.5 text-left">Antocianos</th>
              <th className="px-4 py-2.5 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {samples.map(s => (
              <tr key={s.date} className="table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td className="px-4 py-2.5 font-mono">{s.date}</td>
                <td className="px-4 py-2.5 font-bold" style={{ color: 'var(--accent)' }}>{s.baume}°</td>
                <td className="px-4 py-2.5">{s.ph}</td>
                <td className="px-4 py-2.5">{s.at}</td>
                <td className="px-4 py-2.5">{s.color}%</td>
                <td className="px-4 py-2.5">{s.phenols}</td>
                <td className="px-4 py-2.5">{s.anthocyanins}</td>
                <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--info)' }}>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
