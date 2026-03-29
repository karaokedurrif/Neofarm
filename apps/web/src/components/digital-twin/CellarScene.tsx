'use client'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

interface TankData {
  id: string
  name: string
  capacity: number
  fill: number // 0-1
  temp: number
  status: string
  wine: string
  position: [number, number, number]
}

const TANKS: TankData[] = [
  { id: 'D01', name: 'Depósito 01', capacity: 10000, fill: 0.85, temp: 14.5, status: 'Fermentando', wine: 'Tempranillo 2025', position: [-4, 0, -2] },
  { id: 'D02', name: 'Depósito 02', capacity: 10000, fill: 0, temp: 12.0, status: 'Vacío', wine: '—', position: [-1.5, 0, -2] },
  { id: 'D03', name: 'Depósito 03', capacity: 5000, fill: 1.0, temp: 13.2, status: 'FML', wine: 'Garnacha 2025', position: [1, 0, -2] },
  { id: 'D04', name: 'Depósito 04', capacity: 5000, fill: 0.4, temp: 16.0, status: 'Maceración', wine: 'Tempranillo 2025', position: [3.5, 0, -2] },
  { id: 'D05', name: 'Depósito 05', capacity: 8000, fill: 0.95, temp: 14.0, status: 'Estabilización', wine: 'Crianza 2024', position: [-3, 0, 2] },
  { id: 'D06', name: 'Depósito 06', capacity: 8000, fill: 0.6, temp: 15.1, status: 'Crianza', wine: 'Reserva 2023', position: [0, 0, 2] },
]

const STATUS_COLORS: Record<string, string> = {
  Fermentando: '#EF4444',
  Vacío: '#555555',
  FML: '#8B5CF6',
  Maceración: '#F59E0B',
  Estabilización: '#3B82F6',
  Crianza: '#D4A843',
}

