'use client';

import { useCallback } from 'react';

/* ─── Image paths for each vertical ─── */
const ANIMAL_IMAGES: Record<string, string> = {
  vacas: '/images/verticals/cow-3d.png',
  porc: '/images/verticals/pig-3d.png',
  ovo: '/images/verticals/hen-3d.png',
};

/* ─── Props ─── */
interface VerticalCardProps {
  vertKey: string;
  color: string;
  url: string;
  title: string;
  desc: string;
  cta: string;
}

/* ─── 3D Tilt Card with animal image ─── */
export default function VerticalCard({ vertKey, color, url, title, desc, cta }: VerticalCardProps) {

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-8px)`;
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = '';
  }, []);

  const imgSrc = ANIMAL_IMAGES[vertKey] || ANIMAL_IMAGES.vacas;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="vert-card-3d block h-full group"
      style={{ '--card-color': color } as React.CSSProperties}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animal visual area */}
      <div className="vert-visual">
        <div className="vert-glow" />
        <img
          src={imgSrc}
          alt={title}
          className="vert-animal-img"
          width={220}
          height={220}
          loading="lazy"
        />
      </div>

      {/* Content area */}
      <div className="vert-content">
        <h3 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'var(--fb)' }}>{title}</h3>
        <p className="text-sm text-[var(--t2)] leading-relaxed mb-6">{desc}</p>
        <span className="inline-flex items-center gap-2 text-sm font-mono transition-all group-hover:gap-3" style={{ color }}>
          {cta}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-1">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />
    </a>
  );
}
