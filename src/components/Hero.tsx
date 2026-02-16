'use client';

import { VariantConfig } from '@/config/variants';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  variant: VariantConfig;
}

export default function Hero({ variant }: HeroProps) {
  const handlePrimaryCTA = () => {
    if (variant.demo_url) {
      window.location.href = variant.demo_url;
    } else {
      window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}/register`;
    }
  };

  const handleSecondaryCTA = () => {
    if (variant.demo_url) {
      window.location.href = variant.demo_url;
    } else {
      // Scroll a sección de demo
      document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen flex items-center">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full opacity-10"
          style={{ backgroundColor: variant.theme.primary }}
        />
        <div
          className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ backgroundColor: variant.theme.accent }}
        />
      </div>

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Contenido */}
          <div className="space-y-8">
            {/* Logo */}
            <div className="inline-block">
              <h1 className="text-2xl font-bold" style={{ color: variant.theme.primary }}>
                {variant.logo}
              </h1>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                {variant.headline}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                {variant.subheadline}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              {variant.badges.map((badge, idx) => (
                <span key={idx} className="badge">
                  <CheckCircle2 className="w-4 h-4 mr-2" style={{ color: variant.theme.accent }} />
                  {badge}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handlePrimaryCTA}
                className="btn-primary flex items-center gap-2"
                style={{ backgroundColor: variant.theme.accent }}
              >
                {variant.cta_primary}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={handleSecondaryCTA} className="btn-secondary">
                {variant.cta_secondary}
              </button>
            </div>

            {/* Social proof */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">Integrado con:</p>
              <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-700">
                <span>🏛️ REGA</span>
                <span>📋 SITRAN</span>
                <span>🌍 ECOGAN</span>
                <span>📡 LoRaWAN</span>
                <span>🛰️ Meshtastic</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl shadow-2xl overflow-hidden">
              {/* Placeholder hasta que tengamos imágenes reales */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="text-6xl">{variant.modules[0]?.icon || '🌱'}</div>
                  <p className="text-gray-500 text-sm">
                    Ilustración isométrica
                    <br />
                    (imagen: {variant.hero_image})
                  </p>
                </div>
              </div>
              {/* Aquí irá la imagen real cuando la tengamos */}
              {/* <Image src={variant.hero_image} alt={variant.headline} fill className="object-cover" /> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
