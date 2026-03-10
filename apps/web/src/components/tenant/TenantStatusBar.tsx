'use client';

import { useTenant } from '@/contexts/TenantContext';

export default function TenantStatusBar() {
  const { farm } = useTenant();

  return (
    <div className="nf-status-bar">
      <div className="nf-status-left">
        <span className="nf-status-dot" style={{ background: 'var(--ok)' }} />
        <span className="nf-status-label">{farm?.name || 'Granja'}</span>
        <div className="nf-status-metrics">
          <div className="nf-status-metric">
            <span className="nf-status-metric-value">—</span>
            <span className="nf-status-metric-label">Aves</span>
          </div>
          <div className="nf-status-metric">
            <span className="nf-status-metric-value">—</span>
            <span className="nf-status-metric-label">Gallineros</span>
          </div>
          <div className="nf-status-metric">
            <span className="nf-status-metric-value">—</span>
            <span className="nf-status-metric-label">🥚 Huevos</span>
          </div>
        </div>
      </div>
      <div className="nf-status-right">
        <span className="nf-status-badge">
          {farm?.avatar} {farm?.slug}
        </span>
        <span className="nf-status-badge ok">
          <span className="nf-dot ok" />
          Operativo
        </span>
      </div>
    </div>
  );
}
