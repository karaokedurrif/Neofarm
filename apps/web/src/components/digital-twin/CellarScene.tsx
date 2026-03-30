'use client'
import { useRef, useState, useMemo, useCallback, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text, RoundedBox, Cylinder } from '@react-three/drei'
import * as THREE from 'three'

/* ═══════════════════════════════════════════════════════
   TANK DATA
   ═══════════════════════════════════════════════════════ */
interface TankData {
  id: string
  name: string
  capacity: number
  fill: number
  temp: number
  co2: number
  ph: number
  status: string
  wine: string
  position: [number, number, number]
}

const TANKS: TankData[] = [
  { id: 'D01', name: 'Depósito 01', capacity: 10000, fill: 0.85, temp: 14.5, co2: 700, ph: 3.52, status: 'Fermentando', wine: 'Tempranillo 2025', position: [-5, 0, -3] },
  { id: 'D02', name: 'Depósito 02', capacity: 10000, fill: 0, temp: 12.0, co2: 420, ph: 0, status: 'Vacío', wine: '—', position: [-2, 0, -3] },
  { id: 'D03', name: 'Depósito 03', capacity: 5000, fill: 1.0, temp: 13.2, co2: 580, ph: 3.48, status: 'FML', wine: 'Garnacha 2025', position: [1, 0, -3] },
  { id: 'D04', name: 'Depósito 04', capacity: 5000, fill: 0.4, temp: 16.0, co2: 510, ph: 3.61, status: 'Maceración', wine: 'Tempranillo 2025', position: [4, 0, -3] },
  { id: 'D05', name: 'Depósito 05', capacity: 8000, fill: 0.95, temp: 14.0, co2: 620, ph: 3.55, status: 'Estabilización', wine: 'Crianza 2024', position: [-4, 0, 2.5] },
  { id: 'D06', name: 'Depósito 06', capacity: 8000, fill: 0.6, temp: 15.1, co2: 480, ph: 3.58, status: 'Crianza', wine: 'Reserva 2023', position: [-0.5, 0, 2.5] },
  { id: 'D07', name: 'Depósito 07', capacity: 8000, fill: 0.75, temp: 13.8, co2: 550, ph: 3.50, status: 'Fermentando', wine: 'Merlot 2025', position: [3, 0, 2.5] },
]

const STATUS_COLORS: Record<string, string> = {
  Fermentando: '#EF4444',
  Vacío: '#555555',
  FML: '#8B5CF6',
  Maceración: '#F59E0B',
  Estabilización: '#3B82F6',
  Crianza: '#D4A843',
}

/* ═══════════════════════════════════════════════════════
   TANK — stainless steel cylinder with dome, piping, IoT
   ═══════════════════════════════════════════════════════ */
