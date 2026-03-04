'use client'
import { DollarSign, ShoppingCart, Users, FileText, TrendingUp, Calendar } from 'lucide-react'

export default function ERPPage() {
  const ventas = [
    { id: 'V-001', fecha: '2024-01-15', cliente: 'Restaurante El Asador', producto: '6 capones', importe: 240, estado: 'Pagado' },
    { id: 'V-002', fecha: '2024-01-18', cliente: 'Mercado Local', producto: '48 huevos', importe: 24, estado: 'Pendiente' },
    { id: 'V-003', fecha: '2024-01-20', cliente: 'Carnicería Los Hermanos', producto: '4 capones', importe: 160, estado: 'Pagado' },
  ]

  const compras = [
    { id: 'C-001', fecha: '2024-01-10', proveedor: 'Piensos Ecológicos SA', concepto: 'Pienso ponedoras 25kg', importe: 38, estado: 'Pagado' },
    { id: 'C-002', fecha: '2024-01-12', proveedor: 'Veterinaria Del Campo', concepto: 'Vacunas Newcastle', importe: 45, estado: 'Pendiente' },
    { id: 'C-003', fecha: '2024-01-14', proveedor: 'Semillas Orgánicas', concepto: 'Semilla pradera', importe: 120, estado: 'Pagado' },
  ]

  const totalVentas = ventas.reduce((sum, v) => sum + v.importe, 0)
  const totalCompras = compras.reduce((sum, c) => sum + c.importe, 0)
  const margen = totalVentas - totalCompras

  return (
    <div className="nf-main" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>ERP Avícola</h1>
        <p className="nf-muted">Gestión económica y administrativa</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="nf-kbox">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <DollarSign size={20} color="var(--success-500)" />
            <span className="nf-label">Ventas</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--success-600)' }}>€{totalVentas}</div>
          <div className="nf-muted" style={{ fontSize: '13px' }}>Últimos 30 días</div>
        </div>

        <div className="nf-kbox">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShoppingCart size={20} color="var(--error-500)" />
            <span className="nf-label">Compras</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--error-600)' }}>€{totalCompras}</div>
          <div className="nf-muted" style={{ fontSize: '13px' }}>Últimos 30 días</div>
        </div>

        <div className="nf-kbox">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp size={20} color="var(--primary-500)" />
            <span className="nf-label">Margen</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: margen > 0 ? 'var(--success-600)' : 'var(--error-600)' }}>€{margen}</div>
          <div className="nf-muted" style={{ fontSize: '13px' }}>{((margen / totalVentas) * 100).toFixed(1)}% margen</div>
        </div>

        <div className="nf-kbox">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Users size={20} color="var(--neutral-500)" />
            <span className="nf-label">Clientes</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>3</div>
          <div className="nf-muted" style={{ fontSize: '13px' }}>Activos</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Ventas */}
        <div className="nf-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Últimas Ventas</h2>
            <button className="nf-btn">+ Nueva Venta</button>
          </div>

          <table className="nf-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Importe</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.cliente}</td>
                  <td>{v.producto}</td>
                  <td style={{ fontWeight: 600, color: 'var(--success-600)' }}>€{v.importe}</td>
                  <td>
                    <span className={`nf-tag ${v.estado === 'Pagado' ? 'success' : 'warning'}`}>
                      {v.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compras */}
        <div className="nf-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Últimas Compras</h2>
            <button className="nf-btn">+ Nueva Compra</button>
          </div>

          <table className="nf-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Proveedor</th>
                <th>Concepto</th>
                <th>Importe</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {compras.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.proveedor}</td>
                  <td>{c.concepto}</td>
                  <td style={{ fontWeight: 600, color: 'var(--error-600)' }}>€{c.importe}</td>
                  <td>
                    <span className={`nf-tag ${c.estado === 'Pagado' ? 'success' : 'warning'}`}>
                      {c.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fiscal */}
      <div className="nf-card" style={{ padding: '20px', marginTop: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} />
          Resumen Fiscal (Trimestre Q1 2024)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div className="nf-card" style={{ background: 'var(--neutral-100)', padding: '16px' }}>
            <p className="nf-label">Base Imponible</p>
            <p style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>€{totalVentas}</p>
          </div>

          <div className="nf-card" style={{ background: 'var(--neutral-100)', padding: '16px' }}>
            <p className="nf-label">IVA (10% alimentación)</p>
            <p style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>€{(totalVentas * 0.1).toFixed(2)}</p>
          </div>

          <div className="nf-card" style={{ background: 'var(--neutral-100)', padding: '16px' }}>
            <p className="nf-label">Total Facturado</p>
            <p style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>€{(totalVentas * 1.1).toFixed(2)}</p>
          </div>
        </div>

        <p className="nf-muted" style={{ marginTop: '16px', fontSize: '13px' }}>
          ⚠️ Estos datos son orientativos. Consulta con tu asesor fiscal para el cálculo exacto.
        </p>
      </div>

      {/* Próximos pagos */}
      <div className="nf-card" style={{ padding: '20px', marginTop: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} />
          Próximos Pagos
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--neutral-100)', borderRadius: '4px' }}>
            <div>
              <p style={{ fontWeight: 600 }}>Vacunas Newcastle (Veterinaria Del Campo)</p>
              <p className="nf-muted" style={{ fontSize: '13px' }}>Vence: 25 enero 2024</p>
            </div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--error-600)' }}>€45</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--neutral-100)', borderRadius: '4px' }}>
            <div>
              <p style={{ fontWeight: 600 }}>Electricidad (Iberdrola)</p>
              <p className="nf-muted" style={{ fontSize: '13px' }}>Vence: 1 febrero 2024</p>
            </div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--error-600)' }}>€68</p>
          </div>
        </div>
      </div>
    </div>
  )
}
