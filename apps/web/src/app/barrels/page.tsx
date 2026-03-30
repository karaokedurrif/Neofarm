'use client'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import PageShell from '@/components/shared/PageShell'

const WineryScene = dynamic<{
  children: React.ReactNode
  cameraPosition?: [number, number, number]
  cameraTarget?: [number, number, number]
}>(() => import('@/components/digital-twin/WineryScene'), { ssr: false })
const BarrelRoomScene = dynamic(() => import('@/components/digital-twin/BarrelRoomScene'), { ssr: false })

const barrels = [
  ...Array.from({ length: 8 }, (_, i) => ({ id: `A${i+1}`, row: 'A', oak: 'Roble Francés', cooper: 'Allier', age: 1 + (i % 3), usage: ['Crianza','Reserva','Gran Reserva'][i % 3], wine: 'Tempranillo 2024', racking: i === 2 ? 'Vencido' : 'OK', nextRacking: i === 2 ? '¡Ahora!' : `${10+i*3} días` })),
  ...Array.from({ length: 6 }, (_, i) => ({ id: `B${i+1}`, row: 'B', oak: 'Roble Americano', cooper: 'Missouri', age: 2 + (i % 4), usage: ['Crianza','Reserva'][i % 2], wine: 'Garnacha 2024', racking: 'OK', nextRacking: `${15+i*5} días` })),
]

const usageStyles: Record<string, { color: string; bg: string }> = {
  Crianza: { color: 'var(--accent)', bg: 'color-mix(in srgb, var(--accent) 15%, transparent)' },
  Reserva: { color: 'var(--warning)', bg: 'var(--warning-muted)' },
  'Gran Reserva': { color: 'var(--danger)', bg: 'var(--danger-muted)' },
}

export default function BarrelsPage() {
  return (
    <PageShell title="Barricas" subtitle="14 barricas activas · 2 filas">
      {/* ── 3D Barrel Room Scene ── */}
      <div className="relative h-[420px] rounded-xl overflow-hidden border animate-in" style={{ borderColor: 'var(--border)', background: '#0F0F0F' }}>
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cargando 3D…</p>
            </div>
          </div>
        }>
          <WineryScene cameraPosition={[8, 6, 10]} cameraTarget={[0, 1, 0]}>
            <BarrelRoomScene />
          </WineryScene>
        </Suspense>
        <div className="absolute top-3 left-3 bg-[#0F0F0F]/80 border border-[#333] rounded-lg px-3 py-1.5 backdrop-blur-md z-10">
          <span className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--accent)' }}>Gemelo Digital · Barricas</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 text-sm">
        {[
          { value: '14', label: 'Total activas', color: 'var(--accent)' },
          { value: '8', label: 'Francés', color: undefined },
          { value: '6', label: 'Americano', color: undefined },
          { value: '1', label: 'Trasiego vencido', color: 'var(--danger)' },
        ].map((kpi, i) => (
          <div key={kpi.label} className="card p-4 text-center animate-in" style={{ animationDelay: `${i * 60}ms` }}>
            <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-xs" style={{ color: kpi.color || 'var(--text-muted)' }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-medium">Inventario de barricas</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-medium" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
              <th className="px-4 py-2.5 text-left">ID</th>
              <th className="px-4 py-2.5 text-left">Fila</th>
              <th className="px-4 py-2.5 text-left">Roble</th>
              <th className="px-4 py-2.5 text-left">Edad</th>
              <th className="px-4 py-2.5 text-left">Uso</th>
              <th className="px-4 py-2.5 text-left">Vino</th>
              <th className="px-4 py-2.5 text-left">Trasiego</th>
              <th className="px-4 py-2.5 text-left">Próximo</th>
            </tr>
          </thead>
          <tbody>
            {barrels.map(b => {
              const us = usageStyles[b.usage]
              return (
                <tr key={b.id} className="table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="px-4 py-2.5 font-mono font-bold">{b.id}</td>
                  <td className="px-4 py-2.5">{b.row}</td>
                  <td className="px-4 py-2.5 text-xs">{b.oak}</td>
                  <td className="px-4 py-2.5">{b.age} años</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: us.bg, color: us.color }}>{b.usage}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs">{b.wine}</td>
                  <td className="px-4 py-2.5">
                    <span style={{ color: b.racking === 'Vencido' ? 'var(--danger)' : 'var(--success)', fontWeight: b.racking === 'Vencido' ? 700 : 400 }}>{b.racking}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs">{b.nextRacking}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
