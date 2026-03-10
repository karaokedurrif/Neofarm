/* ══════════════════════════════════════════════════════════════════
 *  BREED CATALOG — Heritage Breeds with Gompertz Parameters
 *  Avicultura de Selección · NeoFarm
 * ══════════════════════════════════════════════════════════════════ */

import type { BreedCatalogEntry } from './types';

export const BREED_CATALOG: BreedCatalogEntry[] = [
  {
    nombre: 'Malines',
    origen: 'Bélgica',
    descripcion: 'Raza pesada, excelente para capón. Gran talla y conformación.',
    pesoMachoKg: 5.5, pesoHembraKg: 4.0,
    huevosAnuales: 160, rendimientoCanal: 72,
    crecimiento: 'medio', rusticidad: 4, docilidad: 4,
    rasgosEspeciales: ['Gran talla', 'Excelente capón', 'Carne firme'],
    gompertzMacho: { A: 5.5, k: 0.018, t0: 65 },
    gompertzHembra: { A: 4.0, k: 0.018, t0: 63 },
  },
  {
    nombre: 'Dorking',
    origen: 'Inglaterra',
    descripcion: 'Cinco dedos, carne excepcional. Raza heritage gourmet por excelencia.',
    pesoMachoKg: 4.5, pesoHembraKg: 3.5,
    huevosAnuales: 170, rendimientoCanal: 70,
    crecimiento: 'lento', rusticidad: 3, docilidad: 5,
    rasgosEspeciales: ['Cinco dedos', 'Carne excepcional', 'Piel blanca'],
    gompertzMacho: { A: 4.5, k: 0.015, t0: 70 },
    gompertzHembra: { A: 3.5, k: 0.015, t0: 68 },
  },
  {
    nombre: 'Sulmtaler',
    origen: 'Austria',
    descripcion: 'Raza alpina de carne grasa infiltrada. Capón famoso en gastronomía.',
    pesoMachoKg: 4.0, pesoHembraKg: 3.0,
    huevosAnuales: 180, rendimientoCanal: 68,
    crecimiento: 'medio', rusticidad: 4, docilidad: 4,
    rasgosEspeciales: ['Grasa infiltrada', 'Sabor intenso', 'Copete característico'],
    gompertzMacho: { A: 4.0, k: 0.016, t0: 68 },
    gompertzHembra: { A: 3.0, k: 0.016, t0: 66 },
  },
  {
    nombre: 'Bresse',
    origen: 'Francia',
    descripcion: 'La reina de las aves gourmet. AOC francés. Patas azules.',
    pesoMachoKg: 3.0, pesoHembraKg: 2.5,
    huevosAnuales: 200, rendimientoCanal: 75,
    crecimiento: 'rapido', rusticidad: 3, docilidad: 3,
    rasgosEspeciales: ['Patas azules', 'Plumaje blanco', 'AOC gourmet', 'Crecimiento rápido heritage'],
    gompertzMacho: { A: 3.0, k: 0.022, t0: 55 },
    gompertzHembra: { A: 2.5, k: 0.022, t0: 53 },
  },
  {
    nombre: 'Bielefelder',
    origen: 'Alemania',
    descripcion: 'Auto-sexing al nacer, gran talla, dócil. Ideal como base funcional.',
    pesoMachoKg: 4.8, pesoHembraKg: 3.5,
    huevosAnuales: 220, rendimientoCanal: 68,
    crecimiento: 'rapido', rusticidad: 5, docilidad: 5,
    rasgosEspeciales: ['Auto-sexing', 'Gran rusticidad', 'Muy dócil', 'Buena ponedora'],
    gompertzMacho: { A: 4.8, k: 0.019, t0: 62 },
    gompertzHembra: { A: 3.5, k: 0.019, t0: 60 },
  },
  {
    nombre: 'Orpington',
    origen: 'Inglaterra',
    descripcion: 'Raza pesada, muy dócil. Aspecto majestuoso con plumaje abundante.',
    pesoMachoKg: 4.3, pesoHembraKg: 3.5,
    huevosAnuales: 180, rendimientoCanal: 65,
    crecimiento: 'medio', rusticidad: 3, docilidad: 5,
    rasgosEspeciales: ['Muy dócil', 'Plumaje abundante', 'Buen temperamento'],
    gompertzMacho: { A: 4.3, k: 0.016, t0: 67 },
    gompertzHembra: { A: 3.5, k: 0.016, t0: 65 },
  },
  {
    nombre: 'Sussex',
    origen: 'Inglaterra',
    descripcion: 'Dual purpose heritage. Equilibrio entre carne y huevos.',
    pesoMachoKg: 4.0, pesoHembraKg: 3.2,
    huevosAnuales: 240, rendimientoCanal: 70,
    crecimiento: 'medio', rusticidad: 4, docilidad: 4,
    rasgosEspeciales: ['Dual purpose', 'Buena ponedora', 'Resistente'],
    gompertzMacho: { A: 4.0, k: 0.017, t0: 65 },
    gompertzHembra: { A: 3.2, k: 0.017, t0: 63 },
  },
  {
    nombre: 'Faverolles',
    origen: 'Francia',
    descripcion: 'Cinco dedos, barba y patillas. Carne delicada tipo Bresse.',
    pesoMachoKg: 4.2, pesoHembraKg: 3.2,
    huevosAnuales: 180, rendimientoCanal: 70,
    crecimiento: 'medio', rusticidad: 3, docilidad: 5,
    rasgosEspeciales: ['Cinco dedos', 'Barba y patillas', 'Patas emplumadas', 'Carne delicada'],
    gompertzMacho: { A: 4.2, k: 0.017, t0: 66 },
    gompertzHembra: { A: 3.2, k: 0.017, t0: 64 },
  },
  {
    nombre: 'Pita Pinta Asturiana',
    origen: 'España (Asturias)',
    descripcion: 'Raza autóctona asturiana. Capón de pitu de caleya. Rusticidad extrema.',
    pesoMachoKg: 4.2, pesoHembraKg: 3.0,
    huevosAnuales: 150, rendimientoCanal: 68,
    crecimiento: 'lento', rusticidad: 5, docilidad: 3,
    rasgosEspeciales: ['Autóctona española', 'Capón de pitu', 'Muy rústica', 'Forrajeo excelente'],
    gompertzMacho: { A: 4.2, k: 0.016, t0: 68 },
    gompertzHembra: { A: 3.0, k: 0.016, t0: 66 },
  },
  {
    nombre: 'Brahma',
    origen: 'EE.UU. / Asia',
    descripcion: 'Gigante entre las aves. Patas emplumadas. Majestuosa y dócil.',
    pesoMachoKg: 5.0, pesoHembraKg: 4.0,
    huevosAnuales: 140, rendimientoCanal: 62,
    crecimiento: 'lento', rusticidad: 4, docilidad: 5,
    rasgosEspeciales: ['Gran talla', 'Patas emplumadas', 'Muy dócil', 'Crecimiento lento'],
    gompertzMacho: { A: 5.0, k: 0.013, t0: 75 },
    gompertzHembra: { A: 4.0, k: 0.013, t0: 73 },
  },
  {
    nombre: 'Castellana Negra',
    origen: 'España (Castilla)',
    descripcion: 'Raza autóctona castellana. Rústica, ponedora fiable. Plumaje negro iridiscente.',
    pesoMachoKg: 3.5, pesoHembraKg: 2.5,
    huevosAnuales: 200, rendimientoCanal: 65,
    crecimiento: 'medio', rusticidad: 5, docilidad: 3,
    rasgosEspeciales: ['Autóctona española', 'Vuela bien', 'Rústica', 'Buena ponedora invernal'],
    gompertzMacho: { A: 3.5, k: 0.018, t0: 60 },
    gompertzHembra: { A: 2.5, k: 0.018, t0: 58 },
  },
  {
    nombre: 'Andaluza Azul',
    origen: 'España (Andalucía)',
    descripcion: 'Plumaje azul pizarra. Genética de dilución interesante para cruces.',
    pesoMachoKg: 3.5, pesoHembraKg: 2.8,
    huevosAnuales: 180, rendimientoCanal: 66,
    crecimiento: 'medio', rusticidad: 4, docilidad: 3,
    rasgosEspeciales: ['Plumaje azul', 'Gen de dilución', 'Elegante'],
    gompertzMacho: { A: 3.5, k: 0.018, t0: 62 },
    gompertzHembra: { A: 2.8, k: 0.018, t0: 60 },
  },
];

