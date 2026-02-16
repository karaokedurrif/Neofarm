'use client';

export default function InfraSection() {
  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4">
          <path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
        </svg>
      ),
      title: 'Infraestructura propia',
      description: 'LoRa, Meshtastic, satélite. Sin depender de operadores.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
      ),
      title: 'Todas las especies',
      description: 'Un mismo dashboard para vacuno, porcino, avícola y ovino.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      title: 'Tiempo real',
      description: 'Sensores cada 15 min. GPS cada 2h. Alertas instantáneas.',
    },
  ];

  return (
    <section className="max-w-[1440px] mx-auto px-12 py-25 grid grid-cols-[1fr_1.1fr] gap-16 items-center">
      {/* Left: Content */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-px" style={{ background: 'var(--accent)' }} />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em]"
                style={{ color: 'var(--accent)' }}>
            Infraestructura conectada
          </span>
        </div>

        <h2 className="text-4xl font-bold leading-[1.14] mb-5"
            style={{ color: 'var(--dark)', letterSpacing: '-0.8px' }}>
          La granja produce los datos.{' '}
          <em className="italic" style={{ color: 'var(--primary)' }}>Tú tomas decisiones.</em>
        </h2>

        <p className="text-[15.5px] leading-[1.7] mb-8" style={{ color: 'var(--text-mid)' }}>
          Convierte tu explotación en una red de sensores inteligentes. Desde collares GPS hasta
          cámaras con IA, todo conectado y sincronizado.
        </p>

        <div className="flex flex-col gap-3.5">
          {features.map((feat, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-[34px] h-[34px] rounded-lg grid place-items-center"
                   style={{ background: 'rgba(45,190,157,0.07)' }}>
                <div className="[&>svg]:stroke-[var(--primary)] [&>svg]:fill-none [&>svg]:stroke-2">
                  {feat.icon}
                </div>
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--dark)' }}>
                  {feat.title}
                </div>
                <div className="text-xs leading-[1.5]" style={{ color: 'var(--text-muted)' }}>
                  {feat.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Visual with floating elements */}
      <div className="relative">
        {/* Main infra image */}
        <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-teal-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-3">🏞️</div>
              <p className="text-gray-500 text-sm">Imagen campo con sensores</p>
            </div>
          </div>
        </div>

        {/* Sensor dots */}
        <div className="absolute top-[28%] left-[32%] w-2.5 h-2.5 rounded-full"
             style={{ background: 'var(--accent)', boxShadow: '0 0 12px rgba(45,190,157,0.5)' }}>
          <div className="absolute -inset-1.5 border-2 rounded-full animate-ring"
               style={{ borderColor: 'rgba(45,190,157,0.25)' }} />
        </div>
        <div className="absolute top-[25%] right-[28%] w-2.5 h-2.5 rounded-full"
             style={{ background: 'var(--accent)', boxShadow: '0 0 12px rgba(45,190,157,0.5)', animationDelay: '0.8s' }}>
          <div className="absolute -inset-1.5 border-2 rounded-full animate-ring"
               style={{ borderColor: 'rgba(45,190,157,0.25)', animationDelay: '0.8s' }} />
        </div>
        <div className="absolute top-[35%] left-[52%] w-2.5 h-2.5 rounded-full"
             style={{ background: 'var(--accent)', boxShadow: '0 0 12px rgba(45,190,157,0.5)', animationDelay: '1.5s' }}>
          <div className="absolute -inset-1.5 border-2 rounded-full animate-ring"
               style={{ borderColor: 'rgba(45,190,157,0.25)', animationDelay: '1.5s' }} />
        </div>

        {/* Floating tablet widget */}
        <div className="absolute top-5 right-5 w-38 bg-white rounded-xl p-2.5 shadow-2xl border animate-float"
             style={{ borderColor: 'rgba(0,0,0,0.03)' }}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[7.5px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}>
              Actividad 24h
            </span>
            <div className="w-1 h-1 rounded-full" style={{ background: 'var(--accent)' }} />
          </div>
          <div className="flex gap-0.5 h-9 items-end">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 rounded-t"
                   style={{ 
                     height: `${h}%`, 
                     background: 'linear-gradient(to top, var(--primary), var(--accent))' 
                   }} />
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[6.5px] font-semibold"
               style={{ color: 'var(--text-muted)' }}>
            <span>Lun</span>
            <span>Dom</span>
          </div>
        </div>
      </div>
    </section>
  );
}
