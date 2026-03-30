'use client'
import PageShell from '@/components/shared/PageShell'
import { Bot, Camera, Bug } from 'lucide-react'

const missions = [
  { id: 'M001', date: '28/03/2026', filas: 'F01–F10', detections: 3, distance: '1.2 km', duration: '45 min', status: 'Completada' },
  { id: 'M002', date: '25/03/2026', filas: 'F11–F20', detections: 1, distance: '1.1 km', duration: '42 min', status: 'Completada' },
  { id: 'M003', date: '01/04/2026', filas: 'F01–F20', detections: 0, distance: '—', duration: '—', status: 'Programada' },
]

const detections = [
  { id: 1, mission: 'M001', fila: 'F03', type: 'Mildiu', confidence: 92, image: true },
  { id: 2, mission: 'M001', fila: 'F07', type: 'Araña roja', confidence: 85, image: true },
  { id: 3, mission: 'M001', fila: 'F09', type: 'Carencia Fe', confidence: 78, image: true },
  { id: 4, mission: 'M002', fila: 'F14', type: 'Botrytis', confidence: 88, image: true },
]

export default function RobotPage() {
  return (
    <PageShell title="Robot UGV" subtitle="AgriBot R1 · Navegación autónoma interfila">
      <div className="grid grid-cols-4 gap-3">
        {[
          { content: <div className="flex items-center gap-3"><Bot className="w-8 h-8" style={{ color: 'var(--accent)' }} /><div><p className="font-bold">AgriBot R1</p><p className="text-xs" style={{ color: 'var(--success)' }}>En espera</p></div></div> },
          { content: <><p className="text-2xl font-bold">{missions.length}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Misiones totales</p></> },
          { content: <><p className="text-2xl font-bold" style={{ color: 'var(--danger)' }}>{detections.length}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Detecciones</p></> },
          { content: <><p className="text-2xl font-bold">2.3 km</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total recorrido</p></> },
        ].map((kpi, i) => (
          <div key={i} className={`card p-4 animate-in ${i > 0 ? 'text-center' : ''}`} style={{ animationDelay: `${i * 60}ms` }}>{kpi.content}</div>
        ))}
      </div>

      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}><h3 className="font-medium">Misiones</h3></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-medium" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
              <th className="px-4 py-2.5 text-left">ID</th>
              <th className="px-4 py-2.5 text-left">Fecha</th>
              <th className="px-4 py-2.5 text-left">Filas</th>
              <th className="px-4 py-2.5 text-left">Detecciones</th>
              <th className="px-4 py-2.5 text-left">Distancia</th>
              <th className="px-4 py-2.5 text-left">Duración</th>
              <th className="px-4 py-2.5 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {missions.map(m => (
              <tr key={m.id} className="table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td className="px-4 py-2.5 font-mono">{m.id}</td>
                <td className="px-4 py-2.5">{m.date}</td>
                <td className="px-4 py-2.5">{m.filas}</td>
                <td className="px-4 py-2.5">{m.detections}</td>
                <td className="px-4 py-2.5">{m.distance}</td>
                <td className="px-4 py-2.5">{m.duration}</td>
                <td className="px-4 py-2.5">
                  <span style={{ color: m.status === 'Completada' ? 'var(--success)' : 'var(--info)' }}>{m.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2"><Bug className="w-4 h-4" style={{ color: 'var(--danger)' }} /> Detecciones IA</h3>
        <div className="grid grid-cols-2 gap-3">
          {detections.map(d => (
            <div key={d.id} className="flex items-center gap-3 rounded-lg p-3" style={{ background: 'var(--surface-active)' }}>
              <div className="w-12 h-12 rounded flex items-center justify-center" style={{ background: 'var(--surface-hover)' }}><Camera className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /></div>
              <div>
                <p className="font-medium text-sm">{d.type}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.mission} · Fila {d.fila} · {d.confidence}% conf.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
