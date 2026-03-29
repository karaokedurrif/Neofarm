'use client'
import { useState, useCallback, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Leaf, Warehouse, Package, Maximize2, Minimize2, RotateCcw } from 'lucide-react'

// Dynamic imports for 3D components (SSR disabled)
const WineryScene = dynamic(() => import('./WineryScene'), { ssr: false })
const VineyardScene = dynamic(() => import('./VineyardScene'), { ssr: false })
const CellarScene = dynamic(() => import('./CellarScene'), { ssr: false })
const BarrelRoomScene = dynamic(() => import('./BarrelRoomScene'), { ssr: false })

type ViewMode = 'vineyard' | 'cellar' | 'barrels'

interface CameraConfig {
  position: [number, number, number]
  target: [number, number, number]
}

const CAMERA_CONFIGS: Record<ViewMode, CameraConfig> = {
  vineyard: { position: [18, 12, 22], target: [0, 0, 0] },
  cellar: { position: [12, 10, 14], target: [0, 2, 0] },
  barrels: { position: [8, 6, 10], target: [0, 1, 0] },
}

const VIEW_TABS = [
  { id: 'vineyard' as ViewMode, label: 'Viñedo', icon: Leaf, color: '#22C55E' },
  { id: 'cellar' as ViewMode, label: 'Bodega', icon: Warehouse, color: '#D4A843' },
  { id: 'barrels' as ViewMode, label: 'Barricas', icon: Package, color: '#B45309' },
]

// HUD data panels
function VineyardHUD() {
  return (
    <div className="absolute top-4 left-4 bg-[#0F0F0F]/85 border border-[#333] rounded-xl p-4 backdrop-blur-md min-w-[200px]">
      <h3 className="text-sm font-bold text-[#22C55E] mb-3 flex items-center gap-2">
        <Leaf className="w-4 h-4" /> VIÑEDO
      </h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">Humedad</span>
          <span className="text-[#60A5FA] font-mono">68%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">Temperatura</span>
          <span className="text-[#EF4444] font-mono">19°C</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">Suelo</span>
          <span className="text-[#22C55E] font-mono">57%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">NDVI medio</span>
          <span className="text-[#4ADE80] font-mono">0.72</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">Dron</span>
          <span className="text-[#3B82F6]">En vuelo</span>
        </div>
      </div>
    </div>
  )
}

function CellarHUD() {
  return (
    <div className="absolute top-4 left-4 bg-[#0F0F0F]/85 border border-[#333] rounded-xl p-4 backdrop-blur-md min-w-[200px]">
      <h3 className="text-sm font-bold text-[#D4A843] mb-3 flex items-center gap-2">
        <Warehouse className="w-4 h-4" /> BODEGA
      </h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">CO₂</span>
          <span className="text-[#4ADE80] font-mono">700 ppm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">Temperatura</span>
          <span className="text-[#60A5FA] font-mono">15°C</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">Presión</span>
          <span className="text-[#FBBF24] font-mono">2.3 bar</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">Energía hoy</span>
          <span className="text-[#D4A843] font-mono">5.4 kWh</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">Depósitos activos</span>
          <span className="text-white font-mono">5/6</span>
        </div>
      </div>
    </div>
  )
}

function BarrelHUD() {
  return (
    <div className="absolute top-4 left-4 bg-[#0F0F0F]/85 border border-[#333] rounded-xl p-4 backdrop-blur-md min-w-[200px]">
      <h3 className="text-sm font-bold text-[#B45309] mb-3 flex items-center gap-2">
        <Package className="w-4 h-4" /> BARRICAS
      </h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">Total</span>
          <span className="text-white font-mono">28</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">Temp. sala</span>
          <span className="text-[#60A5FA] font-mono">15°C</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">HR sala</span>
          <span className="text-[#3B82F6] font-mono">78%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">Maduración media</span>
          <span className="text-[#D4A843] font-mono">8 meses</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">Trasiego vencido</span>
          <span className="text-[#EF4444] font-mono font-bold">2</span>
        </div>
      </div>
    </div>
  )
}

function StatusBar() {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-[#0F0F0F]/80 border border-[#333] rounded-xl px-4 py-2 backdrop-blur-md flex items-center justify-between text-xs">
      <div className="flex items-center gap-4">
        <span className="text-[#9CA3AF]">Gemelo Digital</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
          <span className="text-[#4ADE80]">En línea</span>
        </span>
        <span className="text-[#9CA3AF]">Última sync: hace 2 min</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[#9CA3AF]">IoT: <span className="text-[#4ADE80]">7/8</span> online</span>
        <span className="text-[#9CA3AF]">MQTT: <span className="text-[#4ADE80]">OK</span></span>
      </div>
    </div>
  )
}

export default function DigitalTwinManager() {
  const [activeView, setActiveView] = useState<ViewMode>('vineyard')
  const [fullscreen, setFullscreen] = useState(false)

  const camera = CAMERA_CONFIGS[activeView]

  const handleViewChange = useCallback((view: ViewMode) => {
    setActiveView(view)
  }, [])

  return (
    <div className={`relative ${fullscreen ? 'fixed inset-0 z-50' : 'h-[600px]'} rounded-xl overflow-hidden bg-[#0F0F0F] border border-[#333]`}>
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-[#0F0F0F]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#D4A843] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-[#9CA3AF]">Cargando Gemelo Digital...</p>
            </div>
          </div>
        }>
          <WineryScene cameraPosition={camera.position} cameraTarget={camera.target}>
            {activeView === 'vineyard' && <VineyardScene />}
            {activeView === 'cellar' && <CellarScene />}
            {activeView === 'barrels' && <BarrelRoomScene />}
          </WineryScene>
        </Suspense>
      </div>

      {/* View selector tabs */}
      <div className="absolute top-4 right-4 flex gap-1 bg-[#0F0F0F]/80 border border-[#333] rounded-xl p-1 backdrop-blur-md z-10">
        {VIEW_TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeView === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleViewChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                isActive
                  ? 'text-white'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-[#262626]'
              }`}
              style={isActive ? { backgroundColor: tab.color + '33', color: tab.color } : undefined}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Fullscreen + reset buttons */}
      <div className="absolute top-4 right-[280px] flex gap-1 z-10">
        <button
          onClick={() => setFullscreen(!fullscreen)}
          className="p-2 bg-[#0F0F0F]/80 border border-[#333] rounded-lg text-[#9CA3AF] hover:text-white backdrop-blur-md transition-colors"
          title={fullscreen ? 'Salir pantalla completa' : 'Pantalla completa'}
        >
          {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Contextual HUD */}
      {activeView === 'vineyard' && <VineyardHUD />}
      {activeView === 'cellar' && <CellarHUD />}
      {activeView === 'barrels' && <BarrelHUD />}

      {/* Status bar */}
      <StatusBar />

      {/* Title overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <h2 className="text-sm font-bold text-[#D4A843] tracking-wider uppercase bg-[#0F0F0F]/70 px-4 py-1.5 rounded-full border border-[#D4A843]/30 backdrop-blur-md">
          Gemelo Digital — Piloto Bodega del Duero
        </h2>
      </div>
    </div>
  )
}
