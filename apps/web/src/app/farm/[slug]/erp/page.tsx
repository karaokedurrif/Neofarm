'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { Plus, X, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package } from 'lucide-react';

interface Venta {
  id: number; concepto: string; codigo: string | null; cliente: string | null;
  cantidad: number; precio_unit: number; total: number; fecha: string | null; estado: string; notas: string | null;
}
interface Compra {
  id: number; concepto: string; codigo: string | null; proveedor: string | null;
  cantidad: number; precio_unit: number; total: number; fecha: string | null; estado: string; notas: string | null;
}

const API = (slug: string) => `/api/ovosfera/farms/${encodeURIComponent(slug)}`;

type Tab = 'ventas' | 'compras' | 'resumen';

export default function TenantERPPage() {
  const { slug } = useTenant();
  const [tab, setTab] = useState<Tab>('ventas');
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyVenta = () => ({ concepto: '', codigo: '', cliente: '', cantidad: '1', precio_unit: '0', total: '0', fecha: new Date().toISOString().slice(0, 10), estado: 'Pendiente', notas: '' });
  const emptyCompra = () => ({ concepto: '', codigo: '', proveedor: '', cantidad: '1', precio_unit: '0', total: '0', fecha: new Date().toISOString().slice(0, 10), estado: 'Pendiente', notas: '' });
  const [form, setForm] = useState<any>(emptyVenta());

  const load = useCallback(async () => {
    if (!slug) return;
    try {
      const [vr, cr] = await Promise.all([fetch(`${API(slug)}/ventas`), fetch(`${API(slug)}/compras`)]);
      if (vr.ok) setVentas(await vr.json());
      if (cr.ok) setCompras(await cr.json());
    } catch {}
    setLoaded(true);
  }, [slug]);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!slug || saving) return;
    setSaving(true);
    const endpoint = tab === 'ventas' ? 'ventas' : 'compras';
    const url = editId ? `${API(slug)}/${endpoint}/${editId}` : `${API(slug)}/${endpoint}`;
    const method = editId ? 'PUT' : 'POST';
    const body: any = {
      concepto: form.concepto || 'Sin concepto',
      codigo: form.codigo || null,
      cantidad: parseInt(form.cantidad) || 1,
      precio_unit: parseFloat(form.precio_unit) || 0,
      total: parseFloat(form.total) || (parseInt(form.cantidad) || 1) * (parseFloat(form.precio_unit) || 0),
      fecha: form.fecha || null,
      estado: form.estado || 'Pendiente',
      notas: form.notas || null,
    };
    if (tab === 'ventas') body.cliente = form.cliente || null;
    else body.proveedor = form.proveedor || null;
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        const item = await res.json();
        if (tab === 'ventas') {
          setVentas(p => editId ? p.map(v => v.id === editId ? item : v) : [...p, item]);
        } else {
          setCompras(p => editId ? p.map(c => c.id === editId ? item : c) : [...p, item]);
        }
      }
    } catch {}
    setSaving(false); setShowModal(false); setEditId(null);
  };

  const handleDelete = async (type: 'ventas' | 'compras', id: number) => {
    if (!slug) return;
    try {
      const res = await fetch(`${API(slug)}/${type}/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        if (type === 'ventas') setVentas(p => p.filter(v => v.id !== id));
        else setCompras(p => p.filter(c => c.id !== id));
      }
    } catch {}
  };

  const openCreate = () => {
    setEditId(null);
    setForm(tab === 'ventas' ? emptyVenta() : emptyCompra());
    setShowModal(true);
  };

  const openEdit = (item: Venta | Compra) => {
    setEditId(item.id);
    setForm({
      concepto: item.concepto, codigo: item.codigo || '', cantidad: String(item.cantidad),
      precio_unit: String(item.precio_unit), total: String(item.total), fecha: item.fecha || '',
      estado: item.estado, notas: item.notas || '',
      ...('cliente' in item ? { cliente: item.cliente || '' } : {}),
      ...('proveedor' in item ? { proveedor: item.proveedor || '' } : {}),
    });
    setShowModal(true);
  };

  const updateTotal = (f: any) => ({ ...f, total: String((parseInt(f.cantidad) || 0) * (parseFloat(f.precio_unit) || 0)) });

  const totalVentas = ventas.reduce((s, v) => s + v.total, 0);
  const totalCompras = compras.reduce((s, c) => s + c.total, 0);
  const balance = totalVentas - totalCompras;

  if (!loaded) return <div className="nf-content"><p style={{ color: 'var(--neutral-500)' }}>Cargando ERP…</p></div>;

  return (
    <div className="nf-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)' }}>💰 Gestión Económica</h1>
          <p style={{ fontSize: 13, color: 'var(--neutral-500)', marginTop: 4 }}>
            {ventas.length} ventas · {compras.length} compras
          </p>
        </div>
        {tab !== 'resumen' && (
          <button className="nf-btn primary" onClick={openCreate}>
            <Plus size={16} /> {tab === 'ventas' ? 'Nueva venta' : 'Nueva compra'}
          </button>
        )}
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div className="nf-kbox">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <TrendingUp size={14} style={{ color: '#16A34A' }} />
            <span style={{ fontSize: 11, color: 'var(--neutral-400)' }}>Ventas totales</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#16A34A' }}>{totalVentas.toFixed(2)} €</div>
        </div>
        <div className="nf-kbox">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <TrendingDown size={14} style={{ color: '#DC2626' }} />
            <span style={{ fontSize: 11, color: 'var(--neutral-400)' }}>Compras totales</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#DC2626' }}>{totalCompras.toFixed(2)} €</div>
        </div>
        <div className="nf-kbox">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <DollarSign size={14} style={{ color: balance >= 0 ? '#16A34A' : '#DC2626' }} />
            <span style={{ fontSize: 11, color: 'var(--neutral-400)' }}>Balance</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: balance >= 0 ? '#16A34A' : '#DC2626' }}>{balance >= 0 ? '+' : ''}{balance.toFixed(2)} €</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {([['ventas', '📦 Ventas'], ['compras', '🛒 Compras'], ['resumen', '📊 Resumen']] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} className="nf-btn"
            style={{ fontWeight: tab === t ? 700 : 400, background: tab === t ? 'var(--primary)' : undefined, color: tab === t ? '#fff' : undefined }}>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      {tab !== 'resumen' ? (
        <div className="nf-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--neutral-25)', borderBottom: 'var(--border-default)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--neutral-600)' }}>Fecha</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--neutral-600)' }}>Concepto</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--neutral-600)' }}>{tab === 'ventas' ? 'Cliente' : 'Proveedor'}</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--neutral-600)' }}>Cant.</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--neutral-600)' }}>Precio</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--neutral-600)' }}>Total</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: 'var(--neutral-600)' }}>Estado</th>
                <th style={{ padding: '10px 6px', width: 70 }}></th>
              </tr>
            </thead>
            <tbody>
              {(tab === 'ventas' ? ventas : compras).length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'var(--neutral-400)' }}>
                  {tab === 'ventas' ? '📦 Sin ventas registradas' : '🛒 Sin compras registradas'}. Pulsa &quot;{tab === 'ventas' ? 'Nueva venta' : 'Nueva compra'}&quot; para empezar.
                </td></tr>
              ) : (
                (tab === 'ventas' ? ventas : compras).map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--neutral-500)' }}>{item.fecha || '—'}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--neutral-800)' }}>{item.concepto}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--neutral-600)' }}>{item.cliente || item.proveedor || '—'}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--neutral-700)' }}>{item.cantidad}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--neutral-700)' }}>{item.precio_unit.toFixed(2)} €</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: tab === 'ventas' ? '#16A34A' : '#DC2626' }}>{item.total.toFixed(2)} €</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <span className="nf-tag" style={{ fontSize: 10, background: item.estado === 'Pagado' || item.estado === 'Cobrado' ? '#DCFCE7' : item.estado === 'Pendiente' ? '#FEF9C3' : '#F3F4F6',
                        color: item.estado === 'Pagado' || item.estado === 'Cobrado' ? '#16A34A' : item.estado === 'Pendiente' ? '#CA8A04' : '#6B7280' }}>
                        {item.estado}
                      </span>
                    </td>
                    <td style={{ padding: '4px 6px', display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button onClick={() => openEdit(item)} className="nf-btn" style={{ padding: '4px 6px' }} title="Editar"><Edit2 size={12} /></button>
                      <button onClick={() => handleDelete(tab as 'ventas' | 'compras', item.id)} className="nf-btn" style={{ padding: '4px 6px', color: '#DC2626' }} title="Eliminar"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Resumen tab */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="nf-card">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#16A34A', marginBottom: 12 }}>📦 Ventas por estado</h3>
            {['Pendiente', 'Cobrado', 'Cancelado'].map(e => {
              const items = ventas.filter(v => v.estado === e);
              const t = items.reduce((s, v) => s + v.total, 0);
              return <div key={e} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, color: 'var(--neutral-700)' }}>
                <span>{e} ({items.length})</span><span style={{ fontWeight: 600 }}>{t.toFixed(2)} €</span>
              </div>;
            })}
          </div>
          <div className="nf-card">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#DC2626', marginBottom: 12 }}>🛒 Compras por estado</h3>
            {['Pendiente', 'Pagado', 'Cancelado'].map(e => {
              const items = compras.filter(c => c.estado === e);
              const t = items.reduce((s, c) => s + c.total, 0);
              return <div key={e} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, color: 'var(--neutral-700)' }}>
                <span>{e} ({items.length})</span><span style={{ fontWeight: 600 }}>{t.toFixed(2)} €</span>
              </div>;
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => { setShowModal(false); setEditId(null); }}>
          <div style={{ width: '100%', maxWidth: 480, background: 'var(--neutral-0)', borderRadius: 'var(--radius-xl)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', background: 'var(--neutral-25)', borderBottom: 'var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{editId ? '✏️ Editar' : tab === 'ventas' ? '📦 Nueva Venta' : '🛒 Nueva Compra'}</h3>
              <button onClick={() => { setShowModal(false); setEditId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} style={{ color: 'var(--neutral-500)' }} /></button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label className="nf-label">Concepto</label><input className="nf-input" value={form.concepto} onChange={e => setForm((f: any) => ({ ...f, concepto: e.target.value }))} placeholder="Ej: Venta de huevos" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label className="nf-label">Código</label><input className="nf-input" value={form.codigo} onChange={e => setForm((f: any) => ({ ...f, codigo: e.target.value }))} placeholder="V-001" /></div>
                <div><label className="nf-label">{tab === 'ventas' ? 'Cliente' : 'Proveedor'}</label>
                  <input className="nf-input" value={tab === 'ventas' ? (form.cliente || '') : (form.proveedor || '')}
                    onChange={e => setForm((f: any) => tab === 'ventas' ? { ...f, cliente: e.target.value } : { ...f, proveedor: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div><label className="nf-label">Cantidad</label><input className="nf-input" type="number" value={form.cantidad}
                  onChange={e => setForm((f: any) => updateTotal({ ...f, cantidad: e.target.value }))} /></div>
                <div><label className="nf-label">Precio unit. (€)</label><input className="nf-input" type="number" step="0.01" value={form.precio_unit}
                  onChange={e => setForm((f: any) => updateTotal({ ...f, precio_unit: e.target.value }))} /></div>
                <div><label className="nf-label">Total (€)</label><input className="nf-input" type="number" step="0.01" value={form.total}
                  onChange={e => setForm((f: any) => ({ ...f, total: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label className="nf-label">Fecha</label><input className="nf-input" type="date" value={form.fecha} onChange={e => setForm((f: any) => ({ ...f, fecha: e.target.value }))} /></div>
                <div><label className="nf-label">Estado</label>
                  <select className="nf-input" value={form.estado} onChange={e => setForm((f: any) => ({ ...f, estado: e.target.value }))}>
                    <option>Pendiente</option>
                    <option>{tab === 'ventas' ? 'Cobrado' : 'Pagado'}</option>
                    <option>Cancelado</option>
                  </select>
                </div>
              </div>
              <div><label className="nf-label">Notas</label><textarea className="nf-input" rows={2} value={form.notas} onChange={e => setForm((f: any) => ({ ...f, notas: e.target.value }))} style={{ resize: 'vertical' }} /></div>
              <button className="nf-btn primary" disabled={saving} onClick={handleSave} style={{ width: '100%' }}>
                {saving ? '⏳ Guardando…' : editId ? '💾 Guardar cambios' : <><Plus size={16} /> Crear</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
