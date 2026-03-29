'use client'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing'
import { Suspense } from 'react'

interface WinerySceneProps {
  children: React.ReactNode
  cameraPosition?: [number, number, number]
  cameraTarget?: [number, number, number]
}

function SceneLighting() {
  return (
    <>
      {/* Warm sunset ambient */}
      <ambientLight intensity={0.3} color="#FFD4A0" />
      {/* Sun (low angle, warm) */}
      <directionalLight
        position={[-20, 15, -10]}
        intensity={1.8}
        color="#FF9944"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      {/* Fill light from cellar side */}
      <directionalLight position={[10, 8, 15]} intensity={0.4} color="#B08050" />
      {/* Rim light for depth */}
      <pointLight position={[0, 12, -20]} intensity={0.5} color="#FF6633" />
    </>
  )
}

function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        intensity={0.4}
      />
      <SSAO
        radius={0.1}
        intensity={15}
        luminanceInfluence={0.6}
      />
    </EffectComposer>
  )
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  )
}

export default function WineryScene({
  children,
  cameraPosition = [20, 15, 25],
  cameraTarget = [0, 0, 0],
}: WinerySceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ background: '#0F0F0F' }}
    >
      <fog attach="fog" args={['#1A0F05', 40, 100]} />
      <color attach="background" args={['#0F0F0F']} />

      <PerspectiveCamera makeDefault position={cameraPosition} fov={45} near={0.1} far={200} />
      <OrbitControls
        target={cameraTarget}
        enablePan
        enableZoom
        enableRotate
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={60}
        dampingFactor={0.05}
        enableDamping
      />

      <SceneLighting />

      <Environment preset="sunset" environmentIntensity={0.3} />

      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={60}
        blur={2}
        far={20}
        color="#000000"
      />

      <PostProcessing />
    </Canvas>
  )
}
