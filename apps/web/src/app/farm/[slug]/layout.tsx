'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { TenantProvider, useTenant } from '@/contexts/TenantContext';
import TenantSidebar from '@/components/tenant/TenantSidebar';
import TenantStatusBar from '@/components/tenant/TenantStatusBar';
import SeedyChat from '@/components/SeedyChat';

function TenantShell({ children }: { children: React.ReactNode }) {
  const { farm, membership, loading } = useTenant();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || loading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!farm) {
      router.replace('/farms');
      return;
    }
    if (!membership) {
      router.replace('/farms');
    }
  }, [farm, membership, isAuthenticated, authLoading, loading, router]);

  if (authLoading || loading || !farm || !membership) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--neutral-25)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🥚</div>
          <p style={{ color: 'var(--neutral-500)' }}>Cargando granja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nf-shell">
      <TenantSidebar />
      <main className="nf-main">
        <TenantStatusBar />
        {children}
      </main>
      <SeedyChat />
    </div>
  );
}

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <TenantShell>{children}</TenantShell>
    </TenantProvider>
  );
}
