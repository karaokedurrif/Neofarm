'use client'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows, OrbitControls, PerspectiveCamera, Sky } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, N8AO } from '@react-three/postprocessing'
import { Suspense } from 'react'
import * as THREE from 'three'

interface WinerySceneProps {
  children: React.ReactNode
  cameraPosition?: [number, number, number]
  cameraTarget?: [number, number, number]
}

// 1. ILUMINACIÓN: Cambiamos el naranja por luz solar neutra y potente
function SceneLighting() {
  return (
    <>
      <directionalLight
        position={[20, 30, 10]}
        intensity={4.0}
        color="#ffffff" 
        castShadow
        shadow-mapSize={[2048, 2048]} // Sombras más nítidas, menos "pixeladas"
        shadow-camera-far={100}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0001}
      />
      {/* Luz ambiental azulada (cielo) y terrosa (suelo) */}
      <hemisphereLight args={['#87CEEB', '#443322', 1.2]} />
    </>
  )
}

// 2. POST-PROCESADO: Ajustamos la Oclusión Ambiental para detalles en paredes
function PostProcessing() {
  return (
    <EffectComposer multisampling={4}>
      <N8AO
        aoRadius={0.5}
        intensity={2.5}
        distanceFalloff={0.8}
      />
      <Bloom
        luminanceThreshold={1.5}
        intensity={0.2}
      />
      <Vignette eskil={false} offset={0.2} darkness={0.4} />
    </EffectComposer>
  )
}

export default function WineryScene({
  children,
  cameraPosition = [25, 20, 30],
  cameraTarget = [0, 0, 0],
}: WinerySceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]} // Mejor resolución en pantallas Retina/4K
      gl={{
        antialias: true,
        stencil: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
    >
      {/* 3. FONDO: Azul claro de día en lugar de negro */}
      <color attach="background" args={['#dae4ee']} />
      <fog attach="fog" args={['#dae4ee', 50, 150]} />
      
      {/* Añadimos un cielo físico para reflejos naturales */}
      <Sky sunPosition={[20, 30, 10]} inclination={0.5} azimuth={0.25} />

      <PerspectiveCamera makeDefault position={cameraPosition} fov={40} />
      <OrbitControls
        target={cameraTarget}
        maxPolarAngle={Math.PI / 2.1} // Evita ver debajo del suelo
        enableDamping
      />

      <SceneLighting />

      {/* Preset 'apartment' o 'park' da una luz más blanca y realista que 'sunset' */}
      <Environment preset="apartment" environmentIntensity={0.6} />

      <Suspense fallback={null}>
        {children}
      </Suspense>

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.6}
        scale={60}
        blur={1.5}
        far={10}
        color="#221100"
      />

      <PostProcessing />
    </Canvas>
  )
}