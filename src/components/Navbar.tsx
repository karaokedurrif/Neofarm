'use client';

export default function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-17 flex items-center justify-between px-12
                    border-b backdrop-blur-[28px]"
         style={{ 
           background: 'rgba(247,249,248,0.72)', 
           borderColor: 'rgba(0,0,0,0.04)',
           backdropFilter: 'blur(28px) saturate(1.5)'
         }}>
      {/* Logo */}
      <a href="#" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl grid place-items-center shadow-lg"
             style={{ background: 'var(--primary)', boxShadow: '0 6px 24px rgba(31,111,92,0.18)' }}>
          <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 16C2 16 4 14 10 14C16 14 18 16 18 16M6 6C6 6 8 4 10 4C12 4 14 6 14 6M10 4V14" 
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="10" cy="2" r="1.5" fill="white"/>
          </svg>
        </div>
        <span className="text-xl font-bold" style={{ color: 'var(--dark)', letterSpacing: '-0.4px' }}>
          neofarm<span className="font-normal" style={{ color: 'var(--text-muted)', fontSize: '15px' }}>.io</span>
        </span>
      </a>

      {/* Links */}
      <ul className="flex gap-8 list-none items-center">
        <li><a href="#producto" className="text-sm font-medium" style={{ color: 'var(--text-mid)', letterSpacing: '0.01em' }}>Producto</a></li>
        <li><a href="#modules" className="text-sm font-medium" style={{ color: 'var(--text-mid)', letterSpacing: '0.01em' }}>Módulos</a></li>
        <li><a href="#integraciones" className="text-sm font-medium" style={{ color: 'var(--text-mid)', letterSpacing: '0.01em' }}>Integraciones</a></li>
        <li><a href="#pricing" className="text-sm font-medium" style={{ color: 'var(--text-mid)', letterSpacing: '0.01em' }}>Precios</a></li>
        <li><a href="#recursos" className="text-sm font-medium" style={{ color: 'var(--text-mid)', letterSpacing: '0.01em' }}>Recursos</a></li>
        <li>
          <a href="#setup" className="btn-primary text-sm">
            Comenzar setup
          </a>
        </li>
      </ul>
    </nav>
  );
}
