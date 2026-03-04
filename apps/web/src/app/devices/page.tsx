'use client';

import { Wifi, Battery } from 'lucide-react';

const DEVICES = [
  { id: 'TH-001', name: 'Temp/Hum Gallinero', type: 'temp_humedad', status: 'online', battery: 89, gallinero: 'G1', ultimoDato: '2026-03-04 14:32' },
  { id: 'TH-002', name: 'Temp/Hum Cría', type: 'temp_humedad', status: 'online', battery: 74, gallinero: 'G3', ultimoDato: '2026-03-04 14:31' },
];

export default function DevicesPage() {
  return (
    <div className="nf-content">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
        <Wifi size={24} style={{ display: 'inline', marginRight: 8 }} />
        Dispositivos IoT
      </h1>
      <p style={{ color: 'var(--neutral-500)', marginBottom: 24 }}>
        Sensores y dispositivos conectados
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
        {DEVICES.map((d) => (
          <div key={d.id} className="nf-card">
            <div className="nf-card-hd">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="nf-card-title">{d.name}</div>
                  <div className="nf-card-meta">{d.type}</div>
                </div>
                <span className={`nf-dot ${d.status === 'online' ? 'ok' : 'alert'}`} />
              </div>
            </div>
            <div className="nf-card-pad">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>ID:</span>
                  <span className="nf-tag">{d.id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>Gallinero:</span>
                  <span className="nf-tag">{d.gallinero}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>Batería:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Battery size={16} style={{ color: d.battery > 20 ? 'var(--ok)' : 'var(--alert)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{d.battery}%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>Último dato:</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{d.ultimoDato}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="nf-card" style={{ marginTop: 24, background: 'var(--neutral-50)' }}>
        <div className="nf-card-pad" style={{ textAlign: 'center', padding: 32 }}>
          <Wifi size={48} style={{ color: 'var(--neutral-300)', marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>MQTT Broker Activo</h3>
          <p style={{ fontSize: 13, color: 'var(--neutral-600)' }}>
            ovosfera-mqtt:1883 · {DEVICES.length} dispositivos conectados
          </p>
        </div>
      </div>
    </div>
  );
}
