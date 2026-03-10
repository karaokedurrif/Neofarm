'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserFarms, Farm, FarmMembership } from '@/lib/tenants';
import { Home, Plus, ChevronRight, ArrowRight, LogOut, Star, Lock } from 'lucide-react';

export default function FarmsPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--neutral-25)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🥚</div>
          <p style={{ color: 'var(--neutral-500)' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  const farms = getUserFarms(user.id);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--neutral-50) 0%, var(--neutral-100) 100%)',
      padding: 24,
    }}>
      {/* Header */}
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        paddingTop: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--neutral-900)', letterSpacing: '-0.02em' }}>
              Ovo<span style={{ color: 'var(--primary-500)' }}>Sfera</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--neutral-500)', marginTop: 4 }}>
              Hola, {user.avatar} {user.name} · Selecciona una granja
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => router.push('/dashboard')}
              className="nf-btn"
              style={{ fontSize: 12 }}
              title="Ir al dashboard demo original de OvoSfera"
            >
              <Star size={14} /> Demo OvoSfera
            </button>
            <button
              onClick={logout}
              className="nf-btn"
              style={{ color: 'rgba(220,38,38,0.8)', fontSize: 12 }}
            >
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>

        {/* Farms grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340, 1fr))',
          gap: 20,
        }}>
          {farms.map((farm) => (
            <FarmCard
              key={farm.id}
              farm={farm}
              role={farm.role}
              onClick={() => {
                if (farm.isDemo) {
                  router.push('/dashboard');
                } else {
                  router.push(`/farm/${farm.slug}/dashboard`);
                }
              }}
            />
          ))}

          {/* Create new farm card */}
          <div
            style={{
              border: '2px dashed var(--neutral-200)',
              borderRadius: 'var(--radius-xl)',
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              cursor: 'pointer',
              transition: 'all 160ms ease',
              minHeight: 200,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--primary-400)';
              e.currentTarget.style.background = 'rgba(176,125,43,0.04)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--neutral-200)';
              e.currentTarget.style.background = 'transparent';
            }}
            title="Próximamente: Crear una nueva granja desde cero"
          >
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--neutral-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Plus size={24} style={{ color: 'var(--neutral-400)' }} />
            </div>
            <span style={{ fontWeight: 600, color: 'var(--neutral-500)', fontSize: 14 }}>
              Crear nueva granja
            </span>
            <span style={{ fontSize: 12, color: 'var(--neutral-400)' }}>
              Próximamente
            </span>
          </div>
        </div>

        {/* Quick info */}
        <div style={{
          marginTop: 40,
          padding: '20px 24px',
          background: 'var(--neutral-0)',
          borderRadius: 'var(--radius-xl)',
          border: 'var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{ fontSize: 28 }}>💡</div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--neutral-800)' }}>
              Sistema Multi-Granja
            </p>
            <p style={{ fontSize: 13, color: 'var(--neutral-500)', marginTop: 4 }}>
              Cada granja tiene sus propias aves, gallineros, producción y configuración independiente.
              Entra en <strong>&quot;El Gallinero del Palacio&quot;</strong> para empezar a meter tus datos reales.
              La granja demo &quot;Los Capones&quot; tiene datos de ejemplo para referencia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Farm Card Component ─────────────────────────── */
function FarmCard({ farm, role, onClick }: {
  farm: Farm;
  role: FarmMembership['role'];
  onClick: () => void;
}) {
  return (
    <div
      className="nf-card"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        transition: 'all 160ms ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      {/* Color band */}
      <div style={{
        height: 4,
        background: farm.isDemo
          ? 'linear-gradient(90deg, var(--primary-400), var(--primary-600))'
          : 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
      }} />

      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32 }}>{farm.avatar}</span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--neutral-900)' }}>
                {farm.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span className="nf-tag" style={{
                  fontSize: 10,
                  background: farm.isDemo ? 'rgba(176,125,43,0.1)' : 'rgba(59,130,246,0.1)',
                  color: farm.isDemo ? 'var(--primary-700)' : '#3B82F6',
                }}>
                  {farm.isDemo ? '📋 Demo' : '🏠 Tu granja'}
                </span>
                <span className="nf-tag" style={{ fontSize: 10 }}>
                  {role}
                </span>
              </div>
            </div>
          </div>
          <ArrowRight size={18} style={{ color: 'var(--neutral-400)', marginTop: 4 }} />
        </div>

        {farm.description && (
          <p style={{ fontSize: 13, color: 'var(--neutral-500)', marginTop: 12, lineHeight: 1.5 }}>
            {farm.description}
          </p>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginTop: 16, paddingTop: 12,
          borderTop: 'var(--border-default)',
          fontSize: 12, color: 'var(--neutral-400)',
        }}>
          {farm.location && <span>📍 {farm.location}</span>}
          <span>Plan: {farm.plan}</span>
        </div>
      </div>
    </div>
  );
}
