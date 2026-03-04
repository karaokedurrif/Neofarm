'use client'
import { Package, MapPin, Calendar, User, FileText, Check } from 'lucide-react'

export default function TraceabilityPage() {
  const lotes = [
    {
      id: 'LOT-2024-001',
      nombre: 'Lote Navidad 2024',
      tipo: 'Capones',
      cantidad: 12,
      estado: 'En engorde',
      progenitores: 'Castellana Negra × (Prat + Plymouth)',
      fechaNacimiento: '2024-03-15',
      fechaCaponizacion: '2024-05-20',
      fechaVentaEstimada: '2024-12-20',
      cliente: 'Restaurante El Asador',
      certificaciones: ['Ecológico UE', 'Bienestar Animal']
    },
    {
      id: 'LOT-2024-002',
      nombre: 'Lote Pascua 2025',
      tipo: 'Capones',
      cantidad: 10,
      estado: 'Cría',
      progenitores: 'Prat Leonada × (Sussex + Empordanesa)',
      fechaNacimiento: '2024-09-10',
      fechaCaponizacion: '2024-11-15',
      fechaVentaEstimada: '2025-04-10',
      cliente: 'Pendiente',
      certificaciones: ['Ecológico UE']
    }
  ]

  const timeline = [
    { fecha: '2024-03-15', evento: 'Nacimiento (incubadora)', responsable: 'David' },
    { fecha: '2024-03-16', evento: 'Vacunación Newcastle + Bronquitis', responsable: 'Veterinario' },
    { fecha: '2024-03-30', evento: 'Vacunación Gumboro', responsable: 'Veterinario' },
    { fecha: '2024-04-01', evento: 'Traslado a gallinero cría', responsable: 'David' },
    { fecha: '2024-05-20', evento: 'Caponización (veterinario autorizado)', responsable: 'Dr. Martínez' },
    { fecha: '2024-06-01', evento: 'Traslado a gallinero capones', responsable: 'David' },
    { fecha: '2024-08-15', evento: 'Desparasitación (trimestral)', responsable: 'David' },
    { fecha: '2024-12-15', evento: 'Pesaje pre-venta (5.2 kg promedio)', responsable: 'David' },
    { fecha: '2024-12-20', evento: 'Sacrificio + entrega cliente', responsable: 'Matadero Autorizado' },
  ]

  return (
    <div className="nf-main" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>Trazabilidad</h1>
        <p className="nf-muted">Del huevo al plato: seguimiento completo de cada lote</p>
      </div>

      {/* Lotes activos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {lotes.map(lote => (
          <div key={lote.id} className="nf-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{lote.nombre}</h3>
                <p className="nf-muted" style={{ fontSize: '13px' }}>{lote.id}</p>
              </div>
              <span className={`nf-tag ${lote.estado === 'En engorde' ? 'success' : 'info'}`}>
                {lote.estado}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={16} className="nf-muted" />
                <span className="nf-muted" style={{ fontSize: '13px' }}>Cantidad:</span>
                <span style={{ fontWeight: 600 }}>{lote.cantidad} capones</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} className="nf-muted" />
                <span className="nf-muted" style={{ fontSize: '13px' }}>Nacimiento:</span>
                <span>{new Date(lote.fechaNacimiento).toLocaleDateString('es-ES')}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} className="nf-muted" />
                <span className="nf-muted" style={{ fontSize: '13px' }}>Cliente:</span>
                <span style={{ fontWeight: 600, color: lote.cliente === 'Pendiente' ? 'var(--warning-600)' : 'inherit' }}>
                  {lote.cliente}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <p className="nf-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Progenitores</p>
              <p style={{ fontSize: '13px' }}>{lote.progenitores}</p>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {lote.certificaciones.map(cert => (
                <span key={cert} className="nf-tag success" style={{ fontSize: '11px' }}>
                  <Check size={12} /> {cert}
                </span>
              ))}
            </div>

            <button className="nf-btn" style={{ marginTop: '16px', width: '100%' }}>
              Ver detalles completos
            </button>
          </div>
        ))}
      </div>

      {/* Timeline detallada (LOT-2024-001) */}
      <div className="nf-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
          Timeline: {lotes[0].nombre} ({lotes[0].id})
        </h2>

        <div style={{ position: 'relative', paddingLeft: '32px' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: '10px', top: '8px', bottom: '8px', width: '2px', background: 'var(--neutral-300)' }}></div>

          {timeline.map((event, idx) => (
            <div key={idx} style={{ position: 'relative', marginBottom: '24px' }}>
              {/* Dot */}
              <div style={{ position: 'absolute', left: '-26px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary-500)', border: '2px solid white' }}></div>

              <div className="nf-card" style={{ background: 'var(--neutral-100)', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <p style={{ fontWeight: 600 }}>{event.evento}</p>
                  <p className="nf-muted" style={{ fontSize: '13px' }}>
                    {new Date(event.fecha).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <p className="nf-muted" style={{ fontSize: '13px' }}>
                  Responsable: {event.responsable}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documentación adjunta */}
      <div className="nf-card" style={{ padding: '20px', marginTop: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} />
          Documentación Adjunta
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div className="nf-card" style={{ background: 'var(--neutral-100)', padding: '16px', textAlign: 'center' }}>
            <FileText size={32} color="var(--primary-500)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 600, fontSize: '14px' }}>Certificado Ecológico</p>
            <p className="nf-muted" style={{ fontSize: '12px' }}>UE 2018/848</p>
          </div>

          <div className="nf-card" style={{ background: 'var(--neutral-100)', padding: '16px', textAlign: 'center' }}>
            <FileText size={32} color="var(--primary-500)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 600, fontSize: '14px' }}>Registro Sanitario</p>
            <p className="nf-muted" style={{ fontSize: '12px' }}>RD 1665/2009</p>
          </div>

          <div className="nf-card" style={{ background: 'var(--neutral-100)', padding: '16px', textAlign: 'center' }}>
            <FileText size={32} color="var(--primary-500)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 600, fontSize: '14px' }}>Informe Veterinario</p>
            <p className="nf-muted" style={{ fontSize: '12px' }}>Caponización</p>
          </div>
        </div>
      </div>

      {/* QR Code para cliente */}
      <div className="nf-card" style={{ padding: '20px', marginTop: '24px', background: 'var(--primary-50)', border: '1px solid var(--primary-200)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--primary-700)' }}>
          🔗 Trazabilidad Cliente
        </h2>
        <p className="nf-muted" style={{ marginBottom: '16px', color: 'var(--primary-900)' }}>
          Genera un código QR para que el cliente final pueda consultar el origen, alimentación, vacunaciones y certificaciones del lote.
        </p>
        <button className="nf-btn" style={{ background: 'var(--primary-500)', color: 'white' }}>
          Generar QR Code
        </button>
      </div>
    </div>
  )
}
