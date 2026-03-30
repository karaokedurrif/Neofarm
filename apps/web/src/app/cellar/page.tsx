'use client'
import PageShell from '@/components/shared/PageShell'
import { FlaskConical, Grape, Wine } from 'lucide-react'

const tanks = [
  { id: 'D01', name: 'Depósito 01', type: 'Inox 10.000L', fill: 85, temp: 14.5, status: 'Fermentando', wine: 'Tempranillo 2025' },
  { id: 'D02', name: 'Depósito 02', type: 'Inox 10.000L', fill: 0, temp: 12.0, status: 'Vacío', wine: '—' },
  { id: 'D03', name: 'Depósito 03', type: 'Inox 5.000L', fill: 100, temp: 13.2, status: 'FML', wine: 'Garnacha 2025' },
  { id: 'D04', name: 'Depósito 04', type: 'Inox 5.000L', fill: 40, temp: 16.0, status: 'Maceración', wine: 'Tempranillo 2025' },
  { id: 'D05', name: 'Depósito 05', type: 'Hormigón 8.000L', fill: 95, temp: 14.0, status: 'Estabilización', wine: 'Crianza 2024' },
  { id: 'D06', name: 'Depósito 06', type: 'Hormigón 8.000L', fill: 60, temp: 15.1, status: 'Crianza', wine: 'Reserva 2023' },
]

const statusStyles: Record<string, { color: string; bg: string }> = {
  Fermentando: { color: 'var(--danger)', bg: 'var(--danger-muted)' },
  Vacío: { color: 'var(--text-muted)', bg: 'var(--surface-hover)' },
  FML: { color: 'var(--primary-light)', bg: 'color-mix(in srgb, var(--primary-light) 15%, transparent)' },
  Maceración: { color: 'var(--warning)', bg: 'var(--warning-muted)' },
  Estabilización: { color: 'var(--info)', bg: 'var(--info-muted)' },
  Crianza: { color: 'var(--accent)', bg: 'color-mix(in srgb, var(--accent) 15%, transparent)' },
}

export default function CellarPage() {
  return (
    <PageShell title="Bodega" subtitle="Sala de depósitos · 6 unidades activas">
      <div className="grid grid-cols-3 gap-3">
        {tanks.map((t, i) => {
          const st = statusStyles[t.status]
          return (
            <div key={t.id} className="card p-4 animate-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">{t.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{t.status}</span>
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{t.type}</p>
              <div className="w-full h-2.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--surface-active)' }}>
                <div className="h-full rounded-full transition-all" style={{
                  width: `${t.fill}%`,
                  background: t.fill > 90 ? 'var(--danger)' : t.fill > 0 ? 'var(--accent)' : 'var(--border)',
                }} />
              </div>
              <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>Llenado: <span className="font-mono">{t.fill}%</span></span>
                <span>Temp: <span className="font-mono">{t.temp}°C</span></span>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--accent)' }}>{t.wine}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Grape, title: 'Recepción de Uva', sub: 'Última entrada: 15/09/2025', detail: '320 kg Tempranillo · 12.8° Baumé' },
          { icon: FlaskConical, title: 'Laboratorio', sub: 'Última analítica: 28/03/2026', detail: 'pH 3.52 · AT 5.8 g/L · SO₂ libre 28 mg/L' },
          { icon: Wine, title: 'Embotellado', sub: 'Próximo lote: 02/04/2026', detail: 'Crianza 2023 · 2.500 btl programadas' },
        ].map((c, i) => {
          const I = c.icon
          return (
            <div key={c.title} className="card p-4 animate-in" style={{ animationDelay: `${(i + 6) * 60}ms` }}>
              <div className="flex items-center gap-2 mb-2">
                <I className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <h3 className="font-medium">{c.title}</h3>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.sub}</p>
              <p className="text-sm mt-2">{c.detail}</p>
            </div>
          )
        })}
      </div>
    </PageShell>
  )
}