function Tank({ data, onClick, selected }: { data: TankData; onClick: () => void; selected: boolean }) {
  const [hovered, setHovered] = useState(false)
  const liquidRef = useRef<THREE.Mesh>(null)
  const onEnter = useCallback(() => setHovered(true), [])
  const onLeave = useCallback(() => setHovered(false), [])

  const statusColor = STATUS_COLORS[data.status] || '#555'
  const height = data.capacity >= 10000 ? 4.0 : data.capacity >= 8000 ? 3.5 : 2.8
  const radius = data.capacity >= 10000 ? 0.9 : data.capacity >= 8000 ? 0.8 : 0.6

  useFrame((state) => {
    if (liquidRef.current && data.status === 'Fermentando') {
      const mat = liquidRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.1
    }
  })

  return (
    <group position={[data.position[0], data.position[1] + height / 2, data.position[2]]} onClick={onClick} onPointerEnter={onEnter} onPointerLeave={onLeave}>
      {/* Tank body — brushed stainless steel */}
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshStandardMaterial color="#C8C8C8" metalness={0.85} roughness={0.18} envMapIntensity={1.2} />
      </mesh>

      {/* Top dome (dished head) */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <sphereGeometry args={[radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#D4D4D4" metalness={0.9} roughness={0.15} envMapIntensity={1.0} />
      </mesh>

      {/* Bottom cone */}
      <mesh position={[0, -height / 2 - 0.2, 0]} castShadow>
        <coneGeometry args={[radius, 0.5, 32]} />
        <meshStandardMaterial color="#B8B8B8" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Tank legs (3) */}
      {[0, 120, 240].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        return (
          <mesh key={i} position={[Math.cos(rad) * (radius + 0.05), -height / 2 - 0.5, Math.sin(rad) * (radius + 0.05)]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.6, 6]} />
            <meshStandardMaterial color="#999" metalness={0.8} roughness={0.3} />
          </mesh>
        )
      })}

      {/* Weld seams — 3 horizontal rings */}
      {[-0.5, 0, 0.5].map((y, i) => (
        <mesh key={i} position={[0, y * (height / 2), 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[radius + 0.002, 0.008, 6, 32]} />
          <meshStandardMaterial color="#A0A0A0" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}

      {/* Manhole on top */}
      <mesh position={[0, height / 2 + 0.25, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.08, 16]} />
        <meshStandardMaterial color="#AAA" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0.12, height / 2 + 0.3, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 6]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Valve outlet (side) */}
      <group position={[radius + 0.08, -height / 4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh><cylinderGeometry args={[0.05, 0.05, 0.2, 8]} /><meshStandardMaterial color="#A0A0A0" metalness={0.9} roughness={0.15} /></mesh>
        <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.08, 0.08, 0.03, 12]} /><meshStandardMaterial color="#C44" metalness={0.6} roughness={0.4} /></mesh>
      </group>

      {/* Sight glass */}
      <mesh position={[radius + 0.01, 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.25, 16]} />
        <meshStandardMaterial color="#5588AA" metalness={0.2} roughness={0.1} transparent opacity={0.6} />
      </mesh>

      {/* Liquid fill */}
      {data.fill > 0 && (
        <mesh ref={liquidRef} position={[0, -height / 2 + (height * data.fill) / 2, 0]}>
          <cylinderGeometry args={[radius * 0.95, radius * 0.95, height * data.fill, 32]} />
          <meshStandardMaterial color={statusColor} transparent opacity={0.55} emissive={statusColor} emissiveIntensity={0.15} />
        </mesh>
      )}

      {/* Selection ring */}
      {(selected || hovered) && (
        <mesh position={[0, -height / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius + 0.15, radius + 0.25, 32]} />
          <meshBasicMaterial color="#D4A843" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Temperature LED */}
      <mesh position={[radius + 0.12, 0.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial
          color={data.temp > 20 ? '#EF4444' : data.temp > 16 ? '#FBBF24' : '#4ADE80'}
          emissive={data.temp > 20 ? '#EF4444' : data.temp > 16 ? '#FBBF24' : '#4ADE80'}
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>

      {/* ID Label plate */}
      <Text position={[0, height / 2 + 0.55, 0]} fontSize={0.22} color="#E5E5E5" anchorX="center" anchorY="bottom" font={undefined}>
        {data.id}
      </Text>

      {/* ═══ PERMANENT IoT DATA LABEL ═══ */}
      <Html position={[0, -height / 2 - 0.1, radius + 0.3]} center distanceFactor={8} transform occlude={false}>
        <div className="bg-[#0F0F0F]/90 border border-[#333] rounded px-2 py-1 text-[10px] whitespace-nowrap pointer-events-none select-none">
          <span className="text-[#4ADE80] font-mono">{data.temp}°C</span>
          <span className="text-[#666] mx-1">|</span>
          <span className="text-[#60A5FA] font-mono">{data.co2} ppm</span>
          {data.ph > 0 && <>
            <span className="text-[#666] mx-1">|</span>
            <span className="text-[#FBBF24] font-mono">pH {data.ph}</span>
          </>}
        </div>
      </Html>

      {/* Detailed HUD on hover */}
      {hovered && (
        <Html position={[0, height / 2 + 1.2, 0]} center>
          <div className="bg-[#1A1A1A]/95 border border-[#D4A843] rounded-lg px-4 py-3 text-xs whitespace-nowrap backdrop-blur-sm min-w-[180px]">
            <p className="text-[#D4A843] font-bold text-sm mb-1">{data.name}</p>
            <div className="space-y-1 text-[#E5E5E5]">
              <p>Estado: <span style={{ color: statusColor }}>{data.status}</span></p>
              <p>Temp: <span className="font-mono text-[#4ADE80]">{data.temp}°C</span></p>
              <p>CO₂: <span className="font-mono text-[#60A5FA]">{data.co2} ppm</span></p>
              {data.ph > 0 && <p>pH: <span className="font-mono text-[#FBBF24]">{data.ph}</span></p>}
              <p>Llenado: {Math.round(data.fill * 100)}%</p>
              <p>Capacidad: {(data.capacity / 1000).toFixed(0)}k L</p>
              <p>Vino: {data.wine}</p>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   PIPING SYSTEM — interconnected tank piping
   ═══════════════════════════════════════════════════════ */
function PipingSystem() {
  const pipeColor = '#A8A8A8'
  return (
    <group>
      {/* Main header pipe (runs along ceiling) */}
      <mesh position={[0, 5.2, -3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 12, 8]} />
        <meshStandardMaterial color={pipeColor} metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0, 5.2, 2.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 10, 8]} />
        <meshStandardMaterial color={pipeColor} metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Vertical drops to each tank */}
      {TANKS.map((t) => (
        <mesh key={t.id + '-pipe'} position={[t.position[0], 3.5, t.position[2]]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 3.5, 6]} />
          <meshStandardMaterial color={pipeColor} metalness={0.9} roughness={0.15} />
        </mesh>
      ))}
      {/* Pump station */}
      <group position={[7, 0.4, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.6, 0.5]} />
          <meshStandardMaterial color="#4A4A4A" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.3, 12]} />
          <meshStandardMaterial color={pipeColor} metalness={0.9} roughness={0.15} />
        </mesh>
        <Text position={[0, 0.5, 0.26]} fontSize={0.12} color="#9CA3AF" anchorX="center">BOMBA P-01</Text>
      </group>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   CATWALK — elevated steel grating walkway
   ═══════════════════════════════════════════════════════ */
function Catwalk() {
  return (
    <group>
      {/* Platform */}
      <mesh position={[0, 4.2, 0]} receiveShadow>
        <boxGeometry args={[14, 0.06, 1.5]} />
        <meshStandardMaterial color="#666" metalness={0.7} roughness={0.4} transparent opacity={0.8} />
      </mesh>
      {/* Railing */}
      <mesh position={[0, 4.7, 0.7]}>
        <boxGeometry args={[14, 0.04, 0.04]} />
        <meshStandardMaterial color="#777" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4.7, -0.7]}>
        <boxGeometry args={[14, 0.04, 0.04]} />
        <meshStandardMaterial color="#777" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Supports */}
      {[-6, -3, 0, 3, 6].map((x, i) => (
        <mesh key={i} position={[x, 2.1, 0.7]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 4.2, 6]} />
          <meshStandardMaterial color="#777" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* Stairs */}
      <group position={[-7.5, 0, 0.5]} rotation={[0, 0, -0.55]}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[0, i * 0.52, 0]}>
            <boxGeometry args={[0.6, 0.04, 0.8]} />
            <meshStandardMaterial color="#666" metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   CELLAR FLOOR + WALLS — industrial concrete
   ═══════════════════════════════════════════════════════ */
function CellarFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[22, 18]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.85} metalness={0.08} />
      </mesh>
      {/* Epoxy floor markings */}
      {TANKS.map((t) => (
        <mesh key={t.id + '-mark'} rotation={[-Math.PI / 2, 0, 0]} position={[t.position[0], 0.005, t.position[2]]}>
          <ringGeometry args={[0.9, 1.0, 32]} />
          <meshBasicMaterial color="#D4A843" transparent opacity={0.25} />
        </mesh>
      ))}
      {/* Walls */}
      <mesh position={[0, 3.5, -9]} receiveShadow><boxGeometry args={[22, 7, 0.3]} /><meshStandardMaterial color="#3A3530" roughness={0.92} metalness={0.05} /></mesh>
      <mesh position={[-11, 3.5, 0]} receiveShadow><boxGeometry args={[0.3, 7, 18]} /><meshStandardMaterial color="#3A3530" roughness={0.92} metalness={0.05} /></mesh>
      <mesh position={[11, 3.5, 0]} receiveShadow><boxGeometry args={[0.3, 7, 18]} /><meshStandardMaterial color="#3A3530" roughness={0.92} metalness={0.05} /></mesh>
      {/* Ceiling */}
      <mesh position={[0, 7, 0]}><boxGeometry args={[22, 0.2, 18]} /><meshStandardMaterial color="#2E2E2E" roughness={0.9} side={THREE.BackSide} /></mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   RECEPTION + LAB + BOTTLING
   ═══════════════════════════════════════════════════════ */
function ReceptionArea() {
  return (
    <group position={[8, 0, -6]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2.2, 1, 1.8]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <coneGeometry args={[1.2, 0.5, 4]} />
        <meshStandardMaterial color="#999" metalness={0.85} roughness={0.2} />
      </mesh>
      <Text position={[0, 1.8, 0]} fontSize={0.18} color="#9CA3AF" anchorX="center">RECEPCIÓN</Text>
    </group>
  )
}

function LabArea() {
  return (
    <group position={[-8, 0, 6]}>
      <RoundedBox args={[2.5, 0.9, 1.2]} radius={0.05} position={[0, 0.45, 0]} castShadow>
        <meshStandardMaterial color="#E8E8E8" roughness={0.25} metalness={0.3} envMapIntensity={0.8} />
      </RoundedBox>
      <mesh position={[-0.5, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.35, 12]} />
        <meshStandardMaterial color="#D4D4D4" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.4, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.25, 12]} />
        <meshStandardMaterial color="#B0B0B0" metalness={0.85} roughness={0.15} />
      </mesh>
      <Text position={[0, 1.7, 0]} fontSize={0.18} color="#9CA3AF" anchorX="center">LABORATORIO</Text>
    </group>
  )
}

