'use client'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'

interface BarrelData {
  id: string
  row: string
  col: number
  level: number
  oak: string
  cooper: string
  toast: string
  age: number
  usage: string
  wine: string
  rackingOverdue: boolean
}

const BARRELS: BarrelData[] = [
  // Row A - French oak
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `A${i + 1}`,
    row: 'A',
    col: i,
    level: 0,
    oak: 'Francés Allier',
    cooper: 'Taransaud',
    toast: 'Medio+',
    age: 1 + (i % 3),
    usage: ['Crianza', 'Reserva', 'Gran Reserva'][i % 3],
    wine: 'Tempranillo 2024',
    rackingOverdue: i === 2,
  })),
  // Row A level 2
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `A${i + 9}`,
    row: 'A',
    col: i,
    level: 1,
    oak: 'Francés Nevers',
    cooper: 'Seguin Moreau',
    toast: 'Medio',
    age: 2 + (i % 2),
    usage: ['Crianza', 'Reserva'][i % 2],
    wine: 'Garnacha 2024',
    rackingOverdue: false,
  })),
  // Row B - American oak
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `B${i + 1}`,
    row: 'B',
    col: i,
    level: 0,
    oak: 'Americano Missouri',
    cooper: 'Independent Stave',
    toast: 'Alto',
    age: 2 + (i % 4),
    usage: ['Crianza', 'Reserva'][i % 2],
    wine: 'Tempranillo 2023',
    rackingOverdue: i === 1,
  })),
  // Row B level 2
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `B${i + 7}`,
    row: 'B',
    col: i,
    level: 1,
    oak: 'Americano Missouri',
    cooper: 'Independent Stave',
    toast: 'Alto',
    age: 3 + (i % 3),
    usage: 'Reserva',
    wine: 'Tempranillo 2022',
    rackingOverdue: false,
  })),
]

const USAGE_COLORS: Record<string, string> = {
  Crianza: '#D4A843',
  Reserva: '#B45309',
  'Gran Reserva': '#7F1D1D',
}

