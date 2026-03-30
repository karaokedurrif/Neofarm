'use client'
import { useRef, useState, useMemo, useCallback, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/* ═══════════════════════════════════════════════════════
   BARREL DATA
   ═══════════════════════════════════════════════════════ */
interface BarrelData {
  id: string; row: string; col: number; level: number
  oak: string; cooper: string; toast: string; age: number
  usage: string; wine: string; rackingOverdue: boolean
}

const BARRELS: BarrelData[] = [
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `A${i + 1}`, row: 'A', col: i, level: 0,
    oak: 'Francés Allier', cooper: 'Taransaud', toast: 'Medio+',
    age: 1 + (i % 3), usage: ['Crianza', 'Reserva', 'Gran Reserva'][i % 3],
    wine: 'Tempranillo 2024', rackingOverdue: i === 2,
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `A${i + 9}`, row: 'A', col: i, level: 1,
    oak: 'Francés Nevers', cooper: 'Seguin Moreau', toast: 'Medio',
    age: 2 + (i % 2), usage: ['Crianza', 'Reserva'][i % 2],
    wine: 'Garnacha 2024', rackingOverdue: false,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `B${i + 1}`, row: 'B', col: i, level: 0,
    oak: 'Americano Missouri', cooper: 'Independent Stave', toast: 'Alto',
    age: 2 + (i % 4), usage: ['Crianza', 'Reserva'][i % 2],
    wine: 'Tempranillo 2023', rackingOverdue: i === 1,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `B${i + 7}`, row: 'B', col: i, level: 1,
    oak: 'Americano Missouri', cooper: 'Independent Stave', toast: 'Alto',
    age: 3 + (i % 3), usage: 'Reserva',
    wine: 'Tempranillo 2022', rackingOverdue: false,
  })),
]

const USAGE_COLORS: Record<string, string> = {
  Crianza: '#D4A843',
  Reserva: '#B45309',
  'Gran Reserva': '#7F1D1D',
}

/* ═══════════════════════════════════════════════════════
   BARREL GEOMETRY — LatheGeometry with realistic bulge
   ═══════════════════════════════════════════════════════ */
function createBarrelGeometry(): THREE.LatheGeometry {
  const points: THREE.Vector2[] = []
  const segments = 20
  const halfLen = 0.45 // half-length of barrel (-0.45 to 0.45)
  const rEnd = 0.32   // end radius (head)
  const rMid = 0.40   // belly radius

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const y = -halfLen + t * (2 * halfLen)
    // parabolic bulge: max at center, min at ends
    const bulge = 1 - Math.pow(2 * t - 1, 2)
    const r = rEnd + (rMid - rEnd) * bulge
    points.push(new THREE.Vector2(r, y))
  }
  return new THREE.LatheGeometry(points, 24)
}

/* ═══════════════════════════════════════════════════════
   BARREL 3D — photorealistic oak barrel with bands
   ═══════════════════════════════════════════════════════ */
