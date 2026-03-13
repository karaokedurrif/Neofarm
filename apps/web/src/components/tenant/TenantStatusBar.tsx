'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/contexts/TenantContext';

export default function TenantStatusBar() {
  const { farm, slug } = useTenant();
  const [counts, setCounts] = useState({ aves: 0, gallineros: 0 });

  const load = useCallback(async () => {
    if (!slug) return;
    const api = `/api/ovosfera/farms/${encodeURIComponent(slug)}`;
    try {
      const [a, g] = await Promise.all([fetch(`${api}/aves`), fetch(`${api}/gallineros`)]);
      const ad = a.ok ? await a.json() : [];
      const gd = g.ok ? await g.json() : [];
      setCounts({ aves: ad.length, gallineros: gd.length });
    } catch {}
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="nf-status-bar">
      <div className="nf-status-left">
        <span className="nf-status-dot" style={{ background: 'var(--ok)' }} />
        <span className="nf-status-label">{farm?.name || 'Granja'}</span>
        <div className="nf-status-metrics">
          <div className="nf-status-metric">
            <span className="nf-status-metric-value">{counts.aves}</span>
            <span className="nf-status-metric-label">Aves</span>
          </div>
          <div className="nf-status-metric">
            <span className="nf-status-metric-value">{counts.gallineros}</span>
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
