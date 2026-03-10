'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import {
  BarChart3, Egg, Home, Heart, FlaskConical, Package,
  ClipboardList, FileText, Wifi, Settings, LogOut, User,
  Calendar, Dna, Camera, Leaf, BookOpen, ArrowLeft, type LucideIcon
} from 'lucide-react';

interface NavItem { href: string; label: string; Icon: LucideIcon; badge?: string }
interface NavSection { label: string; items: NavItem[] }

function getNav(slug: string): NavSection[] {
  const base = `/farm/${slug}`;
  return [
    {
      label: 'Principal',
      items: [
        { href: `${base}/dashboard`,    label: 'Dashboard',      Icon: BarChart3 },
        { href: `${base}/gallineros`,   label: 'Gallineros',     Icon: Home },
        { href: `${base}/aves`,         label: 'Aves',           Icon: Package },
        { href: `${base}/production`,   label: 'Producción',     Icon: Egg },
      ],
    },
    {
      label: 'Genética',
      items: [
        { href: `${base}/genetics`,     label: 'Cruces IA',      Icon: Dna },
        { href: `${base}/simulator`,    label: 'Simulador Fotos', Icon: Camera },
      ],
    },
    {
      label: 'Gestión',
      items: [
        { href: `${base}/health`,       label: 'Sanidad',        Icon: Heart },
        { href: `${base}/nutrition`,    label: 'Nutrición',      Icon: FlaskConical },
        { href: `${base}/calendar`,     label: 'Calendario',     Icon: Calendar },
        { href: `${base}/legislation`,  label: 'Legislación',    Icon: BookOpen },
        { href: `${base}/erp`,          label: 'ERP',            Icon: ClipboardList },
      ],
    },
    {
      label: 'Sostenibilidad',
      items: [
        { href: `${base}/carbon`,       label: 'Carbono',        Icon: Leaf },
        { href: `${base}/traceability`, label: 'Trazabilidad',   Icon: FileText },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { href: `${base}/devices`,      label: 'Dispositivos',   Icon: Wifi },
        { href: `${base}/settings`,     label: 'Configuración',  Icon: Settings },
      ],
    },
  ];
}

export default function TenantSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { farm, slug } = useTenant();
  const NAV = getNav(slug);

  return (
    <aside className="nf-sidebar">
      <div className="nf-sidebar-head">
        <Link href="/farms" style={{ textDecoration: 'none' }}>
          <div className="nf-wordmark">
            Ovo<span className="nf-wordmark-accent">Sfera</span>
          </div>
        </Link>
        <div className="nf-sidebar-sub" style={{ fontSize: 11, opacity: 0.35 }}>by NeoFarm</div>
        <div className="nf-farmline">
          <span style={{ fontSize: 14 }}>{farm?.avatar || '🏠'}</span>
          <span className="nf-nav-text" style={{ fontWeight: 600 }}>{farm?.name || 'Granja'}</span>
        </div>
        <Link
          href="/farms"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.45)',
            textDecoration: 'none', transition: 'color 160ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
        >
          <ArrowLeft size={12} /> Cambiar granja
        </Link>
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