function Barrel3D({ data, onClick, selected }: { data: BarrelData; onClick: () => void; selected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const baseColor = useMemo(() => {
    // Darker with age
    const factor = Math.max(0.4, 1 - data.age * 0.15)
    return new THREE.Color('#8B6914').multiplyScalar(factor)
  }, [data.age])

  const usageColor = USAGE_COLORS[data.usage] || '#D4A843'

  const x = (data.row === 'A' ? -3 : 3) + 0
  const y = 0.45 + data.level * 1.0
  const z = -4 + data.col * 1.15

  return (
    <group position={[x, y, z]}>
      {/* Barrel body (cylinder on side) */}
      <mesh
        ref={meshRef}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Barrel shape: slightly bulging cylinder */}
        <cylinderGeometry args={[0.38, 0.38, 0.9, 16]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.85}
          metalness={0.05}
          emissive={hovered || selected ? usageColor : '#000000'}
          emissiveIntensity={hovered ? 0.3 : selected ? 0.2 : 0}
        />
      </mesh>

      {/* Metal bands */}
      {[-0.35, -0.15, 0.15, 0.35].map((zOffset, i) => (
        <mesh key={i} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
          <torusGeometry args={[0.39, 0.01, 8, 32]} />
          <meshStandardMaterial color="#555" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}

      {/* Bung hole */}
      <mesh position={[0, 0.39, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.05, 12]} />
        <meshStandardMaterial color="#444" metalness={0.8} />
      </mesh>

      {/* Racking overdue indicator */}
      {data.rackingOverdue && (
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.5} />
        </mesh>
      )}

      {/* Usage color tag */}
      <mesh position={[0.46, 0, 0]}>
        <planeGeometry args={[0.12, 0.2]} />
        <meshStandardMaterial color={usageColor} side={THREE.DoubleSide} />
      </mesh>

      {/* HUD */}
      {hovered && (
        <Html position={[0, 1.2, 0]} center>
          <div className="bg-[#1A1A1A]/95 border border-[#D4A843] rounded-lg px-4 py-3 text-xs whitespace-nowrap backdrop-blur-sm min-w-[180px]">
            <p className="text-[#D4A843] font-bold text-sm mb-1">Barrica {data.id}</p>
            <div className="space-y-0.5 text-[#E5E5E5]">
              <p>Roble: {data.oak}</p>
              <p>Tonelería: {data.cooper}</p>
              <p>Tostado: {data.toast}</p>
              <p>Edad: {data.age} años</p>
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
}

function BarrelRack({ row, xPos }: { row: string; xPos: number }) {
  return (
    <group position={[xPos, 0, 0]}>
      {/* Rack structure */}
      {[-4.5, 4.5].map((z, i) => (
        <group key={i}>
          {/* Vertical posts */}
          <mesh position={[0, 1, z]} castShadow>
            <boxGeometry args={[0.08, 2, 0.08]} />
            <meshStandardMaterial color="#5C4033" roughness={0.9} />
          </mesh>
          {/* Cross beams */}
          <mesh position={[0, 0.9, z]} castShadow>
            <boxGeometry args={[1.2, 0.06, 0.06]} />
            <meshStandardMaterial color="#5C4033" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Row label */}
      <Text
        position={[0, 2.3, 0]}
        fontSize={0.3}
        color="#D4A843"
        anchorX="center"
      >
        {`Fila ${row}`}
      </Text>
    </group>
  )
}

function BarrelRoomFloor() {
  return (
    <group>
      {/* Stone floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#3A2F28" roughness={0.95} metalness={0} />
      </mesh>

      {/* Stone walls */}
      <mesh position={[0, 2, -7]} receiveShadow>
        <boxGeometry args={[14, 4, 0.4]} />
        <meshStandardMaterial color="#5A4A3A" roughness={0.95} />
      </mesh>
      <mesh position={[-7, 2, 0]} receiveShadow>
        <boxGeometry args={[0.4, 4, 14]} />
        <meshStandardMaterial color="#5A4A3A" roughness={0.95} />
      </mesh>
      <mesh position={[7, 2, 0]} receiveShadow>
        <boxGeometry args={[0.4, 4, 14]} />
        <meshStandardMaterial color="#5A4A3A" roughness={0.95} />
      </mesh>

      {/* Arched ceiling suggestion */}
      <mesh position={[0, 3.5, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[7, 7, 14, 32, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#4A3A2A" roughness={1} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

interface BarrelRoomSceneProps {
  onBarrelSelect?: (barrelId: string | null) => void
}

export default function BarrelRoomScene({ onBarrelSelect }: BarrelRoomSceneProps) {
  const [selectedBarrel, setSelectedBarrel] = useState<string | null>(null)

  const handleBarrelClick = (id: string) => {
    const newSelection = selectedBarrel === id ? null : id
    setSelectedBarrel(newSelection)
    onBarrelSelect?.(newSelection)
  }

  return (
    <group>
      <BarrelRoomFloor />

      <BarrelRack row="A" xPos={-3} />
      <BarrelRack row="B" xPos={3} />

      {BARRELS.map(barrel => (
        <Barrel3D
          key={barrel.id}
          data={barrel}
          onClick={() => handleBarrelClick(barrel.id)}
          selected={selectedBarrel === barrel.id}
        />
      ))}

      {/* Ambient candle-like lights */}
      <pointLight position={[-5, 2, 0]} intensity={0.5} color="#FF8833" distance={8} />
      <pointLight position={[5, 2, 0]} intensity={0.5} color="#FF8833" distance={8} />
      <pointLight position={[0, 2.5, -5]} intensity={0.3} color="#FFAA55" distance={6} />
      <pointLight position={[0, 2.5, 5]} intensity={0.3} color="#FFAA55" distance={6} />

      {/* Humidity/temp sensor */}
      <group position={[0, 3, -6.5]}>
        <mesh>
          <boxGeometry args={[0.3, 0.2, 0.1]} />
          <meshStandardMaterial color="#333" metalness={0.5} />
        </mesh>
        <mesh position={[0.05, 0, 0.06]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#4ADE80" emissive="#4ADE80" emissiveIntensity={1} />
        </mesh>
      </group>
    </group>
  )
}
