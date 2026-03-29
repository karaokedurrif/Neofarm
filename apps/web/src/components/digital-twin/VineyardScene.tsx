'use client'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text, Line } from '@react-three/drei'
import * as THREE from 'three'

// Vineyard row data
const ROWS = 20
const ROW_LENGTH = 12
const ROW_SPACING = 1.2
const VINE_SPACING = 0.6

interface VineRowProps {
  index: number
  ndvi: number
  position: [number, number, number]
  onClick: (index: number) => void
  selected: boolean
}

function VineRow({ index, ndvi, position, onClick, selected }: VineRowProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // NDVI → color: red(0.3) → yellow(0.5) → green(0.8+)
  const color = useMemo(() => {
    if (ndvi > 0.7) return new THREE.Color('#22C55E')
    if (ndvi > 0.5) return new THREE.Color('#FBBF24')
    return new THREE.Color('#EF4444')
  }, [ndvi])

  const emissiveIntensity = hovered ? 0.3 : selected ? 0.2 : 0.05

  return (
    <group position={position}>
      {/* Vine row as extruded hedge shape */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={() => onClick(index)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[0.4, 0.8 + ndvi * 0.6, ROW_LENGTH]} />
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0.0}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Trellis posts */}
      {Array.from({ length: Math.floor(ROW_LENGTH / 2) }, (_, i) => (
        <mesh key={i} position={[0, 0.6, -ROW_LENGTH / 2 + 1 + i * 2]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 1.4, 6]} />
          <meshStandardMaterial color="#8B7355" roughness={0.9} />
        </mesh>
      ))}

      {/* Trellis wire */}
      <Line
        points={[[0, 0.9, -ROW_LENGTH / 2], [0, 0.9, ROW_LENGTH / 2]]}
        color="#999"
        lineWidth={0.5}
      />

      {/* Row label */}
      {(hovered || selected) && (
        <Text
          position={[0, 1.8, 0]}
          fontSize={0.3}
          color="#D4A843"
          anchorX="center"
          anchorY="bottom"
        >
          {`F${String(index + 1).padStart(2, '0')} | NDVI: ${ndvi.toFixed(2)}`}
        </Text>
      )}
    </group>
  )
}

function Terrain() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[50, 50, 32, 32]} />
      <meshStandardMaterial
        color="#3D2B1F"
        roughness={1}
        metalness={0}
      />
    </mesh>
  )
}

function SensorNode({ position, label, value }: { position: [number, number, number]; label: string; value: string }) {
  const ref = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })

  return (
    <group>
      <mesh
        ref={ref}
        position={position}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#60A5FA"
          emissive="#60A5FA"
          emissiveIntensity={hovered ? 1 : 0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Signal ring */}
      <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.25, 32]} />
        <meshBasicMaterial color="#60A5FA" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {hovered && (
        <Html position={[position[0], position[1] + 0.6, position[2]]} center>
          <div className="bg-[#1A1A1A]/95 border border-[#D4A843] rounded-lg px-3 py-2 text-xs whitespace-nowrap backdrop-blur-sm">
            <p className="text-[#D4A843] font-bold">{label}</p>
            <p className="text-[#E5E5E5]">{value}</p>
          </div>
        </Html>
      )}
    </group>
  )
}

function DroneModel() {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * 0.3
      ref.current.position.x = Math.sin(t) * 8
      ref.current.position.z = Math.cos(t) * 6
      ref.current.position.y = 6 + Math.sin(t * 2) * 0.3
      ref.current.rotation.y = t + Math.PI / 2
    }
  })

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.15, 0.4]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Arms + rotors */}
      {[[-0.4, 0, -0.3], [0.4, 0, -0.3], [-0.4, 0, 0.3], [0.4, 0, 0.3]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.1, 6]} />
            <meshStandardMaterial color="#555" />
          </mesh>
          <mesh position={[0, 0.08, 0]} rotation={[0, Date.now() * 0.01 + i, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.01, 3]} />
            <meshStandardMaterial color="#666" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}
      {/* Camera indicator */}
      <pointLight position={[0, -0.2, 0]} intensity={0.3} color="#4ADE80" distance={3} />
    </group>
  )
}

interface VineyardSceneProps {
  onRowSelect?: (index: number | null) => void
}

export default function VineyardScene({ onRowSelect }: VineyardSceneProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null)

  // Generate stable NDVI values
  const ndviValues = useMemo(() =>
    Array.from({ length: ROWS }, (_, i) => {
      const seed = Math.sin(i * 123.456) * 10000
      return 0.45 + (seed - Math.floor(seed)) * 0.45
    }), []
  )

  const handleRowClick = (index: number) => {
    const newSelection = selectedRow === index ? null : index
    setSelectedRow(newSelection)
    onRowSelect?.(newSelection)
  }

  return (
    <group>
      <Terrain />

      {/* Vineyard rows */}
      <group position={[-(ROWS * ROW_SPACING) / 2, 0.5, 0]}>
        {ndviValues.map((ndvi, i) => (
          <VineRow
            key={i}
            index={i}
            ndvi={ndvi}
            position={[i * ROW_SPACING, 0, 0]}
            onClick={handleRowClick}
            selected={selectedRow === i}
          />
        ))}
      </group>

      {/* IoT Sensors */}
      <SensorNode position={[-10, 1.5, -4]} label="T/HR Campo" value="19°C | 68% HR" />
      <SensorNode position={[0, 1.2, 5]} label="Sonda Suelo 30cm" value="57% humedad" />
      <SensorNode position={[8, 1.5, -3]} label="Hoja Sensor" value="Seco" />
      <SensorNode position={[-6, 2, 7]} label="Estación Meteo" value="19°C | UV4 | 12km/h" />

      {/* Drone */}
      <DroneModel />

      {/* Boundary stones */}
      {[[-15, 0.15, -8], [15, 0.15, -8], [-15, 0.15, 8], [15, 0.15, 8]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.3, 8]} />
          <meshStandardMaterial color="#888" roughness={0.9} />
        </mesh>
      ))}

      {/* Winery building placeholder (far end) */}
      <group position={[0, 0, -14]}>
        <mesh position={[0, 2, 0]} castShadow>
          <boxGeometry args={[10, 4, 6]} />
          <meshStandardMaterial color="#6B5B4B" roughness={0.85} />
        </mesh>
        {/* Roof */}
        <mesh position={[0, 4.5, 0]} castShadow>
          <coneGeometry args={[7.5, 2, 4]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
        {/* Door */}
        <mesh position={[0, 1, 3.01]}>
          <planeGeometry args={[2, 2.5]} />
          <meshStandardMaterial color="#4A3728" />
        </mesh>
      </group>
    </group>
  )
}
