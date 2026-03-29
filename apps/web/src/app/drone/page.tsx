'use client'
import PageShell from '@/components/shared/PageShell'

const flights = [
  { id: 'V001', date: '25/03/2026', type: 'NDVI', area: '1 ha', altitude: '30m', images: 124, status: 'Procesado' },
  { id: 'V002', date: '18/03/2026', type: 'RGB', area: '1 ha', altitude: '25m', images: 98, status: 'Procesado' },
  { id: 'V003', date: '10/03/2026', type: 'NDVI+Térmico', area: '1 ha', altitude: '35m', images: 156, status: 'Procesado' },
  { id: 'V004', date: '01/04/2026', type: 'NDVI', area: '1 ha', altitude: '30m', images: 0, status: 'Programado' },
]

const ndviZones = [
  { zone: 'NE', ndvi: 0.82, trend: '↑', health: 'Excelente', color: '#22C55E' },
  { zone: 'NO', ndvi: 0.71, trend: '→', health: 'Bueno', color: '#4ADE80' },
  { zone: 'SE', ndvi: 0.55, trend: '↓', health: 'Estrés moderado', color: '#FBBF24' },
  { zone: 'SO', ndvi: 0.48, trend: '↓', health: 'Estrés alto', color: '#EF4444' },
  { zone: 'Centro', ndvi: 0.76, trend: '↑', health: 'Bueno', color: '#4ADE80' },
]

export default function DronePage() {
  return (
    <PageShell title="Dron / NDVI" subtitle="DJI Mavic 3M · Sensor multiespectral">
      <div className="grid grid-cols-5 gap-3">
        {ndviZones.map(z => (
          <div key={z.zone} className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-center">
            <p className="text-xs text-[#9CA3AF] mb-1">Zona {z.zone}</p>
            <p className="text-2xl font-bold" style={{ color: z.color }}>{z.ndvi}</p>
            <p className="text-xs mt-1">{z.trend} {z.health}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
        <h3 className="font-medium mb-4">Mapa NDVI — Último vuelo (25/03/2026)</h3>
        <div className="relative w-full h-64 bg-[#262626] rounded-lg overflow-hidden">
          <svg viewBox="0 0 500 250" className="w-full h-full">
            <rect x="0" y="0" width="250" height="125" fill="#22C55E" opacity="0.7" />
            <rect x="250" y="0" width="250" height="125" fill="#4ADE80" opacity="0.6" />
            <rect x="0" y="125" width="250" height="125" fill="#EF4444" opacity="0.5" />
            <rect x="250" y="125" width="250" height="125" fill="#FBBF24" opacity="0.5" />
            <rect x="150" y="75" width="200" height="100" fill="#4ADE80" opacity="0.7" rx="8" />
            <text x="250" y="130" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Centro 0.76</text>
            <text x="125" y="70" textAnchor="middle" fill="white" fontSize="10">NE 0.82</text>
            <text x="375" y="70" textAnchor="middle" fill="white" fontSize="10">NO 0.71</text>
            <text x="125" y="200" textAnchor="middle" fill="white" fontSize="10">SE 0.55</text>
            <text x="375" y="200" textAnchor="middle" fill="white" fontSize="10">SO 0.48</text>
          </svg>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#333]"><h3 className="font-medium">Historial de vuelos</h3></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#9CA3AF] text-xs border-b border-[#333]">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Área</th>
              <th className="px-4 py-2 text-left">Altitud</th>
              <th className="px-4 py-2 text-left">Imágenes</th>
              <th className="px-4 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {flights.map(f => (
              <tr key={f.id} className="border-b border-[#222] hover:bg-[#262626]">
                <td className="px-4 py-2 font-mono">{f.id}</td>
                <td className="px-4 py-2">{f.date}</td>
                <td className="px-4 py-2">{f.type}</td>
                <td className="px-4 py-2">{f.area}</td>
                <td className="px-4 py-2">{f.altitude}</td>
                <td className="px-4 py-2">{f.images || '—'}</td>
                <td className="px-4 py-2">
                  <span className={f.status === 'Procesado' ? 'text-[#4ADE80]' : 'text-[#3B82F6]'}>{f.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
