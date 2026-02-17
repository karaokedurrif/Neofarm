'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Cow, PiggyBank, Leaf, FileText, MapPin, Building2 } from 'lucide-react';

type ExplotacionTipo = 'vacuno' | 'porcino' | 'mixto' | 'otro' | '';

interface SetupData {
  // Paso 1
  tipoExplotacion: ExplotacionTipo;
  // Paso 2
  nombreExplotacion: string;
  rega: string;
  provincia: string;
  numeroAnimales: string;
  numeroNavesOParcelas: string;
  // Paso 3
  modulosSeleccionados: string[];
  // Paso 4
  email: string;
  password: string;
  aceptaTerminos: boolean;
}

const MODULOS_DISPONIBLES = {
  vacuno: [
    { id: 'gps', nombre: 'GPS/Collares', descripcion: 'Geolocalización rebaño', precio: 3 },
    { id: 'carbon', nombre: 'Carbono MRV', descripcion: 'Créditos carbono verificables', precio: 5 },
    { id: 'dehesas', nombre: 'Dehesas', descripcion: 'Gestión parcelas extensivas', precio: 2 },
    { id: 'genetics', nombre: 'Genética FarmMatch', descripcion: 'Optimización reproductiva', precio: 4 },
    { id: 'traceability', nombre: 'Trazabilidad', descripcion: 'REGA + SITRAN obligatorio', precio: 1 },
    { id: 'erp', nombre: 'ERP Ganadero', descripcion: 'Gestión económica', precio: 3 },
  ],
  porcino: [
    { id: 'barns', nombre: 'Naves Digitales', descripcion: 'Digital Twin 3D', precio: 5 },
    { id: 'sensors', nombre: 'Sensores Ambientales', descripcion: 'Temp/Hum/NH3/CO2', precio: 4 },
    { id: 'ia-vision', nombre: 'IA Vision', descripcion: 'Cámaras + Computer Vision', precio: 6 },
    { id: 'nutrition', nombre: 'Nutrición Precisión', descripcion: 'Formulación pienso óptima', precio: 3 },
    { id: 'purines', nombre: 'SmartPurín', descripcion: 'Gestión integral purines', precio: 2 },
    { id: 'sige', nombre: 'SIGE RD 306/2020', descripcion: 'Cumplimiento normativo', precio: 2 },
    { id: 'traceability', nombre: 'Trazabilidad', descripcion: 'REGA + SITRAN obligatorio', precio: 1 },
    { id: 'erp', nombre: 'ERP Ganadero', descripcion: 'Gestión económica', precio: 3 },
  ]
};

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [setupData, setSetupData] = useState<SetupData>({
    tipoExplotacion: '',
    nombreExplotacion: '',
    rega: '',
    provincia: '',
    numeroAnimales: '',
    numeroNavesOParcelas: '',
    modulosSeleccionados: [],
    email: '',
    password: '',
    aceptaTerminos: false,
  });

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFinish = async () => {
    // TODO: Llamar a API para crear tenant y usuario
    console.log('Setup completado:', setupData);
    
    // Redirigir al hub correspondiente
    const hubUrl = setupData.tipoExplotacion === 'vacuno'
      ? 'https://hub.vacasdata.com'
      : setupData.tipoExplotacion === 'porcino'
      ? 'https://hub.porcdata.com'
      : 'https://hub.vacasdata.com';
    
    window.location.href = hubUrl;
  };

  const toggleModulo = (moduloId: string) => {
    setSetupData(prev => ({
      ...prev,
      modulosSeleccionados: prev.modulosSeleccionados.includes(moduloId)
        ? prev.modulosSeleccionados.filter(id => id !== moduloId)
        : [...prev.modulosSeleccionados, moduloId]
    }));
  };

  const modulosDisponibles = setupData.tipoExplotacion === 'vacuno' 
    ? MODULOS_DISPONIBLES.vacuno
    : setupData.tipoExplotacion === 'porcino'
    ? MODULOS_DISPONIBLES.porcino
    : [];

  const precioTotal = modulosDisponibles
    .filter(m => setupData.modulosSeleccionados.includes(m.id))
    .reduce((sum, m) => sum + m.precio, 0);

  return (
    <div className="min-h-screen bg-[var(--warm-50)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configurar mi granja
          </h1>
          <p className="text-gray-600">
            Paso {currentStep} de 4
          </p>
          
          {/* Progress bar */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map(step => (
              <div 
                key={step}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-green-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* PASO 1: Tipo de explotación */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¿Qué tipo de explotación tienes?
                </h2>
                <p className="text-gray-600">
                  Selecciona el tipo que mejor describa tu actividad
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSetupData(prev => ({ ...prev, tipoExplotacion: 'vacuno' }))}
                  className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                    setupData.tipoExplotacion === 'vacuno'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-4xl mb-3">🐄</div>
                  <h3 className="font-bold text-lg mb-2">Vacuno extensivo</h3>
                  <p className="text-sm text-gray-600">
                    GPS, dehesas, carbono, genética
                  </p>
                </button>

                <button
                  onClick={() => setSetupData(prev => ({ ...prev, tipoExplotacion: 'porcino' }))}
                  className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                    setupData.tipoExplotacion === 'porcino'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-4xl mb-3">🐷</div>
                  <h3 className="font-bold text-lg mb-2">Porcino intensivo</h3>
                  <p className="text-sm text-gray-600">
                    Naves, sensores, IA, nutrición
                  </p>
                </button>

                <button
                  onClick={() => setSetupData(prev => ({ ...prev, tipoExplotacion: 'mixto' }))}
                  className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                    setupData.tipoExplotacion === 'mixto'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-4xl mb-3">🐄🐷</div>
                  <h3 className="font-bold text-lg mb-2">Mixto</h3>
                  <p className="text-sm text-gray-600">
                    Combina múltiples especies
                  </p>
                </button>

                <button
                  onClick={() => setSetupData(prev => ({ ...prev, tipoExplotacion: 'otro' }))}
                  className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                    setupData.tipoExplotacion === 'otro'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-4xl mb-3">🐐</div>
                  <h3 className="font-bold text-lg mb-2">Otro</h3>
                  <p className="text-sm text-gray-600">
                    Caprino, ovino, avícola
                    <span className="block mt-1 text-amber-600 font-semibold">Próximamente</span>
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: Datos de la granja */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Cuéntanos sobre tu granja
                </h2>
                <p className="text-gray-600">
                  Información básica para personalizar tu experiencia
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre de la explotación *
                  </label>
                  <input
                    type="text"
                    value={setupData.nombreExplotacion}
                    onChange={e => setSetupData(prev => ({ ...prev, nombreExplotacion: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="Granja San Pedro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    REGA (opcional)
                  </label>
                  <input
                    type="text"
                    value={setupData.rega}
                    onChange={e => setSetupData(prev => ({ ...prev, rega: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="ES280790001234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Provincia *
                  </label>
                  <input
                    type="text"
                    value={setupData.provincia}
                    onChange={e => setSetupData(prev => ({ ...prev, provincia: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="Salamanca"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nº de animales *
                    </label>
                    <input
                      type="number"
                      value={setupData.numeroAnimales}
                      onChange={e => setSetupData(prev => ({ ...prev, numeroAnimales: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      placeholder="250"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nº de {setupData.tipoExplotacion === 'vacuno' ? 'parcelas' : 'naves'}
                    </label>
                    <input
                      type="number"
                      value={setupData.numeroNavesOParcelas}
                      onChange={e => setSetupData(prev => ({ ...prev, numeroNavesOParcelas: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      placeholder="4"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: Módulos */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¿Qué módulos necesitas?
                </h2>
                <p className="text-gray-600">
                  Selecciona las funcionalidades que quieres activar
                </p>
              </div>

              <div className="space-y-3">
                {modulosDisponibles.map(modulo => (
                  <button
                    key={modulo.id}
                    onClick={() => toggleModulo(modulo.id)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all flex items-start gap-4 ${
                      setupData.modulosSeleccionados.includes(modulo.id)
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      setupData.modulosSeleccionados.includes(modulo.id)
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-300'
                    }`}>
                      {setupData.modulosSeleccionados.includes(modulo.id) && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">{modulo.nombre}</h3>
                        <span className="text-sm font-semibold text-gray-600">
                          €{modulo.precio}/mes
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{modulo.descripcion}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">
                    Precio estimado mensual:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    €{precioTotal}/mes
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  + IVA • Primer mes gratis • Sin permanencia
                </p>
              </div>
            </div>
          )}

          {/* PASO 4: Crear cuenta */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Crea tu cuenta
                </h2>
                <p className="text-gray-600">
                  Último paso para empezar a usar {setupData.tipoExplotacion === 'vacuno' ? 'VacasData' : setupData.tipoExplotacion === 'porcino' ? 'PorcData' : 'NeoFarm'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={setupData.email}
                    onChange={e => setSetupData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="juan@migranja.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    value={setupData.password}
                    onChange={e => setSetupData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={setupData.aceptaTerminos}
                    onChange={e => setSetupData(prev => ({ ...prev, aceptaTerminos: e.target.checked }))}
                    className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-600">
                    Acepto los <a href="#" className="text-green-600 hover:underline">términos y condiciones</a> y la <a href="#" className="text-green-600 hover:underline">política de privacidad</a>
                  </span>
                </label>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Resumen de tu configuración:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {setupData.nombreExplotacion || 'Tu granja'}</li>
                  <li>• Tipo: {setupData.tipoExplotacion}</li>
                  <li>• {setupData.numeroAnimales} animales</li>
                  <li>• {setupData.modulosSeleccionados.length} módulos seleccionados</li>
                  <li>• Precio: €{precioTotal}/mes</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Atrás
              </button>
            )}
            
            <div className="ml-auto">
              {currentStep < 4 && (
                <button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !setupData.tipoExplotacion) ||
                    (currentStep === 2 && (!setupData.nombreExplotacion || !setupData.provincia || !setupData.numeroAnimales))
                  }
                  className="px-8 py-3 bg-[var(--green-900)] text-white font-semibold rounded-lg hover:bg-[var(--green-700)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              )}

              {currentStep === 4 && (
                <button
                  onClick={handleFinish}
                  disabled={!setupData.email || !setupData.password || !setupData.aceptaTerminos}
                  className="px-8 py-3 bg-[var(--green-900)] text-white font-semibold rounded-lg hover:bg-[var(--green-700)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crear granja →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
