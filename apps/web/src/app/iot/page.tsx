'use client'
import PageShell from '@/components/shared/PageShell'
import { Wifi, WifiOff, Battery, AlertTriangle, Activity } from 'lucide-react'

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

function signalBars(dBm: number | null) {
  if (dBm === null) return 0
  if (dBm > -50) return 4
  if (dBm > -65) return 3
  if (dBm > -75) return 2
  return 1
}

export default function IotPage() {
  const online = devices.filter(d => d.status === 'online').length
  return (
    <PageShell title="IoT Sensores" subtitle={`${devices.length} dispositivos · ${online} online`}>
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Online', value: online, color: 'var(--success)', bg: 'var(--success-muted)' },
          { label: 'Offline', value: devices.length - online, color: 'var(--danger)', bg: 'var(--danger-muted)' },
          { label: 'Protocolos', value: 3, color: 'var(--info)', bg: 'var(--info-muted)' },
          { label: 'Alertas activas', value: alerts.length, color: 'var(--warning)', bg: 'var(--warning-muted)' },
        ].map((kpi, i) => (
          <div key={kpi.label} className="card p-4 text-center animate-in" style={{ animationDelay: `${i * 60}ms` }}>
            <p className="text-2xl font-bold font-mono" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <Activity className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <h3 className="font-medium">Dispositivos</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-medium" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
              <th className="px-4 py-2.5 text-left">ID</th>
              <th className="px-4 py-2.5 text-left">Nombre</th>
              <th className="px-4 py-2.5 text-left">Tipo</th>
              <th className="px-4 py-2.5 text-left">Estado</th>
              <th className="px-4 py-2.5 text-left">Batería</th>
              <th className="px-4 py-2.5 text-left">Señal</th>
              <th className="px-4 py-2.5 text-left">Última lectura</th>
            </tr>
          </thead>
          <tbody>
            {devices.map(d => {
              const bars = signalBars(d.signal)
              return (
                <tr key={d.id} className="table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="px-4 py-2.5 font-mono text-xs">{d.id}</td>
                  <td className="px-4 py-2.5 font-medium">{d.name}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>{d.type}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    {d.status === 'online'
                      ? <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--success)' }}><Wifi className="w-3 h-3" />Online</span>
                      : <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--danger)' }}><WifiOff className="w-3 h-3" />Offline</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    {d.battery != null ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-2 rounded-sm overflow-hidden" style={{ background: 'var(--surface-hover)' }}>
                          <div className="h-full rounded-sm" style={{
                            width: `${d.battery}%`,
                            background: d.battery > 50 ? 'var(--success)' : d.battery > 20 ? 'var(--warning)' : 'var(--danger)',
                          }} />
                        </div>
                        <span className="text-xs font-mono">{d.battery}%</span>
                      </div>
                    ) : <span className="text-[var(--text-muted)]">—</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    {d.signal != null ? (
                      <div className="flex items-end gap-px h-3">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-1 rounded-sm" style={{
                            height: `${i * 25}%`,
                            background: i <= bars ? 'var(--success)' : 'var(--surface-hover)',
                          }} />
                        ))}
                        <span className="text-[10px] font-mono ml-1" style={{ color: 'var(--text-muted)' }}>{d.signal}</span>
                      </div>
                    ) : <span className="text-[var(--text-muted)]">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--text-muted)' }}>{d.lastSeen}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" style={{ color: 'var(--warning)' }} /> Alertas recientes
        </h3>
        <div className="space-y-2">
          {alerts.map(a => (
            <div key={a.id} className="flex items-center gap-3 text-sm">
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{a.time}</span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: a.level === 'warning' ? 'var(--warning)' : 'var(--info)' }} />
              <span style={{ color: a.level === 'warning' ? 'var(--warning)' : 'var(--info)' }}>{a.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
