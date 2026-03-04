'use client';

import { Heart, Syringe, AlertTriangle } from 'lucide-react';

const PROTOCOLOS = [
  { id: 'VAC-01', nombre: 'Newcastle + Bronquitis', obligatorio: true, frecuencia: 'Según programa', edad: '1 día + refuerzos', via: 'Agua de bebida / spray', estado: 'ok' },
  { id: 'VAC-02', nombre: 'Gumboro (Bursitis)', obligatorio: true, frecuencia: '1 vez', edad: '14-18 días', via: 'Agua de bebida', estado: 'ok' },
  { id: 'VAC-03', nombre: 'Influenza Aviar (IAAP)', obligatorio: 'Si zona riesgo', frecuencia: 'Según MAPA', edad: 'Variable', via: 'Inyección', estado: 'pendiente' },
  { id: 'DES-01', nombre: 'Desparasitación interna', obligatorio: false, frecuencia: 'Trimestral', edad: 'Adultos', via: 'Oral en agua', estado: 'programado' },
  { id: 'BIO-01', nombre: 'Vacío sanitario', obligatorio: true, frecuencia: 'Entre lotes', edad: 'N/A', via: 'Desinfección + reposo 14d', estado: 'ok' },
];

const ENFERMEDADES = [
  { nombre: 'Newcastle', riesgo: 'Alto', prevencion: 'Vacunación obligatoria' },
  { nombre: 'Influenza Aviar', riesgo: 'Medio', prevencion: 'Vigilancia + vacunación en zona riesgo' },
  { nombre: 'Salmonelosis', riesgo: 'Medio', prevencion: 'Higiene + control alimento' },
  { nombre: 'Coccidiosis', riesgo: 'Alto', prevencion: 'Higiene cama + anticoccidiano' },
  { nombre: 'Viruela aviar', riesgo: 'Bajo', prevencion: 'Control mosquitos' },
];

export default function HealthPage() {
  return (
    <div className="nf-content">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
        <Heart size={24} style={{ display: 'inline', marginRight: 8, color: 'var(--alert)' }} />
        Sanidad Avícola
      </h1>
      <p style={{ color: 'var(--neutral-500)', marginBottom: 24 }}>
        Protocolos obligatorios y recomendados para avicultura extensiva/ecológica
      </p>

      {/* Protocolos */}
      <div className="nf-card" style={{ marginBottom: 24 }}>
        <div className="nf-card-hd">
          <div className="nf-card-title">
            <Syringe size={16} style={{ display: 'inline', marginRight: 6 }} />
            Protocolos de Vacunación
          </div>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table className="nf-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Protocolo</th>
                <th>Obligatorio</th>
                <th>Frecuencia</th>
                <th>Edad</th>
                <th>Vía</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {PROTOCOLOS.map((p) => (
                <tr key={p.id}>
                  <td><span className="nf-tag">{p.id}</span></td>
                  <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                  <td>
                    {p.obligatorio === true ? (
                      <span style={{ color: 'var(--alert)', fontWeight: 700 }}>✓ Sí</span>
                    ) : p.obligatorio === 'Si zona riesgo' ? (
                      <span style={{ color: 'var(--warn)' }}>Condicional</span>
                    ) : (
                      <span style={{ color: 'var(--neutral-400)' }}>No</span>
                    )}
                  </td>
                  <td>{p.frecuencia}</td>
                  <td style={{ fontSize: 12 }}>{p.edad}</td>
                  <td style={{ fontSize: 12 }}>{p.via}</td>
                  <td>
                    <span className={`nf-dot ${p.estado === 'ok' ? 'ok' : p.estado === 'programado' ? 'info' : 'warn'}`} style={{ marginRight: 6 }} />
                    {p.estado === 'ok' ? 'Al día' : p.estado === 'programado' ? 'Programado' : 'Pendiente'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enfermedades relevantes */}
      <div className="nf-card">
        <div className="nf-card-hd">
          <div className="nf-card-title">
            <AlertTriangle size={16} style={{ display: 'inline', marginRight: 6 }} />
            Enfermedades Relevantes (Extensivo)
          </div>
        </div>
        <div className="nf-card-pad">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {ENFERMEDADES.map((e) => (
              <div key={e.nombre} style={{ padding: 12, border: 'var(--border-default)', borderRadius: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{e.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--neutral-500)', marginBottom: 6 }}>
                  Riesgo: <span style={{ color: e.riesgo === 'Alto' ? 'var(--alert)' : e.riesgo === 'Medio' ? 'var(--warn)' : 'var(--ok)', fontWeight: 600 }}>{e.riesgo}</span>
                </div>
                <div style={{ fontSize: 12 }}>{e.prevencion}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
