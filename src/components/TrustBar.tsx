'use client';

export default function TrustBar() {
  const integrations = [
    'REGA', 'SITRAN', 'ECOGAN', 'LoRaWAN', 'Meshtastic', 'TTN', 'AEAT'
  ];

  return (
    <div className="py-11 px-12 text-center bg-white border-y"
         style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
      <div className="text-[10px] uppercase tracking-[0.14em] font-bold mb-5"
           style={{ color: 'var(--text-muted)' }}>
        Integrado con el ecosistema ganadero
      </div>
      <div className="flex justify-center gap-13">
        {integrations.map((name) => (
          <div key={name}
               className="text-sm font-bold transition-opacity opacity-25 hover:opacity-50"
               style={{ color: 'var(--dark)', letterSpacing: '0.05em' }}>
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}
