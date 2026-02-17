'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';

interface FormData {
  nombre: string;
  email: string;
  nombreGranja: string;
  tipoExplotacion: 'vacuno' | 'porcino' | 'mixto' | 'otro' | '';
  numeroAnimales: string;
  telefono: string;
}

export default function DemoPage() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    nombreGranja: '',
    tipoExplotacion: '',
    numeroAnimales: '',
    telefono: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular envío (después integrar con API)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // TODO: Enviar a API /api/demo-requests
    console.log('Demo request:', formData);
    
    setLoading(false);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (submitted) {
    const hubUrl = formData.tipoExplotacion === 'vacuno' 
      ? 'https://hub.vacasdata.com/login?demo=bovine'
      : formData.tipoExplotacion === 'porcino'
      ? 'https://hub.porcdata.com/login?demo=porcine'
      : 'https://hub.vacasdata.com/login';

    const credentials = formData.tipoExplotacion === 'porcino' ? {
      email: 'demo-porcine@neofarm.io',
      password: 'demo123'
    } : {
      email: 'demo-bovine@neofarm.io',
      password: 'demo123'
    };

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
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-amber-600" />
                <p className="text-sm font-semibold text-amber-900">
                  Credenciales de acceso
                </p>
              </div>
              <div className="text-left space-y-2">
                <div className="bg-white rounded p-3 border border-amber-200">
                  <p className="text-xs text-gray-500 mb-1">Usuario</p>
                  <p className="font-mono text-sm font-semibold text-gray-900">
                    {credentials.email}
                  </p>
                </div>
                <div className="bg-white rounded p-3 border border-amber-200">
                  <p className="text-xs text-gray-500 mb-1">Contraseña</p>
                  <p className="font-mono text-sm font-semibold text-gray-900">
                    {credentials.password}
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Hemos enviado estas credenciales a <strong>{formData.email}</strong>
            </p>
          </div>

          <a
            href={hubUrl}
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
              name="nombre"
              required
              value={formData.nombre}
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
              name="nombreGranja"
              value={formData.nombreGranja}
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
              name="tipoExplotacion"
              required
              value={formData.tipoExplotacion}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors bg-white"
            >
              <option value="">Selecciona una opción</option>
              <option value="vacuno">🐄 Vacuno</option>
              <option value="porcino">🐷 Porcino</option>
              <option value="mixto">🐄🐷 Mixto</option>
              <option value="otro">🐐 Otro (caprino, ovino, avícola)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nº aproximado de animales
              </label>
              <input
                type="number"
                name="numeroAnimales"
                value={formData.numeroAnimales}
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
                name="telefono"
                value={formData.telefono}
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