/** Suggest breed names (autocomplete) */
export function suggestBreeds(query: string): string[] {
  const q = query.toLowerCase();
  const matches = BREED_CATALOG.filter(b => b.nombre.toLowerCase().includes(q)).map(b => b.nombre);
  // Always include cross types
  const crossTypes = ['Cruce F1', 'Cruce F2', 'Cruce F3+', 'Raza personalizada'];
  const crossMatches = crossTypes.filter(t => t.toLowerCase().includes(q));
  return [...matches, ...crossMatches];
}

/** Get Gompertz params for a breed */
export function getBreedGompertz(breedName: string, sex: 'M' | 'F'): { A: number; k: number; t0: number } | null {
  const breed = BREED_CATALOG.find(b => b.nombre.toLowerCase() === breedName.toLowerCase());
  if (!breed) return null;
  return sex === 'M' ? breed.gompertzMacho : breed.gompertzHembra;
}

/** Get breed catalog entry */
export function getBreedInfo(breedName: string): BreedCatalogEntry | undefined {
  return BREED_CATALOG.find(b => b.nombre.toLowerCase() === breedName.toLowerCase());
}

/** Estimate Gompertz params for a cross (mean of parents + heterosis) */
export function estimateCrossGompertz(
  breed1: string, breed2: string, sex: 'M' | 'F', heterosisFactor = 0.07
): { A: number; k: number; t0: number } {
  const p1 = getBreedGompertz(breed1, sex);
  const p2 = getBreedGompertz(breed2, sex);
  if (p1 && p2) {
    return {
      A: (p1.A + p2.A) / 2 * (1 + heterosisFactor),
      k: (p1.k + p2.k) / 2,
      t0: (p1.t0 + p2.t0) / 2,
    };
  }
  // Fallback if one or both breeds unknown
  const known = p1 || p2;
  if (known) return { ...known, A: known.A * (1 + heterosisFactor) };
  // Generic heritage chicken
  return sex === 'M'
    ? { A: 4.0, k: 0.017, t0: 65 }
    : { A: 3.0, k: 0.017, t0: 63 };
}

/* ── Adapter: BreedCatalogEntry → BreedProfile (for simulator) ── */
export interface BreedProfile {
  name: string;
  weight_m: number;
  weight_f: number;
  eggs_per_year: number;
  carcass_pct: number;
  growth: string;
  comb: string;
  origin?: string;
  description?: string;
  genetic_profile?: {
    plumage_loci: Record<string, string>;
    phenotype: string;
    comb_type: string;
    eye_color: string;
    special_traits?: string[];
  };
}

export function catalogToBreedProfile(entry: BreedCatalogEntry): BreedProfile {
  return {
    name: entry.nombre,
    weight_m: entry.pesoMachoKg,
    weight_f: entry.pesoHembraKg,
    eggs_per_year: entry.huevosAnuales,
    carcass_pct: entry.rendimientoCanal,
    growth: entry.crecimiento === 'rapido' ? 'rápido' : entry.crecimiento,
    comb: 'simple',
    origin: entry.origen,
    description: entry.descripcion,
  };
}
