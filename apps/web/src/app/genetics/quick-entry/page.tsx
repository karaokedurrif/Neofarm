'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ClipboardList, Weight, Bird, Calendar, Check, Plus, Search } from 'lucide-react';
import { loadProgram, addMeasurement, addEvent, updateBird } from '@/lib/genetics/store';
import type { SelectionProgram, BirdMeasurement, BirdEvent, Bird as BirdType } from '@/lib/genetics/types';

type Mode = 'pesaje' | 'evento' | 'evaluacion';

export default function QuickEntryPage() {
  const [prog, setProg] = useState<SelectionProgram | null>(null);
  const [mode, setMode] = useState<Mode>('pesaje');
  const [search, setSearch] = useState('');
  const [selectedBird, setSelectedBird] = useState<string | null>(null);
  const [success, setSuccess] = useState('');

  // Pesaje
  const [peso, setPeso] = useState('');
  const [fechaPeso, setFechaPeso] = useState(() => new Date().toISOString().slice(0, 10));

  // Evento
  const [tipoEvento, setTipoEvento] = useState('vacunacion');
  const [descEvento, setDescEvento] = useState('');
  const [fechaEvento, setFechaEvento] = useState(() => new Date().toISOString().slice(0, 10));

  // Evaluación rápida
  const [confPecho, setConfPecho] = useState(3);
  const [confMuslo, setConfMuslo] = useState(3);
  const [docilidad, setDocilidad] = useState(3);

  useEffect(() => { setProg(loadProgram()); }, []);

  const filteredBirds = useMemo(() => {
    if (!prog) return [];
    const q = search.toLowerCase();
    return prog.birds.filter(b => b.estadoProductivo === 'activo' && 
      (b.anilla.toLowerCase().includes(q) || (b.nombre || '').toLowerCase().includes(q)))
      .slice(0, 20);
  }, [prog, search]);

  const bird = useMemo(() => prog?.birds.find(b => b.id === selectedBird), [prog, selectedBird]);

  const handlePesaje = () => {
    if (!prog || !selectedBird || !peso) return;
    const m: BirdMeasurement = {
      id: `meas-${Date.now()}`, birdId: selectedBird, fecha: fechaPeso,
      tipo: 'peso', valor: parseFloat(peso),
    };
    let updated = addMeasurement(prog, m);
    updated = updateBird(updated, selectedBird, { pesoActual: parseFloat(peso) });
    setProg(updated);
    setSuccess(`Pesaje registrado: ${peso} kg`);
    setPeso('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEvento = () => {
    if (!prog || !selectedBird) return;
    const e: BirdEvent = {
      id: `evt-${Date.now()}`, birdId: selectedBird, fecha: fechaEvento,
      tipo: tipoEvento as any, descripcion: descEvento,
    };
    const updated = addEvent(prog, e);
    setProg(updated);
    setSuccess(`Evento registrado: ${tipoEvento}`);
    setDescEvento('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEvaluacion = () => {
    if (!prog || !selectedBird) return;
    const updated = updateBird(prog, selectedBird, {
      conformacionPecho: confPecho, conformacionMuslo: confMuslo, docilidad,
    });
    setProg(updated);
    setSuccess('Evaluación guardada');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (!prog) return <div style={{ padding: 32, color: 'var(--neutral-400)' }}>Cargando…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 4, maxWidth: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/genetics" style={{ color: 'var(--neutral-400)', textDecoration: 'none', fontSize: 12 }}>← Programa</Link>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--neutral-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClipboardList size={20} style={{ color: 'var(--primary)' }} /> Entrada Rápida
        </h1>
      </div>

      {/* Bird selector */}
      <div className="nf-card">
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-200)', marginBottom: 8 }}>
          <Bird size={14} style={{ verticalAlign: -2, marginRight: 4 }} /> Seleccionar Ave
        </div>
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-500)' }} />
          <input className="nf-input" placeholder="Buscar anilla o nombre…" value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30, width: '100%' }} />
        </div>
        {search && !selectedBird && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 200, overflowY: 'auto' }}>
            {filteredBirds.map(b => (
              <div key={b.id} onClick={() => { setSelectedBird(b.id); setSearch(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 12,
                  background: 'rgba(var(--primary-rgb,180,130,50),0.03)' }}>
                <span style={{ color: b.sexo === 'M' ? '#3B82F6' : '#EC4899' }}>{b.sexo === 'M' ? '♂' : '♀'}</span>
                <span style={{ fontWeight: 600, color: 'var(--neutral-200)' }}>{b.anilla}</span>
                <span style={{ color: 'var(--neutral-400)' }}>{b.nombre}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--neutral-500)' }}>{b.generacion}</span>
              </div>
            ))}
          </div>
        )}
        {bird && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, background: 'rgba(var(--primary-rgb,180,130,50),0.08)', border: '1px solid var(--primary)' }}>
            <span style={{ color: bird.sexo === 'M' ? '#3B82F6' : '#EC4899', fontSize: 16 }}>{bird.sexo === 'M' ? '♂' : '♀'}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-200)' }}>{bird.anilla} — {bird.nombre}</div>
              <div style={{ fontSize: 10, color: 'var(--neutral-400)' }}>{bird.generacion} · {bird.raza} · {bird.pesoActual}kg</div>
            </div>
            <button onClick={() => setSelectedBird(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)', fontSize: 12 }}>✕</button>
          </div>
        )}
      </div>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--neutral-800)' }}>
        {([['pesaje', '⚖️ Pesaje'], ['evento', '📋 Evento'], ['evaluacion', '⭐ Evaluación']] as const).map(([m, label]) => (
          <button key={m} onClick={() => setMode(m as Mode)}
            style={{ padding: '8px 16px', fontSize: 12, border: 'none', cursor: 'pointer', background: 'transparent',
              color: mode === m ? 'var(--primary)' : 'var(--neutral-400)', fontWeight: mode === m ? 600 : 400,
              borderBottom: mode === m ? '2px solid var(--primary)' : '2px solid transparent' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Success msg */}
      {success && (
        <div style={{ padding: '8px 12px', borderRadius: 6, background: '#16A34A22', color: '#16A34A', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Check size={14} /> {success}
        </div>
      )}

      {/* Pesaje form */}
      {mode === 'pesaje' && selectedBird && (
        <div className="nf-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label className="nf-label">Peso (kg)</label>
          <input className="nf-input" type="number" step="0.01" min="0" value={peso} onChange={e => setPeso(e.target.value)} placeholder="ej: 3.45" style={{ width: '100%' }} />
          <label className="nf-label">Fecha</label>
          <input className="nf-input" type="date" value={fechaPeso} onChange={e => setFechaPeso(e.target.value)} style={{ width: '100%' }} />
          <button className="nf-btn" onClick={handlePesaje} disabled={!peso} style={{ marginTop: 4 }}>
            <Weight size={14} /> Registrar Pesaje
          </button>
        </div>
      )}

      {/* Event form */}
      {mode === 'evento' && selectedBird && (
        <div className="nf-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label className="nf-label">Tipo de evento</label>
          <select className="nf-input" value={tipoEvento} onChange={e => setTipoEvento(e.target.value)} style={{ width: '100%' }}>
            <option value="vacunacion">Vacunación</option>
            <option value="caponizacion">Caponización</option>
            <option value="sacrificio">Sacrificio</option>
            <option value="enfermedad">Enfermedad</option>
            <option value="tratamiento">Tratamiento</option>
            <option value="observacion">Observación</option>
            <option value="cambio_lote">Cambio de lote</option>
          </select>
          <label className="nf-label">Descripción</label>
          <textarea className="nf-input" value={descEvento} onChange={e => setDescEvento(e.target.value)} rows={3} placeholder="Detalles del evento…" style={{ width: '100%', resize: 'vertical' }} />
          <label className="nf-label">Fecha</label>
          <input className="nf-input" type="date" value={fechaEvento} onChange={e => setFechaEvento(e.target.value)} style={{ width: '100%' }} />
          <button className="nf-btn" onClick={handleEvento} style={{ marginTop: 4 }}>
            <Calendar size={14} /> Registrar Evento
          </button>
        </div>
      )}

      {/* Evaluacion form */}
      {mode === 'evaluacion' && selectedBird && (
        <div className="nf-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Conformación Pecho', val: confPecho, set: setConfPecho },
            { label: 'Conformación Muslo', val: confMuslo, set: setConfMuslo },
            { label: 'Docilidad', val: docilidad, set: setDocilidad },
          ].map(attr => (
            <div key={attr.label}>
              <label className="nf-label">{attr.label}</label>
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => attr.set(n)}
                    style={{ width: 36, height: 36, borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14,
                      background: n <= attr.val ? '#F59E0B22' : 'var(--neutral-800)',
                      color: n <= attr.val ? '#F59E0B' : 'var(--neutral-600)' }}>
                    ★
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button className="nf-btn" onClick={handleEvaluacion} style={{ marginTop: 4 }}>
            <Check size={14} /> Guardar Evaluación
          </button>
        </div>
      )}

      {!selectedBird && (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--neutral-500)', fontSize: 13 }}>
          Selecciona un ave para registrar datos
        </div>
      )}
    </div>
  );
}
