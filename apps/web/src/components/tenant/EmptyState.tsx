'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  emoji?: string;
  title: string;
  description: string;
  hint?: string;
  action?: ReactNode;
  example?: {
    title: string;
    items: string[];
  };
}

export default function EmptyState({ icon: Icon, emoji, title, description, hint, action, example }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      textAlign: 'center',
      maxWidth: 520,
      margin: '0 auto',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'var(--neutral-50)',
        border: '2px dashed var(--neutral-200)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        {emoji ? (
          <span style={{ fontSize: 32 }}>{emoji}</span>
        ) : (
          <Icon size={32} style={{ color: 'var(--neutral-300)' }} />
        )}
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 8 }}>
        {title}
      </h3>

      <p style={{ fontSize: 14, color: 'var(--neutral-500)', lineHeight: 1.6, marginBottom: 16 }}>
        {description}
      </p>

      {hint && (
        <div style={{
          padding: '10px 16px',
          background: 'rgba(59,130,246,0.06)',
          border: '1px solid rgba(59,130,246,0.15)',
          borderRadius: 'var(--radius-md)',
          fontSize: 13,
          color: '#3B82F6',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          💡 {hint}
        </div>
      )}

      {action && <div style={{ marginBottom: 20 }}>{action}</div>}

      {example && (
        <div style={{
          width: '100%',
          padding: '16px 20px',
          background: 'var(--neutral-25)',
          border: 'var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'left',
          marginTop: 8,
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-600)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            {example.title}
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {example.items.map((item, i) => (
              <li key={i} style={{ fontSize: 13, color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--primary-500)', fontSize: 16 }}>•</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Tooltip on hover ────────────────────────────── */
export function HoverGuide({ children, tip }: { children: ReactNode; tip: string }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className="hover-guide-wrap">
      {children}
      <div className="hover-guide-tip" style={{
        position: 'absolute',
        bottom: 'calc(100% + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '8px 12px',
        background: 'var(--neutral-800)',
        color: 'var(--neutral-0)',
        fontSize: 12,
        fontWeight: 500,
        borderRadius: 'var(--radius-md)',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        opacity: 0,
        transition: 'opacity 160ms ease',
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}>
        {tip}
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid var(--neutral-800)',
        }} />
      </div>
      <style jsx>{`
        .hover-guide-wrap:hover .hover-guide-tip {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
