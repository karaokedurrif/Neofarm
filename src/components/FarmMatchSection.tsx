'use client';

import { Heart, Sparkles, ArrowRight } from 'lucide-react';

export default function FarmMatchSection() {
  return (
    <section className="section-container bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Contenido */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Nuevo</span>
          </div>

          <h2 className="text-5xl font-bold leading-tight">
            FarmMatch™
          </h2>

          <p className="text-xl text-gray-600 leading-relaxed">
            El Tinder de la genética ganadera. Desliza, compara y encuentra el cruce perfecto para tu rebaño.
          </p>

          <ul className="space-y-3 text-lg">
            {[
              '🧬 Compatibilidad genética calculada al instante',
              '📊 Predicción de heterosis, consanguinidad y EPDs',
              '📸 Fotos reales de los candidatos',
              '🐄 Vacuno carne, leche y cruces',
              '🐷 Porcino: líneas maternas × paternas',
            ].map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-rose-500 mt-1">•</span>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          <button className="flex items-center gap-2 px-8 py-4 bg-rose-500 text-white rounded-full 
                           font-medium text-lg hover:bg-rose-600 transition-all shadow-lg hover:shadow-xl
                           transform hover:-translate-y-0.5">
            Probar FarmMatch™
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-sm text-gray-500">
            <Heart className="w-4 h-4 inline text-rose-500" /> Ya se han realizado más de 1,200 cruces óptimos
          </p>
        </div>

        {/* Mockup de la interfaz */}
        <div className="relative">
          {/* Phone mockup */}
          <div className="mx-auto max-w-sm">
            <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
              <div className="bg-white rounded-[2.5rem] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-rose-500 to-amber-500 p-4 text-white text-center">
                  <h3 className="font-bold text-lg">FarmMatch™</h3>
                  <p className="text-sm opacity-90">Encuentra el cruce perfecto</p>
                </div>

                {/* Card de animal */}
                <div className="p-4">
                  <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                    {/* Foto placeholder */}
                    <div className="h-64 bg-gradient-to-br from-amber-200 to-rose-200 flex items-center justify-center">
                      <span className="text-7xl">🐄</span>
                    </div>

                    {/* Info del animal */}
                    <div className="p-4 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-xl font-bold">Toro Charolais</h4>
                          <p className="text-sm text-gray-600">3 años • Ganadería El Roble</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-rose-500">92%</div>
                          <div className="text-xs text-gray-500">Match</div>
                        </div>
                      </div>

                      {/* Métricas */}
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                          <div className="text-sm font-bold text-green-700">12%</div>
                          <div className="text-xs text-gray-600">Heterosis</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                          <div className="text-sm font-bold text-green-700">2.5%</div>
                          <div className="text-xs text-gray-600">Consang.</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className="text-sm font-bold text-blue-700">+8kg</div>
                          <div className="text-xs text-gray-600">EPD WW</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botones de swipe */}
                  <div className="flex justify-center gap-4 mt-4">
                    <button className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg">
                      ✕
                    </button>
                    <button className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg">
                      ★
                    </button>
                    <button className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg">
                      ♥
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
