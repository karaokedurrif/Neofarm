'use client'
import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sky, Environment, ContactShadows, OrbitControls, PerspectiveCamera, Html, Line } from '@react-three/drei'
import * as THREE from 'three'

type FrostState = 'NORMAL' | 'ALERTA' | 'ACTIVO'

/* ─── Terrain ─── */
function FrostTerrain() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(40, 40, 80, 80)
    g.rotateX(-Math.PI / 2)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i)
      pos.setY(i, Math.sin(x * 0.15) * Math.cos(z * 0.12) * 0.3)
    }
    pos.needsUpdate = true
    g.computeVertexNormals()
    return g
  }, [])

  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color="#3a4a2e" roughness={0.9} />
    </mesh>
  )
}

/* ─── Vine Row ─── */
function VineRow({ position }: { position: [number, number, number] }) {
  const posts: [number, number, number][] = []
  for (let i = -8; i <= 8; i += 2) posts.push([i, 0, 0])
  return (
    <group position={position}>
      {posts.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.04, 1, 6]} />
            <meshStandardMaterial color="#5c3d2e" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <sphereGeometry args={[0.25, 8, 6]} />
            <meshStandardMaterial color="#4a6b3a" roughness={0.8} transparent opacity={0.85} />
          </mesh>
        </group>
      ))}
      {/* Wire */}
      <Line
        points={[[-8, 0.7, 0], [8, 0.7, 0]]}
        color="#888"
        lineWidth={0.5}
      />
    </group>
  )
}

/* ─── Aspersore ─── */
function Aspersor({ position, active }: { position: [number, number, number]; active: boolean }) {
  const ref = useRef<THREE.Group>(null!)
  const particlesRef = useRef<THREE.Points>(null!)

  const particleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const count = 200
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = Math.random() * 1.5
      const h = Math.random() * 2
      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = h
      positions[i * 3 + 2] = Math.sin(angle) * r
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [])

  useFrame((_, dt) => {
    if (particlesRef.current) {
      particlesRef.current.visible = active
      if (active) particlesRef.current.rotation.y += dt * 0.5
    }
  })

  return (
    <group ref={ref} position={position}>
      {/* Post */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.8, 6]} />
        <meshStandardMaterial color="#777" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color={active ? '#3b82f6' : '#999'} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Water particles */}
      <points ref={particlesRef} position={[0, 0.9, 0]} geometry={particleGeo}>
        <pointsMaterial size={0.04} color="#93c5fd" transparent opacity={0.6} sizeAttenuation />
      </points>
    </group>
  )
}

