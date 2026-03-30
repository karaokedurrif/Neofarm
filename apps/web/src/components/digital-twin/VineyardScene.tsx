'use client'
import React, { useRef, useState, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Sky, Line } from '@react-three/drei'
import * as THREE from 'three'

/* ═══════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════ */
const ROWS = 20
const VINES_PER_ROW = 25
const ROW_SPACING = 1.6
const VINE_SPACING = 0.48
const TOTAL_VINES = ROWS * VINES_PER_ROW
const POSTS_PER_ROW = 7
const ROW_LENGTH = VINES_PER_ROW * VINE_SPACING
const TOTAL_POSTS = ROWS * POSTS_PER_ROW

function sr(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

interface VineRowsProps {
  ndviValues: number[]
  humidityValues: number[]
}

/* ═══════════════════════════════════════════════════════
   TERRAIN — 128×128 with multi-octave displacement
   ═══════════════════════════════════════════════════════ */
function Terrain() {
  const ref = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const h =
        Math.sin(x * 0.15) * Math.cos(y * 0.12) * 0.5 +
        Math.sin(x * 0.4 + 1.7) * Math.cos(y * 0.35 + 0.9) * 0.2 +
        Math.sin(x * 0.85 + 3.1) * Math.cos(y * 0.9 + 2.4) * 0.08
      pos.setZ(i, h)
    }
    pos.needsUpdate = true
    ref.current.geometry.computeVertexNormals()
  }, [])

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[70, 70, 128, 128]} />
      <meshStandardMaterial color="#4A3728" roughness={0.95} metalness={0} />
    </mesh>
  )
}

/* ═══════════════════════════════════════════════════════
   VINE INSTANCING — animated emissive color pulse per-row
   ═══════════════════════════════════════════════════════ */
function useVineInstancing(
  meshRef: React.RefObject<THREE.InstancedMesh>,
  ndviValues: number[],
  humidityValues: number[]
) {
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    let idx = 0
    for (let row = 0; row < ROWS; row++) {
      for (let vine = 0; vine < VINES_PER_ROW; vine++) {
        const x = (row - ROWS / 2) * ROW_SPACING
        const z = (vine - VINES_PER_ROW / 2) * VINE_SPACING
        dummy.position.set(
          x + (sr(row * 100 + vine) - 0.5) * 0.06,
          0,
          z + (sr(row * 200 + vine + 50) - 0.5) * 0.06
        )
        dummy.rotation.set(0, sr(row * 400 + vine) * Math.PI * 2, 0)
        dummy.scale.setScalar(0.85 + sr(row * 300 + vine) * 0.3)
        dummy.updateMatrix()
        mesh.setMatrixAt(idx, dummy.matrix)
        idx++
      }
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [meshRef, dummy])

  const tmpColor = useMemo(() => new THREE.Color(), [])
  useFrame(({ clock, invalidate }) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = clock.elapsedTime
    let idx = 0
    for (let row = 0; row < ROWS; row++) {
      const hum = humidityValues[row]
      const ndvi = ndviValues[row]
      const pulse =
        1 +
        Math.sin(t * (0.3 + hum * 0.008) + row * 0.5) *
          (0.08 + (1 - hum / 100) * 0.12)
      tmpColor
        .setHex(ndvi > 0.7 ? 0x22c55e : ndvi > 0.5 ? 0xfbbf24 : 0xef4444)
        .multiplyScalar(pulse)
      for (let vine = 0; vine < VINES_PER_ROW; vine++) {
        mesh.setColorAt(idx, tmpColor)
        idx++
      }
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    invalidate()
  })
}

/* ═══════════════════════════════════════════════════════
   PROCEDURAL VINE ROWS — organic canopy shape
   ═══════════════════════════════════════════════════════ */
