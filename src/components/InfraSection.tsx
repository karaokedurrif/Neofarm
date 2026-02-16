"use client";

export default function InfraSection() {
  return (
    <section className="py-28 bg-[#F7F9F8]">
      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">

        {/* TEXTO */}
        <div className="max-w-[480px]">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[#2DBE9D] font-bold mb-4">
            <div className="w-6 h-px bg-[#2DBE9D]" />
            Infraestructura inteligente
          </div>
          <h2 className="text-[38px] font-bold text-[#1E2A2F] leading-[1.14] tracking-[-0.8px] mb-5">
            Sensores, visión IA y conectividad{" "}
            <span className="italic text-[#1F6F5C]" style={{ fontFamily: "'Instrument Serif', serif" }}>
              mesh
            </span>{" "}
            en tiempo real
          </h2>
          <p className="text-[15.5px] leading-[1.7] text-[#5A6B70] mb-8">
            Cada nave se convierte en un organismo monitorizado. Temperatura, humedad,
            gases, consumo de agua y comportamiento animal — todo capturado.
          </p>

          {/* Feature rows — SVG icons, NO emojis */}
          <div className="space-y-4">
            {[
              { title: "Sensores ambientales", desc: "T°, HR, NH₃, CO₂ a altura animal. Alertas automáticas.", d: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" },
              { title: "Visión IA", desc: "Conteo, caudofagia, cojeras, actividad grupal, animal caído.", d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" },
              { title: "Red mesh Meshtastic", desc: "Cobertura indoor/outdoor sin SIM. Bridges LoRa cada 30m.", d: "M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0" },
              { title: "Caudalímetro de agua", desc: "Consumo por nave = indicador precoz de enfermedad.", d: "M12 2v6M12 18v4M4.93 10.93l1.41 1.41M17.66 10.93l-1.41 1.41M2 18h20" },
            ].map((feat) => (
              <div key={feat.title} className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-9 h-9 bg-[#2DBE9D]/8 rounded-[9px] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F6F5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={feat.d} />
                  </svg>
                </div>
                <div>
                  <div className="text-[13.5px] font-bold text-[#1E2A2F]">{feat.title}</div>
                  <div className="text-[12.5px] text-[#8A9BA0] leading-[1.5]">{feat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IMAGEN NAVE REAL — misma regla que el hero: <img> real, no placeholder */}
        <div className="relative">
          <img
            src="/hero-barn.jpg"
            alt="Smart Barn Infrastructure"
            className="w-full rounded-2xl"
            style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.10)" }}
          />

          {/* Sensor dots pulsantes */}
          {[
            { top: "28%", left: "32%" },
            { top: "25%", right: "28%" },
            { top: "35%", left: "52%" },
          ].map((pos, i) => (
            <span
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full bg-[#2DBE9D] animate-ping"
              style={{ ...pos, boxShadow: "0 0 12px rgba(45,190,157,0.5)", animationDelay: `${i * 0.6}s` }}
            />
          ))}

          {/* Tablet flotante */}
          <div
            className="absolute top-5 right-5 w-[150px] bg-white rounded-xl p-2.5 border border-black/[0.03]"
            style={{ boxShadow: "0 12px 48px rgba(0,0,0,0.08)", animation: "hud-float 4s ease-in-out infinite" }}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[7px] font-bold text-[#8A9BA0] uppercase tracking-wider">Live data</span>
              <span className="w-1 h-1 rounded-full bg-[#2DBE9D]" />
            </div>
            <div className="flex gap-[2px] h-9 items-end">
              {[55, 82, 40, 90, 65, 75].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: "linear-gradient(to top, #1F6F5C, #2DBE9D)" }} />
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[6.5px] text-[#8A9BA0] font-semibold">
              <span>22.3°C</span><span>12ppm</span><span>65%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
