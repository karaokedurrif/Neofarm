'use client'
import PageShell from '@/components/shared/PageShell'
import { Snowflake, Thermometer, Wind, AlertTriangle } from 'lucide-react'

const zones = [
  { name: 'Zona NE', risk: 'Bajo', temp: 3.2, minForecast: 1.5, aspersores: true, status: 'Standby' },
  { name: 'Zona NO', risk: 'Medio', temp: 1.8, minForecast: -0.5, aspersores: true, status: 'Alerta' },
  { name: 'Zona SE', risk: 'Alto', temp: 0.5, minForecast: -2.1, aspersores: true, status: 'Activo' },
  { name: 'Zona SO', risk: 'Medio', temp: 1.2, minForecast: -0.8, aspersores: true, status: 'Alerta' },
  { name: 'Centro', risk: 'Bajo', temp: 2.5, minForecast: 0.8, aspersores: false, status: 'Standby' },
]

const riskColor: Record<string, string> = { Bajo: '#4ADE80', Medio: '#FBBF24', Alto: '#EF4444' }

const history = [
  { date: '15/03/2026', minTemp: -1.8, aspersores: true, duration: '3h 20min', damage: 'Sin daño' },
  { date: '22/02/2026', minTemp: -3.2, aspersores: true, duration: '5h 10min', damage: 'Daño leve F09' },
  { date: '10/01/2026', minTemp: -0.5, aspersores: false, duration: '—', damage: 'Sin daño' },
]

export default function FrostPage() {
  return (
    <PageShell title="Antihelada" subtitle="Sistema de protección activa · 4 zonas con aspersores">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#1A1A1A] border border-[#EF4444] rounded-xl p-4 text-center">
          <Snowflake className="w-6 h-6 text-[#EF4444] mx-auto mb-2" />
          <p className="text-xl font-bold text-[#EF4444]">-2.1°C</p>
          <p className="text-xs text-[#9CA3AF]">Min prevista (mañana)</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-center">
          <Thermometer className="w-6 h-6 text-[#3B82F6] mx-auto mb-2" />
          <p className="text-xl font-bold">1.8°C</p>
          <p className="text-xs text-[#9CA3AF]">Temp media actual</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-center">
          <Wind className="w-6 h-6 text-[#9CA3AF] mx-auto mb-2" />
          <p className="text-xl font-bold">5 km/h</p>
          <p className="text-xs text-[#9CA3AF]">Viento</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#F59E0B] rounded-xl p-4 text-center">
          <AlertTriangle className="w-6 h-6 text-[#F59E0B] mx-auto mb-2" />
          <p className="text-xl font-bold text-[#F59E0B]">1</p>
          <p className="text-xs text-[#F59E0B]">Zona activa</p>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#333]"><h3 className="font-medium">Zonas de protección</h3></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#9CA3AF] text-xs border-b border-[#333]">
              <th className="px-4 py-2 text-left">Zona</th>
              <th className="px-4 py-2 text-left">Riesgo</th>
              <th className="px-4 py-2 text-left">Temp actual</th>
              <th className="px-4 py-2 text-left">Min prevista</th>
              <th className="px-4 py-2 text-left">Aspersores</th>
              <th className="px-4 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {zones.map(z => (
              <tr key={z.name} className="border-b border-[#222] hover:bg-[#262626]">
                <td className="px-4 py-2 font-medium">{z.name}</td>
                <td className="px-4 py-2"><span style={{ color: riskColor[z.risk] }}>{z.risk}</span></td>
                <td className="px-4 py-2">{z.temp}°C</td>
                <td className="px-4 py-2">
                  <span className={z.minForecast < 0 ? 'text-[#EF4444] font-bold' : ''}>{z.minForecast}°C</span>
                </td>
                <td className="px-4 py-2">{z.aspersores ? 'Sí' : 'No'}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${z.status === 'Activo' ? 'bg-[#EF4444]/20 text-[#EF4444]' : z.status === 'Alerta' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-[#333] text-[#9CA3AF]'}`}>
                    {z.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#333]"><h3 className="font-medium">Historial de heladas</h3></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#9CA3AF] text-xs border-b border-[#333]">
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Temp min</th>
              <th className="px-4 py-2 text-left">Aspersores</th>
              <th className="px-4 py-2 text-left">Duración</th>
              <th className="px-4 py-2 text-left">Daño</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h.date} className="border-b border-[#222] hover:bg-[#262626]">
                <td className="px-4 py-2">{h.date}</td>
                <td className="px-4 py-2 text-[#EF4444]">{h.minTemp}°C</td>
                <td className="px-4 py-2">{h.aspersores ? 'Sí' : 'No'}</td>
                <td className="px-4 py-2">{h.duration}</td>
                <td className="px-4 py-2">{h.damage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
