'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3, Egg, Home, Heart, FlaskConical, Package,
  ClipboardList, FileText, Wifi, Settings, LogOut, User,
  Calendar, Dna, Camera, Leaf, BookOpen, MessageCircle, type LucideIcon
} from 'lucide-react';

interface NavItem { href: string; label: string; Icon: LucideIcon; badge?: string }
interface NavSection { label: string; items: NavItem[] }

const NAV: NavSection[] = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard',    label: 'Dashboard',      Icon: BarChart3,    badge: 'OK' },
      { href: '/gallineros',   label: 'Gallineros',     Icon: Home },
      { href: '/aves',         label: 'Aves',           Icon: Package },
      { href: '/production',   label: 'Producción',     Icon: Egg,          badge: 'Live' },
    ],
  },
  {
    label: 'Genética',
    items: [
      { href: '/genetics',     label: 'Cruces IA',      Icon: Dna },
      { href: '/simulator',    label: 'Simulador Fotos', Icon: Camera },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { href: '/health',       label: 'Sanidad',        Icon: Heart },
      { href: '/nutrition',    label: 'Nutrición',      Icon: FlaskConical },
      { href: '/calendar',     label: 'Calendario',     Icon: Calendar },
      { href: '/legislation',  label: 'Legislación',    Icon: BookOpen },
      { href: '/erp',          label: 'ERP',            Icon: ClipboardList },
    ],
  },
  {
    label: 'Sostenibilidad',
    items: [
      { href: '/carbon',       label: 'Carbono',        Icon: Leaf },
      { href: '/traceability', label: 'Trazabilidad',   Icon: FileText },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/devices',      label: 'Dispositivos',   Icon: Wifi,         badge: '2' },
      { href: '/settings',     label: 'Configuración',  Icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  return (
    <aside className="nf-sidebar">
      <div className="nf-sidebar-head">
        <Link href="/dashboard">
          <div className="nf-wordmark">
            Ovo<span className="nf-wordmark-accent">Sfera</span>
          </div>
        </Link>
        <div className="nf-sidebar-sub" style={{ fontSize: 11, opacity: 0.35 }}>by NeoFarm</div>
        <div className="nf-farmline">
          <span className="nf-dot ok" />
          <span className="nf-nav-text">Granja Los Capones</span>
        </div>
      </div>
      <nav className="nf-sidebar-nav">
        {NAV.map((section) => (
          <div key={section.label}>
            <div className="nf-nav-label">{section.label}</div>
            {section.items.map(({ href, label, Icon, badge }) => {
              const active = pathname === href || pathname?.startsWith(href + '/');
              return (
                <Link key={href} href={href} className={`nf-nav-item${active ? ' active' : ''}`}>
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span className="nf-nav-text">{label}</span>
                  {badge && <span className="nf-nav-badge">{badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="nf-sidebar-footer">
        <div className="nf-nav-item" style={{ cursor: 'default', pointerEvents: 'none' }}>
          <User size={16} /> <span className="nf-nav-text" style={{ fontSize: 12 }}>{user?.name || 'Usuario'}</span>
        </div>
        <button className="nf-nav-item" onClick={logout} style={{ color: 'rgba(220,38,38,0.8)', width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
          <LogOut size={16} /> <span className="nf-nav-text">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