function Tank({ data, onClick, selected }: { data: TankData; onClick: () => void; selected: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const liquidRef = useRef<THREE.Mesh>(null)

  const statusColor = STATUS_COLORS[data.status] || '#555'
  const height = data.capacity >= 10000 ? 3.5 : data.capacity >= 8000 ? 3 : 2.5
  const radius = data.capacity >= 10000 ? 0.8 : data.capacity >= 8000 ? 0.7 : 0.55

  // Bubble animation for fermenting tanks
  useFrame((state) => {
    if (liquidRef.current && data.status === 'Fermentando') {
      const mat = liquidRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.1
    }
  })

  return (
    <group
      ref={groupRef}
      position={[data.position[0], data.position[1] + height / 2, data.position[2]]}
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Tank body (stainless steel) */}
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshStandardMaterial
          color="#C0C0C0"
          metalness={0.9}
          roughness={0.15}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Tank top dome */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <sphereGeometry args={[radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#D0D0D0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Liquid fill */}
      {data.fill > 0 && (
        <mesh ref={liquidRef} position={[0, -height / 2 + (height * data.fill) / 2, 0]}>
          <cylinderGeometry args={[radius * 0.95, radius * 0.95, height * data.fill, 32]} />
          <meshStandardMaterial
            color={statusColor}
            transparent
            opacity={0.6}
            emissive={statusColor}
            emissiveIntensity={0.15}
          />
        </mesh>
      )}

      {/* Selection ring */}
      {(selected || hovered) && (
        <mesh position={[0, -height / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius + 0.1, radius + 0.2, 32]} />
          <meshBasicMaterial color="#D4A843" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Temperature indicator LED */}
      <mesh position={[radius + 0.05, 0.5, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial
          color={data.temp > 20 ? '#EF4444' : data.temp > 16 ? '#FBBF24' : '#4ADE80'}
          emissive={data.temp > 20 ? '#EF4444' : data.temp > 16 ? '#FBBF24' : '#4ADE80'}
          emissiveIntensity={1}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, height / 2 + 0.8, 0]}
        fontSize={0.25}
        color="#E5E5E5"
        anchorX="center"
        anchorY="bottom"
      >
        {data.id}
      </Text>

      {/* HUD on hover */}
      {hovered && (
        <Html position={[0, height / 2 + 1.5, 0]} center>
          <div className="bg-[#1A1A1A]/95 border border-[#D4A843] rounded-lg px-4 py-3 text-xs whitespace-nowrap backdrop-blur-sm min-w-[160px]">
            <p className="text-[#D4A843] font-bold text-sm mb-1">{data.name}</p>
            <div className="space-y-1 text-[#E5E5E5]">
              <p>Estado: <span style={{ color: statusColor }}>{data.status}</span></p>
              <p>Temp: {data.temp}°C</p>
              <p>Llenado: {Math.round(data.fill * 100)}%</p>
              <p>Vino: {data.wine}</p>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

function CellarFloor() {
  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 16]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, 3, -8]} receiveShadow>
        <boxGeometry args={[20, 6, 0.3]} />
        <meshStandardMaterial color="#4A3F35" roughness={0.9} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-10, 3, 0]} receiveShadow>
        <boxGeometry args={[0.3, 6, 16]} />
        <meshStandardMaterial color="#4A3F35" roughness={0.9} />
      </mesh>
      {/* Right wall */}
      <mesh position={[10, 3, 0]} receiveShadow>
        <boxGeometry args={[0.3, 6, 16]} />
        <meshStandardMaterial color="#4A3F35" roughness={0.9} />
      </mesh>
    </group>
  )
}

function ReceptionArea() {
  return (
    <group position={[7, 0, -5]}>
      {/* Hopper */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[2, 1.5, 1.5]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.3} />
      </mesh>
      <Text position={[0, 2, 0]} fontSize={0.2} color="#9CA3AF" anchorX="center">
        RECEPCIÓN
      </Text>
    </group>
  )
}

function LabArea() {
  return (
    <group position={[-7, 0, 5]}>
      {/* Lab bench */}
      <RoundedBox args={[2.5, 0.9, 1.2]} radius={0.05} position={[0, 0.45, 0]} castShadow>
        <meshStandardMaterial color="#E8E8E8" roughness={0.3} metalness={0.2} />
      </RoundedBox>
      {/* Equipment */}
      <mesh position={[-0.5, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.4, 12]} />
        <meshStandardMaterial color="#D4D4D4" metalness={0.9} roughness={0.1} />
      </mesh>
      <Text position={[0, 1.8, 0]} fontSize={0.2} color="#9CA3AF" anchorX="center">
        LABORATORIO
      </Text>
    </group>
  )
}

function BottlingLine() {
  return (
    <group position={[7, 0, 5]}>
      {/* Conveyor */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[3, 0.3, 0.8]} />
        <meshStandardMaterial color="#666" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Legs */}
      {[[-1.2, 0, 0.3], [1.2, 0, 0.3], [-1.2, 0, -0.3], [1.2, 0, -0.3]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.2, p[2]]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 6]} />
          <meshStandardMaterial color="#888" />
        </mesh>
      ))}
      <Text position={[0, 1.5, 0]} fontSize={0.2} color="#9CA3AF" anchorX="center">
        EMBOTELLADO
      </Text>
    </group>
  )
}

interface CellarSceneProps {
  onTankSelect?: (tankId: string | null) => void
}

export default function CellarScene({ onTankSelect }: CellarSceneProps) {
  const [selectedTank, setSelectedTank] = useState<string | null>(null)

  const handleTankClick = (id: string) => {
    const newSelection = selectedTank === id ? null : id
    setSelectedTank(newSelection)
    onTankSelect?.(newSelection)
  }

  return (
    <group>
      <CellarFloor />

      {TANKS.map(tank => (
        <Tank
          key={tank.id}
          data={tank}
          onClick={() => handleTankClick(tank.id)}
          selected={selectedTank === tank.id}
        />
      ))}

      <ReceptionArea />
      <LabArea />
      <BottlingLine />

      {/* CO2 sensor */}
      <mesh position={[0, 4.5, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#4ADE80" emissive="#4ADE80" emissiveIntensity={0.8} />
      </mesh>

      {/* Ambient cellar lighting */}
      <pointLight position={[-4, 4, 0]} intensity={0.6} color="#FF9955" distance={12} />
      <pointLight position={[4, 4, 0]} intensity={0.6} color="#FF9955" distance={12} />
      <pointLight position={[0, 4, 4]} intensity={0.4} color="#FFAA66" distance={10} />
    </group>
  )
}
