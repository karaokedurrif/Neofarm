'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Leaf, Warehouse, Package, Thermometer, Droplets, Wind, Sun, Moon, Snowflake, Zap, Box, LayoutGrid } from 'lucide-react'
import VineyardPlane from '@/components/dashboard/VineyardPlane'
import CellarPlane from '@/components/dashboard/CellarPlane'
import BarrelPlane from '@/components/dashboard/BarrelPlane'
import KPICards from '@/components/dashboard/KPICards'

const DigitalTwinManager = dynamic(
  () => import('@/components/digital-twin/DigitalTwinManager'),
  { ssr: false, loading: () => (
    <div className="h-[600px] bg-[#1A1A1A] border border-[#333] rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#D4A843] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#9CA3AF]">Cargando Gemelo Digital 3D...</p>
      </div>
    </div>
  )}
)

const tabs = [
  { id: 'vineyard', label: 'Viñedo', icon: Leaf },
  { id: 'cellar', label: 'Bodega', icon: Warehouse },
  { id: 'barrels', label: 'Barricas', icon: Package },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('vineyard')
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E5E5E5]">Dashboard</h1>
          <p className="text-sm text-[#9CA3AF]">Bodega del Duero — Ribera del Duero</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {/* 2D / 3D Toggle */}
          <div className="flex items-center bg-[#1A1A1A] border border-[#333] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === '3d' ? 'bg-[#7F1D1D] text-white' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" /> 3D
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === '2d' ? 'bg-[#7F1D1D] text-white' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> 2D
            </button>
          </div>
          <div className="flex items-center gap-2 bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2">
            <Moon className="w-4 h-4 text-[#D4A843]" />
            <span className="text-[#D4A843]">Día FRUTO</span>
            <span className="text-[#9CA3AF]">☽ Creciente</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2">
            <Snowflake className="w-4 h-4 text-[#4ADE80]" />
            <span className="text-[#4ADE80]">Helada: OK</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* 3D Digital Twin */}
      {viewMode === '3d' && <DigitalTwinManager />}

      {/* 2D SVG Planes (classic view) */}
      {viewMode === '2d' && (
        <>
          {/* Tab selector */}
          <div className="flex gap-1 bg-[#1A1A1A] border border-[#333] rounded-xl p-1 w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#7F1D1D] text-white'
                      : 'text-[#9CA3AF] hover:bg-[#262626] hover:text-[#E5E5E5]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Plane */}
          <div className="bg-[#1A1A1A] border border-[#333] rounded-xl overflow-hidden">
            {activeTab === 'vineyard' && <VineyardPlane />}
            {activeTab === 'cellar' && <CellarPlane />}
            {activeTab === 'barrels' && <BarrelPlane />}
          </div>
        </>
      )}
    </div>
  )
}
