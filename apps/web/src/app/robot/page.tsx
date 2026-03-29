'use client'
import PageShell from '@/components/shared/PageShell'
import { Bot, MapPin, Camera, Bug } from 'lucide-react'

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
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 flex items-center gap-3">
          <Bot className="w-8 h-8 text-[#D4A843]" />
          <div>
            <p className="font-bold">AgriBot R1</p>
            <p className="text-xs text-[#4ADE80]">En espera</p>
          </div>
        </div>
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{missions.length}</p>
          <p className="text-xs text-[#9CA3AF]">Misiones totales</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#EF4444]">{detections.length}</p>
          <p className="text-xs text-[#9CA3AF]">Detecciones</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">2.3 km</p>
          <p className="text-xs text-[#9CA3AF]">Total recorrido</p>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#333]"><h3 className="font-medium">Misiones</h3></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#9CA3AF] text-xs border-b border-[#333]">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Filas</th>
              <th className="px-4 py-2 text-left">Detecciones</th>
              <th className="px-4 py-2 text-left">Distancia</th>
              <th className="px-4 py-2 text-left">Duración</th>
              <th className="px-4 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {missions.map(m => (
              <tr key={m.id} className="border-b border-[#222] hover:bg-[#262626]">
                <td className="px-4 py-2 font-mono">{m.id}</td>
                <td className="px-4 py-2">{m.date}</td>
                <td className="px-4 py-2">{m.filas}</td>
                <td className="px-4 py-2">{m.detections}</td>
                <td className="px-4 py-2">{m.distance}</td>
                <td className="px-4 py-2">{m.duration}</td>
                <td className="px-4 py-2">
                  <span className={m.status === 'Completada' ? 'text-[#4ADE80]' : 'text-[#3B82F6]'}>{m.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2"><Bug className="w-4 h-4 text-[#EF4444]" /> Detecciones IA</h3>
        <div className="grid grid-cols-2 gap-3">
          {detections.map(d => (
            <div key={d.id} className="flex items-center gap-3 bg-[#262626] rounded-lg p-3">
              <div className="w-12 h-12 rounded bg-[#333] flex items-center justify-center"><Camera className="w-5 h-5 text-[#9CA3AF]" /></div>
              <div>
                <p className="font-medium text-sm">{d.type}</p>
                <p className="text-xs text-[#9CA3AF]">{d.mission} · Fila {d.fila} · {d.confidence}% conf.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
