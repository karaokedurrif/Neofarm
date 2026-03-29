'use client'
import { useState } from 'react'
import { Leaf, Warehouse, Package, Thermometer, Droplets, Wind, Sun, Moon, Snowflake, Zap } from 'lucide-react'
import VineyardPlane from '@/components/dashboard/VineyardPlane'
import CellarPlane from '@/components/dashboard/CellarPlane'
import BarrelPlane from '@/components/dashboard/BarrelPlane'
import KPICards from '@/components/dashboard/KPICards'

const tabs = [
  { id: 'vineyard', label: 'Viñedo', icon: Leaf },
  { id: 'cellar', label: 'Bodega', icon: Warehouse },
  { id: 'barrels', label: 'Barricas', icon: Package },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('vineyard')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E5E5E5]">Dashboard</h1>
          <p className="text-sm text-[#9CA3AF]">Bodega Demo — Ribera del Duero · 29 Mar 2026</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
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

      {/* Weather strip */}
      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-[#EF4444]" />
          <span>19°C</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-[#60A5FA]" />
          <span>68% HR</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-[#9CA3AF]" />
          <span>12 km/h NO</span>
        </div>
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-[#FBBF24]" />
          <span>UV 4</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-[#22C55E]" />
          <span>Suelo: 57%</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#D4A843]" />
          <span>5.4 kWh hoy</span>
        </div>
      </div>

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
    </div>
  )
}
