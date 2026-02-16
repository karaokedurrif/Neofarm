'use client';

export default function Footer() {
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
    <footer className="px-12 pt-14 pb-7" style={{ background: 'var(--dark)', color: 'var(--text-muted)' }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-11 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-8 h-8 rounded-lg grid place-items-center" style={{ background: 'var(--primary)' }}>
                <svg width="15" height="14" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 16C2 16 4 14 10 14C16 14 18 16 18 16M6 6C6 6 8 4 10 4C12 4 14 6 14 6M10 4V14" 
                        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10" cy="2" r="1.5" fill="white"/>
                </svg>
              </div>
              <span className="text-base font-bold" style={{ color: '#fff' }}>neofarm</span>
            </div>
            <p className="text-xs leading-relaxed max-w-[260px]" style={{ color: '#5A6B70' }}>
              Ganadería inteligente multi-especie. IoT LoRa/Mesh, visión IA y trazabilidad en una sola plataforma conectada.
            </p>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="text-[10.5px] uppercase tracking-wider font-bold mb-4" style={{ color: '#5A6B70' }}>
              Producto
            </h4>
            <ul className="list-none space-y-2">
              {footerLinks.producto.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-xs transition-colors hover:text-white" style={{ color: '#7A8E94' }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10.5px] uppercase tracking-wider font-bold mb-4" style={{ color: '#5A6B70' }}>
              Recursos
            </h4>
            <ul className="list-none space-y-2">
              {footerLinks.recursos.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-xs transition-colors hover:text-white" style={{ color: '#7A8E94' }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10.5px] uppercase tracking-wider font-bold mb-4" style={{ color: '#5A6B70' }}>
              Empresa
            </h4>
            <ul className="list-none space-y-2">
              {footerLinks.empresa.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-xs transition-colors hover:text-white" style={{ color: '#7A8E94' }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-[1200px] pt-5 border-t flex justify-between text-[11px]"
             style={{ borderColor: 'rgba(255,255,255,0.05)', color: '#4A5E64' }}>
          <div>© {currentYear} neofarm.io · Todos los derechos reservados</div>
          <div className="flex gap-6">
            {footerLinks.legal.map((link, i) => (
              <a key={i} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