function ProceduralVineRows({ ndviValues, humidityValues }: VineRowsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide,
      envMapIntensity: 1.0,
    })
    mat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         #ifdef USE_INSTANCING_COLOR
           totalEmissiveRadiance += vColor * 0.3;
         #endif`
      )
    }
    return mat
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.22, 1)
    geo.translate(0, 0.65, 0)
    const p = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      p.setY(i, p.getY(i) * 0.55)
      p.setX(i, p.getX(i) * 1.35 + (sr(i * 7) - 0.5) * 0.04)
      p.setZ(i, p.getZ(i) * 1.35 + (sr(i * 13) - 0.5) * 0.04)
    }
    p.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [])

  useVineInstancing(meshRef, ndviValues, humidityValues)

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, TOTAL_VINES]}
      castShadow
      receiveShadow
      frustumCulled={false}
    />
  )
}

/* ═══════════════════════════════════════════════════════
   TRELLIS SYSTEM — instanced posts + wire lines
   ═══════════════════════════════════════════════════════ */
function TrellisSystem() {
  const postRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    if (!postRef.current) return
    let idx = 0
    for (let row = 0; row < ROWS; row++) {
      const x = (row - ROWS / 2) * ROW_SPACING
      for (let p = 0; p < POSTS_PER_ROW; p++) {
        const z = -ROW_LENGTH / 2 + (p / (POSTS_PER_ROW - 1)) * ROW_LENGTH
        dummy.position.set(x, 0.6, z)
        dummy.scale.set(1, 1, 1)
        dummy.updateMatrix()
        postRef.current.setMatrixAt(idx, dummy.matrix)
        idx++
      }
    }
    postRef.current.instanceMatrix.needsUpdate = true
  }, [dummy])

  const wireData = useMemo(() => {
    const lines: { points: [number, number, number][] }[] = []
    for (let row = 0; row < ROWS; row++) {
      const x = (row - ROWS / 2) * ROW_SPACING
      lines.push({ points: [[x, 1.0, -ROW_LENGTH / 2], [x, 1.0, ROW_LENGTH / 2]] })
      lines.push({ points: [[x, 0.7, -ROW_LENGTH / 2], [x, 0.7, ROW_LENGTH / 2]] })
    }
    return lines
  }, [])

  return (
    <group>
      <instancedMesh ref={postRef} args={[undefined, undefined, TOTAL_POSTS]} castShadow>
        <cylinderGeometry args={[0.02, 0.025, 1.3, 6]} />
        <meshStandardMaterial color="#7A6A55" roughness={0.9} metalness={0.1} />
      </instancedMesh>
      {wireData.map((w, i) => (
        <Line
          key={i}
          points={w.points as [number, number, number][]}
          color="#888888"
          lineWidth={0.5}
          transparent
          opacity={0.6}
        />
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   SENSOR NODE — high-emissive sphere caught by Bloom
   ═══════════════════════════════════════════════════════ */
function SensorNode({
  position,
  label,
  value,
  color = '#60A5FA',
}: {
  position: [number, number, number]
  label: string
  value: string
  color?: string
}) {
  const ref = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock, invalidate }) => {
    const t = clock.elapsedTime
    if (ref.current) ref.current.position.y = position[1] + Math.sin(t * 2) * 0.05
    if (ringRef.current) {
      ringRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.15)
      const mat = ringRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.15 + Math.sin(t * 1.5) * 0.1
    }
    invalidate()
  })

  return (
    <group>
      <mesh
        ref={ref}
        position={position}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 3.0 : 1.5}
          transparent
          opacity={0.95}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ringRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.22, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.35, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      {hovered && (
        <Html position={[position[0], position[1] + 0.7, position[2]]} center>
          <div className="bg-[#1A1A1A]/95 border border-[#D4A843]/50 rounded-lg px-3 py-2 text-xs whitespace-nowrap backdrop-blur-md shadow-lg shadow-black/40">
            <p className="text-[#D4A843] font-bold text-[11px] mb-1">{label}</p>
            <p className="text-[#E5E5E5] font-mono">{value}</p>
          </div>
        </Html>
      )}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   DRONE MODEL
   ═══════════════════════════════════════════════════════ */
function DroneModel() {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock, invalidate }) => {
    if (!ref.current) return
    const t = clock.elapsedTime * 0.3
    ref.current.position.set(Math.sin(t) * 10, 7 + Math.sin(t * 2) * 0.3, Math.cos(t) * 8)
    ref.current.rotation.y = t + Math.PI / 2
    invalidate()
  })

  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.12, 0.35]} />
        <meshStandardMaterial color="#2A2A2A" metalness={0.9} roughness={0.15} />
      </mesh>
      {(
        [[-0.4, 0, -0.28], [0.4, 0, -0.28], [-0.4, 0, 0.28], [0.4, 0, 0.28]] as [number, number, number][]
      ).map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, 0.08, 6]} />
            <meshStandardMaterial color="#444" />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.008, 3]} />
            <meshStandardMaterial color="#555" transparent opacity={0.2} />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, -0.15, 0]} intensity={0.5} color="#4ADE80" distance={4} />
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   WINERY BUILDING
   ═══════════════════════════════════════════════════════ */