function BottlingLine() {
  return (
    <group position={[8, 0, 6]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[3.5, 0.25, 0.8]} />
        <meshStandardMaterial color="#666" metalness={0.75} roughness={0.25} />
      </mesh>
      {[[-1.4, 0, 0.3], [1.4, 0, 0.3], [-1.4, 0, -0.3], [1.4, 0, -0.3]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.2, p[2]]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 6]} />
          <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <Text position={[0, 1.3, 0]} fontSize={0.18} color="#9CA3AF" anchorX="center">EMBOTELLADO</Text>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   CO2 SENSOR ARRAY
   ═══════════════════════════════════════════════════════ */
function CO2Sensor({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh><boxGeometry args={[0.2, 0.15, 0.08]} /><meshStandardMaterial color="#333" metalness={0.5} roughness={0.4} /></mesh>
      <mesh position={[0, 0.04, 0.05]}><sphereGeometry args={[0.025, 8, 8]} /><meshStandardMaterial color="#4ADE80" emissive="#4ADE80" emissiveIntensity={1} toneMapped={false} /></mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════ */
interface CellarSceneProps {
  onTankSelect?: (tankId: string | null) => void
}

export default function CellarScene({ onTankSelect }: CellarSceneProps) {
  const [selectedTank, setSelectedTank] = useState<string | null>(null)

  const handleTankClick = useCallback((id: string) => {
    setSelectedTank(prev => {
      const newVal = prev === id ? null : id
      onTankSelect?.(newVal)
      return newVal
    })
  }, [onTankSelect])

  return (
    <group>
      <CellarFloor />
      <PipingSystem />
      <Catwalk />

      {TANKS.map(tank => (
        <Tank key={tank.id} data={tank} onClick={() => handleTankClick(tank.id)} selected={selectedTank === tank.id} />
      ))}

      <ReceptionArea />
      <LabArea />
      <BottlingLine />

      {/* CO2 sensors on walls */}
      <CO2Sensor position={[-10.7, 3, -3]} />
      <CO2Sensor position={[10.7, 3, -3]} />
      <CO2Sensor position={[0, 5.5, -8.7]} />

      {/* Industrial lighting */}
      <pointLight position={[-5, 5.5, 0]} intensity={0.8} color="#FFCC88" distance={14} />
      <pointLight position={[5, 5.5, 0]} intensity={0.8} color="#FFCC88" distance={14} />
      <pointLight position={[0, 6, -5]} intensity={0.5} color="#FFAA66" distance={12} />
      <pointLight position={[0, 6, 5]} intensity={0.5} color="#FFAA66" distance={12} />

      {/* Overhead ambient label */}
      <Html position={[0, 6.2, -8.5]} center distanceFactor={12} transform>
        <div className="bg-[#0F0F0F]/85 border border-[#4ADE80]/40 rounded px-3 py-1 text-[11px] whitespace-nowrap pointer-events-none">
          <span className="text-[#4ADE80]">CO₂</span>
          <span className="text-[#666] mx-1">:</span>
          <span className="text-[#E5E5E5] font-mono">700 ppm</span>
          <span className="text-[#666] mx-2">|</span>
          <span className="text-[#60A5FA]">Temp</span>
          <span className="text-[#666] mx-1">:</span>
          <span className="text-[#E5E5E5] font-mono">15°C</span>
          <span className="text-[#666] mx-2">|</span>
          <span className="text-[#FBBF24]">HR</span>
          <span className="text-[#666] mx-1">:</span>
          <span className="text-[#E5E5E5] font-mono">72%</span>
        </div>
      </Html>
    </group>
  )
}
