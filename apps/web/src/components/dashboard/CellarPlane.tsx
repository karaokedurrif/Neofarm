'use client'
import { useState } from 'react'

const tanks = [
  { id: 1, name: 'D1', material: 'Inox', capacity: 5000, volume: 4200, temp: 18, target: 18, status: 'fermentando', wine: 'Tempranillo 2025' },
  { id: 2, name: 'D2', material: 'Inox', capacity: 5000, volume: 3800, temp: 22, target: 20, status: 'fermentando', wine: 'Garnacha 2025' },
  { id: 3, name: 'D3', material: 'Inox', capacity: 10000, volume: 9500, temp: 26, target: 22, status: 'fermentando', wine: 'Tempranillo Reserva' },
  { id: 4, name: 'D4', material: 'Inox', capacity: 5000, volume: 0, temp: 15, target: 15, status: 'vacio', wine: '-' },
  { id: 5, name: 'D5', material: 'Hormigón', capacity: 8000, volume: 7200, temp: 15, target: 15, status: 'crianza', wine: 'Verdejo 2025' },
  { id: 6, name: 'D6', material: 'Inox', capacity: 3000, volume: 2800, temp: 16, target: 15, status: 'estabilizando', wine: 'Rosado 2025' },
]

function statusColor(s: string) {
  if (s === 'fermentando') return '#EF4444'
  if (s === 'crianza') return '#D4A843'
  if (s === 'estabilizando') return '#FBBF24'
  return '#333'
}

function tempColor(t: number, target: number) {
  const diff = Math.abs(t - target)
  if (diff <= 1) return '#4ADE80'
  if (diff <= 3) return '#FBBF24'
  return '#EF4444'
}