function WineryBuilding() {
  return (
    <group position={[0, 0, -16]}>
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[12, 4.5, 7]} />
        <meshStandardMaterial color="#5C4D3C" roughness={0.88} metalness={0.05} />
      </mesh>
      <mesh position={[0, 4.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[9, 2.2, 4]} />
        <meshStandardMaterial color="#8B4513" roughness={0.92} metalness={0} />
      </mesh>
      <mesh position={[0, 1.3, 3.51]}>
        <planeGeometry args={[2.2, 2.8]} />
        <meshStandardMaterial color="#3D2B1F" roughness={0.9} />
      </mesh>
      {([-3.5, 3.5] as number[]).map((x) => (
        <mesh key={x} position={[x, 2.8, 3.51]}>
          <planeGeometry args={[1, 1.2]} />
          <meshStandardMaterial color="#1A1A1A" emissive="#FF9944" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   GOLDEN HOUR SKY
   ═══════════════════════════════════════════════════════ */
function GoldenHourSky() {
  return (
    <Sky
      distance={450000}
      sunPosition={[150, 8, -80]}
      turbidity={10}
      rayleigh={2}
      mieCoefficient={0.005}
      mieDirectionalG={0.85}
    />
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN SCENE EXPORT
   ═══════════════════════════════════════════════════════ */
interface VineyardSceneProps {
  onRowSelect?: (index: number | null) => void
}

export default function VineyardScene({ onRowSelect }: VineyardSceneProps) {
  const ndviValues = useMemo(
    () => Array.from({ length: ROWS }, (_, i) => 0.45 + sr(i * 17) * 0.45),
    []
  )
  const humidityValues = useMemo(
    () => Array.from({ length: ROWS }, (_, i) => 30 + sr(i * 31 + 7) * 60),
    []
  )

  return (
    <group>
      <GoldenHourSky />
      <Terrain />
      <TrellisSystem />

      <ProceduralVineRows ndviValues={ndviValues} humidityValues={humidityValues} />

      <SensorNode position={[-12, 1.5, -4]} label="T/HR Campo" value="19°C | 68% HR" color="#60A5FA" />
      <SensorNode position={[0, 1.2, 5]} label="Sonda Suelo 30cm" value="57% humedad | 16°C" color="#22C55E" />
      <SensorNode position={[10, 1.5, -3]} label="Sensor Hoja" value="Potencial: -0.4 MPa" color="#FBBF24" />
      <SensorNode position={[-8, 2, 8]} label="Estación Meteo" value="19°C | UV 4 | 12 km/h NW" color="#A78BFA" />

      <DroneModel />
      <WineryBuilding />

      {([[-18, 0.12, -9], [18, 0.12, -9], [-18, 0.12, 9], [18, 0.12, 9]] as [number, number, number][]).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.25, 8]} />
          <meshStandardMaterial color="#777" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}
