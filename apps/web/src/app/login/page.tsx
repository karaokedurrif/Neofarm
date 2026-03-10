'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Egg, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // If already logged in, redirect
  if (isAuthenticated) {
    router.replace('/farms');
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    setLoading(false);

    if (success) {
      router.replace('/farms');
    } else {
      setError('Email o contraseña incorrectos');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--neutral-800) 0%, var(--neutral-900) 100%)',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'var(--neutral-0)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '32px 32px 24px',
          background: 'linear-gradient(135deg, var(--primary-700) 0%, var(--primary-500) 100%)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🥚</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
            Ovo<span style={{ color: 'var(--primary-100)' }}>Sfera</span>
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
            Hub de Avicultura Inteligente · by NeoFarm
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="nf-label">Email</label>
            <input
              className="nf-input"
              type="email"
              placeholder="tu@ovosfera.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="nf-label">Contraseña</label>
            <input
              className="nf-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(220,38,38,0.08)',
              border: '1px solid rgba(220,38,38,0.2)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--alert)',
              fontSize: 13,
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <button
            className="nf-btn primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: 8, padding: '12px 16px', fontSize: 14 }}
          >
            {loading ? (
              <><Loader2 size={16} className="spin" /> Entrando...</>
            ) : (
              'Entrar'
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <p style={{ fontSize: 12, color: 'var(--neutral-400)' }}>
              Acceso restringido a socios de OvoSfera
            </p>
          </div>
        </form>
      </div>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
