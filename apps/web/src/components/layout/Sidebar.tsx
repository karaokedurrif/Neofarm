'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Leaf, Warehouse, Package, Cpu, Plane,
  Bot, Calendar, Snowflake, Route, Palette, BarChart3,
  ShoppingCart, Settings, FlaskConical, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useState } from 'react'

const nav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Viñedo', href: '/vineyard', icon: Leaf },
  { label: 'Bodega', href: '/cellar', icon: Warehouse },
  { label: 'Barricas', href: '/barrels', icon: Package },
  { label: 'IoT Sensores', href: '/iot', icon: Cpu },
  { label: 'Dron / NDVI', href: '/drone', icon: Plane },
  { label: 'Robot UGV', href: '/robot', icon: Bot },
  { label: 'Calendario', href: '/calendar', icon: Calendar },
  { label: 'Antihelada', href: '/frost', icon: Snowflake },
  { label: 'Trazabilidad', href: '/traceability', icon: Route },
  { label: 'Maduración', href: '/maturation', icon: Palette },
  { label: 'Sostenibilidad', href: '/sustainability', icon: BarChart3 },
  { label: 'Laboratorio', href: '/cellar/lab', icon: FlaskConical },
  { label: 'ERP', href: '/erp', icon: ShoppingCart },
  { label: 'Ajustes', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-56'} transition-all duration-200 bg-[#1A1A1A] border-r border-[#333] flex flex-col h-screen`}>
      {/* Header — VacasData-style text wordmark */}
      <div className="px-3 py-4 border-b border-[#333]">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="block">
            {collapsed ? (
              <span className="text-lg font-extrabold tracking-tight text-white">B</span>
            ) : (
              <div className="leading-tight">
                <div className="text-[18px] font-extrabold tracking-[-0.02em] text-white">
                  Bodega<span className="text-[var(--accent,#D4A843)]">Data</span>
                </div>
                <div className="text-[10px] text-[#9CA3AF] tracking-wide">by NeoFarm</div>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-[#262626] text-[#9CA3AF]"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        {!collapsed && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
            <span className="text-[10px] text-[#9CA3AF]">Bodega Demo · Sync OK</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-[var(--sidebar-active,#7F1D1D)] text-white'
                  : 'text-[#9CA3AF] hover:bg-[#262626] hover:text-[#E5E5E5]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#333] p-3">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-[#7F1D1D] flex items-center justify-center text-xs font-bold text-[#D4A843] shrink-0">B</div>
          {!collapsed && (
            <div className="truncate">
              <p className="text-xs font-medium text-[#E5E5E5]">Bodega Demo</p>
              <p className="text-[10px] text-[#9CA3AF]">Ribera del Duero</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
