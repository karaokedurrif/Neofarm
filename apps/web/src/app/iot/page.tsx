'use client'
import PageShell from '@/components/shared/PageShell'
import { Wifi, WifiOff, Battery, AlertTriangle } from 'lucide-react'

const devices = [
  { id: 'S001', name: 'Sensor T/HR Campo', type: 'LoRa', protocol: 'MQTT', status: 'online', battery: 87, lastSeen: 'Hace 2 min', signal: -72 },
  { id: 'S002', name: 'Sonda Suelo 30cm', type: 'LoRa', protocol: 'MQTT', status: 'online', battery: 92, lastSeen: 'Hace 5 min', signal: -65 },
  { id: 'S003', name: 'Hoja Sensor', type: 'LoRa', protocol: 'MQTT', status: 'online', battery: 75, lastSeen: 'Hace 8 min', signal: -80 },
  { id: 'S004', name: 'Estación Meteo', type: 'WiFi', protocol: 'MQTT', status: 'online', battery: 100, lastSeen: 'Hace 1 min', signal: -45 },
  { id: 'S005', name: 'Temp Depósito 01', type: 'Zigbee', protocol: 'MQTT', status: 'online', battery: 95, lastSeen: 'Hace 30 seg', signal: -55 },
  { id: 'S006', name: 'Temp Depósito 03', type: 'Zigbee', protocol: 'MQTT', status: 'online', battery: 90, lastSeen: 'Hace 1 min', signal: -58 },
  { id: 'S007', name: 'HR Sala Barricas', type: 'Zigbee', protocol: 'MQTT', status: 'online', battery: 82, lastSeen: 'Hace 3 min', signal: -62 },
  { id: 'S008', name: 'Pileta pH', type: 'RS485', protocol: 'Modbus→MQTT', status: 'offline', battery: null, lastSeen: 'Hace 2 horas', signal: null },
]

const alerts = [
  { id: 1, time: '14:23', msg: 'S008 Pileta pH sin conexión', level: 'warning' },
  { id: 2, time: '09:05', msg: 'S003 batería < 80%', level: 'info' },
]

export default function IotPage() {
  const online = devices.filter(d => d.status === 'online').length
  return (
    <PageShell title="IoT Sensores" subtitle={`${devices.length} dispositivos · ${online} online`}>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#4ADE80]">{online}</p>
          <p className="text-xs text-[#9CA3AF]">Online</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#EF4444]">{devices.length - online}</p>
          <p className="text-xs text-[#9CA3AF]">Offline</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">3</p>
          <p className="text-xs text-[#9CA3AF]">Protocolos</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#F59E0B] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#F59E0B]">{alerts.length}</p>
          <p className="text-xs text-[#F59E0B]">Alertas activas</p>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#333]"><h3 className="font-medium">Dispositivos</h3></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#9CA3AF] text-xs border-b border-[#333]">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Batería</th>
              <th className="px-4 py-2 text-left">Señal</th>
              <th className="px-4 py-2 text-left">Última lectura</th>
            </tr>
          </thead>
          <tbody>
            {devices.map(d => (
              <tr key={d.id} className="border-b border-[#222] hover:bg-[#262626]">
                <td className="px-4 py-2 font-mono">{d.id}</td>
                <td className="px-4 py-2">{d.name}</td>
                <td className="px-4 py-2 text-xs">{d.type}</td>
                <td className="px-4 py-2">
                  {d.status === 'online'
                    ? <span className="flex items-center gap-1 text-[#4ADE80]"><Wifi className="w-3 h-3" />Online</span>
                    : <span className="flex items-center gap-1 text-[#EF4444]"><WifiOff className="w-3 h-3" />Offline</span>}
                </td>
                <td className="px-4 py-2">{d.battery != null ? `${d.battery}%` : '—'}</td>
                <td className="px-4 py-2 text-xs">{d.signal != null ? `${d.signal} dBm` : '—'}</td>
                <td className="px-4 py-2 text-xs text-[#9CA3AF]">{d.lastSeen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-[#F59E0B]" /> Alertas recientes</h3>
        <div className="space-y-2">
          {alerts.map(a => (
            <div key={a.id} className="flex items-center gap-3 text-sm">
              <span className="text-xs text-[#9CA3AF] font-mono">{a.time}</span>
              <span className={a.level === 'warning' ? 'text-[#F59E0B]' : 'text-[#3B82F6]'}>{a.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
