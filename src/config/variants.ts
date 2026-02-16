export type LandingVariant = 'general' | 'bovine' | 'porcine';

export interface VariantConfig {
  logo: string;
  headline: string;
  subheadline: string;
  cta_primary: string;
  cta_secondary: string;
  hero_image: string;
  badges: string[];
  theme: {
    primary: string;
    accent: string;
  };
  demo_url?: string;
  modules: ModuleConfig[];
}

export interface ModuleConfig {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

export const VARIANTS: Record<LandingVariant, VariantConfig> = {
  general: {
    logo: 'NeoFarm',
    headline: 'Transforma tu granja en un gemelo digital',
    subheadline:
      'IoT LoRa/Mesh, visión IA y ganadería multi-especie en una sola plataforma conectada.',
    cta_primary: 'Comenzar setup (3 min)',
    cta_secondary: 'Ver demo en vivo',
    hero_image: '/hero-general.webp',
    badges: ['Ganadería multi-especie', 'Carbono MRV', 'Trazabilidad oficial'],
    theme: { primary: '#0F766E', accent: '#10B981' },
    modules: [
      {
        icon: '🐄',
        title: 'Vacuno',
        description: 'GPS LoRa, genética EPDs, carbono',
        features: ['Localización GPS', 'Genética avanzada', 'Créditos carbono'],
      },
      {
        icon: '🐷',
        title: 'Porcino',
        description: 'Sensores ambientales, IA vision, SIGE',
        features: ['IoT temperatura/gases', 'Trazabilidad ICA', 'Gestión purines'],
      },
      {
        icon: '🐓',
        title: 'Avícola',
        description: 'Clima inteligente, pesaje automático',
        features: ['Control ambiental', 'Trazabilidad huevos', 'Alertas sanitarias'],
      },
      {
        icon: '🐑',
        title: 'Ovino/Caprino',
        description: 'Pastoreo inteligente, producción lechera',
        features: ['GPS en montaña', 'Control ordeño', 'Trazabilidad queso'],
      },
    ],
  },
  bovine: {
    logo: 'NeoFarm · Vacuno',
    headline: 'Tu rebaño conectado en tiempo real',
    subheadline:
      'Localiza tus vacas por GPS, gestiona genética EPDs, calcula créditos de carbono y lleva la trazabilidad oficial sin papeles.',
    cta_primary: 'Ver demo vacuno',
    cta_secondary: 'Solicitar piloto',
    hero_image: '/hero-bovine.webp',
    badges: ['GPS LoRa en sierra', 'Genética EPDs', 'Carbono con satélite NDVI'],
    theme: { primary: '#1B4332', accent: '#40C057' },
    demo_url: 'https://app.neofarm.io/demo/bovine',
    modules: [
      {
        icon: '📍',
        title: 'GPS LoRa',
        description: 'Localización real de tu ganado en extensivo',
        features: [
          'Collares LoRa con 7 días autonomía',
          '15km alcance sin cobertura',
          'Alertas de geovallas y movimiento',
        ],
      },
      {
        icon: '🧬',
        title: 'Genética',
        description: 'EPDs, consanguinidad, cruces F1',
        features: [
          'Base de datos de 50+ razas',
          'Cálculo de heterosis y consanguinidad',
          'Predicción peso destete',
        ],
      },
      {
        icon: '🌱',
        title: 'Carbono MRV',
        description: 'Créditos de carbono verificados',
        features: [
          'NDVI satelital de pastizales',
          'Cálculo emisiones metano',
          'Certificados verificados',
        ],
      },
      {
        icon: '📋',
        title: 'Trazabilidad',
        description: 'REGA, SITRAN, DIB digital',
        features: ['Sincronización automática REGA', 'DIB en 1 click', 'Historial completo'],
      },
    ],
  },
  porcine: {
    logo: 'NeoFarm · Porcino',
    headline: 'Infraestructura inteligente para naves ganaderas',
    subheadline:
      'Sensores ambientales, visión IA, trazabilidad ICA en 1 click, SIGE digital y gestión de purines. Todo integrado.',
    cta_primary: 'Ver demo porcino',
    cta_secondary: 'Solicitar piloto',
    hero_image: '/hero-porcine.webp',
    badges: ['Sensores T°/NH₃/CO₂', 'IA Vision', 'SmartPurín'],
    theme: { primary: '#7C2D12', accent: '#F59E0B' },
    demo_url: 'https://app.neofarm.io/demo/porcine',
    modules: [
      {
        icon: '🌡️',
        title: 'IoT Barn',
        description: 'Sensores ambientales en tiempo real',
        features: [
          'Temperatura, humedad, NH₃, CO₂',
          'Alertas automáticas fuera de rango',
          'Histórico y gráficas',
        ],
      },
      {
        icon: '📹',
        title: 'IA Vision',
        description: 'Cámaras con detección inteligente',
        features: [
          'Conteo automático de animales',
          'Detección de peleas y cojeras',
          'Alertas mortalidad',
        ],
      },
      {
        icon: '📄',
        title: 'SIGE Digital',
        description: 'Los 11 planes del RD 306/2020',
        features: [
          'Plantillas pre-configuradas',
          'Actualización automática',
          'Cumplimiento normativo',
        ],
      },
      {
        icon: '♻️',
        title: 'SmartPurín',
        description: 'Gestión inteligente de purines',
        features: [
          'Nivel de fosa en tiempo real',
          'Calendario de abonado',
          'Potencial biogás',
        ],
      },
    ],
  },
};

export function getLandingVariant(hostname?: string): LandingVariant {
  // 1. Verificar query param ?variant=bovine|porcine|general (para debug)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const variantParam = urlParams.get('variant');
    if (variantParam === 'bovine' || variantParam === 'porcine' || variantParam === 'general') {
      // Guardar en localStorage para persistir
      localStorage.setItem('debug_variant', variantParam);
      return variantParam;
    }
    
    // 2. Verificar localStorage (si se estableció antes)
    const savedVariant = localStorage.getItem('debug_variant');
    if (savedVariant === 'bovine' || savedVariant === 'porcine' || savedVariant === 'general') {
      return savedVariant;
    }
  }

  // 3. Detección servidor-side o cliente-side por dominio
  const host = hostname || (typeof window !== 'undefined' ? window.location.hostname : '');

  if (host.includes('vacasdata')) return 'bovine';
  if (host.includes('porcdata')) return 'porcine';
  return 'general';
}
