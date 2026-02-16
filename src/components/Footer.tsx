'use client';

import { Mail, Twitter, Linkedin, Github } from 'lucide-react';
import { LandingVariant } from '@/config/variants';

interface FooterProps {
  variant: LandingVariant;
}

export default function Footer({ variant }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    producto: [
      { label: 'Características', href: '#modules' },
      { label: 'Precios', href: '#pricing' },
      { label: 'Demo', href: '#demo' },
      { label: 'FarmMatch™', href: '#farmmatch' },
    ],
    recursos: [
      { label: 'Documentación', href: '/docs' },
      { label: 'API', href: '/api-docs' },
      { label: 'Blog', href: '/blog' },
      { label: 'Casos de éxito', href: '/casos' },
    ],
    empresa: [
      { label: 'Sobre nosotros', href: '/about' },
      { label: 'Contacto', href: '/contact' },
      { label: 'Trabaja con nosotros', href: '/careers' },
      { label: 'Prensa', href: '/press' },
    ],
    legal: [
      { label: 'Privacidad', href: '/privacy' },
      { label: 'Términos', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="section-container">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Logo y descripción */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">
              {variant === 'general' && 'NeoFarm'}
              {variant === 'bovine' && 'NeoFarm · Vacuno'}
              {variant === 'porcine' && 'NeoFarm · Porcino'}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              {variant === 'general' && 
                'Ganadería inteligente multi-especie. IoT, IA y trazabilidad en una sola plataforma.'}
              {variant === 'bovine' && 
                'Gestión profesional para ganadería vacuna extensiva. GPS, genética y carbono.'}
              {variant === 'porcine' && 
                'Infraestructura inteligente para granjas porcinas. IoT, SIGE y SmartPurín.'}
            </p>
            <div className="flex gap-4">
              <a
                href="mailto:info@neofarm.io"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/neofarm"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/neofarm"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/neofarm"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Enlaces */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold mb-4 capitalize">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {currentYear} NeoFarm. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <span>🇪🇸 Hecho en España</span>
            <span>🌱 Carbono neutro</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
