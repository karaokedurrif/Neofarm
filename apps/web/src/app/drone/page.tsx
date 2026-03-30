'use client'
import PageShell from '@/components/shared/PageShell'

const flights = [
  { id: 'V001', date: '25/03/2026', type: 'NDVI', area: '1 ha', altitude: '30m', images: 124, status: 'Procesado' },
  { id: 'V002', date: '18/03/2026', type: 'RGB', area: '1 ha', altitude: '25m', images: 98, status: 'Procesado' },
  { id: 'V003', date: '10/03/2026', type: 'NDVI+Térmico', area: '1 ha', altitude: '35m', images: 156, status: 'Procesado' },
  { id: 'V004', date: '01/04/2026', type: 'NDVI', area: '1 ha', altitude: '30m', images: 0, status: 'Programado' },
]

const ndviZones = [
  { zone: 'NE', ndvi: 0.82, trend: '↑', health: 'Excelente', color: 'var(--success)' },
  { zone: 'NO', ndvi: 0.71, trend: '→', health: 'Bueno', color: '#4ADE80' },
  { zone: 'SE', ndvi: 0.55, trend: '↓', health: 'Estrés moderado', color: 'var(--warning)' },
  { zone: 'SO', ndvi: 0.48, trend: '↓', health: 'Estrés alto', color: 'var(--danger)' },
  { zone: 'Centro', ndvi: 0.76, trend: '↑', health: 'Bueno', color: '#4ADE80' },
]

export default function DronePage() {
  return (
    <PageShell title="Dron / NDVI" subtitle="DJI Mavic 3M · Sensor multiespectral">
      <div className="grid grid-cols-5 gap-3">
        {ndviZones.map((z, i) => (
          <div key={z.zone} className="card p-4 text-center animate-in" style={{ animationDelay: `${i * 60}ms` }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Zona {z.zone}</p>
            <p className="text-2xl font-bold" style={{ color: z.color }}>{z.ndvi}</p>
            <p className="text-xs mt-1">{z.trend} {z.health}</p>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h3 className="font-medium mb-4">Mapa NDVI — Último vuelo (25/03/2026)</h3>
        <div className="relative w-full h-64 rounded-lg overflow-hidden" style={{ background: 'var(--surface-active)' }}>
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

      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}><h3 className="font-medium">Historial de vuelos</h3></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-medium" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
              <th className="px-4 py-2.5 text-left">ID</th>
              <th className="px-4 py-2.5 text-left">Fecha</th>
              <th className="px-4 py-2.5 text-left">Tipo</th>
              <th className="px-4 py-2.5 text-left">Área</th>
              <th className="px-4 py-2.5 text-left">Altitud</th>
              <th className="px-4 py-2.5 text-left">Imágenes</th>
              <th className="px-4 py-2.5 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {flights.map(f => (
              <tr key={f.id} className="table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td className="px-4 py-2.5 font-mono">{f.id}</td>
                <td className="px-4 py-2.5">{f.date}</td>
                <td className="px-4 py-2.5">{f.type}</td>
                <td className="px-4 py-2.5">{f.area}</td>
                <td className="px-4 py-2.5">{f.altitude}</td>
                <td className="px-4 py-2.5">{f.images || '—'}</td>
                <td className="px-4 py-2.5">
                  <span style={{ color: f.status === 'Procesado' ? 'var(--success)' : 'var(--info)' }}>{f.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
