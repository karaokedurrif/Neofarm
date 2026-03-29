'use client'
import PageShell from '@/components/shared/PageShell'

const barrels = [
  ...Array.from({ length: 8 }, (_, i) => ({ id: `A${i+1}`, row: 'A', oak: 'Roble Francés', cooper: 'Allier', age: 1+Math.floor(Math.random()*3), usage: ['Crianza','Reserva','Gran Reserva'][Math.floor(Math.random()*3)], wine: 'Tempranillo 2024', racking: i === 2 ? 'Vencido' : 'OK', nextRacking: i === 2 ? '¡Ahora!' : `${10+i*3} días` })),
  ...Array.from({ length: 6 }, (_, i) => ({ id: `B${i+1}`, row: 'B', oak: 'Roble Americano', cooper: 'Missouri', age: 2+Math.floor(Math.random()*4), usage: ['Crianza','Reserva'][Math.floor(Math.random()*2)], wine: 'Garnacha 2024', racking: 'OK', nextRacking: `${15+i*5} días` })),
]

const usageColor: Record<string, string> = { Crianza: '#D4A843', Reserva: '#B45309', 'Gran Reserva': '#7F1D1D' }

export default function BarrelsPage() {
  return (
    <PageShell title="Barricas" subtitle="14 barricas activas · 2 filas">
      <div className="grid grid-cols-4 gap-3 text-sm">
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#D4A843]">14</p>
          <p className="text-xs text-[#9CA3AF]">Total activas</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">8</p>
          <p className="text-xs text-[#9CA3AF]">Francés</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">6</p>
          <p className="text-xs text-[#9CA3AF]">Americano</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#EF4444] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#EF4444]">1</p>
          <p className="text-xs text-[#EF4444]">Trasiego vencido</p>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#333]">
          <h3 className="font-medium">Inventario de barricas</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#9CA3AF] text-xs border-b border-[#333]">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Fila</th>
              <th className="px-4 py-2 text-left">Roble</th>
              <th className="px-4 py-2 text-left">Edad</th>
              <th className="px-4 py-2 text-left">Uso</th>
              <th className="px-4 py-2 text-left">Vino</th>
              <th className="px-4 py-2 text-left">Trasiego</th>
              <th className="px-4 py-2 text-left">Próximo</th>
            </tr>
          </thead>
          <tbody>
            {barrels.map(b => (
              <tr key={b.id} className="border-b border-[#222] hover:bg-[#262626]">
                <td className="px-4 py-2 font-mono font-bold">{b.id}</td>
                <td className="px-4 py-2">{b.row}</td>
                <td className="px-4 py-2 text-xs">{b.oak}</td>
                <td className="px-4 py-2">{b.age} años</td>
                <td className="px-4 py-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: usageColor[b.usage] + '33', color: usageColor[b.usage] }}>{b.usage}</span>
                </td>
                <td className="px-4 py-2 text-xs">{b.wine}</td>
                <td className="px-4 py-2">
                  <span className={b.racking === 'Vencido' ? 'text-[#EF4444] font-bold' : 'text-[#4ADE80]'}>{b.racking}</span>
                </td>
                <td className="px-4 py-2 text-xs">{b.nextRacking}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
