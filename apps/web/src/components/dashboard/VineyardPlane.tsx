'use client'
import { useState } from 'react'

const rows = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  label: `F${String(i + 1).padStart(2, '0')}`,
  ndvi: 0.4 + Math.random() * 0.5,
  vines: 80 + Math.floor(Math.random() * 20),
  phenology: ['brotación', 'floración', 'envero', 'maduración'][Math.floor(Math.random() * 4)],
}))

function ndviColor(v: number) {
  if (v > 0.7) return '#22C55E'
  if (v > 0.5) return '#FBBF24'
  return '#EF4444'
}

export default function VineyardPlane() {
  const [selected, setSelected] = useState<number | null>(null)
  const sel = selected !== null ? rows.find(r => r.id === selected) : null

  return (
    <div className="flex">
      {/* SVG Map */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-[#22C55E]">●</span> Viñedo — Parcela Piloto 1ha
          </h3>
          <div className="flex gap-3 text-xs text-[#9CA3AF]">
            <span>Tempranillo · Espaldera · N-S</span>
          </div>
        </div>

        <svg viewBox="0 0 600 340" className="w-full">
          {/* Background field */}
          <rect x="20" y="20" width="560" height="300" rx="8" fill="#1a2e1a" stroke="#333" strokeWidth="1" />
          
          {/* Compass */}
          <text x="560" y="40" fill="#9CA3AF" fontSize="10" textAnchor="end">N ↑</text>

          {/* Rows */}
          {rows.map((row, i) => {
            const x = 40 + (i % 10) * 54
            const y = 50 + Math.floor(i / 10) * 150
            const isSelected = selected === row.id
            return (
              <g key={row.id} onClick={() => setSelected(row.id)} className="cursor-pointer">
                <rect
                  x={x} y={y} width="44" height="120" rx="4"
                  fill={ndviColor(row.ndvi)}
                  opacity={isSelected ? 1 : 0.7}
                  stroke={isSelected ? '#D4A843' : 'transparent'}
                  strokeWidth={isSelected ? 2 : 0}
                />
                <text x={x + 22} y={y + 14} textAnchor="middle" fill="#0F0F0F" fontSize="9" fontWeight="bold">
                  {row.label}
                </text>
                <text x={x + 22} y={y + 110} textAnchor="middle" fill="#0F0F0F" fontSize="8">
                  {row.ndvi.toFixed(2)}
                </text>
                {/* Vine dots */}
                {[30, 45, 60, 75, 90].map(dy => (
                  <circle key={dy} cx={x + 22} cy={y + dy} r="3" fill="#0F0F0F" opacity="0.4" />
                ))}
              </g>
            )
          })}

          {/* Sensors icons */}
          <circle cx="50" cy="38" r="5" fill="#60A5FA" />
          <text x="60" y="42" fill="#60A5FA" fontSize="8">T/HR</text>
          <circle cx="520" cy="38" r="5" fill="#22C55E" />
          <text x="530" y="42" fill="#22C55E" fontSize="8">Suelo</text>
        </svg>

        <div className="flex gap-4 mt-3 text-xs text-[#9CA3AF]">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#22C55E' }} /> NDVI &gt; 0.7</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#FBBF24' }} /> NDVI 0.5–0.7</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#EF4444' }} /> NDVI &lt; 0.5</span>
        </div>

        {/* Bottom info */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          <div className="bg-[#262626] rounded-lg p-3">
            <p className="text-[#9CA3AF]">Último vuelo dron</p>
            <p className="font-medium">25/03/2026 — NDVI prom: 0.72</p>
          </div>
          <div className="bg-[#262626] rounded-lg p-3">
            <p className="text-[#9CA3AF]">Robot UGV</p>
            <p className="font-medium text-[#FBBF24]">Mildiu detectado sector NE (3 focos)</p>
          </div>
          <div className="bg-[#262626] rounded-lg p-3">
            <p className="text-[#9CA3AF]">Fenología dominante</p>
            <p className="font-medium">Brotación avanzada</p>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {sel && (
        <div className="w-64 border-l border-[#333] p-4 bg-[#151515]">
          <h4 className="font-semibold text-[#D4A843] mb-3">Fila {sel.label}</h4>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-[#9CA3AF] text-xs">NDVI</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[#333] rounded-full">
                  <div className="h-2 rounded-full" style={{ width: `${sel.ndvi * 100}%`, background: ndviColor(sel.ndvi) }} />
                </div>
                <span className="font-mono text-xs">{sel.ndvi.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <p className="text-[#9CA3AF] text-xs">Cepas</p>
              <p>{sel.vines}</p>
            </div>
            <div>
              <p className="text-[#9CA3AF] text-xs">Fenología</p>
              <p className="capitalize">{sel.phenology}</p>
            </div>
            <div>
              <p className="text-[#9CA3AF] text-xs">Estrés hídrico</p>
              <p className="text-[#4ADE80]">Bajo</p>
            </div>
          </div>
          <button
            onClick={() => setSelected(null)}
            className="mt-4 text-xs text-[#9CA3AF] hover:text-white"
          >
            Cerrar ✕
          </button>
        </div>
      )}
    </div>
  )
}
