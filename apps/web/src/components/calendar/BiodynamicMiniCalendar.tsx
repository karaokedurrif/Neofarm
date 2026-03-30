'use client'

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

type DayType = 'raíz' | 'hoja' | 'flor' | 'fruto'

const dayTypeColors: Record<DayType, string> = {
  raíz:  '#a16207',
  hoja:  '#16a34a',
  flor:  '#ec4899',
  fruto: '#7c3aed',
}

const lunarPhases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘']

/* Simplified biodynamic calendar — deterministic seed per day */
function getDayType(day: number, month: number): DayType {
  const types: DayType[] = ['raíz', 'hoja', 'flor', 'fruto']
  return types[(day + month * 3) % 4]
}

function getLunarPhase(day: number): string {
  return lunarPhases[day % 8]
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1 // Monday=0
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const recommendations: Record<DayType, string> = {
  raíz:  'Labores de suelo y raíces. Ideal para abonar y transplante.',
  hoja:  'Poda y trabajo con hojas. Bueno para riego.',
  flor:  'Evitar intervenciones. Día de reposo floral.',
  fruto: 'Cosecha y vendimia. Día ideal para recoger frutos.',
}

export default function BiodynamicMiniCalendar() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)
  const todayType = getDayType(today, month)

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="card p-4 animate-in" style={{ animationDelay: '480ms' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{getLunarPhase(today)}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Biodinámica</span>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{MONTH_NAMES[month]} {year}</span>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-center text-[9px] font-medium text-[var(--text-muted)]">{w}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="h-6" />
          const type = getDayType(day, month)
          const isToday = day === today
          return (
            <div
              key={i}
              className="h-6 flex items-center justify-center rounded relative text-[10px] font-mono"
              style={{
                background: isToday ? 'var(--sidebar-active)' : undefined,
                color: isToday ? '#fff' : 'var(--text-secondary)',
                fontWeight: isToday ? 700 : 400,
              }}
            >
              {day}
              <span
                className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full"
                style={{ background: dayTypeColors[type], opacity: 0.7 }}
              />
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {(Object.entries(dayTypeColors) as [DayType, string][]).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1 text-[9px] text-[var(--text-muted)]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            {type}
          </span>
        ))}
      </div>

      {/* Today panel */}
      <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: dayTypeColors[todayType] }}>
            Hoy — Día {todayType}
          </span>
          <span className="text-xs">{getLunarPhase(today)}</span>
        </div>
        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
          {recommendations[todayType]}
        </p>
      </div>
    </div>
  )
}
