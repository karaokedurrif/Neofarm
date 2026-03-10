'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Farm, FarmMembership, getFarmBySlug, userHasAccess } from '@/lib/tenants';
import { useAuth } from '@/contexts/AuthContext';

interface TenantContextType {
  farm: Farm | null;
  membership: FarmMembership | null;
  slug: string;
  isDemo: boolean;
  loading: boolean;
}

const TenantContext = createContext<TenantContextType>({
  farm: null,
  membership: null,
  slug: '',
  isDemo: false,
  loading: true,
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const slug = (params?.slug as string) || '';

  const { farm, membership } = useMemo(() => {
    if (!slug || !user) return { farm: null, membership: null };
    const f = getFarmBySlug(slug);
    const m = f ? userHasAccess(user.id, slug) : undefined;
    return { farm: f || null, membership: m || null };
  }, [slug, user]);

  return (
    <TenantContext.Provider value={{
      farm,
      membership,
      slug,
      isDemo: farm?.isDemo || false,
      loading: authLoading,
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
