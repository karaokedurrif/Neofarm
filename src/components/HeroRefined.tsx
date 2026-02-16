'use client';

import { VariantConfig } from '@/config/variants';

interface HeroRefinedProps {
  variant: VariantConfig;
}

export default function HeroRefined({ variant }: HeroRefinedProps) {
  return (
    <section className="min-h-screen pt-28 pb-16 px-12 flex items-center max-w-[1440px] mx-auto gap-5"
             style={{ background: 'linear-gradient(180deg, #F7F9F8, #EEF2F3)' }}>
      {/* Left column */}
      <div className="flex-[0_0_420px] pr-5">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
             style={{ 
               background: 'rgba(45,190,157,0.07)', 
               border: '1px solid rgba(45,190,157,0.12)' 
             }}>
          <div className="w-1.5 h-1.5 rounded-full animate-blink" style={{ background: 'var(--accent)' }} />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
            IoT + IA + Trazabilidad
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-[46px] font-bold leading-[1.08] mb-5"
            style={{ color: 'var(--dark)', letterSpacing: '-1.5px' }}>
          Transforma tu granja en un{' '}
          <em className="italic" style={{ color: 'var(--primary)' }}>gemelo digital</em>
        </h1>

        {/* Subheadline */}
        <p className="text-base leading-[1.65] mb-8 max-w-md" style={{ color: 'var(--text-mid)' }}>
          IoT LoRa/Mesh, visión IA y ganadería multi-especie en una sola plataforma conectada.
        </p>

        {/* Buttons */}
        <div className="flex gap-3 mb-11">
          <button className="btn-primary">
            Comenzar setup (3 min)
          </button>
          <button className="btn-secondary">
            Ver demo en vivo
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-9">
          <div>
            <div className="text-[26px] font-extrabold" style={{ color: 'var(--dark)', letterSpacing: '-0.5px' }}>
              500+
            </div>
            <div className="text-[11.5px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Granjas activas
            </div>
          </div>
          <div>
            <div className="text-[26px] font-extrabold" style={{ color: 'var(--dark)', letterSpacing: '-0.5px' }}>
              12k
            </div>
            <div className="text-[11.5px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Dispositivos IoT
            </div>
          </div>
          <div>
            <div className="text-[26px] font-extrabold" style={{ color: 'var(--dark)', letterSpacing: '-0.5px' }}>
              24M€
            </div>
            <div className="text-[11.5px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Facturado gestionado
            </div>
          </div>
        </div>
      </div>

      {/* Right column - Hero image with HUD panels */}
      <div className="flex-1 relative">
        {/* Main image */}
        <div className="w-full rounded-3xl overflow-hidden shadow-2xl"
             style={{ boxShadow: '0 20px 80px rgba(0,0,0,0.08)' }}>
          <div className="aspect-[4/3] bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🌱</div>
              <p className="text-gray-500 text-sm">Hero image isométrica</p>
            </div>
          </div>
        </div>

        {/* HUD Panel A - Top right */}
        <div className="hud top-[8%] right-[4%] animate-float">
          <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
            Ganado monitoreado
          </div>
          <div className="text-xl font-extrabold" style={{ color: 'var(--dark)', letterSpacing: '-0.4px' }}>
            1,247
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            156 vacas · 891 porcino
          </div>
        </div>

        {/* HUD Panel B - Mid right */}
        <div className="hud top-[38%] right-0 animate-float" style={{ animationDelay: '1.5s' }}>
          <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
            Dispositivos activos
          </div>
          <div className="text-xl font-extrabold" style={{ color: 'var(--primary)' }}>
            47/48
          </div>
          <div className="w-20 h-1 bg-gray-100 rounded mt-2 overflow-hidden">
            <div className="h-full rounded" style={{ width: '98%', background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
          </div>
        </div>

        {/* HUD Panel C - Bottom right */}
        <div className="hud bottom-[8%] right-[6%] animate-float" style={{ animationDelay: '3s' }}>
          <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
            Carbono capturado
          </div>
          <div className="text-xl font-extrabold" style={{ color: 'var(--primary)' }}>
            -12.4 tCO₂
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Este mes
          </div>
        </div>

        {/* HUD Panel D - Bottom left */}
        <div className="hud bottom-[20%] left-[2%] animate-float" style={{ animationDelay: '2s' }}>
          <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
            Alertas hoy
          </div>
          <div className="text-xl font-extrabold" style={{ color: 'var(--dark)' }}>
            0
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Everything OK ✓
          </div>
        </div>
      </div>
    </section>
  );
}
