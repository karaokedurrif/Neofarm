'use client';

import EmptyState from '@/components/tenant/EmptyState';
import { Wifi } from 'lucide-react';

export default function TenantDevicesPage() {
  return (
    <div className="nf-content">
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 20 }}>📡 Dispositivos</h1>
      <EmptyState
        icon={Wifi}
        emoji="📡"
        title="Sin dispositivos IoT"
        description="Conecta sensores de temperatura, humedad, CO₂, báscula automática y cámaras a tu granja."
        hint="Los sensores IoT envían datos por MQTT. Configura tu primer dispositivo para ver datos en tiempo real."
        example={{
          title: 'Dispositivos compatibles',
          items: [
            'Sensor DHT22 — temperatura + humedad',
            'Sensor MH-Z19B — CO₂',
            'Báscula HX711 — peso automático',
            'ESP32-CAM — cámara IA (conteo de aves)',
          ],
        }}
      />
    </div>
  );
}
