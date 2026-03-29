export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-bodega-50 to-wine-50">
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center space-y-6 max-w-2xl">
          <h1 className="text-5xl font-bold text-wine-700">
            🍷 BodegaData Hub
          </h1>
          <p className="text-xl text-bodega-700">
            Gestión integral de bodegas, viñedos y producción vitivinícola
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-bodega-200">
              <h3 className="font-semibold text-wine-800">🏠 Bodegas</h3>
              <p className="text-sm text-bodega-600 mt-2">Gestión de instalaciones</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-bodega-200">
              <h3 className="font-semibold text-wine-800">🍇 Viñedos</h3>
              <p className="text-sm text-bodega-600 mt-2">Control de parcelas</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-bodega-200">
              <h3 className="font-semibold text-wine-800">📊 IoT Sensores</h3>
              <p className="text-sm text-bodega-600 mt-2">Monitorización en tiempo real</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-bodega-200">
              <h3 className="font-semibold text-wine-800">📈 Analytics</h3>
              <p className="text-sm text-bodega-600 mt-2">Análisis de producción</p>
            </div>
          </div>
          <p className="text-sm text-bodega-500 mt-4">
            API: <code className="bg-bodega-100 px-2 py-1 rounded">api.bodegadata.com</code>
          </p>
        </div>
      </div>
    </main>
  )
}
