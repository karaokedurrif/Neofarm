'use client'
import PageShell from '@/components/shared/PageShell'
import { Leaf, Thermometer, Droplets, MapPin } from 'lucide-react'

const sensors = [
  { id: 1, name: 'Sensor T/HR Campo', type: 'Temperatura + Humedad', value: '19°C / 68%', status: 'ok', battery: 87 },
  { id: 2, name: 'Sonda Suelo 30cm', type: 'Humedad suelo', value: '57%', status: 'ok', battery: 92 },
  { id: 3, name: 'Hoja Sensor', type: 'Humectación foliar', value: 'Seco', status: 'ok', battery: 75 },
  { id: 4, name: 'Estación Meteo', type: 'Multiparámetro', value: '19°C UV4 12km/h', status: 'ok', battery: 100 },
]

const rows = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1, label: `F${String(i + 1).padStart(2, '0')}`,
  ndvi: (0.5 + Math.random() * 0.4).toFixed(2),
  phenology: ['Brotación', 'Floración', 'Envero', 'Maduración'][Math.floor(Math.random() * 4)],
  stress: ['Bajo', 'Medio', 'Bajo', 'Bajo'][Math.floor(Math.random() * 4)],
}))

export default function VineyardPage() {
  return (
    <PageShell title="Viñedo" subtitle="Parcela Piloto 1ha — Tempranillo · Espaldera · Ribera del Duero">
      <div className="grid grid-cols-4 gap-4">
        {sensors.map(s => (
          <div key={s.id} className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#9CA3AF]">{s.type}</span>
              <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
            </div>
            <p className="font-bold text-lg">{s.value}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">{s.name} · Bat: {s.battery}%</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#333] flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2"><Leaf className="w-4 h-4 text-[#22C55E]" /> Filas del viñedo</h3>
          <span className="text-xs text-[#9CA3AF]">20 filas · Último NDVI: 25/03/2026</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#9CA3AF] text-xs border-b border-[#333]">
              <th className="px-4 py-2 text-left">Fila</th>
              <th className="px-4 py-2 text-left">NDVI</th>
              <th className="px-4 py-2 text-left">Fenología</th>
              <th className="px-4 py-2 text-left">Estrés hídrico</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b border-[#222] hover:bg-[#262626]">
                <td className="px-4 py-2 font-mono">{r.label}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: parseFloat(r.ndvi) > 0.7 ? '#22C55E' : parseFloat(r.ndvi) > 0.5 ? '#FBBF24' : '#EF4444' }} />
                    {r.ndvi}
                  </span>
                </td>
                <td className="px-4 py-2">{r.phenology}</td>
                <td className="px-4 py-2">
                  <span className={r.stress === 'Bajo' ? 'text-[#4ADE80]' : 'text-[#FBBF24]'}>{r.stress}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
