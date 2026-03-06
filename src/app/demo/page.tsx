'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Mail, Loader2 } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  farm_name: string;
  farm_type: 'bovine' | 'porcine' | 'mixed' | '';
  farm_size: string;
  phone: string;
}

interface DemoResponse {
  success: boolean;
  message: string;
  demo_url: string;
  demo_email: string;
  demo_password: string;
}

export default function DemoPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    farm_name: '',
    farm_type: '',
    farm_size: '',
    phone: '',
  });

  const [result, setResult] = useState<DemoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://api-v2.vacasdata.com/api/v1/customers/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          farm_name: formData.farm_name || null,
          farm_type: formData.farm_type,
          farm_size: formData.farm_size ? parseInt(formData.farm_size) : null,
          source: 'landing_demo',
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.detail || 'Error al procesar la solicitud');
      }
    } catch (e) {
      setError('Error de conexión. Inténtalo de nuevo.');
      console.error('Error submitting demo request:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (result) {
    return (
      <div className="min-h-screen bg-[var(--warm-50)] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Tu demo está lista!
          </h1>
          
          <div className="mb-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-green-600" />
                <p className="text-sm font-semibold text-green-900">
                  ✅ Email enviado a {formData.email}
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {result.message}
              </p>
              
              <div className="text-left space-y-2">
                <div className="bg-white rounded p-3 border border-green-200">
                  <p className="text-xs text-gray-500 mb-1">URL Demo</p>
                  <p className="font-mono text-sm font-semibold text-gray-900 break-all">
                    {result.demo_url}
                  </p>
                </div>
                <div className="bg-white rounded p-3 border border-green-200">
                  <p className="text-xs text-gray-500 mb-1">Usuario</p>
                  <p className="font-mono text-sm font-semibold text-gray-900">
                    {result.demo_email}
                  </p>
                </div>
                <div className="bg-white rounded p-3 border border-green-200">
                  <p className="text-xs text-gray-500 mb-1">Contraseña</p>
                  <p className="font-mono text-sm font-semibold text-gray-900">
                    {result.demo_password}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <a
            href={result.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-8 py-4 bg-[var(--green-900)] text-white font-semibold rounded-lg hover:bg-[var(--green-700)] transition-colors text-center mb-4"
          >
            Acceder a la demo ahora →
          </a>

          <Link
            href="/setup"
            className="block w-full px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            ¿Quieres configurar tu propia granja?
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--warm-50)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prueba la plataforma completa
          </h1>
          <p className="text-gray-600">
            Rellena tus datos y recibe acceso instantáneo a la demo
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
              placeholder="Juan García López"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
              placeholder="juan@migranja.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre de la granja
            </label>
            <input
              type="text"
              name="farm_name"
              value={formData.farm_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
              placeholder="Granja San Pedro"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de explotación *
            </label>
            <select
              name="farm_type"
              required
              value={formData.farm_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors bg-white"
            >
              <option value="">Selecciona una opción</option>
              <option value="bovine">🐄 Vacuno</option>
              <option value="porcine">🐷 Porcino</option>
              <option value="mixed">🐄🐷 Mixto</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nº aproximado de animales
              </label>
              <input
                type="number"
                name="farm_size"
                value={formData.farm_size}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                placeholder="150"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                placeholder="+34 600 123 456"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-[var(--green-900)] text-white font-semibold rounded-lg hover:bg-[var(--green-700)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : 'Solicitar acceso demo →'}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Al solicitar la demo aceptas recibir comunicaciones de NeoFarm.
            <br />
            Puedes darte de baja en cualquier momento.
          </p>
        </form>
      </div>
    </div>
  );
}
