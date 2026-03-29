'use client'
import PageShell from '@/components/shared/PageShell'
import { Grape, Thermometer, Droplets, Sun } from 'lucide-react'

const samples = [
  { date: '28/03', baume: 12.8, ph: 3.45, at: 6.2, color: 85, phenols: 62, anthocyanins: 310, status: 'En curso' },
  { date: '25/03', baume: 12.2, ph: 3.42, at: 6.5, color: 78, phenols: 58, anthocyanins: 285, status: 'En curso' },
  { date: '21/03', baume: 11.5, ph: 3.38, at: 6.9, color: 70, phenols: 52, anthocyanins: 255, status: 'En curso' },
  { date: '18/03', baume: 10.8, ph: 3.35, at: 7.2, color: 62, phenols: 48, anthocyanins: 230, status: 'En curso' },
  { date: '14/03', baume: 10.0, ph: 3.30, at: 7.5, color: 55, phenols: 42, anthocyanins: 200, status: 'Envero' },
]

export default function MaturationPage() {
  const latest = samples[0]
  return (
    <PageShell title="Maduración" subtitle="Control de madurez · Tempranillo Parcela Piloto">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-center">
          <Grape className="w-6 h-6 text-[#7F1D1D] mx-auto mb-2" />
          <p className="text-xl font-bold text-[#D4A843]">{latest.baume}°</p>
          <p className="text-xs text-[#9CA3AF]">Baumé</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-center">
          <p className="text-xl font-bold">{latest.ph}</p>
          <p className="text-xs text-[#9CA3AF]">pH</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-center">
          <p className="text-xl font-bold">{latest.at} g/L</p>
          <p className="text-xs text-[#9CA3AF]">Acidez total</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-center">
          <p className="text-xl font-bold">{latest.anthocyanins}</p>
          <p className="text-xs text-[#9CA3AF]">Antocianos (mg/L)</p>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
        <h3 className="font-medium mb-4">Curva de maduración</h3>
        <div className="h-48 flex items-end gap-4 px-4">
          {[...samples].reverse().map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-[#D4A843]">{s.baume}°</span>
              <div className="w-full rounded-t" style={{ height: `${(s.baume / 15) * 100}%`, background: `linear-gradient(to top, #7F1D1D, #D4A843)` }} />
              <span className="text-[10px] text-[#9CA3AF]">{s.date}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-center text-xs text-[#9CA3AF]">Objetivo vendimia: 13.5° Baumé</div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#333]"><h3 className="font-medium">Muestras de campo</h3></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#9CA3AF] text-xs border-b border-[#333]">
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Baumé</th>
              <th className="px-4 py-2 text-left">pH</th>
              <th className="px-4 py-2 text-left">AT (g/L)</th>
              <th className="px-4 py-2 text-left">Color (%)</th>
              <th className="px-4 py-2 text-left">Fenoles</th>
              <th className="px-4 py-2 text-left">Antocianos</th>
              <th className="px-4 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {samples.map(s => (
              <tr key={s.date} className="border-b border-[#222] hover:bg-[#262626]">
                <td className="px-4 py-2 font-mono">{s.date}</td>
                <td className="px-4 py-2 text-[#D4A843] font-bold">{s.baume}°</td>
                <td className="px-4 py-2">{s.ph}</td>
                <td className="px-4 py-2">{s.at}</td>
                <td className="px-4 py-2">{s.color}%</td>
                <td className="px-4 py-2">{s.phenols}</td>
                <td className="px-4 py-2">{s.anthocyanins}</td>
                <td className="px-4 py-2 text-xs text-[#3B82F6]">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
