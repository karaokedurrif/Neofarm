'use client'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Suspense } from 'react'
import * as THREE from 'three'

interface WinerySceneProps {
  children: React.ReactNode
  cameraPosition?: [number, number, number]
  cameraTarget?: [number, number, number]
}

function SceneLighting() {
  return (
    <>
      {/* Primary sun — warm golden-hour directional */}
      <directionalLight
        position={[-20, 15, -10]}
        intensity={2}
        color="#FF9944"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0005}
      />
      {/* Fill light — low-intensity warm from opposite side */}
      <directionalLight position={[10, 8, 15]} intensity={0.6} color="#B08050" />
      {/* Rim light for depth separation */}
      <pointLight position={[0, 12, -20]} intensity={0.5} color="#FF6633" />
      {/* Very subtle hemisphere — avoid flattening scene */}
      <hemisphereLight args={['#FFD4A0', '#3D2B1F', 0.08]} />
    </>
  )
}

function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={1}
        luminanceSmoothing={0.9}
        intensity={0.6}
      />
      <Vignette eskil={false} offset={0.3} darkness={0.55} />
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
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ background: '#0F0F0F' }}
    >
      <fog attach="fog" args={['#2A1A0A', 35, 90]} />
      <color attach="background" args={['#0F0F0F']} />

      <PerspectiveCamera makeDefault position={cameraPosition} fov={45} near={0.1} far={200} />
      <OrbitControls
        target={cameraTarget}
        enablePan
        enableZoom
        enableRotate
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.4}
        minDistance={5}
        maxDistance={60}
        dampingFactor={0.05}
        enableDamping
      />

      <SceneLighting />

      {/* Environment sunset HDRI for natural reflections — replaces generic ambientLight */}
      <Environment preset="sunset" environmentIntensity={0.8} />

      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.5}
        scale={80}
        blur={2.5}
        far={25}
        frames={1}
        resolution={512}
        color="#1A0F05"
      />

      <PostProcessing />
    </Canvas>
  )
}