export default function CellarPlane() {
  const [selected, setSelected] = useState<number | null>(null)
  const sel = selected !== null ? tanks.find(t => t.id === selected) : null

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-[#7F1D1D]">●</span> Bodega — Plano de Planta
        </h3>

        <svg viewBox="0 0 700 380" className="w-full">
          <rect x="10" y="10" width="680" height="360" rx="8" fill="#151515" stroke="#333" strokeWidth="1" />

          {/* Zone labels */}
          <text x="80" y="45" fill="#9CA3AF" fontSize="11" fontWeight="bold">RECEPCIÓN</text>
          <text x="280" y="45" fill="#9CA3AF" fontSize="11" fontWeight="bold">FERMENTACIÓN</text>
          <text x="540" y="45" fill="#9CA3AF" fontSize="11" fontWeight="bold">CRIANZA</text>

          {/* Reception area */}
          <rect x="30" y="60" width="130" height="120" rx="6" fill="#1A1A1A" stroke="#333" />
          <text x="95" y="90" textAnchor="middle" fill="#9CA3AF" fontSize="10">Tolva Recepción</text>
          <text x="95" y="120" textAnchor="middle" fill="#E5E5E5" fontSize="12">22°C</text>
          <text x="95" y="145" textAnchor="middle" fill="#D4A843" fontSize="9">Báscula + Refractómetro</text>

          {/* Tanks */}
          {tanks.slice(0, 4).map((tank, i) => {
            const x = 200 + i * 85
            const fillPct = tank.volume / tank.capacity
            const isSelected = selected === tank.id
            return (
              <g key={tank.id} onClick={() => setSelected(tank.id)} className="cursor-pointer">
                <rect x={x} y={60} width="70" height="160" rx="6"
                  fill="#1A1A1A" stroke={isSelected ? '#D4A843' : '#333'} strokeWidth={isSelected ? 2 : 1} />
                {/* Fill level */}
                <rect x={x + 4} y={60 + 160 * (1 - fillPct)} width="62" height={160 * fillPct - 4}
                  rx="4" fill={statusColor(tank.status)} opacity="0.3" />
                <text x={x + 35} y={80} textAnchor="middle" fill="#E5E5E5" fontSize="14" fontWeight="bold">{tank.name}</text>
                <text x={x + 35} y={100} textAnchor="middle" fill={tempColor(tank.temp, tank.target)} fontSize="11">{tank.temp}°C</text>
                <text x={x + 35} y={115} textAnchor="middle" fill="#9CA3AF" fontSize="8">{Math.round(fillPct * 100)}%</text>
                {/* Status dot */}
                <circle cx={x + 35} cy={195} r="5" fill={statusColor(tank.status)} />
                <text x={x + 35} y={210} textAnchor="middle" fill="#9CA3AF" fontSize="7" className="capitalize">{tank.status}</text>
              </g>
            )
          })}

          {/* Barrels room */}
          <rect x="540" y="60" width="130" height="120" rx="6" fill="#1A1A1A" stroke="#333" />
          <text x="605" y="90" textAnchor="middle" fill="#D4A843" fontSize="11">Sala Barricas</text>
          <text x="605" y="115" textAnchor="middle" fill="#E5E5E5" fontSize="12">15°C</text>
          <text x="605" y="135" textAnchor="middle" fill="#60A5FA" fontSize="10">78% HR</text>
          {/* Mini barrel icons */}
          {[0,1,2,3,4,5].map(i => (
            <rect key={i} x={558 + (i % 3) * 30} y={145 + Math.floor(i / 3) * 14} width="22" height="10" rx="3" fill="#92400E" opacity="0.6" />
          ))}

          {/* Lab */}
          <rect x="30" y="230" width="130" height="100" rx="6" fill="#1A1A1A" stroke="#333" />
          <text x="95" y="260" textAnchor="middle" fill="#9CA3AF" fontSize="11" fontWeight="bold">LABORATORIO</text>
          <text x="95" y="285" textAnchor="middle" fill="#E5E5E5" fontSize="11">pH 3.42</text>
          <text x="95" y="305" textAnchor="middle" fill="#9CA3AF" fontSize="9">Último: hoy 10:30</text>

          {/* Bottling */}
          <rect x="200" y="260" width="180" height="70" rx="6" fill="#1A1A1A" stroke="#333" />
          <text x="290" y="290" textAnchor="middle" fill="#9CA3AF" fontSize="11" fontWeight="bold">EMBOTELLADO</text>
          <text x="290" y="310" textAnchor="middle" fill="#333" fontSize="10">⚡ OFF</text>

          {/* Extra tanks */}
          {tanks.slice(4).map((tank, i) => {
            const x = 440 + i * 85
            const fillPct = tank.volume / tank.capacity
            const isSelected = selected === tank.id
            return (
              <g key={tank.id} onClick={() => setSelected(tank.id)} className="cursor-pointer">
                <rect x={x} y={230} width="70" height="120" rx="6"
                  fill="#1A1A1A" stroke={isSelected ? '#D4A843' : '#333'} strokeWidth={isSelected ? 2 : 1} />
                <rect x={x + 4} y={230 + 120 * (1 - fillPct)} width="62" height={120 * fillPct - 4}
                  rx="4" fill={statusColor(tank.status)} opacity="0.3" />
                <text x={x + 35} y={255} textAnchor="middle" fill="#E5E5E5" fontSize="14" fontWeight="bold">{tank.name}</text>
                <text x={x + 35} y={275} textAnchor="middle" fill={tempColor(tank.temp, tank.target)} fontSize="11">{tank.temp}°C</text>
                <circle cx={x + 35} cy={325} r="5" fill={statusColor(tank.status)} />
                <text x={x + 35} y={340} textAnchor="middle" fill="#9CA3AF" fontSize="7">{tank.status}</text>
              </g>
            )
          })}

          {/* Environment readings bottom bar */}
          <text x="30" y="365" fill="#9CA3AF" fontSize="9">CO2: 700ppm ✓  |  T: 15°C ✓  |  HR: 75% ✓  |  Consumo: 5.4 kWh</text>
        </svg>
      </div>

      {/* Detail panel */}
      {sel && (
        <div className="w-64 border-l border-[#333] p-4 bg-[#151515]">
          <h4 className="font-semibold text-[#D4A843] mb-3">Depósito {sel.name}</h4>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-[#9CA3AF] text-xs">Material</p>
              <p>{sel.material}</p>
            </div>
            <div>
              <p className="text-[#9CA3AF] text-xs">Capacidad</p>
              <p>{sel.capacity.toLocaleString()} L</p>
            </div>
            <div>
              <p className="text-[#9CA3AF] text-xs">Volumen actual</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[#333] rounded-full">
                  <div className="h-2 rounded-full bg-[#7F1D1D]" style={{ width: `${(sel.volume / sel.capacity) * 100}%` }} />
                </div>
                <span className="font-mono text-xs">{sel.volume.toLocaleString()} L</span>
              </div>
            </div>
            <div>
              <p className="text-[#9CA3AF] text-xs">Temperatura</p>
              <p style={{ color: tempColor(sel.temp, sel.target) }}>{sel.temp}°C <span className="text-[#9CA3AF]">(obj: {sel.target}°C)</span></p>
            </div>
            <div>
              <p className="text-[#9CA3AF] text-xs">Estado</p>
              <p className="capitalize" style={{ color: statusColor(sel.status) }}>{sel.status}</p>
            </div>
            <div>
              <p className="text-[#9CA3AF] text-xs">Vino</p>
              <p>{sel.wine}</p>
            </div>
          </div>
          <button onClick={() => setSelected(null)} className="mt-4 text-xs text-[#9CA3AF] hover:text-white">Cerrar ✕</button>
        </div>
      )}
    </div>
  )
}
