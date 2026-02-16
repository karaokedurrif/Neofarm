'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DebugPage() {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<string>('general');

  const variants = [
    { id: 'general', name: 'General (neofarm.io)', color: '#0F766E', url: '/?variant=general' },
    { id: 'bovine', name: 'Vacuno (vacasdata.com)', color: '#1B4332', url: '/?variant=bovine' },
    { id: 'porcine', name: 'Porcino (porcdata.com)', color: '#991B1B', url: '/?variant=porcine' },
  ];

  const handleSetVariant = (variantId: string) => {
    // Guardar en localStorage para persistir
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('debug_variant', variantId);
    }
    setSelectedVariant(variantId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">🔧 Debug - Selector de Variantes</h1>
            <p className="text-gray-600 text-lg">
              Selecciona qué variante de la landing quieres ver
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {variants.map((variant) => (
              <a
                key={variant.id}
                href={variant.url}
                className="group p-8 border-2 rounded-2xl hover:shadow-2xl transition-all cursor-pointer"
                style={{
                  borderColor: selectedVariant === variant.id ? variant.color : '#e5e7eb',
                  background: selectedVariant === variant.id ? `${variant.color}10` : 'white',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  handleSetVariant(variant.id);
                  window.location.href = variant.url;
                }}
              >
                <div className="text-center">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl"
                    style={{ background: variant.color }}
                  >
                    {variant.id === 'general' && '🌱'}
                    {variant.id === 'bovine' && '🐄'}
                    {variant.id === 'porcine' && '🐷'}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{variant.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {variant.id === 'general' && 'Multi-especie'}
                    {variant.id === 'bovine' && 'Extensivo'}
                    {variant.id === 'porcine' && 'Intensivo'}
                  </p>
                  <div
                    className="text-xs font-mono px-3 py-1 rounded-full inline-block"
                    style={{
                      background: `${variant.color}20`,
                      color: variant.color,
                    }}
                  >
                    {variant.url}
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="border-t pt-8">
            <h3 className="text-lg font-bold mb-4">Cómo funciona:</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex gap-3">
                <span className="font-mono bg-gray-100 px-3 py-1 rounded">localhost:3020</span>
                <span>→ Variante GENERAL (por defecto)</span>
              </div>
              <div className="flex gap-3">
                <span className="font-mono bg-gray-100 px-3 py-1 rounded">
                  localhost:3020/?variant=bovine
                </span>
                <span>→ Variante VACUNO</span>
              </div>
              <div className="flex gap-3">
                <span className="font-mono bg-gray-100 px-3 py-1 rounded">
                  localhost:3020/?variant=porcine
                </span>
                <span>→ Variante PORCINO</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-blue-900 mb-2">📝 Nota:</h4>
              <p className="text-sm text-blue-800">
                En producción, la variante se detecta automáticamente según el dominio:
              </p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                <li>
                  <span className="font-mono">neofarm.io</span> → General
                </li>
                <li>
                  <span className="font-mono">vacasdata.com</span> → Vacuno
                </li>
                <li>
                  <span className="font-mono">porcdata.com</span> → Porcino
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
