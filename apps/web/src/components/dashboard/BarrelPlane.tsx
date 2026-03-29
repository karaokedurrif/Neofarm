'use client'
import { useState } from 'react'

const barrels = [
  ...Array.from({ length: 8 }, (_, i) => ({
    id: i + 1, code: `BD-FR-2023-${String(i + 1).padStart(3, '0')}`, row: 'A', col: i + 1,
    oak: 'Francés Allier', toast: 'Medio', cooperage: 'Taransaud', volume: 225,
    uses: Math.floor(Math.random() * 4), status: Math.random() > 0.15 ? 'en_uso' : 'vacia',
    wine: 'Tempranillo Reserva 2024', monthsSinceRacking: Math.floor(Math.random() * 10),
    purchaseYear: 2023,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: i + 9, code: `BD-AM-2022-${String(i + 1).padStart(3, '0')}`, row: 'B', col: i + 1,
    oak: 'Americano Missouri', toast: 'Alto', cooperage: 'Independent Stave', volume: 225,
    uses: 1 + Math.floor(Math.random() * 3), status: Math.random() > 0.1 ? 'en_uso' : 'vacia',
    wine: 'Garnacha Crianza 2024', monthsSinceRacking: Math.floor(Math.random() * 12),
    purchaseYear: 2022,
  })),
]

function barrelColor(uses: number, status: string) {
  if (status === 'vacia') return '#333'
  if (uses <= 1) return '#D4A843'
  if (uses <= 2) return '#92400E'
  return '#5C3310'
}

