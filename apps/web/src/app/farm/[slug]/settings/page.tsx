'use client';

import { useTenant } from '@/contexts/TenantContext';
import { Settings, Users, MapPin, Shield } from 'lucide-react';

export default function TenantSettingsPage() {
  const { farm, membership } = useTenant();

  return (
    <div className="nf-content">
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 20 }}>⚙️ Configuración</h1>

      <div style={{ display: 'grid', gap: 20, maxWidth: 680 }}>
        {/* Farm info */}
        <div className="nf-card">
          <div className="nf-card-hd">
            <div className="nf-card-title">🏠 Datos de la granja</div>
          </div>
          <div className="nf-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="nf-label">Nombre</label>
              <input className="nf-input" value={farm?.name || ''} readOnly style={{ background: 'var(--neutral-25)' }} />
            </div>
            <div>
              <label className="nf-label">Slug (URL)</label>
              <input className="nf-input" value={farm?.slug || ''} readOnly style={{ background: 'var(--neutral-25)', fontFamily: 'var(--font-mono)' }} />
            </div>
            <div>
              <label className="nf-label">Ubicación</label>
              <input className="nf-input" value={farm?.location || ''} readOnly style={{ background: 'var(--neutral-25)' }} />
            </div>
            <div>
              <label className="nf-label">Plan</label>
              <input className="nf-input" value={farm?.plan || ''} readOnly style={{ background: 'var(--neutral-25)' }} />
            </div>
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)',
              fontSize: 12, color: '#3B82F6',
            }}>
              💡 La configuración de la granja se editará desde el panel de administración (próximamente).
            </div>
          </div>
        </div>

        {/* Membership */}
        <div className="nf-card">
          <div className="nf-card-hd">
            <div className="nf-card-title">👥 Miembros</div>
          </div>
          <div className="nf-card-pad">
            <table className="nf-table">
              <thead>
                <tr><th>Usuario</th><th>Rol</th></tr>
              </thead>
              <tbody>
                <tr><td>🧑‍🌾 Jesús</td><td><span className="nf-tag">admin</span></td></tr>
                <tr><td>👨‍🔬 Fran</td><td><span className="nf-tag">admin</span></td></tr>
                <tr><td>👨‍💻 David</td><td><span className="nf-tag">admin</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tu rol */}
        <div className="nf-card">
          <div className="nf-card-hd">
            <div className="nf-card-title">🔐 Tu acceso</div>
          </div>
          <div className="nf-card-pad">
            <p style={{ fontSize: 13, color: 'var(--neutral-600)' }}>
              Rol actual: <strong>{membership?.role || '—'}</strong>
            </p>
            <p style={{ fontSize: 12, color: 'var(--neutral-400)', marginTop: 4 }}>
              Como admin puedes crear gallineros, registrar aves, anotar producción y gestionar todos los módulos de la granja.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
