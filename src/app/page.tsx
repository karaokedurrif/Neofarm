'use client';

import { useEffect, useState } from 'react';
import { getLandingVariant, VARIANTS, LandingVariant } from '@/config/variants';
import Hero from '@/components/Hero';
import ModulesGrid from '@/components/ModulesGrid';
import FarmMatchSection from '@/components/FarmMatchSection';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';
import { BookOpen, Zap } from 'lucide-react';

export default function LandingPage() {
  const [variant, setVariant] = useState<LandingVariant>('general');

  useEffect(() => {
    // Detectar variante según dominio
    const detectedVariant = getLandingVariant();
    setVariant(detectedVariant);

    // Update document title
    const config = VARIANTS[detectedVariant];
    document.title = `${config.logo} - Ganadería Inteligente`;
  }, []);

  const config = VARIANTS[variant];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <Hero variant={config} />

      {/* Problema → Solución */}
      <section className="section-container bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            De 5 apps que no se hablan a una plataforma integrada
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-red-500">
              <h3 className="text-xl font-bold mb-4 text-red-700">❌ Antes</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li>• Excel para el censo</li>
                <li>• Papel para trazabilidad</li>
                <li>• WhatsApp para alertas</li>
                <li>• Calculadora para genética</li>
                <li>• Notas de papel en el campo</li>
              </ul>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-green-500">
              <h3 className="text-xl font-bold mb-4 text-green-700">✅ Con NeoFarm</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li>• Todo en tiempo real</li>
                <li>• Trazabilidad automática</li>
                <li>• Alertas inteligentes</li>
                <li>• Genética científica</li>
                <li>• App móvil offline</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Módulos */}
      <ModulesGrid modules={config.modules} themeColor={config.theme.primary} />

      {/* FarmMatch™ */}
      <FarmMatchSection />

      {/* Demo embed */}
      <section className="section-container" id="demo">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-neofarm-primary uppercase tracking-wider">
              Demo en vivo
            </span>
            <h2 className="text-4xl font-bold mt-2 mb-4">Prueba la plataforma ahora</h2>
            <p className="text-xl text-gray-600">
              {variant === 'general' && 'Elige el tipo de explotación y explora la demo interactiva'}
              {variant === 'bovine' && 'Accede a la demo de vacuno extensivo con datos reales'}
              {variant === 'porcine' && 'Accede a la demo de porcino intensivo con datos reales'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="text-white text-sm font-mono">
                {config.demo_url || 'https://app.neofarm.io/demo'}
              </div>
            </div>

            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              {variant === 'general' ? (
                <div className="grid grid-cols-2 gap-8 p-12">
                  <a
                    href="https://app.neofarm.io/demo/bovine"
                    className="group p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-bovine-primary hover:border-bovine-accent"
                  >
                    <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
                      🐄
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Vacuno Extensivo</h3>
                    <p className="text-gray-600 mb-4">Ganadería Los Pinares</p>
                    <p className="text-sm text-gray-500">Segovia · 156 vacas</p>
                  </a>
                  <a
                    href="https://app.neofarm.io/demo/porcine"
                    className="group p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-porcine-primary hover:border-porcine-accent"
                  >
                    <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
                      🐷
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Porcino Intensivo</h3>
                    <p className="text-gray-600 mb-4">Cebadero El Encinar</p>
                    <p className="text-sm text-gray-500">Zaragoza · 300 plazas</p>
                  </a>
                </div>
              ) : (
                <div className="text-center space-y-6 p-12">
                  <div className="text-8xl">
                    {variant === 'bovine' ? '🐄' : '🐷'}
                  </div>
                  <h3 className="text-3xl font-bold">
                    {variant === 'bovine' ? 'Demo Vacuno' : 'Demo Porcino'}
                  </h3>
                  <a
                    href={config.demo_url}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-neofarm-accent text-white rounded-full 
                             font-medium text-lg hover:bg-amber-600 transition-all shadow-lg"
                  >
                    <Zap className="w-5 h-5" />
                    Acceder a la demo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Precios */}
      <Pricing />

      {/* FAQ */}
      <section className="section-container bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Preguntas frecuentes</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: '¿Necesito instalar hardware especial?',
                a: 'No. Funciona con cualquier sensor IoT estándar (LoRa, Sigfox, WiFi). También ofrecemos nuestros propios sensores plug-and-play.',
              },
              {
                q: '¿Funciona sin internet en el campo?',
                a: 'Sí. La app móvil funciona 100% offline. Cuando recuperas cobertura, sincroniza automáticamente.',
              },
              {
                q: '¿Puedo probar antes de pagar?',
                a: '30 días gratis en cualquier plan. No pedimos tarjeta de crédito. Cancela cuando quieras.',
              },
              {
                q: '¿Es compatible con mi software actual?',
                a: 'Sí. Tenemos API abierta e integraciones con los principales ERPs ganaderos (GUSI, Unicorn, etc.).',
              },
              {
                q: '¿Cómo funciona FarmMatch™?',
                a: 'Analizamos la genética de tus animales y te mostramos los mejores cruces posibles según heterosis, consanguinidad y EPDs. Como Tinder pero científico.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="group p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <summary className="font-semibold text-lg flex items-center justify-between">
                  {faq.q}
                  <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section-container bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-bold">¿Listo para modernizar tu granja?</h2>
          <p className="text-xl text-gray-300">
            Únete a más de 500 ganaderos que ya gestionan sus explotaciones con NeoFarm
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={config.demo_url || `${process.env.NEXT_PUBLIC_APP_URL}/register`}
              className="btn-primary flex items-center gap-2 text-lg"
            >
              <Zap className="w-5 h-5" />
              Empezar ahora gratis
            </a>
            <a
              href="/docs"
              className="px-8 py-4 border-2 border-white text-white rounded-full font-medium
                       hover:bg-white hover:text-gray-900 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Ver documentación
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant={variant} />
    </main>
  );
}
