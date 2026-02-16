'use client';

import { VariantConfig } from '@/config/variants';

interface ModulesGridRefinedProps {
  variant: VariantConfig;
}

const ALL_MODULES = [
  {
    icon: '📍',
    title: 'IoT GPS LoRa',
    description: 'Localización real de tu ganado en extensivo. Rango 15km sin cobertura.',
    tag: 'Extensivo',
    tagColor: 'teal',
  },
  {
    icon: '🌡️',
    title: 'IoT Barn',
    description: 'Sensores T°, NH₃, CO₂, humedad en naves. Alertas automáticas.',
    tag: 'Intensivo',
    tagColor: 'amber',
  },
  {
    icon: '🧬',
    title: 'Genética Avanzada',
    description: 'EPDs, consanguinidad, predictor F1, FarmMatch™ para cruces óptimos.',
    tag: null,
  },
  {
    icon: '🌱',
    title: 'Carbono MRV',
    description: 'Calcula créditos de carbono con satélite NDVI y biomasa acreditada.',
    tag: null,
  },
  {
    icon: '📹',
    title: 'IA Vision',
    description: 'Cámaras con ML: detección de cojeras, peleas, alertas comportamentales.',
    tag: 'Intensivo',
    tagColor: 'amber',
  },
  {
    icon: '📄',
    title: 'Trazabilidad Oficial',
    description: 'REGA, SITRAN, ICA, retorno matadero. Todo digital, cero papel.',
    tag: null,
  },
  {
    icon: '🏭',
    title: 'SIGE Digital',
    description: '11 planes del RD 306/2020 en un dashboard. Inspecciones con 1 click.',
    tag: 'Intensivo',
    tagColor: 'amber',
  },
  {
    icon: '💰',
    title: 'ERP Ganadero',
    description: 'Ventas, compras, inventario, RRHH, Modelo 303. Contabilidad integrada.',
    tag: null,
  },
  {
    icon: '💧',
    title: 'SmartPurín',
    description: 'Gestión de fosa + biogás + planes de abonado. Cumplimiento RD 1051.',
    tag: 'Intensivo',
    tagColor: 'amber',
  },
];

export default function ModulesGridRefined({ variant }: ModulesGridRefinedProps) {
  return (
    <section className="py-25 px-12 bg-white border-t"
             style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center gap-2 justify-center mb-3">
            <div className="w-6 h-px" style={{ background: 'var(--accent)' }} />
            <span className="text-[11px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: 'var(--accent)' }}>
              Módulos conectados
            </span>
            <div className="w-6 h-px" style={{ background: 'var(--accent)' }} />
          </div>
          <h2 className="text-4xl font-bold" style={{ color: 'var(--dark)', letterSpacing: '-0.8px' }}>
            Todo lo que necesitas para gestionar tu granja
          </h2>
          <p className="text-[15px] mt-2.5 max-w-lg mx-auto" style={{ color: 'var(--text-mid)' }}>
            Activa solo los módulos que uses. Desactiva lo que no necesites. Sin coste oculto.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 rounded-2xl overflow-hidden border"
             style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
          {ALL_MODULES.map((mod, i) => (
            <div key={i}
                 className="p-8 border-r border-b relative transition-colors hover:bg-[#FAFCFB] group"
                 style={{ 
                   borderColor: 'rgba(0,0,0,0.04)',
                   borderRight: (i + 1) % 3 === 0 ? 'none' : undefined,
                   borderBottom: i >= 6 ? 'none' : undefined,
                 }}>
              {/* Bottom accent bar on hover */}
              <div className="absolute bottom-0 left-8 right-8 h-0 group-hover:h-0.5 transition-all rounded-t"
                   style={{ background: 'var(--accent)' }} />
              
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg grid place-items-center mb-4"
                   style={{ 
                     background: mod.tagColor === 'amber' 
                       ? 'rgba(217,119,6,0.06)' 
                       : mod.tagColor === 'rose'
                       ? 'rgba(225,29,72,0.05)'
                       : 'rgba(31,111,92,0.06)' 
                   }}>
                <span className="text-xl">{mod.icon}</span>
              </div>

              {/* Content */}
              <h3 className="text-[14.5px] font-bold mb-1.5" style={{ color: 'var(--dark)' }}>
                {mod.title}
              </h3>
              <p className="text-xs leading-[1.55]" style={{ color: 'var(--text-muted)' }}>
                {mod.description}
              </p>

              {/* Tag */}
              {mod.tag && (
                <div className="inline-block mt-3 text-[9.5px] font-bold uppercase tracking-wider px-2 py-1 rounded"
                     style={{
                       background: mod.tagColor === 'amber' 
                         ? 'rgba(180,83,9,0.07)' 
                         : mod.tagColor === 'rose'
                         ? 'rgba(190,18,60,0.05)'
                         : 'rgba(31,111,92,0.06)',
                       color: mod.tagColor === 'amber'
                         ? '#92400E'
                         : mod.tagColor === 'rose'
                         ? '#9F1239'
                         : 'var(--primary)',
                     }}>
                  {mod.tag}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
