'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Wizard has been moved into Configuración (/settings).
 * This page redirects there automatically.
 */
export default function WizardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--neutral-25)', color: 'var(--neutral-500)', fontSize: 14,
    }}>
      Redirigiendo a Configuración…
    </div>
  );
}
