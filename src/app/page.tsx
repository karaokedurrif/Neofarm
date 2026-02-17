import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin, Thermometer, Dna, Leaf, Eye, FileCheck, ClipboardList, Receipt,
  Droplet, Radio, Droplets, BarChart3, Camera, Beef, PiggyBank, Warehouse,
  XCircle, CheckCircle, ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--warm-50)]" style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-[var(--warm-200)] z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--green-900)] flex items-center justify-center text-white font-bold text-xl">
              N
            </div>
            <span className="text-xl font-semibold" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              neofarm.io
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-[var(--text-600)]">
            <Link href="#producto" className="hover:text-[var(--green-900)]">Producto</Link>
            <Link href="#modulos" className="hover:text-[var(--green-900)]">Módulos</Link>
            <Link href="#integraciones" className="hover:text-[var(--green-900)]">Integraciones</Link>
            <Link href="#precios" className="hover:text-[var(--green-900)]">Precios</Link>
            <Link href="#recursos" className="hover:text-[var(--green-900)]">Recursos</Link>
          </div>
          
          <Link
            href="/wizard"
            className="px-6 py-2.5 bg-[var(--green-900)] text-white font-semibold rounded-lg hover:bg-[var(--green-700)] transition-colors"
          >
            Comenzar setup
          </Link>
        </div>
      </nav>

      {/* Espaciado para navbar fixed */}
      <div className="h-20"></div>

      {/* SECCIÓN 1: HERO */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-4 py-1.5 bg-[var(--green-100)] text-[var(--green-700)] rounded-full text-sm font-medium mb-6">
              IoT + IA + Trazabilidad
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-normal mb-6 text-[var(--green-900)]" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              Transforma tu granja<br />
              en un <span className="italic text-[var(--green-700)]">gemelo digital</span>
            </h1>
            
            <p className="text-lg text-[var(--text-600)] mb-8 max-w-md leading-relaxed">
              Monitoriza temperatura, gases, agua y comportamiento animal desde tu móvil. 
              Sin obras. Sin cables. Operativo en 3 días.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/wizard"
                className="px-8 py-4 bg-[var(--green-900)] text-white font-semibold rounded-lg hover:bg-[var(--green-700)] transition-colors text-center"
              >
                Comenzar setup (3 min)
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 border-2 border-[var(--green-900)] text-[var(--green-900)] font-semibold rounded-lg hover:bg-[var(--green-50)] transition-colors text-center"
              >
                Ver demo en vivo
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-semibold mb-1" style={{ fontFamily: "'IBM Plex Mono', 'SF Mono', monospace" }}>
                  500+
                </div>
                <div className="text-sm text-[var(--text-400)]">Granjas activas</div>
              </div>
              <div>
                <div className="text-3xl font-semibold mb-1" style={{ fontFamily: "'IBM Plex Mono', 'SF Mono', monospace" }}>
                  12k
                </div>
                <div className="text-sm text-[var(--text-400)]">Dispositivos IoT</div>
              </div>
              <div>
                <div className="text-3xl font-semibold mb-1" style={{ fontFamily: "'IBM Plex Mono', 'SF Mono', monospace" }}>
                  24M€
                </div>
                <div className="text-sm text-[var(--text-400)]">Facturado gestionado</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <Image
              src="/images/hero-barn-v2.png"
              alt="Digital Twin Barn"
              width={800}
              height={600}
              className="w-full h-auto"
              priority
            />
            
            {/* Overlays de datos */}
            <div className="absolute top-10 left-10 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
              <div className="text-sm text-[var(--text-400)] mb-2">Ganado Monitorizado</div>
              <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                1,247
              </div>
            </div>
            
            <div className="absolute top-32 right-8 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
              <div className="text-sm text-[var(--text-400)] mb-2">Dispositivos Activos</div>
              <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                48
              </div>
            </div>
            
            <div className="absolute bottom-20 left-16 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
              <div className="text-sm text-[var(--text-400)] mb-2">Carbono Capturado</div>
              <div className="text-2xl font-semibold text-[var(--green-700)]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                342t CO₂
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: INTEGRACIONES */}
      <section id="integraciones" className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-xs font-medium text-[var(--text-400)] tracking-widest uppercase mb-8 text-center">
            INTEGRADO CON EL ECOSISTEMA GANADERO
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            {['REGA', 'SITRAN', 'ECOGAN', 'LoRaWAN', 'Meshtastic', 'CTTNA', 'EAT'].map((logo) => (
              <div
                key={logo}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-sm text-gray-500 hover:border-[var(--green-500)] hover:text-[var(--green-700)] transition-colors"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: ANTES vs DESPUÉS */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-normal text-center mb-16" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            De 5 apps que no se hablan<br />
            a una plataforma integrada
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ANTES */}
            <div className="bg-[var(--warm-100)] rounded-2xl p-8 border-l-4 border-[var(--accent)]">
              <div className="flex items-center gap-3 mb-6">
                <XCircle className="w-8 h-8 text-[var(--accent)]" />
                <h3 className="text-2xl font-bold text-[var(--accent)]">Antes</h3>
              </div>
              
              <ul className="space-y-4 text-[var(--text-600)]">
                <li className="flex gap-3">
                  <span className="text-[var(--accent)] mt-1">•</span>
                  <span>Excel para el censo — errores, datos perdidos, sin histórico</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)] mt-1">•</span>
                  <span>Papel para trazabilidad — horas buscando documentos en inspecciones</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)] mt-1">•</span>
                  <span>WhatsApp para alertas — se pierden entre memes y audios</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)] mt-1">•</span>
                  <span>Calculadora para genética — sin predicción, sin datos reales</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)] mt-1">•</span>
                  <span>Notas de papel en el campo — ilegibles, se mojan, se pierden</span>
                </li>
              </ul>
            </div>
            
            {/* CON NEOFARM */}
            <div className="bg-[var(--green-50)] rounded-2xl p-8 border-l-4 border-[var(--green-700)]">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-8 h-8 text-[var(--green-700)]" />
                <h3 className="text-2xl font-bold text-[var(--green-700)]">Con NeoFarm</h3>
              </div>
              
              <ul className="space-y-4 text-[var(--text-600)]">
                <li className="flex gap-3">
                  <span className="text-[var(--green-700)] mt-1">•</span>
                  <span>Todo en tiempo real — un vistazo en el móvil y sabes cómo va la granja</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--green-700)] mt-1">•</span>
                  <span>Trazabilidad automática — ICA, SITRAN, REMO con un click</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--green-700)] mt-1">•</span>
                  <span>Alertas inteligentes — solo cuando importa, con datos, no con ruido</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--green-700)] mt-1">•</span>
                  <span>Genética científica — predicción de heterosis, EPDs, cruces óptimos</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--green-700)] mt-1">•</span>
                  <span>App móvil offline — funciona en el campo sin cobertura</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: INFRAESTRUCTURA INTELIGENTE */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-4 py-1.5 bg-[var(--green-100)] text-[var(--green-700)] rounded-full text-sm font-medium mb-6">
              INFRAESTRUCTURA INTELIGENTE
            </div>
            
            <h2 className="text-4xl font-normal mb-6 text-[var(--green-900)] max-w-lg" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              Sensores, visión IA y conectividad <span className="italic">mesh</span> en tiempo real
            </h2>
            
            <p className="text-lg text-[var(--text-600)] mb-10 max-w-lg leading-relaxed">
              Cada nave se convierte en un organismo monitorizado. Temperatura, humedad, gases, 
              consumo de agua y comportamiento animal — todo capturado, todo analizado, todo en tu bolsillo.
            </p>
            
            <div className="space-y-6">
              {[
                { icon: Thermometer, title: 'Sensores ambientales', desc: 'T°, HR, NH₃, CO₂ a altura animal. Alertas automáticas.' },
                { icon: Eye, title: 'Visión IA', desc: 'Conteo, caudofagia, cojeras, actividad grupal, animal caído.' },
                { icon: Radio, title: 'Red mesh Meshtastic', desc: 'Cobertura indoor/outdoor sin SIM. Bridges LoRa cada 30m.' },
                { icon: Droplets, title: 'Caudalímetro de agua', desc: 'Consumo por nave = indicador precoz de enfermedad.' },
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-4">
                  <feature.icon className="w-8 h-8 text-[var(--green-700)] flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-[var(--text-900)] mb-1">{feature.title}</div>
                    <div className="text-[var(--text-400)]">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative h-[500px]">
            <Image
              src="/images/hero-barn-v2.png"
              alt="IoT Infrastructure"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* SECCIÓN 5: MÓDULOS CONECTADOS */}
      <section id="modulos" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="inline-block px-4 py-1.5 bg-[var(--green-100)] text-[var(--green-700)] rounded-full text-sm font-medium mb-6 mx-auto block w-fit">
            MÓDULOS CONECTADOS
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-normal text-center mb-4" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Todo lo que necesitas para gestionar tu granja
          </h2>
          
          <p className="text-lg text-[var(--text-600)] text-center mb-16 max-w-2xl mx-auto">
            Activa solo los módulos que uses. Desactiva lo que no necesites. Sin coste oculto.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MapPin, title: 'IoT GPS LoRa', desc: 'Localización real de tu ganado en extensivo. Rango 15km sin cobertura.', badge: 'EXTENSIVO', badgeColor: 'green' },
              { icon: Thermometer, title: 'IoT Barn', desc: 'Sensores T°, NH₃, CO₂, humedad en naves. Alertas automáticas.', badge: 'INTENSIVO', badgeColor: 'orange' },
              { icon: Dna, title: 'Genética Avanzada', desc: 'EPDs, consanguinidad, predictor F1. FarmMatch™ para cruces óptimos.' },
              { icon: Leaf, title: 'Carbono MRV', desc: 'Calcula créditos de carbono con satélite NDVI y biomasa acreditada.' },
              { icon: Eye, title: 'IA Vision', desc: 'Cámaras con ML: detección de cojeras, caudofagia, alertas comportamentales.', badge: 'INTENSIVO', badgeColor: 'orange' },
              { icon: FileCheck, title: 'Trazabilidad Oficial', desc: 'REGA, SITRAN, ICA, retorno matadero. Todo digital, cero papel.' },
              { icon: ClipboardList, title: 'SIGE Digital', desc: '11 planes del RD 306/2020 en un dashboard. Inspecciones con 1 click.', badge: 'INTENSIVO', badgeColor: 'orange' },
              { icon: Receipt, title: 'ERP Ganadero', desc: 'Ventas, compras, inventario, RRHH, Modelo 303. Contabilidad integrada.' },
              { icon: Droplet, title: 'SmartPurín', desc: 'Gestión de fosa + biogás + planes de abonado. Cumplimiento RD 1051.', badge: 'INTENSIVO', badgeColor: 'orange' },
            ].map((module, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[var(--green-500)] hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <module.icon className="w-8 h-8 text-[var(--green-700)]" />
                  {module.badge && (
                    <span className={`text-xs px-2 py-1 rounded ${module.badgeColor === 'green' ? 'bg-[var(--green-100)] text-[var(--green-700)]' : 'bg-orange-100 text-orange-700'}`}>
                      {module.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-[var(--text-900)] mb-2">{module.title}</h3>
                <p className="text-sm text-[var(--text-400)] leading-relaxed">{module.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 6: FARMMATCH */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-6">
              NUEVO
            </div>
            
            <h2 className="text-5xl font-normal mb-4" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              FarmMatch™
            </h2>
            
            <p className="text-xl text-[var(--text-600)] mb-8 leading-relaxed">
              El Tinder de la genética ganadera. Desliza, compara y encuentra el cruce perfecto para tu rebaño.
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                { icon: Dna, text: 'Compatibilidad genética calculada al instante' },
                { icon: BarChart3, text: 'Predicción de heterosis, consanguinidad y EPDs' },
                { icon: Camera, text: 'Fotos reales de los candidatos' },
                { icon: Beef, text: 'Vacuno: carne, leche y cruces' },
                { icon: PiggyBank, text: 'Porcino: líneas maternas × paternas' },
              ].map((feature, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <feature.icon className="w-5 h-5 text-[var(--green-700)] flex-shrink-0 mt-1" />
                  <span className="text-[var(--text-600)]">{feature.text}</span>
                </li>
              ))}
            </ul>
            
            <Link
              href="/genetics"
              className="inline-block px-8 py-4 bg-[var(--accent)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Probar FarmMatch™
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl border-2 border-[var(--green-500)] p-8 shadow-xl">
            <div className="aspect-square bg-gray-100 rounded-xl mb-6 flex items-center justify-center text-gray-400">
              <Beef className="w-24 h-24" />
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--text-400)]">Compatibilidad genética</span>
                <span className="text-2xl font-semibold text-[var(--green-700)]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  92%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[var(--green-500)] h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-[var(--text-400)] mb-1">Heterosis</div>
                <div className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>+18%</div>
              </div>
              <div>
                <div className="text-sm text-[var(--text-400)] mb-1">Consang.</div>
                <div className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>2.1%</div>
              </div>
              <div>
                <div className="text-sm text-[var(--text-400)] mb-1">EPD</div>
                <div className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>+3.2</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 7: PRUEBA LA PLATAFORMA */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-normal text-center mb-4" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Prueba la plataforma ahora
          </h2>
          
          <p className="text-lg text-[var(--text-600)] text-center mb-16">
            Elige tu tipo de explotación y explora la demo interactiva.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              href="/demo?type=extensivo"
              className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[var(--green-500)] hover:shadow-lg transition-all group"
            >
              <MapPin className="w-12 h-12 text-[var(--green-700)] mb-6" />
              <h3 className="text-2xl font-bold mb-2">Vacuno Extensivo</h3>
              <p className="text-[var(--text-400)] mb-6">Sierras, dehesas, GPS, carbono</p>
              <div className="flex items-center text-[var(--green-700)] font-semibold group-hover:gap-3 transition-all">
                Explorar <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </Link>
            
            <Link
              href="/demo?type=intensivo"
              className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[var(--accent)] hover:shadow-lg transition-all group"
            >
              <Warehouse className="w-12 h-12 text-[var(--accent)] mb-6" />
              <h3 className="text-2xl font-bold mb-2">Porcino Intensivo</h3>
              <p className="text-[var(--text-400)] mb-6">Naves, sensores, IA, purines</p>
              <div className="flex items-center text-[var(--accent)] font-semibold group-hover:gap-3 transition-all">
                Explorar <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </Link>
            
            <Link
              href="https://hub.vacasdata.com/dafo"
              className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all group"
            >
              <BarChart3 className="w-12 h-12 text-purple-600 mb-6" />
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold">DAFO Inteligente</h3>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded uppercase">IA</span>
              </div>
              <p className="text-[var(--text-400)] mb-6">Diagnóstico completo con Claude IA</p>
              <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 transition-all">
                Analizar mi granja <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* SECCIÓN 8: PRICING */}
      <section id="precios" className="py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="inline-block px-4 py-1.5 bg-[var(--green-100)] text-[var(--green-700)] rounded-full text-sm font-medium mb-6 mx-auto block w-fit">
            PRECIOS
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-normal text-center mb-4" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Planes que escalan contigo
          </h2>
          
          <p className="text-lg text-[var(--text-600)] text-center mb-16">
            Paga solo por lo que uses. Sin permanencia. Cancela cuando quieras.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* STARTER */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
              <div className="text-sm font-medium text-[var(--text-400)] uppercase mb-2">Starter</div>
              <div className="mb-6">
                <span className="text-5xl font-bold">49€</span>
                <span className="text-[var(--text-400)]">/mes</span>
              </div>
              <p className="text-[var(--text-600)] mb-6">Para granjas que empiezan a digitalizar</p>
              <ul className="space-y-3 mb-8">
                {['Hasta 500 animales', '5 sensores incluidos', 'Dashboard básico', 'Trazabilidad REGA/SITRAN', 'Soporte email'].map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-[var(--green-500)] flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/wizard"
                className="block w-full py-3 border-2 border-[var(--green-900)] text-[var(--green-900)] font-semibold rounded-lg hover:bg-[var(--green-50)] transition-colors text-center"
              >
                Empieza gratis 30 días
              </Link>
            </div>
            
            {/* PRO */}
            <div className="bg-white rounded-2xl p-8 border-2 border-[var(--green-500)] relative shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-[var(--green-500)] text-white text-sm font-semibold rounded-full">
                POPULAR
              </div>
              <div className="text-sm font-medium text-[var(--green-700)] uppercase mb-2">Pro</div>
              <div className="mb-6">
                <span className="text-5xl font-bold">99€</span>
                <span className="text-[var(--text-400)]">/mes</span>
              </div>
              <p className="text-[var(--text-600)] mb-6">Para granjas que quieren control total</p>
              <ul className="space-y-3 mb-8">
                {['Hasta 3.000 animales', 'Sensores ilimitados', 'IA Vision (2 cámaras)', 'Todos los módulos', 'FarmMatch™', 'SmartPurín', 'Soporte prioritario'].map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-[var(--green-500)] flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/wizard"
                className="block w-full py-3 bg-[var(--green-900)] text-white font-semibold rounded-lg hover:bg-[var(--green-700)] transition-colors text-center"
              >
                Comenzar con Pro
              </Link>
            </div>
            
            {/* ENTERPRISE */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
              <div className="text-sm font-medium text-[var(--text-400)] uppercase mb-2">Enterprise</div>
              <div className="mb-6">
                <span className="text-5xl font-bold">199€</span>
                <span className="text-[var(--text-400)]">/mes</span>
              </div>
              <p className="text-[var(--text-600)] mb-6">Para integradoras y grandes explotaciones</p>
              <ul className="space-y-3 mb-8">
                {['Animales ilimitados', 'Multi-granja', 'API completa', 'Nutrición IA Precisión', 'Pool compra colectiva', 'Gestor dedicado', 'SLA 99.9%'].map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-[var(--green-500)] flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="block w-full py-3 border-2 border-[var(--green-900)] text-[var(--green-900)] font-semibold rounded-lg hover:bg-[var(--green-50)] transition-colors text-center"
              >
                Contactar ventas
              </Link>
            </div>
          </div>
          
          <p className="text-sm text-[var(--text-400)] text-center mt-8">
            Precios sin IVA. 20% descuento anual. Subvencionable PERTE Agroalimentario + PAC.
          </p>
        </div>
      </section>

      {/* SECCIÓN 9: FAQ */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-normal text-center mb-16" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Preguntas frecuentes
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: '¿Necesito instalar hardware especial?',
                a: 'No. Nuestros sensores son inalámbricos, con batería de 2 años y se instalan en 30 minutos sin obras. El gateway se conecta a tu WiFi o usa 4G propio.'
              },
              {
                q: '¿Funciona sin internet en el campo?',
                a: 'Sí. La app funciona 100% offline. Sincroniza automáticamente cuando recuperas cobertura. Los sensores usan red mesh propia que no depende de internet.'
              },
              {
                q: '¿Puedo probar antes de pagar?',
                a: '30 días gratis con todas las funciones. Sin tarjeta. Si no te convence, no pagas nada.'
              },
              {
                q: '¿Es compatible con mi software actual?',
                a: 'NeoFarm se integra con REGA, SITRAN, ECOGAN y los principales software ganaderos. También exporta a Excel, PDF y tiene API abierta.'
              },
              {
                q: '¿Cómo funciona FarmMatch™?',
                a: 'Introduces los datos de tu rebaño y FarmMatch busca en nuestra base de datos de sementales y hembras. Calcula compatibilidad genética, predicción de heterosis y te muestra candidatos con fotos reales y EPDs verificados.'
              },
            ].map((faq, idx) => (
              <details key={idx} className="group border-b border-gray-200 pb-6">
                <summary className="flex justify-between items-center font-semibold text-lg cursor-pointer hover:text-[var(--green-700)]">
                  {faq.q}
                  <span className="ml-4 flex-shrink-0">+</span>
                </summary>
                <p className="mt-4 text-[var(--text-600)] leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 10: CTA FINAL */}
      <section className="py-28 px-6 bg-gradient-to-br from-[var(--green-900)] to-[var(--green-700)] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium mb-6">
            EMPIEZA HOY
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-normal mb-6" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Setup en 3 minutos. Sin tarjeta.
          </h2>
          
          <p className="text-xl mb-8 opacity-90 leading-relaxed">
            Paga tu primera factura solo si te merece la pena.<br />
            Y te aseguramos que te va a merecer la pena.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/wizard"
              className="px-8 py-4 bg-white text-[var(--green-900)] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Comenzar setup (3 min)
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Ver demo en vivo
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[var(--text-900)] text-gray-400 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--green-500)] flex items-center justify-center text-white font-bold text-xl">
                N
              </div>
              <span className="text-white text-xl font-semibold" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                neofarm.io
              </span>
            </div>
            <p className="text-sm">Ganadería inteligente para el siglo XXI</p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Producto</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
              <li><Link href="#modulos" className="hover:text-white">Módulos</Link></li>
              <li><Link href="#integraciones" className="hover:text-white">Integraciones</Link></li>
              <li><Link href="/genetics" className="hover:text-white">FarmMatch™</Link></li>
              <li><Link href="#precios" className="hover:text-white">Precios</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/docs" className="hover:text-white">Documentación</Link></li>
              <li><Link href="/api" className="hover:text-white">API</Link></li>
              <li><Link href="/status" className="hover:text-white">Estado del servicio</Link></li>
              <li><Link href="/changelog" className="hover:text-white">Changelog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">Sobre nosotros</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contacto</Link></li>
              <li><Link href="/press" className="hover:text-white">Prensa</Link></li>
              <li><Link href="/careers" className="hover:text-white">Empleo</Link></li>
              <li><Link href="/legal" className="hover:text-white">Legal</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div>© 2026 NeoFarm Technologies S.L. · Todos los derechos reservados</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white">Privacidad</Link>
            <Link href="/terms" className="hover:text-white">Términos</Link>
            <Link href="/cookies" className="hover:text-white">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