/* ─── Temperature Sensor ─── */
function TempSensor({ position, temp, state }: { position: [number, number, number]; temp: number; state: FrostState }) {
  const blinkRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (blinkRef.current && state === 'ALERTA') {
      blinkRef.current.material = blinkRef.current.material as THREE.MeshStandardMaterial
      ;(blinkRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + Math.sin(clock.elapsedTime * 4) * 0.5
    }
  })

  const ledColor = state === 'ACTIVO' ? '#3b82f6' : state === 'ALERTA' ? '#f59e0b' : '#22c55e'

  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.12, 1.2, 0.08]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* LED */}
      <mesh ref={blinkRef} position={[0, 1.25, 0.05]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={0.8} />
      </mesh>
      {/* Label */}
      <Html position={[0, 1.6, 0]} center distanceFactor={12}>
        <div className="font-mono text-[10px] px-2 py-0.5 rounded whitespace-nowrap"
          style={{
            background: 'rgba(0,0,0,0.75)',
            color: temp < 0 ? '#ef4444' : temp < 2 ? '#f59e0b' : '#22c55e',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
          {temp.toFixed(1)}°C
        </div>
      </Html>
    </group>
  )
}

/* ─── Ice Layer (only in ACTIVO) ─── */
function IceLayer({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial
        color="#c4e0f9"
        transparent
        opacity={0.15}
        roughness={0.1}
        metalness={0.3}
      />
    </mesh>
  )
}

/* ─── Scene Content ─── */
function FrostSceneContent({ state, temperature }: { state: FrostState; temperature: number }) {
  const aspersorsActive = state === 'ACTIVO'

  const sunPos: [number, number, number] = state === 'ACTIVO'
    ? [-10, -5, -20]    // night
    : state === 'ALERTA'
    ? [-20, 3, -10]     // dusk
    : [-30, 20, 10]     // day

  const fogColor = state === 'ACTIVO' ? '#1a1a2e' : state === 'ALERTA' ? '#3d2b1f' : '#dae4ee'
  const envIntensity = state === 'ACTIVO' ? 0.2 : state === 'ALERTA' ? 0.5 : 0.8

  return (
    <>
      <PerspectiveCamera makeDefault position={[12, 8, 16]} fov={50} />
      <OrbitControls maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={35} />

      <Sky sunPosition={sunPos} />
      <Environment preset={state === 'ACTIVO' ? 'night' : 'city'} environmentIntensity={envIntensity} />
      <fog attach="fog" args={[fogColor, 20, 60]} />

      <ambientLight intensity={state === 'ACTIVO' ? 0.15 : 0.3} />
      <directionalLight
        position={sunPos}
        intensity={state === 'ACTIVO' ? 0.5 : state === 'ALERTA' ? 1.5 : 3}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <FrostTerrain />

      {/* Vine rows */}
      {[-6, -3, 0, 3, 6].map((z, i) => (
        <VineRow key={i} position={[0, 0, z]} />
      ))}

      {/* Aspersors between rows */}
      {[-4.5, -1.5, 1.5, 4.5].map((z, i) => (
        <Aspersor key={i} position={[0, 0, z]} active={aspersorsActive} />
      ))}

      {/* Temperature sensors */}
      <TempSensor position={[-7, 0, -7]} temp={temperature} state={state} />
      <TempSensor position={[7, 0, -7]} temp={temperature + 0.3} state={state} />
      <TempSensor position={[-7, 0, 7]} temp={temperature - 0.2} state={state} />
      <TempSensor position={[7, 0, 7]} temp={temperature + 0.1} state={state} />

      <IceLayer visible={state === 'ACTIVO'} />

      <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={50} blur={2} far={10} />
    </>
  )
}

/* ─── Exported component ─── */
export default function FrostVisualization3D() {
  const [state, setState] = useState<FrostState>('NORMAL')
  const [temperature, setTemperature] = useState(3.2)

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {(['NORMAL', 'ALERTA', 'ACTIVO'] as FrostState[]).map(s => (
          <button
            key={s}
            onClick={() => {
              setState(s)
              if (s === 'NORMAL') setTemperature(3.2)
              else if (s === 'ALERTA') setTemperature(0.8)
              else setTemperature(-1.5)
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: state === s ? (s === 'ACTIVO' ? '#3b82f6' : s === 'ALERTA' ? '#f59e0b' : '#22c55e') : 'var(--surface)',
              color: state === s ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            {s === 'NORMAL' ? '☀ Normal' : s === 'ALERTA' ? '⚠ Alerta' : '❄ Activo'}
          </button>
        ))}
        <div className="flex items-center gap-2 text-xs ml-auto">
          <span className="text-[var(--text-muted)]">Temp simulada:</span>
          <input
            type="range"
            min={-5}
            max={10}
            step={0.1}
            value={temperature}
            onChange={e => setTemperature(parseFloat(e.target.value))}
            className="w-28"
          />
          <span className="font-mono font-bold w-14 text-right" style={{
            color: temperature < 0 ? '#ef4444' : temperature < 2 ? '#f59e0b' : '#22c55e'
          }}>
            {temperature.toFixed(1)}°C
          </span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="rounded-xl overflow-hidden" style={{ height: 420, background: '#111' }}>
        <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true, stencil: false }}>
          <FrostSceneContent state={state} temperature={temperature} />
        </Canvas>
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[10px] font-mono px-2 py-1 rounded"
            style={{ background: 'rgba(0,0,0,0.6)', color: '#93c5fd', backdropFilter: 'blur(4px)' }}>
            Gemelo Digital — Sistema Antihelada
          </span>
        </div>
      </div>
    </div>
  )
}
