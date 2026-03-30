'use client'
import PageShell from '@/components/shared/PageShell'
import { CalendarDays } from 'lucide-react'

const typeStyles: Record<string, { color: string; bg: string }> = {
  vineyard: { color: 'var(--success)', bg: 'var(--success-muted)' },
  cellar: { color: 'var(--danger)', bg: 'var(--danger-muted)' },
  drone: { color: 'var(--info)', bg: 'var(--info-muted)' },
  robot: { color: 'var(--primary-light)', bg: 'color-mix(in srgb, var(--primary-light) 15%, transparent)' },
  lab: { color: 'var(--warning)', bg: 'var(--warning-muted)' },
  iot: { color: '#06B6D4', bg: 'color-mix(in srgb, #06B6D4 15%, transparent)' },
  traceability: { color: '#EC4899', bg: 'color-mix(in srgb, #EC4899 15%, transparent)' },
}

const events = [
  { date: '29/03', title: 'Poda en verde F01–F05', type: 'vineyard' },
  { date: '30/03', title: 'Trasiego barrica A3', type: 'cellar' },
  { date: '01/04', title: 'Vuelo NDVI programado', type: 'drone' },
  { date: '01/04', title: 'Misión robot F01–F20', type: 'robot' },
  { date: '02/04', title: 'Embotellado Crianza 2023', type: 'cellar' },
  { date: '05/04', title: 'Analítica depósito D01', type: 'lab' },
  { date: '07/04', title: 'Tratamiento fitosanitario', type: 'vineyard' },
  { date: '10/04', title: 'Revisión sensores IoT', type: 'iot' },
  { date: '15/04', title: 'Control maduración', type: 'vineyard' },
  { date: '20/04', title: 'Auditoría trazabilidad', type: 'traceability' },
]

const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function CalendarPage() {
  return (
    <PageShell title="Calendario" subtitle="Abril 2026 · Vista general de tareas">
      <div className="grid grid-cols-7 gap-2">
        {days.map(d => (
          <div key={d} className="text-center text-xs py-2" style={{ color: 'var(--text-muted)' }}>{d}</div>
        ))}
        {Array.from({ length: 2 }, (_, i) => (
          <div key={`empty-${i}`} className="h-24 rounded-lg" style={{ background: 'var(--bg)' }} />
        ))}
        {Array.from({ length: 30 }, (_, i) => {
          const day = i + 1
          const dayEvents = events.filter(e => parseInt(e.date.split('/')[0]) === day)
          return (
            <div key={day} className="card h-24 !rounded-lg p-2" style={{ padding: '0.5rem' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{day}</p>
              <div className="space-y-1">
                {dayEvents.map((e, j) => {
                  const st = typeStyles[e.type] || typeStyles.vineyard
                  return (
                    <div key={j} className="text-[10px] px-1 py-0.5 rounded truncate" style={{ background: st.bg, color: st.color }}>
                      {e.title}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {Array.from({ length: 3 }, (_, i) => (
          <div key={`end-${i}`} className="h-24 rounded-lg" style={{ background: 'var(--bg)' }} />
        ))}
      </div>

      <div className="card p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2"><CalendarDays className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Próximos eventos</h3>
        <div className="space-y-0">
          {events.map((e, i) => {
            const st = typeStyles[e.type] || typeStyles.vineyard
            return (
              <div key={i} className="flex items-center gap-3 text-sm py-2.5" style={{ borderBottom: i < events.length - 1 ? '1px solid var(--border-subtle)' : undefined }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: st.color }} />
                <span className="text-xs font-mono w-12" style={{ color: 'var(--text-muted)' }}>{e.date}</span>
                <span>{e.title}</span>
              </div>
            )
          })}
        </div>
      </div>
    </PageShell>
  )
}