const Barrel3D = memo(function Barrel3D({ data, onClick, selected }: { data: BarrelData; onClick: () => void; selected: boolean }) {
  const [hovered, setHovered] = useState(false)
  const onEnter = useCallback(() => setHovered(true), [])
  const onLeave = useCallback(() => setHovered(false), [])

  const barrelGeo = useMemo(() => createBarrelGeometry(), [])

  const baseColor = useMemo(() => {
    const factor = Math.max(0.35, 1 - data.age * 0.13)
    return new THREE.Color('#8B6914').multiplyScalar(factor)
  }, [data.age])

  const usageColor = USAGE_COLORS[data.usage] || '#D4A843'

  const x = (data.row === 'A' ? -3 : 3)
  const y = 0.45 + data.level * 1.05
  const z = -4.5 + data.col * 1.2

  return (
    <group position={[x, y, z]}>
      {/* Barrel body — LatheGeometry with bulge, laid on side */}
      <mesh
        geometry={barrelGeo}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        onClick={onClick}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
      >
        <meshStandardMaterial
          color={baseColor}
          roughness={0.82}
          metalness={0.04}
          emissive={hovered || selected ? usageColor : '#000000'}
          emissiveIntensity={hovered ? 0.35 : selected ? 0.2 : 0}
        />
      </mesh>

      {/* Barrel heads (flat end caps) */}
      {[-0.46, 0.46].map((offset, i) => (
        <mesh key={`head-${i}`} position={[offset, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <circleGeometry args={[0.32, 24]} />
          <meshStandardMaterial
            color={new THREE.Color('#8B6914').multiplyScalar(Math.max(0.38, 1 - data.age * 0.12))}
            roughness={0.88}
            metalness={0.03}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Metal bands (6 bands at realistic positions) */}
      {[-0.40, -0.28, -0.12, 0.12, 0.28, 0.40].map((pos, i) => {
        const t = (pos + 0.45) / 0.9
        const bulge = 1 - Math.pow(2 * t - 1, 2)
        const r = 0.32 + (0.40 - 0.32) * bulge
        return (
          <mesh key={`band-${i}`} position={[pos, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[r + 0.005, 0.008, 6, 24]} />
            <meshStandardMaterial color="#4A4A4A" metalness={0.92} roughness={0.25} />
          </mesh>
        )
      })}

      {/* Bung hole (top center) */}
      <group position={[0, 0.40, 0]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.04, 0.04, 12]} />
          <meshStandardMaterial color="#3A3A3A" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Bung cork */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.03, 0.035, 0.03, 8]} />
          <meshStandardMaterial color="#997744" roughness={0.95} metalness={0} />
        </mesh>
      </group>

      {/* Racking overdue indicator — pulsing red LED */}
      {data.rackingOverdue && (
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
      )}

      {/* Usage color tag (hanging from metal band) */}
      <group position={[0.48, 0, 0]}>
        <mesh><planeGeometry args={[0.14, 0.22]} /><meshStandardMaterial color={usageColor} side={THREE.DoubleSide} roughness={0.7} /></mesh>
        <Text position={[0, -0.08, 0.01]} fontSize={0.06} color="#FFF" anchorX="center">{data.usage.charAt(0)}</Text>
      </group>

      {/* Permanent IoT label (temp + humidity) */}
      <Html position={[0, -0.55, 0]} center distanceFactor={6} transform occlude={false}>
        <div className="bg-[#0F0F0F]/85 border border-[#4A3520] rounded px-1.5 py-0.5 text-[9px] whitespace-nowrap pointer-events-none select-none font-mono">
          <span className="text-[#D4A843]">{data.id}</span>
          <span className="text-[#555] mx-0.5">·</span>
          <span className="text-[#E5E5E5]">{data.age}a</span>
        </div>
      </Html>

      {/* Hover HUD */}
      {hovered && (
        <Html position={[0, 1.3, 0]} center>
          <div className="bg-[#1A1A1A]/95 border border-[#D4A843] rounded-lg px-4 py-3 text-xs whitespace-nowrap backdrop-blur-sm min-w-[180px]">
            <p className="text-[#D4A843] font-bold text-sm mb-1">Barrica {data.id}</p>
            <div className="space-y-0.5 text-[#E5E5E5]">
              <p>Roble: {data.oak}</p>
              <p>Tonelería: {data.cooper}</p>
              <p>Tostado: {data.toast}</p>
              <p>Edad: <span className="font-mono">{data.age} años</span></p>
              <p>Uso: <span style={{ color: usageColor }}>{data.usage}</span></p>
              <p>Vino: {data.wine}</p>
              {data.rackingOverdue && (
                <p className="text-[#EF4444] font-bold mt-1">⚠ Trasiego vencido</p>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
})

/* ═══════════════════════════════════════════════════════
   BARREL RACK — wooden cradle structure
   ═══════════════════════════════════════════════════════ */
function BarrelRack({ row, xPos, count }: { row: string; count: number; xPos: number }) {
  const zStart = -4.5
  const zEnd = zStart + (count - 1) * 1.2
  const zCenter = (zStart + zEnd) / 2
  const length = zEnd - zStart + 0.8

  return (
    <group position={[xPos, 0, zCenter]}>
      {/* Bottom cradle beams (2 long rails) */}
      {[-0.3, 0.3].map((offset, i) => (
        <mesh key={`rail-${i}`} position={[offset, 0.12, 0]} castShadow>
          <boxGeometry args={[0.12, 0.12, length]} />
          <meshStandardMaterial color="#5C4033" roughness={0.92} metalness={0.02} />
        </mesh>
      ))}

      {/* V-cradle supports per barrel position */}
      {Array.from({ length: count }, (_, i) => {
        const z = zStart + i * 1.2 - zCenter
        return (
          <group key={`cradle-${i}`} position={[0, 0.15, z]}>
            {/* Left V wedge */}
            <mesh position={[-0.25, 0.08, 0]} rotation={[0, 0, 0.5]} castShadow>
              <boxGeometry args={[0.06, 0.2, 0.15]} />
              <meshStandardMaterial color="#6B5035" roughness={0.9} />
            </mesh>
            {/* Right V wedge */}
            <mesh position={[0.25, 0.08, 0]} rotation={[0, 0, -0.5]} castShadow>
              <boxGeometry args={[0.06, 0.2, 0.15]} />
              <meshStandardMaterial color="#6B5035" roughness={0.9} />
            </mesh>
          </group>
        )
      })}

      {/* Mid-level shelf beams */}
      {[-0.35, 0.35].map((offset, i) => (
        <mesh key={`shelf-${i}`} position={[offset, 0.95, 0]} castShadow>
          <boxGeometry args={[0.1, 0.1, length]} />
          <meshStandardMaterial color="#5C4033" roughness={0.92} metalness={0.02} />
        </mesh>
      ))}

      {/* Vertical posts at ends */}
      {[zStart - zCenter - 0.3, zEnd - zCenter + 0.3].map((z, i) => (
        <group key={`post-${i}`}>
          {[-0.4, 0.4].map((offset, j) => (
            <mesh key={`vpost-${j}`} position={[offset, 1.05, z]} castShadow>
              <boxGeometry args={[0.1, 2.1, 0.1]} />
              <meshStandardMaterial color="#5C4033" roughness={0.92} metalness={0.02} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Row label */}
      <Text position={[0, 2.4, 0]} fontSize={0.3} color="#D4A843" anchorX="center" font={undefined}>
        {`Fila ${row}`}
      </Text>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   BARREL ROOM ENVIRONMENT — stone cave
   ═══════════════════════════════════════════════════════ */
function BarrelRoomEnv() {
  return (
    <group>
      {/* Stone floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#3A2F28" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* Stone walls */}
      <mesh position={[0, 2.5, -8]} receiveShadow><boxGeometry args={[16, 5, 0.5]} /><meshStandardMaterial color="#5A4A3A" roughness={0.96} /></mesh>
      <mesh position={[-8, 2.5, 0]} receiveShadow><boxGeometry args={[0.5, 5, 16]} /><meshStandardMaterial color="#5A4A3A" roughness={0.96} /></mesh>
      <mesh position={[8, 2.5, 0]} receiveShadow><boxGeometry args={[0.5, 5, 16]} /><meshStandardMaterial color="#5A4A3A" roughness={0.96} /></mesh>

      {/* Arched ceiling */}
      <mesh position={[0, 4.0, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[8, 8, 16, 32, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#4A3A2A" roughness={1} side={THREE.BackSide} />
      </mesh>

      {/* Decorative archway ribs */}
      {[-6, -3, 0, 3, 6].map((z, i) => (
        <mesh key={`rib-${i}`} position={[0, 4, z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[7.5, 0.12, 6, 32, Math.PI]} />
          <meshStandardMaterial color="#4F3D2D" roughness={0.95} />
        </mesh>
      ))}

      {/* Floor drain channel (center) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <planeGeometry args={[0.15, 12]} />
        <meshStandardMaterial color="#2A2218" roughness={0.98} />
      </mesh>

      {/* Wall sconce torches */}
      {[
        [-7.6, 2.8, -4], [-7.6, 2.8, 4],
        [7.6, 2.8, -4], [7.6, 2.8, 4],
      ].map((pos, i) => (
        <group key={`torch-${i}`} position={pos as [number, number, number]}>
          <mesh><cylinderGeometry args={[0.04, 0.03, 0.25, 6]} /><meshStandardMaterial color="#444" metalness={0.7} roughness={0.3} /></mesh>
          <pointLight position={[0, 0.3, 0]} intensity={0.35} color="#FF8833" distance={6} />
        </group>
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   HYGROMETER + THERMOMETER SENSOR
   ═══════════════════════════════════════════════════════ */
function CaveSensor({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh><boxGeometry args={[0.25, 0.18, 0.06]} /><meshStandardMaterial color="#2A2A2A" metalness={0.4} roughness={0.5} /></mesh>
      <mesh position={[0.06, 0, 0.04]}><sphereGeometry args={[0.02, 8, 8]} /><meshStandardMaterial color="#4ADE80" emissive="#4ADE80" emissiveIntensity={1} toneMapped={false} /></mesh>
      <Html position={[0, 0.2, 0]} center distanceFactor={8} transform>
        <div className="bg-[#0F0F0F]/85 border border-[#4ADE80]/30 rounded px-2 py-0.5 text-[9px] whitespace-nowrap pointer-events-none font-mono">
          <span className="text-[#4ADE80]">14°C</span>
          <span className="text-[#555] mx-1">·</span>
          <span className="text-[#60A5FA]">78% HR</span>
        </div>
      </Html>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════ */
interface BarrelRoomSceneProps {
  onBarrelSelect?: (barrelId: string | null) => void
}

export default function BarrelRoomScene({ onBarrelSelect }: BarrelRoomSceneProps) {
  const [selectedBarrel, setSelectedBarrel] = useState<string | null>(null)

  const handleBarrelClick = useCallback((id: string) => {
    setSelectedBarrel(prev => {
      const newVal = prev === id ? null : id
      onBarrelSelect?.(newVal)
      return newVal
    })
  }, [onBarrelSelect])

  return (
    <group>
      <BarrelRoomEnv />

      <BarrelRack row="A" xPos={-3} count={8} />
      <BarrelRack row="B" xPos={3} count={6} />

      {BARRELS.map(barrel => (
        <Barrel3D
          key={barrel.id}
          data={barrel}
          onClick={() => handleBarrelClick(barrel.id)}
          selected={selectedBarrel === barrel.id}
        />
      ))}

      {/* Overhead cave ambience */}
      <pointLight position={[0, 3.5, 0]} intensity={0.3} color="#FFAA55" distance={10} />

      {/* Cave sensors */}
      <CaveSensor position={[0, 3.2, -7.5]} />
      <CaveSensor position={[7.5, 2, 0]} />

      {/* Room label */}
      <Html position={[0, 4.5, -7.5]} center distanceFactor={10} transform>
        <div className="bg-[#0F0F0F]/80 border border-[#D4A843]/40 rounded-lg px-4 py-2 pointer-events-none select-none">
          <p className="text-[#D4A843] text-sm font-semibold tracking-wider">SALA DE BARRICAS</p>
          <p className="text-[#999] text-[10px] mt-0.5 font-mono">28 barricas · 14°C · 78% HR</p>
        </div>
      </Html>
    </group>
  )
}
