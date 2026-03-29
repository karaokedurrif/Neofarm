'use client'
import PageShell from '@/components/shared/PageShell'

const tanks = [
  { id: 'D01', name: 'Depósito 01', type: 'Inox 10.000L', fill: 85, temp: 14.5, status: 'Fermentando', wine: 'Tempranillo 2025' },
  { id: 'D02', name: 'Depósito 02', type: 'Inox 10.000L', fill: 0, temp: 12.0, status: 'Vacío', wine: '—' },
  { id: 'D03', name: 'Depósito 03', type: 'Inox 5.000L', fill: 100, temp: 13.2, status: 'FML', wine: 'Garnacha 2025' },
  { id: 'D04', name: 'Depósito 04', type: 'Inox 5.000L', fill: 40, temp: 16.0, status: 'Maceración', wine: 'Tempranillo 2025' },
  { id: 'D05', name: 'Depósito 05', type: 'Hormigón 8.000L', fill: 95, temp: 14.0, status: 'Estabilización', wine: 'Crianza 2024' },
  { id: 'D06', name: 'Depósito 06', type: 'Hormigón 8.000L', fill: 60, temp: 15.1, status: 'Crianza', wine: 'Reserva 2023' },
]

const statusColor: Record<string, string> = {
  Fermentando: '#EF4444', Vacío: '#6B7280', FML: '#8B5CF6',
  Maceración: '#F59E0B', Estabilización: '#3B82F6', Crianza: '#D4A843',
}

export default function CellarPage() {
  return (
    <PageShell title="Bodega" subtitle="Sala de depósitos · 6 unidades activas">
      <div className="grid grid-cols-3 gap-4">
        {tanks.map(t => (
          <div key={t.id} className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 hover:border-[#D4A843] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">{t.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: statusColor[t.status] + '22', color: statusColor[t.status] }}>{t.status}</span>
            </div>
            <p className="text-xs text-[#9CA3AF] mb-3">{t.type}</p>
            <div className="w-full h-3 bg-[#262626] rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all" style={{ width: `${t.fill}%`, background: t.fill > 90 ? '#EF4444' : t.fill > 0 ? '#D4A843' : '#333' }} />
            </div>
            <div className="flex justify-between text-xs text-[#9CA3AF]">
              <span>Llenado: {t.fill}%</span>
              <span>Temp: {t.temp}°C</span>
            </div>
            <p className="text-xs text-[#D4A843] mt-2">{t.wine}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
          <h3 className="font-medium mb-2">Recepción de Uva</h3>
          <p className="text-xs text-[#9CA3AF]">Última entrada: 15/09/2025</p>
          <p className="text-sm mt-2">320 kg Tempranillo · 12.8° Baumé</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
          <h3 className="font-medium mb-2">Laboratorio</h3>
          <p className="text-xs text-[#9CA3AF]">Última analítica: 28/03/2026</p>
          <p className="text-sm mt-2">pH 3.52 · AT 5.8 g/L · SO₂ libre 28 mg/L</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
          <h3 className="font-medium mb-2">Embotellado</h3>
          <p className="text-xs text-[#9CA3AF]">Próximo lote: 02/04/2026</p>
          <p className="text-sm mt-2">Crianza 2023 · 2.500 btl programadas</p>
        </div>
      </div>
    </PageShell>
  )
}
