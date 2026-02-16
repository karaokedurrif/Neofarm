'use client';

export default function FarmMatchSection() {
  return (
    <section className="py-25 px-12"
             style={{ background: 'linear-gradient(135deg, #FFF5F5 0%, #FEF3C7 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <span className="text-sm font-medium uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-3"
                  style={{ color: '#BE123C', background: 'rgba(190,18,60,0.08)' }}>
              Nuevo
            </span>
            <h2 className="text-5xl font-bold mb-4" style={{ color: 'var(--dark)', letterSpacing: '-1px' }}>
              FarmMatch™
            </h2>
            <p className="text-xl leading-relaxed mb-6" style={{ color: 'var(--text-mid)' }}>
              El Tinder de la genética ganadera. Desliza, compara y encuentra el cruce perfecto para tu rebaño.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                '🧬 Compatibilidad genética calculada al instante',
                '📊 Predicción de heterosis, consanguinidad y EPDs',
                '📸 Fotos reales de los candidatos',
                '🐄 Vacuno carne, leche y cruces',
                '🐷 Porcino: líneas maternas × paternas',
              ].map((item, i) => (
                <li key={i} className="text-[15px]" style={{ color: 'var(--text)' }}>
                  {item}
                </li>
              ))}
            </ul>
            <button className="px-8 py-3.5 rounded-full font-medium text-white transition-all shadow-lg hover:shadow-xl"
                    style={{ background: '#BE123C' }}>
              Probar FarmMatch™
            </button>
          </div>

          {/* Right: Phone mockup */}
          <div className="relative">
            <div className="mx-auto w-[280px] h-[560px] rounded-[2.5rem] border-8 border-gray-900 bg-white shadow-2xl overflow-hidden">
              {/* Status bar */}
              <div className="h-8 bg-gray-900" />
              
              {/* App header */}
              <div className="px-4 py-3 border-b">
                <h3 className="text-lg font-bold text-center">FarmMatch™</h3>
                <p className="text-xs text-gray-500 text-center">Encuentra el cruce perfecto</p>
              </div>

              {/* Card */}
              <div className="p-4">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  {/* Photo */}
                  <div className="h-64 bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
                    <span className="text-7xl">🐄</span>
                  </div>
                  
                  {/* Info */}
                  <div className="bg-white p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xl font-bold">Limousine ES-001</h4>
                      <div className="px-3 py-1 rounded-full text-sm font-bold text-white bg-green-500">
                        92%
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Limousine · 3 años · Navarra
                    </p>
                    
                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 rounded bg-green-50">
                        <div className="text-xs text-gray-600">Heterosis</div>
                        <div className="text-lg font-bold text-green-600">12%</div>
                      </div>
                      <div className="text-center p-2 rounded bg-green-50">
                        <div className="text-xs text-gray-600">Consang.</div>
                        <div className="text-lg font-bold text-green-600">2.1%</div>
                      </div>
                      <div className="text-center p-2 rounded bg-amber-50">
                        <div className="text-xs text-gray-600">EPD</div>
                        <div className="text-lg font-bold text-amber-600">A+</div>
                      </div>
                    </div>

                    {/* Prediction */}
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-[10px] font-medium text-gray-700 mb-1">Predicción:</p>
                      <div className="flex gap-3 text-xs">
                        <span>Destete: 245kg</span>
                        <span>Parto: 4/5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Swipe buttons */}
                <div className="flex justify-center gap-4 mt-4">
                  <button className="w-14 h-14 rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white text-2xl shadow-lg">
                    ✕
                  </button>
                  <button className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-2xl shadow-lg">
                    ★
                  </button>
                  <button className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white text-2xl shadow-lg">
                    ♥
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
