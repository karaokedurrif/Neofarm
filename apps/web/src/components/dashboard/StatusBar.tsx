'use client';

const METRICS = [
  { value: '38',     label: 'Aves' },
  { value: '18',     label: 'Gallinas' },
  { value: '2',      label: 'Gallos' },
  { value: '12',     label: 'Capones' },
  { value: '6',      label: 'Pollitos' },
  { value: '4/día',  label: '🥚 Huevos' },
];

const BADGES = [
  { label: 'Sensores 2/2', status: 'ok' as const },
  { label: 'IoT activo',   status: 'ok' as const },
  { label: 'Sync 60s',     status: 'ok' as const },
];

export default function StatusBar() {
  return (
    <div className="nf-status-bar">
      <div className="nf-status-left">
        <span className="nf-status-dot" style={{ background: 'var(--ok)' }} />
        <span className="nf-status-label">Operativo</span>
        <div className="nf-status-metrics">
          {METRICS.map((m) => (
            <div key={m.label} className="nf-status-metric">
              <span className="nf-status-metric-value">{m.value}</span>
              <span className="nf-status-metric-label">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="nf-status-right">
        {BADGES.map((b) => (
          <span key={b.label} className={`nf-status-badge ${b.status}`}>
            <span className={`nf-dot ${b.status}`} />
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}