export default function BarrelPlane() {
  const [selected, setSelected] = useState<number | null>(null)
  const sel = selected !== null ? barrels.find(b => b.id === selected) : null
  const inUse = barrels.filter(b => b.status === 'en_uso').length
  const empty = barrels.filter(b => b.status === 'vacia').length
  const overdue = barrels.filter(b => b.monthsSinceRacking > 6 && b.status === 'en_uso')

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-[#92400E]">●</span> Sala de Barricas — Inventario Digital
          </h3>
          <div className="flex gap-4 text-xs">
            <span className="text-[#D4A843]">Total: {barrels.length}</span>
            <span className="text-[#22C55E]">En uso: {inUse}</span>
            <span className="text-[#9CA3AF]">Vacías: {empty}</span>
          </div>
        </div>

        <svg viewBox="0 0 640 320" className="w-full">
          <rect x="10" y="10" width="620" height="300" rx="8" fill="#151515" stroke="#333" strokeWidth="1" />

          {/* Row A */}
          <text x="25" y="50" fill="#D4A843" fontSize="11" fontWeight="bold">Fila A</text>
          <text x="25" y="63" fill="#9CA3AF" fontSize="8">Roble francés, tostado medio</text>

          {barrels.filter(b => b.row === 'A').map((b, i) => {
            const x = 30 + i * 72
            const isSelected = selected === b.id
            return (
              <g key={b.id} onClick={() => setSelected(b.id)} className="cursor-pointer">
                <rect x={x} y={75} width="60" height="70" rx="8"
                  fill={barrelColor(b.uses, b.status)}
                  stroke={isSelected ? '#D4A843' : '#444'} strokeWidth={isSelected ? 2 : 1}
                  opacity={b.status === 'vacia' ? 0.4 : 0.9}
                />
                {/* Barrel bands */}
                <line x1={x + 5} y1={87} x2={x + 55} y2={87} stroke="#0F0F0F" strokeWidth="1.5" opacity="0.3" />
                <line x1={x + 5} y1={133} x2={x + 55} y2={133} stroke="#0F0F0F" strokeWidth="1.5" opacity="0.3" />
                <text x={x + 30} y={110} textAnchor="middle" fill="#E5E5E5" fontSize="12" fontWeight="bold">
                  {String(b.col).padStart(2, '0')}
                </text>
                {b.monthsSinceRacking > 6 && b.status === 'en_uso' && (
                  <circle cx={x + 52} cy={80} r="5" fill="#EF4444" />
                )}
              </g>
            )
          })}

          {/* Row B */}
          <text x="25" y="180" fill="#D4A843" fontSize="11" fontWeight="bold">Fila B</text>
          <text x="25" y="193" fill="#9CA3AF" fontSize="8">Roble americano, tostado alto</text>

          {barrels.filter(b => b.row === 'B').map((b, i) => {
            const x = 30 + i * 72
            const isSelected = selected === b.id
            return (
              <g key={b.id} onClick={() => setSelected(b.id)} className="cursor-pointer">
                <rect x={x} y={205} width="60" height="70" rx="8"
                  fill={barrelColor(b.uses, b.status)}
                  stroke={isSelected ? '#D4A843' : '#444'} strokeWidth={isSelected ? 2 : 1}
                  opacity={b.status === 'vacia' ? 0.4 : 0.9}
                />
                <line x1={x + 5} y1={217} x2={x + 55} y2={217} stroke="#0F0F0F" strokeWidth="1.5" opacity="0.3" />
                <line x1={x + 5} y1={263} x2={x + 55} y2={263} stroke="#0F0F0F" strokeWidth="1.5" opacity="0.3" />
                <text x={x + 30} y={240} textAnchor="middle" fill="#E5E5E5" fontSize="12" fontWeight="bold">
                  {String(b.col + 8).padStart(2, '0')}
                </text>
                {b.monthsSinceRacking > 6 && b.status === 'en_uso' && (
                  <circle cx={x + 52} cy={210} r="5" fill="#EF4444" />
                )}
              </g>
            )
          })}
        </svg>

        <div className="flex gap-4 mt-3 text-xs text-[#9CA3AF]">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#D4A843' }} /> Nuevo (1 uso)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#92400E' }} /> 2 usos</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#5C3310' }} /> 3+ usos</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#333' }} /> Vacía</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Trasiego pendiente</span>
        </div>

        {overdue.length > 0 && (
          <div className="mt-4 bg-[#262626] border border-[#EF4444]/30 rounded-lg p-3 text-sm">
            <p className="text-[#EF4444] font-medium mb-1">Trasiegos pendientes</p>
            {overdue.map(b => (
              <p key={b.id} className="text-[#9CA3AF]">
                Barrica {b.code}: {b.monthsSinceRacking} meses (máx recomendado: 6)
              </p>
            ))}
          </div>
        )}
      </div>

      {sel && (
        <div className="w-64 border-l border-[#333] p-4 bg-[#151515]">
          <h4 className="font-semibold text-[#D4A843] mb-3">Barrica {sel.code}</h4>
          <div className="space-y-3 text-sm">
            <div><p className="text-[#9CA3AF] text-xs">Roble</p><p>{sel.oak}</p></div>
            <div><p className="text-[#9CA3AF] text-xs">Tonelería</p><p>{sel.cooperage}</p></div>
            <div><p className="text-[#9CA3AF] text-xs">Tostado</p><p className="capitalize">{sel.toast}</p></div>
            <div><p className="text-[#9CA3AF] text-xs">Volumen</p><p>{sel.volume} L</p></div>
            <div><p className="text-[#9CA3AF] text-xs">Año compra</p><p>{sel.purchaseYear}</p></div>
            <div><p className="text-[#9CA3AF] text-xs">Usos</p><p>{sel.uses}</p></div>
            <div><p className="text-[#9CA3AF] text-xs">Vino actual</p><p>{sel.wine}</p></div>
            <div><p className="text-[#9CA3AF] text-xs">Último trasiego</p>
              <p className={sel.monthsSinceRacking > 6 ? 'text-[#EF4444]' : ''}>Hace {sel.monthsSinceRacking} meses</p>
            </div>
            <div><p className="text-[#9CA3AF] text-xs">Estado</p><p className="capitalize">{sel.status.replace('_', ' ')}</p></div>
          </div>
          <button onClick={() => setSelected(null)} className="mt-4 text-xs text-[#9CA3AF] hover:text-white">Cerrar ✕</button>
        </div>
      )}
    </div>
  )
}
