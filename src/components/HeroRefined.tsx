"use client";

export default function NeoHero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#F7F9F8] to-[#EEF2F3]">
      <div className="mx-auto max-w-7xl px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-[420px_1fr] gap-12 items-center">

          {/* ═══ LEFT: TEXTO ═══ */}
          <div className="space-y-7">
            {/* Pill */}
            <span className="inline-flex items-center gap-2 rounded-full bg-[#1F6F5C]/8 border border-[#2DBE9D]/12 px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DBE9D] animate-pulse" />
              <span className="text-[11px] font-bold text-[#1F6F5C] uppercase tracking-[0.08em]">
                IoT + IA + Trazabilidad
              </span>
            </span>

            {/* H1 */}
            <h1 className="text-[48px] font-bold leading-[1.08] tracking-[-1.5px] text-[#1E2A2F]">
              Transforma tu granja
              <br />
              en un{" "}
              <span className="italic text-[#1F6F5C]" style={{ fontFamily: "'Instrument Serif', serif" }}>
                gemelo digital
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-[16.5px] leading-[1.65] text-[#5A6B70] max-w-[420px]">
              Infraestructura IoT LoRa/Mesh, visión IA y carbono MRV en una plataforma conectada multi-especie.
            </p>

            {/* CTAs */}
            <div className="flex gap-3 pt-1">
              <button className="bg-[#1F6F5C] text-white px-7 py-3.5 rounded-xl text-[15px] font-semibold shadow-[0_8px_28px_rgba(31,111,92,0.22)] hover:bg-[#18573F] hover:-translate-y-0.5 transition-all">
                Comenzar setup (3 min)
              </button>
              <button className="border border-black/10 text-[#5A6B70] px-7 py-3.5 rounded-xl text-[15px] font-medium hover:border-[#1F6F5C] hover:text-[#1F6F5C] transition-all">
                Ver demo en vivo
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-10 pt-4">
              <div>
                <div className="text-[26px] font-extrabold text-[#1E2A2F] tracking-[-0.5px]">500+</div>
                <div className="text-[11.5px] text-[#8A9BA0] font-medium">Granjas activas</div>
              </div>
              <div>
                <div className="text-[26px] font-extrabold text-[#1E2A2F] tracking-[-0.5px]">12k</div>
                <div className="text-[11.5px] text-[#8A9BA0] font-medium">Dispositivos IoT</div>
              </div>
              <div>
                <div className="text-[26px] font-extrabold text-[#1E2A2F] tracking-[-0.5px]">24M€</div>
                <div className="text-[11.5px] text-[#8A9BA0] font-medium">Facturado gestionado</div>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT: IMAGEN ISOMÉTRICA REAL + HUD PANELS ═══ */}
          <div className="relative">
            {/*
              ╔══════════════════════════════════════════════════╗
              ║  ESTO ES UNA IMAGEN REAL .JPG                   ║
              ║  NO es un placeholder                           ║
              ║  NO es un gradiente                             ║
              ║  NO es un rectángulo verde con iconos           ║
              ║  NO es un componente React que "simula" la img  ║
              ║  ES: <img src="/hero-farm.jpg" />               ║
              ╚══════════════════════════════════════════════════╝
            */}
            <img
              src="/hero-farm.jpg"
              alt="NeoFarm Digital Twin — Granja isométrica 3D"
              className="w-full max-w-[720px]"
              style={{ filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.08))" }}
            />

            {/* HUD: Ganado monitorizado — arriba derecha */}
            <div
              className="absolute top-[6%] right-[3%] bg-white/90 backdrop-blur-xl rounded-[14px] px-5 py-4 border border-white/60"
              style={{
                boxShadow: "0 16px 60px rgba(0,0,0,0.08)",
                animation: "hud-float 5s ease-in-out infinite",
              }}
            >
              <div className="absolute top-0 left-5 w-8 h-[2.5px] bg-[#2DBE9D] rounded-b" />
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#8A9BA0]">Ganado monitorizado</p>
              <p className="text-[22px] font-extrabold text-[#1E2A2F] tracking-[-0.4px]">1,247</p>
              <p className="text-[10px] text-[#8A9BA0]">156 vacas · 891 porcino</p>
            </div>

            {/* HUD: Dispositivos — derecha medio */}
            <div
              className="absolute top-[34%] right-[-2%] bg-white/90 backdrop-blur-xl rounded-[14px] px-5 py-4 border border-white/60"
              style={{
                boxShadow: "0 16px 60px rgba(0,0,0,0.08)",
                animation: "hud-float 5s ease-in-out infinite 1.5s",
              }}
            >
              <div className="absolute top-0 left-5 w-8 h-[2.5px] bg-[#2DBE9D] rounded-b" />
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#8A9BA0]">Dispositivos activos</p>
              <p className="text-[22px] font-extrabold text-[#1F6F5C]">47/48</p>
              <div className="w-20 h-[3px] bg-black/5 rounded mt-2 overflow-hidden">
                <div className="h-full w-[98%] rounded bg-gradient-to-r from-[#1F6F5C] to-[#2DBE9D]" />
              </div>
            </div>

            {/* HUD: Alertas — izquierda abajo */}
            <div
              className="absolute bottom-[28%] left-[2%] bg-white/90 backdrop-blur-xl rounded-[14px] px-5 py-4 border border-white/60"
              style={{
                boxShadow: "0 16px 60px rgba(0,0,0,0.08)",
                animation: "hud-float 5s ease-in-out infinite 2s",
              }}
            >
              <div className="absolute top-0 left-5 w-8 h-[2.5px] bg-[#2DBE9D] rounded-b" />
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#8A9BA0]">Alertas hoy</p>
              <p className="text-[22px] font-extrabold text-[#1E2A2F]">0</p>
              <p className="text-[10px] text-[#2DBE9D] font-medium">Everything OK</p>
            </div>

            {/* HUD: Carbono — derecha abajo */}
            <div
              className="absolute bottom-[6%] right-[5%] bg-white/90 backdrop-blur-xl rounded-[14px] px-5 py-4 border border-white/60"
              style={{
                boxShadow: "0 16px 60px rgba(0,0,0,0.08)",
                animation: "hud-float 5s ease-in-out infinite 3s",
              }}
            >
              <div className="absolute top-0 left-5 w-8 h-[2.5px] bg-[#2DBE9D] rounded-b" />
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#8A9BA0]">Carbono capturado</p>
              <p className="text-[22px] font-extrabold text-[#1F6F5C]">-12.4 tCO₂</p>
              <p className="text-[10px] text-[#8A9BA0]">Este mes</p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS animation for float */}
      <style>{`
        @keyframes hud-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </section>
  );
}
