'use client';

import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="nf-content">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>
        <SettingsIcon size={24} style={{ display: 'inline', marginRight: 8 }} />
        Configuración
      </h1>

      <div className="nf-card" style={{ marginBottom: 24 }}>
        <div className="nf-card-hd">
          <div className="nf-card-title">Información de la Granja</div>
        </div>
        <div className="nf-card-pad">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="nf-label">Nombre</label>
              <input className="nf-input" defaultValue="Granja Los Capones" />
            </div>
            <div>
              <label className="nf-label">Código REGA</label>
              <input className="nf-input" defaultValue="ES123456789" />
            </div>
            <div>
              <label className="nf-label">Ubicación</label>
              <input className="nf-input" defaultValue="Castilla y León" />
            </div>
            <div>
              <label className="nf-label">Tipo Explotación</label>
              <select className="nf-input">
                <option>Ecológico certificado</option>
                <option>Extensivo</option>
                <option>Campero</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="nf-card">
        <div className="nf-card-hd">
          <div className="nf-card-title">Notificaciones</div>
        </div>
        <div className="nf-card-pad">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              <span>Alertas de vacunación</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              <span>Stock de pienso bajo</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" />
              <span>Resumen diario producción</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
