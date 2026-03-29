'use client'
import PageShell from '@/components/shared/PageShell'
import { Settings, Palette, Users, Bell, Database, Shield } from 'lucide-react'

const sections = [
  { icon: Palette, title: 'Branding', desc: 'Logo, colores, nombre de la bodega', items: ['Logo: bodegadata-logo.svg', 'Color primario: #7F1D1D (Burdeos)', 'Color acento: #D4A843 (Dorado)', 'Nombre: BodegaData Hub'] },
  { icon: Users, title: 'Usuarios', desc: 'Gestión de acceso y roles', items: ['admin@bodegadata.com — Admin', 'enólogo@bodegadata.com — Técnico', 'viñedo@bodegadata.com — Campo'] },
  { icon: Bell, title: 'Notificaciones', desc: 'Alertas y canales', items: ['Email: Activado', 'MQTT alerts: Activado', 'Telegram Bot: Configurado', 'Umbral helada: 0°C'] },
  { icon: Database, title: 'Base de datos', desc: 'PostgreSQL + PostGIS', items: ['Host: bodegadata-db:5432', 'DB: bodegadata', 'PostGIS: 3.4', 'Backup diario: 03:00 UTC'] },
  { icon: Shield, title: 'Seguridad', desc: 'Acceso y autenticación', items: ['JWT Auth: Activado', 'HTTPS: Cloudflare Tunnel', '2FA: Desactivado', 'Session timeout: 24h'] },
]

export default function SettingsPage() {
  return (
    <PageShell title="Ajustes" subtitle="Configuración general del sistema">
      <div className="grid grid-cols-2 gap-4">
        {sections.map(s => (
          <div key={s.title} className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 hover:border-[#D4A843] transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <s.icon className="w-5 h-5 text-[#D4A843]" />
              <div>
                <h3 className="font-medium">{s.title}</h3>
                <p className="text-xs text-[#9CA3AF]">{s.desc}</p>
              </div>
            </div>
            <div className="space-y-1">
              {s.items.map((item, i) => (
                <p key={i} className="text-xs text-[#9CA3AF] pl-8">{item}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
        <h3 className="font-medium mb-3">Información del sistema</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><span className="text-[#9CA3AF]">Versión:</span> BodegaData Hub v1.0.0</div>
          <div><span className="text-[#9CA3AF]">Servidor:</span> docker-edge-apps</div>
          <div><span className="text-[#9CA3AF]">IP:</span> 192.168.30.101</div>
          <div><span className="text-[#9CA3AF]">API:</span> FastAPI v0.104</div>
          <div><span className="text-[#9CA3AF]">Frontend:</span> Next.js 14</div>
          <div><span className="text-[#9CA3AF]">MQTT:</span> Mosquitto 2.0</div>
        </div>
      </div>
    </PageShell>
  )
}
