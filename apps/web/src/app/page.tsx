'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary-600)' }}>
          Ovo<span style={{ color: 'var(--primary-400)' }}>Sfera</span>
        </h1>
        <p style={{ marginTop: 8, color: 'var(--neutral-500)' }}>Avicultura Inteligente</p>
      </div>
    </div>
  );
}
