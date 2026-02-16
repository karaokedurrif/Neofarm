'use client';

import { Check } from 'lucide-react';

const PRICING_TIERS = [
  {
    name: 'Starter',
    price: '49',
    description: 'Para granjas pequeñas empezando con IoT',
    features: [
      'Hasta 50 animales',
      '3 sensores IoT incluidos',
      'Dashboard básico',
      'Trazabilidad oficial',
      'Soporte por email',
    ],
    cta: 'Empezar gratis 30 días',
    popular: false,
  },
  {
    name: 'Pro',
    price: '99',
    description: 'Para granjas profesionales con operaciones avanzadas',
    features: [
      'Hasta 500 animales',
      '10 sensores IoT incluidos',
      'Todos los módulos',
      'FarmMatch™ ilimitado',
      'Genética avanzada',
      'Carbono MRV',
      'App móvil de campo',
      'Soporte prioritario',
    ],
    cta: 'Comenzar prueba',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '199',
    description: 'Para grandes operaciones y cooperativas',
    features: [
      'Animales ilimitados',
      'Sensores ilimitados',
      'Multi-explotación',
      'API personalizada',
      'Integración ERP',
      'BI avanzado',
      'Soporte 24/7',
      'Consultoría incluida',
    ],
    cta: 'Contactar ventas',
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section className="section-container bg-gray-50" id="pricing">
      <div className="text-center mb-16">
        <span className="text-sm font-medium text-neofarm-primary uppercase tracking-wider">
          Precios
        </span>
        <h2 className="text-4xl font-bold mt-2 mb-4">Planes que escalan contigo</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Paga solo por lo que usas. Sin permanencia. Cancela cuando quieras.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {PRICING_TIERS.map((tier, idx) => (
          <div
            key={idx}
            className={`relative p-8 bg-white rounded-2xl shadow-lg 
                      ${tier.popular ? 'border-4 border-neofarm-accent transform scale-105' : 'border-2 border-gray-200'}
                      transition-all hover:shadow-2xl`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-neofarm-accent text-white px-4 py-1 rounded-full text-sm font-medium">
                  Más popular
                </span>
              </div>
            )}

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold">{tier.price}€</span>
                <span className="text-gray-600">/mes</span>
              </div>
              <p className="text-sm text-gray-600">{tier.description}</p>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {tier.features.map((feature, fidx) => (
                <li key={fidx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-neofarm-accent shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              className={`w-full py-3 rounded-full font-medium transition-all
                        ${tier.popular 
                          ? 'bg-neofarm-accent text-white hover:bg-amber-600' 
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Nota adicional */}
      <div className="text-center mt-12 text-sm text-gray-600">
        <p>
          🎓 <strong>Descuento educativo:</strong> 40% para universidades y centros de formación
        </p>
        <p className="mt-2">
          💶 Precios sin IVA. Facturación mensual o anual (2 meses gratis).
        </p>
      </div>
    </section>
  );
}
