'use client'
import PageShell from '@/components/shared/PageShell'
import { FileCheck, ArrowRight } from 'lucide-react'

const lots = [
  { id: 'LOT-2025-001', wine: 'Tempranillo Crianza 2023', origin: 'Parcela Piloto', grapeKg: 1200, bottles: 2500, status: 'Embotellado', dop: 'Ribera del Duero' },
  { id: 'LOT-2025-002', wine: 'Garnacha Reserva 2022', origin: 'Parcela Piloto', grapeKg: 800, bottles: 1600, status: 'En barrica', dop: 'Ribera del Duero' },
  { id: 'LOT-2025-003', wine: 'Tempranillo Joven 2025', origin: 'Parcela Piloto', grapeKg: 600, bottles: 0, status: 'Fermentación', dop: 'Ribera del Duero' },
]

const timeline = [
  { step: 'Vendimia', date: '15/09/2023', detail: '1.200 kg Tempranillo · 13.2° Baumé' },
  { step: 'Despalillado', date: '15/09/2023', detail: 'Vibración + selección manual' },
  { step: 'Fermentación', date: '16/09/2023', detail: 'Depósito D01 · 14 días · 24°C max' },
  { step: 'FML', date: '02/10/2023', detail: 'Depósito D01 · Iniciado espontáneo' },
  { step: 'Crianza barrica', date: '15/11/2023', detail: '12 meses · Roble francés Allier' },
  { step: 'Coupage', date: '15/11/2024', detail: '100% Tempranillo' },
  { step: 'Estabilización', date: '01/12/2024', detail: 'Frío + clarificación bentonita' },
  { step: 'Embotellado', date: '15/03/2025', detail: '2.500 botellas 75cl · Corcho natural' },
  { step: 'Etiquetado', date: '16/03/2025', detail: 'Lote LOT-2025-001 · Contraetiqueta DOP' },
]

export default function TraceabilityPage() {
  return (
    <PageShell title="Trazabilidad" subtitle="Control de lotes · Cumplimiento DOP Ribera del Duero">
      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#333]"><h3 className="font-medium flex items-center gap-2"><FileCheck className="w-4 h-4 text-[#D4A843]" /> Lotes activos</h3></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#9CA3AF] text-xs border-b border-[#333]">
              <th className="px-4 py-2 text-left">Lote</th>
              <th className="px-4 py-2 text-left">Vino</th>
              <th className="px-4 py-2 text-left">Origen</th>
              <th className="px-4 py-2 text-left">Uva (kg)</th>
              <th className="px-4 py-2 text-left">Botellas</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">DOP</th>
            </tr>
          </thead>
          <tbody>
            {lots.map(l => (
              <tr key={l.id} className="border-b border-[#222] hover:bg-[#262626]">
                <td className="px-4 py-2 font-mono font-bold">{l.id}</td>
                <td className="px-4 py-2">{l.wine}</td>
                <td className="px-4 py-2 text-xs">{l.origin}</td>
                <td className="px-4 py-2">{l.grapeKg.toLocaleString()}</td>
                <td className="px-4 py-2">{l.bottles > 0 ? l.bottles.toLocaleString() : '—'}</td>
                <td className="px-4 py-2">
                  <span className={l.status === 'Embotellado' ? 'text-[#4ADE80]' : l.status === 'En barrica' ? 'text-[#D4A843]' : 'text-[#3B82F6]'}>{l.status}</span>
                </td>
                <td className="px-4 py-2 text-xs">{l.dop}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
        <h3 className="font-medium mb-4">Trazabilidad LOT-2025-001 — Tempranillo Crianza 2023</h3>
        <div className="relative">
          {timeline.map((t, i) => (
            <div key={i} className="flex items-start gap-4 mb-4 last:mb-0">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[#D4A843] shrink-0 mt-1" />
                {i < timeline.length - 1 && <div className="w-px h-full bg-[#333] min-h-[24px]" />}
              </div>
              <div>
                <p className="font-medium text-sm">{t.step}</p>
                <p className="text-xs text-[#9CA3AF]">{t.date} · {t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
