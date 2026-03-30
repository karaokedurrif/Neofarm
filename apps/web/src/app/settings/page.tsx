'use client'
import { useState, useEffect } from 'react'
import PageShell from '@/components/shared/PageShell'
import { Check, PanelLeftClose, Minimize2, Globe } from 'lucide-react'

/* ─── Wine-themed color palettes ─── */
interface ThemeDef {
  key: string
  name: string
  primary500: string
  samples: string[]
  vars: Record<string, string>
}

const THEMES: ThemeDef[] = [
  {
    key: 'joven',
    name: 'Vino Joven',
    primary500: '#7C3AED',
    samples: ['#C4B5FD', '#A78BFA', '#7C3AED', '#6D28D9', '#4C1D95'],
    vars: {
      '--primary': '#7C3AED',
      '--primary-light': '#A78BFA',
      '--accent': '#C084FC',
      '--accent-light': '#E9D5FF',
      '--sidebar-active': '#6D28D9',
    },
  },
  {
    key: 'crianza',
    name: 'Crianza',
    primary500: '#991B1B',
    samples: ['#FCA5A5', '#EF4444', '#DC2626', '#991B1B', '#7F1D1D'],
    vars: {
      '--primary': '#991B1B',
      '--primary-light': '#B91C1C',
      '--accent': '#D4A843',
      '--accent-light': '#F5DEB3',
      '--sidebar-active': '#7F1D1D',
    },
  },
  {
    key: 'reserva',
    name: 'Reserva',
    primary500: '#92400E',
    samples: ['#FCD34D', '#D97706', '#B45309', '#92400E', '#78350F'],
    vars: {
      '--primary': '#92400E',
      '--primary-light': '#B45309',
      '--accent': '#D97706',
      '--accent-light': '#FCD34D',
      '--sidebar-active': '#78350F',
    },
  },
]

const STORAGE_KEY = 'bd-theme'

function applyTheme(key: string) {
  const theme = THEMES.find((t) => t.key === key)
  if (!theme) return
  localStorage.setItem(STORAGE_KEY, key)
  document.documentElement.setAttribute('data-theme', key)
  Object.entries(theme.vars).forEach(([prop, val]) => {
    document.documentElement.style.setProperty(prop, val)
  })
}

export default function SettingsPage() {
  const [activeTheme, setActiveTheme] = useState('crianza')
  const [compactMode, setCompactMode] = useState(false)
  const [collapsedDefault, setCollapsedDefault] = useState(false)
  const [lang, setLang] = useState('es')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && THEMES.find((t) => t.key === saved)) {
      setActiveTheme(saved)
      applyTheme(saved)
    }
    setCompactMode(localStorage.getItem('bd-compact') === '1')
    setCollapsedDefault(localStorage.getItem('bd-collapsed') === '1')
    setLang(localStorage.getItem('bd-lang') || 'es')
  }, [])

  const handleTheme = (key: string) => {
    setActiveTheme(key)
    applyTheme(key)
  }

  return (
    <PageShell title="Configuración" subtitle="">
      {/* ── Tema de color ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Tema de color</h2>
        <div className="grid grid-cols-3 gap-4">
          {THEMES.map((t) => {
            const active = activeTheme === t.key
            return (
              <button
                key={t.key}
                onClick={() => handleTheme(t.key)}
                className="relative card p-5 text-left"
                style={{ borderColor: active ? 'rgba(255,255,255,0.4)' : undefined, boxShadow: active ? '0 0 0 1px rgba(255,255,255,0.2)' : undefined }}
              >
                {active && (
                  <span className="absolute top-3 right-3 text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Check className="w-3 h-3" /> Activo
                  </span>
                )}
                <div
                  className="w-6 h-6 rounded-full mb-3 ring-2 ring-offset-2"
                  style={{
                    backgroundColor: t.primary500,
                    ringColor: active ? t.primary500 : 'transparent',
                    '--tw-ring-offset-color': 'var(--surface)',
                  } as React.CSSProperties}
                />
                <p className="font-semibold text-sm mb-1">{t.name}</p>
                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{t.primary500}</p>

                {/* Palette preview */}
                <div className="flex gap-1 mt-3">
                  {t.samples.map((c, i) => (
                    <div key={i} className="h-2 flex-1 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Otros ajustes ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Otros ajustes</h2>
        <div className="space-y-3">
          {/* Compact mode */}
          <div className="card px-5 py-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="flex items-center gap-3">
              <Minimize2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <div>
                <p className="text-sm font-medium">Modo compacto</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Reduce padding y font-size en cards</p>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !compactMode
                setCompactMode(next)
                localStorage.setItem('bd-compact', next ? '1' : '0')
              }}
              className={`relative w-10 h-5 rounded-full transition-colors ${compactMode ? 'bg-[var(--primary,#991B1B)]' : 'bg-[#333]'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${compactMode ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Sidebar collapsed */}
          <div className="card px-5 py-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="flex items-center gap-3">
              <PanelLeftClose className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <div>
                <p className="text-sm font-medium">Sidebar colapsado por defecto</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Solo muestra iconos en la barra lateral</p>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !collapsedDefault
                setCollapsedDefault(next)
                localStorage.setItem('bd-collapsed', next ? '1' : '0')
              }}
              className={`relative w-10 h-5 rounded-full transition-colors ${collapsedDefault ? 'bg-[var(--primary,#991B1B)]' : 'bg-[#333]'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${collapsedDefault ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Language */}
          <div className="card px-5 py-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <div>
                <p className="text-sm font-medium">Idioma</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Selecciona el idioma de la interfaz</p>
              </div>
            </div>
            <select
              value={lang}
              onChange={(e) => {
                setLang(e.target.value)
                localStorage.setItem('bd-lang', e.target.value)
              }}
              className="rounded-lg px-3 py-1.5 text-sm outline-none"
              style={{ background: 'var(--surface-active)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
