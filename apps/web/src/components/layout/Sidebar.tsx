'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Leaf, Warehouse, Package, Cpu, Plane,
  Bot, Calendar, Snowflake, Route, Palette, BarChart3,
  ShoppingCart, Settings, FlaskConical, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface NavGroup {
  label?: string
  items: { label: string; href: string; icon: typeof LayoutDashboard }[]
}

const navGroups: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'CAMPO',
    items: [
      { label: 'Viñedo', href: '/vineyard', icon: Leaf },
      { label: 'Dron / NDVI', href: '/drone', icon: Plane },
      { label: 'Robot UGV', href: '/robot', icon: Bot },
      { label: 'Antihelada', href: '/frost', icon: Snowflake },
      { label: 'Maduración', href: '/maturation', icon: Palette },
    ],
  },
  {
    label: 'BODEGA',
    items: [
      { label: 'Bodega', href: '/cellar', icon: Warehouse },
      { label: 'Barricas', href: '/barrels', icon: Package },
      { label: 'Laboratorio', href: '/cellar/lab', icon: FlaskConical },
    ],
  },
  {
    label: 'GESTIÓN',
    items: [
      { label: 'IoT Sensores', href: '/iot', icon: Cpu },
      { label: 'Calendario', href: '/calendar', icon: Calendar },
      { label: 'Trazabilidad', href: '/traceability', icon: Route },
      { label: 'Sostenibilidad', href: '/sustainability', icon: BarChart3 },
      { label: 'ERP', href: '/erp', icon: ShoppingCart },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('bd-collapsed') === '1') {
      setCollapsed(true)
    }
  }, [])

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('bd-collapsed', next ? '1' : '0')
  }

  return (
    <aside className={`${collapsed ? 'w-[60px]' : 'w-[220px]'} transition-all duration-200 flex flex-col h-screen shrink-0`}
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
      {/* Header wordmark */}
      <div className="px-3 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="block min-w-0">
            {collapsed ? (
              <span className="text-base font-extrabold tracking-tight text-white">B</span>
            ) : (
              <div className="leading-tight">
                <div className="text-[17px] font-extrabold tracking-[-0.02em] text-white">
                  Bodega<span style={{ color: 'var(--accent)' }}>Data</span>
                </div>
                <div className="text-[10px] tracking-wide" style={{ color: 'var(--text-muted)' }}>by NeoFarm</div>
              </div>
            )}
          </Link>
          <button onClick={toggle}
            className="p-1 rounded-md transition-colors hover:bg-[var(--surface-hover)]"
            style={{ color: 'var(--text-muted)' }}>
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
        {!collapsed && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Bodega Demo · Sync OK</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-3">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && !collapsed && (
              <p className="px-2 pb-1 text-[10px] font-semibold tracking-wider"
                style={{ color: 'var(--text-muted)' }}>{group.label}</p>
            )}
            {group.label && collapsed && (
              <div className="mx-auto w-5 border-b mb-2" style={{ borderColor: 'var(--border)' }} />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-150 ${
                      active ? 'text-white font-medium' : 'hover:bg-[var(--surface-hover)]'
                    }`}
                    style={active
                      ? { background: 'var(--sidebar-active)', color: 'white', boxShadow: `0 0 12px -4px var(--primary-glow)` }
                      : { color: 'var(--text-secondary)' }}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {active && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings link */}
      <div className="px-2 pb-1" style={{ borderTop: '1px solid var(--border)' }}>
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-150 mt-1 ${
            pathname === '/settings' ? 'text-white font-medium' : 'hover:bg-[var(--surface-hover)]'
          }`}
          style={pathname === '/settings'
            ? { background: 'var(--sidebar-active)' }
            : { color: 'var(--text-secondary)' }}
          title={collapsed ? 'Ajustes' : undefined}
        >
          <Settings className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Ajustes</span>}
        </Link>
      </div>

      {/* Footer */}
      <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'var(--sidebar-active)', color: 'var(--accent)' }}>B</div>
          {!collapsed && (
            <div className="truncate">
              <p className="text-xs font-medium">Bodega Demo</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Ribera del Duero</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
