'use client'
import PageShell from '@/components/shared/PageShell'
import { Package, TrendingUp, FileText } from 'lucide-react'
import { useState } from 'react'

const tabs = ['Inventario', 'Ventas', 'Informes']

const inventory = [
  { sku: 'BDG-CR-2023', name: 'Crianza 2023', type: '75cl', stock: 2200, reserved: 300, available: 1900, price: 12.50 },
  { sku: 'BDG-RS-2022', name: 'Reserva 2022', type: '75cl', stock: 800, reserved: 150, available: 650, price: 22.00 },
  { sku: 'BDG-JV-2025', name: 'Joven 2025', type: '75cl', stock: 0, reserved: 0, available: 0, price: 7.50 },
  { sku: 'BDG-CR-2023-M', name: 'Crianza 2023 Magnum', type: '150cl', stock: 120, reserved: 20, available: 100, price: 28.00 },
]

const sales = [
  { month: 'Ene', revenue: 8500, bottles: 520 },
  { month: 'Feb', revenue: 12200, bottles: 780 },
  { month: 'Mar', revenue: 15800, bottles: 1020 },
]

export default function ErpPage() {
  const [tab, setTab] = useState('Inventario')
  return (
    <PageShell title="ERP" subtitle="Gestión comercial · Inventario + Ventas + Informes">
      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: tab === t ? 'var(--accent)' : 'var(--surface)',
              color: tab === t ? '#000' : 'var(--text-muted)',
              border: tab === t ? 'none' : '1px solid var(--border)',
              fontWeight: tab === t ? 600 : 400,
            }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Inventario' && (
        <div className="card-flat overflow-hidden animate-in">
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <Package className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <h3 className="font-medium">Stock actual</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-medium" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-4 py-2.5 text-left">SKU</th>
                <th className="px-4 py-2.5 text-left">Producto</th>
                <th className="px-4 py-2.5 text-left">Formato</th>
                <th className="px-4 py-2.5 text-right">Stock</th>
                <th className="px-4 py-2.5 text-right">Reservados</th>
                <th className="px-4 py-2.5 text-right">Disponible</th>
                <th className="px-4 py-2.5 text-right">PVP</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(p => (
                <tr key={p.sku} className="table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="px-4 py-2.5 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-2.5">{p.name}</td>
                  <td className="px-4 py-2.5 text-xs">{p.type}</td>
                  <td className="px-4 py-2.5 text-right">{p.stock.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right" style={{ color: 'var(--warning)' }}>{p.reserved}</td>
                  <td className="px-4 py-2.5 text-right font-bold">{p.available.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right" style={{ color: 'var(--accent)' }}>{p.price.toFixed(2)}€</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Ventas' && (
        <div className="space-y-4 animate-in">
          <div className="grid grid-cols-3 gap-3">
            {sales.map((s, i) => (
              <div key={s.month} className="card p-4 text-center animate-in" style={{ animationDelay: `${i * 60}ms` }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.month} 2026</p>
                <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{s.revenue.toLocaleString()}€</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.bottles} btls</p>
              </div>
            ))}
          </div>
          <div className="card p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" style={{ color: 'var(--success)' }} /> Tendencia Q1 2026</h3>
            <div className="h-32 flex items-end gap-8 justify-center px-8">
              {sales.map(s => (
                <div key={s.month} className="flex flex-col items-center gap-1">
                  <span className="text-xs" style={{ color: 'var(--accent)' }}>{(s.revenue / 1000).toFixed(1)}k€</span>
                  <div className="w-16 rounded-t" style={{ height: `${(s.revenue / 16000) * 100}%`, background: 'linear-gradient(to top, var(--primary), var(--accent))' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Informes' && (
        <div className="card p-4 animate-in">
          <h3 className="font-medium mb-3 flex items-center gap-2"><FileText className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Informes disponibles</h3>
          <div className="space-y-2">
            {['Balance mensual Marzo 2026', 'Informe DOP Q1 2026', 'Análisis coste/botella', 'Previsión vendimia 2026', 'Informe sostenibilidad anual'].map(r => (
              <div key={r} className="flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors cursor-pointer" style={{ background: 'var(--surface-active)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-active)')}>
                <span className="text-sm">{r}</span>
                <span className="text-xs" style={{ color: 'var(--accent)' }}>PDF ↓</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  )
}
