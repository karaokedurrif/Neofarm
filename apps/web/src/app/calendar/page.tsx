'use client'
import PageShell from '@/components/shared/PageShell'
import { CalendarDays } from 'lucide-react'

const events = [
  { date: '29/03', title: 'Poda en verde F01–F05', type: 'vineyard', color: '#22C55E' },
  { date: '30/03', title: 'Trasiego barrica A3', type: 'cellar', color: '#EF4444' },
  { date: '01/04', title: 'Vuelo NDVI programado', type: 'drone', color: '#3B82F6' },
  { date: '01/04', title: 'Misión robot F01–F20', type: 'robot', color: '#8B5CF6' },
  { date: '02/04', title: 'Embotellado Crianza 2023', type: 'cellar', color: '#D4A843' },
  { date: '05/04', title: 'Analítica depósito D01', type: 'lab', color: '#F59E0B' },
  { date: '07/04', title: 'Tratamiento fitosanitario', type: 'vineyard', color: '#22C55E' },
  { date: '10/04', title: 'Revisión sensores IoT', type: 'iot', color: '#06B6D4' },
  { date: '15/04', title: 'Control maduración', type: 'vineyard', color: '#22C55E' },
  { date: '20/04', title: 'Auditoría trazabilidad', type: 'traceability', color: '#EC4899' },
]

const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function CalendarPage() {
  return (
    <PageShell title="Calendario" subtitle="Abril 2026 · Vista general de tareas">
      <div className="grid grid-cols-7 gap-2">
        {days.map(d => (
          <div key={d} className="text-center text-xs text-[#9CA3AF] py-2">{d}</div>
        ))}
        {Array.from({ length: 2 }, (_, i) => (
          <div key={`empty-${i}`} className="h-24 bg-[#111] rounded-lg" />
        ))}
        {Array.from({ length: 30 }, (_, i) => {
          const day = i + 1
          const dayEvents = events.filter(e => parseInt(e.date.split('/')[0]) === day)
          return (
            <div key={day} className="h-24 bg-[#1A1A1A] border border-[#333] rounded-lg p-2 hover:border-[#D4A843] transition-colors">
              <p className="text-xs text-[#9CA3AF] mb-1">{day}</p>
              <div className="space-y-1">
                {dayEvents.map((e, j) => (
                  <div key={j} className="text-[10px] px-1 py-0.5 rounded truncate" style={{ background: e.color + '22', color: e.color }}>
                    {e.title}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {Array.from({ length: 3 }, (_, i) => (
          <div key={`end-${i}`} className="h-24 bg-[#111] rounded-lg" />
        ))}
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-[#D4A843]" /> Próximos eventos</h3>
        <div className="space-y-2">
          {events.map((e, i) => (
            <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-[#222] last:border-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: e.color }} />
              <span className="text-xs text-[#9CA3AF] font-mono w-12">{e.date}</span>
              <span>{e.title}</span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
