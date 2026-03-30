'use client'
import { usePathname } from 'next/navigation'
import { Bell, Search, Command } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/vineyard': 'Viñedo',
  '/cellar': 'Bodega',
  '/barrels': 'Barricas',
  '/iot': 'IoT Sensores',
  '/drone': 'Dron / NDVI',
  '/robot': 'Robot UGV',
  '/calendar': 'Calendario',
  '/frost': 'Antihelada',
  '/traceability': 'Trazabilidad',
  '/maturation': 'Maduración',
  '/sustainability': 'Sostenibilidad',
  '/cellar/lab': 'Laboratorio',
  '/erp': 'ERP',
  '/settings': 'Ajustes',
}

const SEARCH_ITEMS = Object.entries(ROUTE_LABELS).map(([href, label]) => ({ href, label }))

function formatDate() {
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
}

export default function TopBar() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const crumbs = pathname.split('/').filter(Boolean)
  const pageLabel = ROUTE_LABELS[pathname] || crumbs[crumbs.length - 1] || ''

  const filtered = query.trim()
    ? SEARCH_ITEMS.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : SEARCH_ITEMS

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(o => !o)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setNotifOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const notifications = [
    { id: 1, text: 'Trasiego vencido en barricas A3, B2', time: 'Hace 10 min', type: 'danger' as const },
    { id: 2, text: 'Sensor Pileta pH sin conexión', time: 'Hace 2h', type: 'warning' as const },
    { id: 3, text: 'Vuelo dron completado — NDVI actualizado', time: 'Hace 4h', type: 'info' as const },
    { id: 4, text: 'Depósito 01: FML finalizada', time: 'Ayer', type: 'success' as const },
  ]

  const typeColors = { danger: 'var(--danger)', warning: 'var(--warning)', info: 'var(--info)', success: 'var(--success)' }

  return (
    <>
      <header className="h-12 shrink-0 border-b flex items-center justify-between px-5 gap-4"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm min-w-0">
          <Link href="/dashboard" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            Hub
          </Link>
          {crumbs.length > 0 && (
            <>
              <span className="text-[var(--border)]">/</span>
              <span className="text-[var(--text)] font-medium truncate">{pageLabel}</span>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] hidden lg:block capitalize">{formatDate()}</span>

          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 h-7 px-2.5 rounded-lg text-xs transition-colors"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            <Search className="w-3 h-3" />
            <span className="hidden sm:inline">Buscar</span>
            <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] opacity-50"><Command className="w-2.5 h-2.5" />K</kbd>
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(o => !o)}
              className="relative p-1.5 rounded-lg transition-colors hover:bg-[var(--surface)]"
            >
              <Bell className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--danger)] border-2"
                style={{ borderColor: 'var(--bg-elevated)' }} />
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden shadow-2xl shadow-black/40 z-50"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-sm font-semibold">Notificaciones</p>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="px-4 py-3 flex gap-3 border-b transition-colors hover:bg-[var(--surface-hover)]"
                      style={{ borderColor: 'var(--border-subtle)' }}>
                      <span className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                        style={{ background: typeColors[n.type] }} />
                      <div className="min-w-0">
                        <p className="text-sm leading-snug">{n.text}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 text-center">
                  <Link href="/settings" className="text-xs font-medium" style={{ color: 'var(--accent)' }}
                    onClick={() => setNotifOpen(false)}>
                    Ver todo
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'var(--sidebar-active)', color: 'var(--accent)' }}>
            B
          </div>
        </div>
      </header>

      {/* Command palette overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
          onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <Search className="w-4 h-4 text-[var(--text-muted)]" />
              <input
                ref={searchRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ir a sección..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
              />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>ESC</kbd>
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => { setSearchOpen(false); setQuery('') }}
                  className="block px-4 py-2.5 text-sm hover:bg-[var(--surface-hover)] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              {filtered.length === 0 && (
                <p className="px-4 py-3 text-sm text-[var(--text-muted)]">Sin resultados</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
