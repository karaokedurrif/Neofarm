'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dna, Camera, Sparkles, Search, ChevronRight, X, ArrowRight, Download,
  Loader2, FlaskConical, BarChart3, Star, Eye, Microscope, RefreshCw,
  ChevronDown, ImageIcon, BookOpen
} from 'lucide-react';

/* ══════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════ */
const API_BASE = '/ext';

interface BreedProfile {
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

/* ── Image slug map: breeds that have real photos on the backend ── */
const BREED_IMG_SLUG: Record<string, { male?: string; female?: string }> = {
  'Bresse':                { male: 'bresse', female: 'bresse' },
  'Sulmtaler':             { male: 'sulmtaler', female: 'sulmtaler' },
  'Orpington':             { male: 'orpington', female: 'orpington' },
  'Plymouth Rock Barrada': { male: 'plymouth%20rock%20barrada', female: 'plymouth%20rock%20barrada' },
  'Sussex':                { male: 'sussex', female: 'sussex' },
  'Vorwerk':               { male: 'vorwerk', female: 'vorwerk' },
  'Andaluza':              { male: 'andaluza', female: 'andaluza' },
  'Brahma':                { male: 'brahma', female: 'brahma' },
  'Cornish':               { male: 'cornish', female: 'cornish' },
  'Castellana':            { female: 'castellana' },
  'Castellana Negra':      { female: 'castellana' },
};

function breedImgUrl(name: string, sex: 'male' | 'female'): string | null {
  const entry = BREED_IMG_SLUG[name];
  if (!entry) return null;
  const slug = sex === 'male' ? entry.male : entry.female;
  if (!slug) return entry.male ? `${API_BASE}/images/males/${entry.male}.jpg` : entry.female ? `${API_BASE}/images/females/${entry.female}.jpg` : null;
  return `${API_BASE}/images/${sex === 'male' ? 'males' : 'females'}/${slug}.jpg`;
}

/* ── Breed emoji fallback by category ── */
const BREED_EMOJI: Record<string, string> = {
  'Bresse': '🇫🇷', 'Sulmtaler': '🇦🇹', 'Orpington': '🇬🇧', 'Plymouth Rock Barrada': '🇺🇸',
  'Sussex': '🇬🇧', 'Vorwerk': '🇩🇪', 'Andaluza': '🇪🇸', 'Castellana': '🇪🇸', 'Castellana Negra': '🇪🇸',
  'Brahma': '🐘', 'Cornish': '💪', 'Cochin': '🐉', 'Rhode Island Red': '🇺🇸', 'New Hampshire': '🇺🇸',
  'Wyandotte': '🌸', 'Australorp': '🇦🇺', 'Marans': '🍫', 'Faverolles': '🧔', 'Dorking': '🏰',
  'Jersey Giant': '🦕', 'Euskal Oiloa': '🇪🇸', 'Pita Pinta Asturiana': '🇪🇸', 'Prat Leonada': '🇪🇸',
  'Penedesenca Negra': '🇪🇸', 'Mos': '🇪🇸', 'Malines': '🇧🇪', 'Ayam Cemani': '🖤', 'Delaware': '🇺🇸',
  'Naked Neck': '🦃', 'Naked Neck (Cuello Pelado)': '🦃', 'Leghorn': '🇮🇹', 'Minorca': '🇪🇸',
  'Welsummer': '🇳🇱', 'Barnevelder': '🇳🇱', 'Empordanesa': '🇪🇸', 'Sobrarbe': '🏔️',
  'Combatiente Español': '⚔️', 'La Flèche': '😈', 'Houdan': '🎩', 'Crèvecœur': '🖤',
  'Barbezieux': '🇫🇷', 'Hamburg': '🇩🇪', 'Campine': '🇧🇪', 'Araucana': '🥚', 'Bielefelder': '🇩🇪',
};

/* ── Normalize API breed to our interface ── */
function normalizeBreed(raw: any): BreedProfile {
  return {
    name: raw.name || raw.breed_name || 'Sin nombre',
    weight_m: raw.weight_m ?? raw.weight_male_kg ?? 0,
    weight_f: raw.weight_f ?? raw.weight_female_kg ?? 0,
    eggs_per_year: raw.eggs_per_year ?? 0,
    carcass_pct: raw.carcass_pct ?? raw.carcass_yield_pct ?? 0,
    growth: raw.growth ?? (raw.growth_rate_index >= 85 ? 'rápido' : raw.growth_rate_index >= 60 ? 'medio' : 'lento'),
    comb: raw.comb ?? raw.comb_type ?? 'simple',
    origin: raw.origin ?? '',
    description: raw.description ?? '',
    genetic_profile: raw.genetic_profile,
  };
}

type CrossType = 'F0xF0' | 'F1xF0' | 'F1xF1' | 'F2xF1' | 'F2xF0' | 'F2xF2';
type Sexo = 'male' | 'female';
type ImgStyle = 'photorealistic' | 'artistic' | 'professional';
type Tab = 'gallery' | 'cross' | 'library';

interface PredictResult {
  cross_type: string;
  padre: string;
  madre: string;
  f1_prediction: {
    weight_m: number;
    weight_f: number;
    eggs_per_year: number;
    carcass_pct: number;
    growth: string;
    heterosis: number;
    capon_score?: number;
  };
  recommendation?: string;
}

interface GeneticAnalysis {
  color_genetics?: any;
  f1_prediction?: any;
  special_traits?: any;
  production_morphology?: any;
}

interface BLUPResult {
  success?: boolean;
  cross_name?: string;
  additive_means?: Record<string, number>;
  blup_adjusted_means?: Record<string, number>;
  intervals?: any;
  capon_score_traditional?: number;
  capon_score_adjusted?: number;
  ebvs?: any;
  gebvs?: any;
  heterosis_effects?: Record<string, number>;
  selection_index?: number;
  parent_rankings?: any;
  breeding_accuracy?: number;
  accuracy?: number;
  inbreeding_effects?: any;
  technical_report?: string;
  analysis_metadata?: {
    method?: string;
    used_pedigree?: boolean;
    used_genotypes?: boolean;
    n_offspring?: number;
    traits_evaluated?: string[];
  };
  [key: string]: any;
}

/* ══════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════ */
export default function SimulatorPage() {
  const [tab, setTab] = useState<Tab>('gallery');
  const [breeds, setBreeds] = useState<BreedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cross config
  const [crossType, setCrossType] = useState<CrossType>('F0xF0');
  const [padre, setPadre] = useState('');
  const [madre, setMadre] = useState('');

  // Results
  const [predResult, setPredResult] = useState<PredictResult | null>(null);
  const [genAnalysis, setGenAnalysis] = useState<GeneticAnalysis | null>(null);
  const [blupResult, setBlupResult] = useState<BLUPResult | null>(null);
  const [genImage, setGenImage] = useState<string | null>(null);
  const [imgError, setImgError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [generatingImg, setGeneratingImg] = useState(false);
  const [analyzingBLUP, setAnalyzingBLUP] = useState(false);

  // Image options
  const [imgSex, setImgSex] = useState<Sexo>('male');
  const [imgStyle, setImgStyle] = useState<ImgStyle>('photorealistic');

  // Gallery detail
  const [selectedBreed, setSelectedBreed] = useState<BreedProfile | null>(null);
  const [breedImgSex, setBreedImgSex] = useState<'male' | 'female'>('male');

  // Hybrid library
  const [hybrids, setHybrids] = useState<any[]>([]);
  const [hybridTab, setHybridTab] = useState<'F1' | 'F2' | 'F3'>('F1');

  // Gallery search & filter
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'pesada' | 'ligera' | 'española' | 'francesa'>('all');

  /* ── Fetch breeds ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/breeds`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const raw = Array.isArray(data) ? data : data.breeds || [];
        setBreeds(raw.map(normalizeBreed));
        setLoading(false);
      } catch (e: any) {
        console.error('Breeds fetch error:', e);
        // Fallback demo breeds — 42 razas para capones gourmet
        setBreeds([
          { name: 'Bresse', weight_m: 4.5, weight_f: 3.5, eggs_per_year: 200, carcass_pct: 70, growth: 'medio', comb: 'simple', origin: 'Francia', description: 'La "Reina de las gallinas" francesa. Carne marmoleada excepcional, ideal para capones de alta gama. AOC protegida.' },
          { name: 'Sulmtaler', weight_m: 4.0, weight_f: 3.0, eggs_per_year: 180, carcass_pct: 68, growth: 'medio', comb: 'nuez', origin: 'Austria', description: 'Raza austríaca de doble propósito. Carne jugosa y sabrosa, excelente para capones tradicionales.' },
          { name: 'Orpington', weight_m: 4.5, weight_f: 3.5, eggs_per_year: 160, carcass_pct: 65, growth: 'lento', comb: 'simple', origin: 'Reino Unido', description: 'Ave grande y dócil con carne tierna. Plumaje denso, crecimiento lento que favorece infiltración grasa.' },
          { name: 'Plymouth Rock Barrada', weight_m: 4.3, weight_f: 3.3, eggs_per_year: 200, carcass_pct: 72, growth: 'rápido', comb: 'simple', origin: 'Estados Unidos', description: 'Raza americana versátil. Excelente conversión alimenticia, carne sabrosa y alto rendimiento en canal.' },
          { name: 'Cochin', weight_m: 4.8, weight_f: 3.8, eggs_per_year: 140, carcass_pct: 68, growth: 'lento', comb: 'guisante', origin: 'China', description: 'Gigante asiática con plumaje abundante. Carne tierna con buena infiltración grasa, ideal para cruces.' },
          { name: 'Sussex', weight_m: 4.2, weight_f: 3.2, eggs_per_year: 210, carcass_pct: 70, growth: 'medio', comb: 'simple', origin: 'Reino Unido', description: 'Raza británica clásica. Carne blanca de calidad, temperamento tranquilo, excelente ponedora.' },
          { name: 'Vorwerk', weight_m: 3.5, weight_f: 2.8, eggs_per_year: 170, carcass_pct: 66, growth: 'medio', comb: 'simple', origin: 'Alemania', description: 'Alemana resistente con plumaje leonado-negro. Carne sabrosa, buena forrajeadora.' },
          { name: 'Andaluza', weight_m: 3.0, weight_f: 2.5, eggs_per_year: 180, carcass_pct: 64, growth: 'rápido', comb: 'simple', origin: 'España', description: 'Mediterránea ligera y vivaz. Plumaje azul-grisáceo, adaptada a climas cálidos.' },
          { name: 'Castellana Negra', weight_m: 3.2, weight_f: 2.6, eggs_per_year: 190, carcass_pct: 67, growth: 'rápido', comb: 'simple', origin: 'España', description: 'Autóctona española rústica. Carne sabrosa y fibrosa, excelente adaptación a extensivo.' },
          { name: 'Brahma', weight_m: 5.0, weight_f: 4.0, eggs_per_year: 140, carcass_pct: 68, growth: 'lento', comb: 'guisante', origin: 'India', description: 'Ave gigante de origen asiático. Gran volumen de carne, temperamento dócil, patas emplumadas.' },
          { name: 'Cornish', weight_m: 4.0, weight_f: 2.5, eggs_per_year: 80, carcass_pct: 75, growth: 'medio', comb: 'guisante', origin: 'Reino Unido', description: 'Base genética del pollo industrial. Pecho ancho y musculoso, máximo rendimiento en canal.' },
          { name: 'Rhode Island Red', weight_m: 3.9, weight_f: 2.9, eggs_per_year: 220, carcass_pct: 70, growth: 'rápido', comb: 'simple', origin: 'Estados Unidos', description: 'Ponedora prolífica y resistente. Plumaje rojo caoba, excelente doble propósito.' },
          { name: 'New Hampshire', weight_m: 3.8, weight_f: 2.8, eggs_per_year: 200, carcass_pct: 72, growth: 'rápido', comb: 'simple', origin: 'Estados Unidos', description: 'Derivada de Rhode Island, seleccionada para carne. Crecimiento rápido, buena canal.' },
          { name: 'Wyandotte', weight_m: 3.8, weight_f: 2.8, eggs_per_year: 180, carcass_pct: 70, growth: 'medio', comb: 'rosa', origin: 'Estados Unidos', description: 'Robusta con cresta rosa, adaptada a climas fríos. Plumaje ribeteado decorativo.' },
          { name: 'Australorp', weight_m: 3.9, weight_f: 3.1, eggs_per_year: 250, carcass_pct: 68, growth: 'rápido', comb: 'simple', origin: 'Australia', description: 'Récord mundial de puesta (364 huevos/año). Plumaje negro con reflejos verdes.' },
          { name: 'Marans', weight_m: 3.5, weight_f: 2.6, eggs_per_year: 150, carcass_pct: 70, growth: 'medio', comb: 'simple', origin: 'Francia', description: 'Famosa por sus huevos chocolate oscuro. Carne sabrosa, plumaje cobrizo oscuro.' },
          { name: 'Faverolles', weight_m: 4.0, weight_f: 3.3, eggs_per_year: 160, carcass_pct: 68, growth: 'lento', comb: 'simple', origin: 'Francia', description: 'Francesa con barba y 5 dedos. Carne fina y delicada, temperamento dócil.' },
          { name: 'Dorking', weight_m: 4.5, weight_f: 3.6, eggs_per_year: 140, carcass_pct: 70, growth: 'lento', comb: 'simple', origin: 'Reino Unido', description: 'Una de las razas más antiguas de Europa. 5 dedos, carne blanca de textura excepcional.' },
          { name: 'Jersey Giant', weight_m: 5.5, weight_f: 4.5, eggs_per_year: 180, carcass_pct: 72, growth: 'lento', comb: 'simple', origin: 'Estados Unidos', description: 'La raza de gallina más grande. Creada como alternativa al pavo, crecimiento lento pero gran volumen.' },
          { name: 'Euskal Oiloa', weight_m: 4.0, weight_f: 2.9, eggs_per_year: 200, carcass_pct: 68, growth: 'medio', comb: 'simple', origin: 'País Vasco', description: 'Raza autóctona vasca, "Gallina del País". Carne de calidad, resistente y buena ponedora.' },
          { name: 'Pita Pinta Asturiana', weight_m: 4.3, weight_f: 2.8, eggs_per_year: 180, carcass_pct: 70, growth: 'medio', comb: 'simple', origin: 'Asturias', description: 'Raza asturiana en peligro de extinción. Plumaje moteado, carne sabrosa, gran rusticidad.' },
          { name: 'Prat Leonada', weight_m: 3.5, weight_f: 2.5, eggs_per_year: 180, carcass_pct: 70, growth: 'medio', comb: 'simple', origin: 'Cataluña', description: 'Raza catalana premium. Piel y tarsos rosados, carne fina con Denominación de Calidad.' },
          { name: 'Penedesenca Negra', weight_m: 3.0, weight_f: 2.3, eggs_per_year: 160, carcass_pct: 65, growth: 'rápido', comb: 'simple', origin: 'Cataluña', description: 'Catalana de plumaje negro intenso. Huevos de cáscara muy oscura, rústica y forrajeadora.' },
          { name: 'Mos', weight_m: 4.0, weight_f: 3.0, eggs_per_year: 190, carcass_pct: 72, growth: 'lento', comb: 'guisante', origin: 'Galicia', description: 'Autóctona gallega, cresta en guisante. Carne excepcional para capones, adaptada a clima atlántico.' },
          { name: 'Malines', weight_m: 5.0, weight_f: 3.8, eggs_per_year: 150, carcass_pct: 72, growth: 'lento', comb: 'simple', origin: 'Bélgica', description: 'Gigante belga, base del "Coucou de Malines". Carne fina y abundante, ideal para capones premium.' },
          { name: 'Ayam Cemani', weight_m: 2.0, weight_f: 1.4, eggs_per_year: 140, carcass_pct: 60, growth: 'medio', comb: 'simple', origin: 'Indonesia', description: 'Gallina negra total (piel, huesos, carne). Fibromelanosis, ave ornamental de gran valor.' },
          { name: 'Delaware', weight_m: 3.8, weight_f: 2.8, eggs_per_year: 200, carcass_pct: 72, growth: 'rápido', comb: 'simple', origin: 'Estados Unidos', description: 'Cruce de New Hampshire × Plymouth Rock. Plumaje blanco colombino, eficiente para carne.' },
          { name: 'Naked Neck', weight_m: 3.5, weight_f: 2.5, eggs_per_year: 160, carcass_pct: 72, growth: 'medio', comb: 'simple', origin: 'Transilvania', description: 'Cuello desnudo sin plumas. Tolerante al calor, fácil desplume, alto rendimiento en canal.' },
          { name: 'Leghorn', weight_m: 2.5, weight_f: 1.8, eggs_per_year: 280, carcass_pct: 62, growth: 'rápido', comb: 'simple', origin: 'Italia', description: 'La ponedora mediterránea por excelencia. Ligera, nerviosa, récord de producción de huevos blancos.' },
          { name: 'Minorca', weight_m: 3.5, weight_f: 2.5, eggs_per_year: 200, carcass_pct: 62, growth: 'medio', comb: 'simple', origin: 'España', description: 'Originaria de Menorca. Ave elegante con orejillas blancas grandes, huevos blancos de gran tamaño.' },
          { name: 'Welsummer', weight_m: 3.2, weight_f: 2.5, eggs_per_year: 170, carcass_pct: 68, growth: 'medio', comb: 'simple', origin: 'Países Bajos', description: 'Holandesa de plumaje perdiz. Huevos de cáscara terracota moteada, dócil y decorativa.' },
          { name: 'Barnevelder', weight_m: 3.5, weight_f: 2.8, eggs_per_year: 180, carcass_pct: 68, growth: 'medio', comb: 'simple', origin: 'Países Bajos', description: 'Holandesa de plumaje doble-ribeteado. Huevos marrón chocolate, buen doble propósito.' },
          { name: 'Empordanesa', weight_m: 3.2, weight_f: 2.4, eggs_per_year: 160, carcass_pct: 66, growth: 'medio', comb: 'simple', origin: 'Cataluña', description: 'Raza catalana del Empordà. Rústica de plumaje variado, adaptada a sistemas extensivos.' },
          { name: 'Sobrarbe', weight_m: 3.5, weight_f: 2.8, eggs_per_year: 150, carcass_pct: 67, growth: 'lento', comb: 'simple', origin: 'Aragón', description: 'Raza aragonesa en recuperación. Plumaje trigueño, adaptada a clima montañoso del Pirineo.' },
          { name: 'La Flèche', weight_m: 4.0, weight_f: 3.0, eggs_per_year: 150, carcass_pct: 72, growth: 'medio', comb: 'en V', origin: 'Francia', description: 'Francesa con cresta en V ("cuernos del diablo"). Carne blanca exquisita, rara y valiosa.' },
          { name: 'Houdan', weight_m: 3.5, weight_f: 2.5, eggs_per_year: 170, carcass_pct: 68, growth: 'medio', comb: 'en V', origin: 'Francia', description: 'Francesa con moño y 5 dedos. Carne fina y delicada, raza histórica de mesa de París.' },
          { name: 'Crèvecœur', weight_m: 4.0, weight_f: 3.0, eggs_per_year: 140, carcass_pct: 70, growth: 'lento', comb: 'en V', origin: 'Francia', description: 'Una de las razas francesas más antiguas. Plumaje negro, moño y barba, carne delicada.' },
          { name: 'Barbezieux', weight_m: 4.5, weight_f: 3.5, eggs_per_year: 180, carcass_pct: 72, growth: 'medio', comb: 'simple', origin: 'Francia', description: 'La gallina más alta de Francia. Cresta grande, tarsos oscuros, carne sabrosa y abundante.' },
          { name: 'Hamburg', weight_m: 2.5, weight_f: 2.0, eggs_per_year: 200, carcass_pct: 62, growth: 'rápido', comb: 'rosa', origin: 'Alemania', description: 'Elegante ave de plumaje lentejuelado. Cresta en rosa, ligera y nerviosa, buena ponedora.' },
          { name: 'Campine', weight_m: 2.5, weight_f: 2.0, eggs_per_year: 180, carcass_pct: 62, growth: 'rápido', comb: 'simple', origin: 'Bélgica', description: 'Belga ligera con plumaje lentejuelado dorado o plateado. Ave ornamental y ponedora.' },
          { name: 'Araucana', weight_m: 2.8, weight_f: 2.2, eggs_per_year: 170, carcass_pct: 66, growth: 'medio', comb: 'guisante', origin: 'Chile', description: 'Única raza que pone huevos azules/verdes. Aretes y sin cola, genética única sudamericana.' },
          { name: 'Bielefelder', weight_m: 4.2, weight_f: 3.2, eggs_per_year: 220, carcass_pct: 70, growth: 'rápido', comb: 'simple', origin: 'Alemania', description: 'Alemana moderna autosexable al nacer. Gran tamaño, carne sabrosa, excelente doble propósito.' },
        ]);
        setError('Usando catálogo demo — API no disponible');
        setLoading(false);
      }
    })();
  }, []);

  /* ── Fetch hybrids ── */
  useEffect(() => {
    if (tab !== 'library') return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/saved-hybrids`);
        if (res.ok) setHybrids(await res.json());
      } catch {}
    })();
  }, [tab]);

  /* ── Predict F1 ── */
  const predictCross = useCallback(async () => {
    if (!padre || !madre) return;
    setPredicting(true);
    setPredResult(null); setGenAnalysis(null); setBlupResult(null); setGenImage(null);
    try {
      const [predRes, genRes] = await Promise.all([
        fetch(`${API_BASE}/api/predict-f1`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parentA: padre, parentB: madre, cross_type: crossType }),
        }),
        fetch(`${API_BASE}/api/genetic-analysis`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ male_breed: padre, female_breed: madre }),
        }),
      ]);
      if (predRes.ok) {
        const raw = await predRes.json();
        const m = raw.means || {};
        const gri = m.growth_rate_index ?? 50;
        setPredResult({
          cross_type: crossType, padre, madre,
          f1_prediction: {
            weight_m: +(m.body_weight_male_kg ?? 0).toFixed(1),
            weight_f: +(m.body_weight_female_kg ?? 0).toFixed(1),
            eggs_per_year: Math.round(m.eggs_per_year ?? 0),
            carcass_pct: +(m.carcass_yield_pct ?? 0).toFixed(1),
            growth: gri >= 80 ? 'rápido' : gri >= 60 ? 'medio' : 'lento',
            heterosis: 0,
            capon_score: raw.capon_score ?? undefined,
          },
          recommendation: raw.phenotype
            ? `Fenotipo F1: plumaje ${raw.phenotype.plumage}, cresta ${raw.phenotype.comb_type}, piel ${raw.phenotype.skin_color}`
            : undefined,
        });
      }
      if (genRes.ok) {
        const raw = await genRes.json();
        setGenAnalysis({
          color_genetics: raw.genetic_analysis,
          f1_prediction: raw.f1_prediction,
          special_traits: raw.special_traits,
          production_morphology: raw.production_morphology,
        });
      }
    } catch (e) {
      console.error('Predict error:', e);
      // Offline fallback
      const p = breeds.find(b => b.name === padre);
      const m = breeds.find(b => b.name === madre);
      if (p && m) {
        setPredResult({
          cross_type: crossType,
          padre, madre,
          f1_prediction: {
            weight_m: +((p.weight_m + m.weight_m) / 2 * 1.05).toFixed(1),
            weight_f: +((p.weight_f + m.weight_f) / 2 * 1.05).toFixed(1),
            eggs_per_year: Math.round((p.eggs_per_year + m.eggs_per_year) / 2),
            carcass_pct: +((p.carcass_pct + m.carcass_pct) / 2).toFixed(1),
            growth: 'medio-rápido',
            heterosis: 12,
            capon_score: 7.5,
          },
          recommendation: 'Predicción offline — conecta con la API para análisis completo.',
        });
      }
    }
    setPredicting(false);
  }, [padre, madre, crossType, breeds]);

  /* ── BLUP analysis ── */
  const runBLUP = useCallback(async () => {
    if (!padre || !madre) return;
    setAnalyzingBLUP(true);
    try {
      const res = await fetch(`${API_BASE}/api/evaluate-breeding-values`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ breed_a: padre, breed_b: madre }),
      });
      if (res.ok) {
        const raw = await res.json();
        setBlupResult({ ...raw, accuracy: raw.breeding_accuracy });
      }
    } catch {}
    setAnalyzingBLUP(false);
  }, [padre, madre]);

  /* ── Generate image ── */
  const generateImage = useCallback(async () => {
    if (!padre || !madre) return;
    setGeneratingImg(true); setGenImage(null); setImgError(null);
    try {
      const res = await fetch(`${API_BASE}/api/generate-genetic-image`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ male_breed: padre, female_breed: madre, sex: imgSex, style: imgStyle }),
      });
      if (res.ok) {
        const data = await res.json();
        setGenImage(data.image_url || data.url || data.image || null);
      } else {
        setImgError('No se pudo generar la imagen. El servicio de IA (Replicate) no está disponible en este momento.');
      }
    } catch (e) {
      console.error('Image gen error:', e);
      setImgError('Error de conexión al generar la imagen.');
    }
    setGeneratingImg(false);
  }, [padre, madre, imgSex, imgStyle]);

  const CROSS_TYPES: { value: CrossType; label: string; desc: string }[] = [
    { value: 'F0xF0', label: 'F0 × F0', desc: 'Razas puras' },
    { value: 'F1xF0', label: 'F1 × F0', desc: 'Retrocruce (BC1)' },
    { value: 'F1xF1', label: 'F1 × F1', desc: 'Segunda generación' },
    { value: 'F2xF1', label: 'F2 × F1', desc: 'Cruce mixto' },
    { value: 'F2xF0', label: 'F2 × F0', desc: 'Retrocruce F2' },
    { value: 'F2xF2', label: 'F2 × F2', desc: 'Tercera generación' },
  ];

  if (loading) return (
    <div className="nf-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary-500)' }} />
      <span style={{ marginLeft: 8, color: 'var(--neutral-600)' }}>Cargando catálogo de razas...</span>
    </div>
  );

  return (
    <div className="nf-content" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FlaskConical size={22} style={{ color: 'var(--primary-500)' }} />
          Simulador Genético
        </h1>
        <p style={{ fontSize: 13, color: 'var(--neutral-500)', margin: '4px 0 0' }}>
          Catálogo de {breeds.length} razas — cruza, analiza y genera imágenes con IA
        </p>
        {error && <div style={{ fontSize: 11, color: 'var(--warn)', marginTop: 4 }}>{error}</div>}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid var(--neutral-100)', paddingBottom: 0 }}>
        {([
          { key: 'gallery' as Tab, label: 'Catálogo de Razas', icon: BookOpen },
          { key: 'cross' as Tab, label: 'Simulador de Cruces', icon: Dna },
          { key: 'library' as Tab, label: 'Biblioteca Híbridos', icon: Star },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 16px', fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
            color: tab === t.key ? 'var(--primary-600)' : 'var(--neutral-500)',
            background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid var(--primary-500)' : '2px solid transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: -2,
          }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════ GALLERY TAB ═══════════ */}
      {tab === 'gallery' && (
        <div>
          {/* Search & Filter bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
              <input
                className="nf-input" placeholder="Buscar raza..."
                value={gallerySearch} onChange={e => setGallerySearch(e.target.value)}
                style={{ width: '100%', paddingLeft: 30 }}
              />
            </div>
            {[
              { k: 'all', l: 'Todas' },
              { k: 'pesada', l: '🐔 Pesadas (>3.5kg)' },
              { k: 'ligera', l: '🐤 Ligeras (<3kg)' },
              { k: 'española', l: '🇪🇸 Españolas' },
              { k: 'francesa', l: '🇫🇷 Francesas' },
            ].map(f => (
              <button key={f.k} onClick={() => setGalleryFilter(f.k as any)} style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: galleryFilter === f.k ? 700 : 500,
                background: galleryFilter === f.k ? 'var(--primary-500)' : 'var(--neutral-50)',
                color: galleryFilter === f.k ? 'white' : 'var(--neutral-600)',
                border: galleryFilter === f.k ? '1px solid var(--primary-600)' : '1px solid var(--neutral-200)',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                {f.l}
              </button>
            ))}
            <span style={{ fontSize: 11, color: 'var(--neutral-400)', marginLeft: 'auto' }}>
              {(() => {
                const spanishOrigins = ['España','Cataluña','Galicia','Asturias','País Vasco','Aragón'];
                const frenchOrigins = ['Francia'];
                const filtered = breeds.filter(b => {
                  const q = gallerySearch.toLowerCase();
                  if (q && !b.name.toLowerCase().includes(q) && !(b.origin || '').toLowerCase().includes(q)) return false;
                  if (galleryFilter === 'pesada' && b.weight_m < 3.5) return false;
                  if (galleryFilter === 'ligera' && b.weight_m >= 3.0) return false;
                  if (galleryFilter === 'española' && !spanishOrigins.includes(b.origin || '')) return false;
                  if (galleryFilter === 'francesa' && !frenchOrigins.includes(b.origin || '')) return false;
                  return true;
                });
                return `${filtered.length} razas`;
              })()}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {breeds.filter(b => {
              const spanishOrigins = ['España','Cataluña','Galicia','Asturias','País Vasco','Aragón'];
              const frenchOrigins = ['Francia'];
              const q = gallerySearch.toLowerCase();
              if (q && !b.name.toLowerCase().includes(q) && !(b.origin || '').toLowerCase().includes(q)) return false;
              if (galleryFilter === 'pesada' && b.weight_m < 3.5) return false;
              if (galleryFilter === 'ligera' && b.weight_m >= 3.0) return false;
              if (galleryFilter === 'española' && !spanishOrigins.includes(b.origin || '')) return false;
              if (galleryFilter === 'francesa' && !frenchOrigins.includes(b.origin || '')) return false;
              return true;
            }).map(breed => {
              // Mini radar chart data (normalize 0-1)
              const radarData = [
                { label: 'Peso', value: Math.min(1, breed.weight_m / 5.5) },
                { label: 'Huevos', value: Math.min(1, breed.eggs_per_year / 280) },
                { label: 'Canal', value: Math.min(1, breed.carcass_pct / 80) },
                { label: 'Crec.', value: breed.growth === 'rápido' ? 0.9 : breed.growth === 'medio' ? 0.6 : 0.3 },
              ];
              const cx = 40, cy = 36, r = 28;
              const radarPoints = radarData.map((d, i) => {
                const angle = (Math.PI * 2 * i) / radarData.length - Math.PI / 2;
                return `${cx + r * d.value * Math.cos(angle)},${cy + r * d.value * Math.sin(angle)}`;
              }).join(' ');
              const radarAxes = radarData.map((_, i) => {
                const angle = (Math.PI * 2 * i) / radarData.length - Math.PI / 2;
                return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
              });

              return (
                <div key={breed.name} onClick={() => setSelectedBreed(breed)} style={{
                  background: 'white', borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                  border: '1px solid var(--neutral-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  transition: 'transform .15s, box-shadow .15s',
                  display: 'flex', flexDirection: 'row',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; }}
                >
                  {/* Left: Photo */}
                  <div style={{ width: 110, minHeight: 130, flexShrink: 0, background: '#f8f5f0', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {breedImgUrl(breed.name, 'male') ? (
                      <>
                        <img
                          src={breedImgUrl(breed.name, 'male')!}
                          alt={breed.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', inset: 0, padding: 4 }}
                          onError={e => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const sib = (e.target as HTMLImageElement).nextElementSibling;
                            if (sib) (sib as HTMLElement).style.display = 'flex';
                          }}
                        />
                        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                          {BREED_EMOJI[breed.name] || '🐓'}
                        </div>
                      </>
                    ) : (
                      <span style={{ fontSize: 40 }}>{BREED_EMOJI[breed.name] || '🐓'}</span>
                    )}
                  </div>

                  {/* Right: Info + mini radar */}
                  <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>{breed.name}</div>
                      {breed.origin && <div style={{ fontSize: 10, color: 'var(--neutral-400)', marginTop: 1 }}>📍 {breed.origin}</div>}
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, fontSize: 10, color: 'var(--neutral-500)', flexWrap: 'wrap' }}>
                        {breed.weight_m > 0 && <span>♂{breed.weight_m}kg</span>}
                        {breed.weight_f > 0 && <span>♀{breed.weight_f}kg</span>}
                        {breed.eggs_per_year > 0 && <span>🥚{breed.eggs_per_year}</span>}
                        {breed.carcass_pct > 0 && <span>{breed.carcass_pct}%</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: breed.growth === 'rápido' ? '#ECFDF5' : breed.growth === 'lento' ? '#FEF3C7' : '#EFF6FF', color: breed.growth === 'rápido' ? '#059669' : breed.growth === 'lento' ? '#92400E' : '#2563EB', fontWeight: 600 }}>
                          {breed.growth}
                        </span>
                        <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'var(--neutral-50)', color: 'var(--neutral-500)' }}>
                          {breed.comb}
                        </span>
                      </div>
                      {breed.description && (
                        <div style={{ fontSize: 10, color: 'var(--neutral-400)', marginTop: 4, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                          {breed.description}
                        </div>
                      )}
                    </div>
                    {/* Mini SVG radar chart */}
                    <svg width={80} height={72} viewBox="0 0 80 72" style={{ marginTop: 4, alignSelf: 'flex-end' }}>
                      {/* Grid */}
                      {[0.33, 0.66, 1].map(s => (
                        <polygon key={s} points={radarData.map((_, i) => {
                          const angle = (Math.PI * 2 * i) / radarData.length - Math.PI / 2;
                          return `${cx + r * s * Math.cos(angle)},${cy + r * s * Math.sin(angle)}`;
                        }).join(' ')} fill="none" stroke="var(--neutral-200)" strokeWidth={0.5} />
                      ))}
                      {radarAxes.map((a, i) => (
                        <line key={i} x1={cx} y1={cy} x2={a.x} y2={a.y} stroke="var(--neutral-200)" strokeWidth={0.5} />
                      ))}
                      {/* Data fill */}
                      <polygon points={radarPoints} fill="rgba(176,125,43,0.2)" stroke="var(--primary-500)" strokeWidth={1.2} />
                      {/* Labels */}
                      {radarData.map((d, i) => {
                        const angle = (Math.PI * 2 * i) / radarData.length - Math.PI / 2;
                        const lx = cx + (r + 10) * Math.cos(angle);
                        const ly = cy + (r + 10) * Math.sin(angle);
                        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="var(--neutral-400)">{d.label}</text>;
                      })}
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Breed detail modal */}
          {selectedBreed && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
            }} onClick={() => setSelectedBreed(null)}>
              <div onClick={e => e.stopPropagation()} style={{
                background: 'white', borderRadius: 16, width: 560, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              }}>
                {/* Photo area — full breed image */}
                <div style={{ position: 'relative', height: 300, background: '#f8f5f0', borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {breedImgUrl(selectedBreed.name, breedImgSex) ? (
                    <>
                      <img
                        src={breedImgUrl(selectedBreed.name, breedImgSex)!}
                        alt={`${selectedBreed.name} ${breedImgSex === 'male' ? 'macho' : 'hembra'}`}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; const sib = (e.target as HTMLImageElement).nextElementSibling; if (sib) (sib as HTMLElement).style.display = 'flex'; }}
                      />
                      <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>
                        {BREED_EMOJI[selectedBreed.name] || '🐓'}
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: 80 }}>{BREED_EMOJI[selectedBreed.name] || '🐓'}</span>
                  )}
                  {/* Sex toggle */}
                  <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4 }}>
                    {(['male', 'female'] as const).map(s => (
                      <button key={s} onClick={() => setBreedImgSex(s)} style={{
                        padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: breedImgSex === s ? '#B07D2B' : 'rgba(255,255,255,0.92)',
                        color: breedImgSex === s ? 'white' : 'var(--neutral-700)',
                        border: 'none', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                      }}>
                        {s === 'male' ? '♂ Macho' : '♀ Hembra'}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setSelectedBreed(null)} style={{
                    position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.92)',
                    border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                  }}>
                    <X size={16} />
                  </button>
                  {/* Photo credit hint */}
                  {breedImgUrl(selectedBreed.name, breedImgSex) && (
                    <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 9, color: 'rgba(0,0,0,0.35)', background: 'rgba(255,255,255,0.6)', padding: '2px 6px', borderRadius: 4 }}>
                      Foto generada con IA
                    </div>
                  )}
                </div>

                <div style={{ padding: 20 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 4 }}>{selectedBreed.name}</h2>
                  {selectedBreed.origin && <div style={{ fontSize: 13, color: 'var(--neutral-500)', marginBottom: 6 }}>📍 Origen: {selectedBreed.origin}</div>}
                  {selectedBreed.description && (
                    <div style={{ fontSize: 13, color: 'var(--neutral-600)', lineHeight: 1.6, marginBottom: 16, background: '#faf8f5', borderRadius: 10, padding: '12px 14px', border: '1px solid #f0ece6' }}>
                      {selectedBreed.description}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                    {[
                      { l: 'Peso ♂', v: selectedBreed.weight_m ? `${selectedBreed.weight_m} kg` : '—' },
                      { l: 'Peso ♀', v: selectedBreed.weight_f ? `${selectedBreed.weight_f} kg` : '—' },
                      { l: 'Huevos/año', v: selectedBreed.eggs_per_year || '—' },
                      { l: '% Canal', v: selectedBreed.carcass_pct ? `${selectedBreed.carcass_pct}%` : '—' },
                      { l: 'Crecimiento', v: selectedBreed.growth || '—' },
                      { l: 'Cresta', v: selectedBreed.comb || '—' },
                    ].map(r => (
                      <div key={r.l} style={{ background: 'var(--neutral-25)', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 10, color: 'var(--neutral-400)' }}>{r.l}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>{r.v}</div>
                      </div>
                    ))}
                  </div>

                  {selectedBreed.genetic_profile && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-600)', marginBottom: 8 }}>Perfil Genético</div>
                      <div style={{ background: 'var(--neutral-25)', borderRadius: 10, padding: 12, fontSize: 12 }}>
                        <div><strong>Fenotipo:</strong> {selectedBreed.genetic_profile.phenotype}</div>
                        <div><strong>Color ojos:</strong> {selectedBreed.genetic_profile.eye_color}</div>
                        <div><strong>Cresta:</strong> {selectedBreed.genetic_profile.comb_type}</div>
                        {selectedBreed.genetic_profile.plumage_loci && (
                          <div style={{ marginTop: 8 }}>
                            <strong>Loci de plumaje:</strong>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                              {Object.entries(selectedBreed.genetic_profile.plumage_loci).map(([k, v]) => (
                                <span key={k} style={{ padding: '2px 6px', borderRadius: 4, background: 'white', border: '1px solid var(--neutral-200)', fontSize: 11 }}>
                                  {k}: {v as string}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedBreed.genetic_profile.special_traits && selectedBreed.genetic_profile.special_traits.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <strong>Rasgos especiales:</strong> {selectedBreed.genetic_profile.special_traits.join(', ')}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button onClick={() => {
                      setPadre(selectedBreed.name);
                      setSelectedBreed(null);
                      setTab('cross');
                    }} className="nf-btn primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Dna size={14} /> ♂ Usar como padre
                    </button>
                    <button onClick={() => {
                      setMadre(selectedBreed.name);
                      setSelectedBreed(null);
                      setTab('cross');
                    }} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '10px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13,
                      background: '#F3E5F5', color: '#8E24AA', border: '1px solid #CE93D8', cursor: 'pointer',
                    }}>
                      <Dna size={14} /> ♀ Usar como madre
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* ═══════════ CROSS TAB ═══════════ */}
      {tab === 'cross' && (
        <div style={{ display: 'grid', gridTemplateColumns: (genImage || generatingImg || imgError) ? '300px 1fr 280px' : '340px 1fr', gap: 16, transition: 'grid-template-columns 0.3s ease' }}>
          {/* Left panel — config */}
          <div style={{
            background: 'white', borderRadius: 14, padding: 18,
            border: '1px solid var(--neutral-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            alignSelf: 'start',
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 14 }}>
              Configurar Cruce
            </h3>

            {/* Cross type */}
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 6 }}>
              Tipo de cruce
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 14 }}>
              {CROSS_TYPES.map(ct => (
                <button key={ct.value} onClick={() => setCrossType(ct.value)} style={{
                  padding: '6px 8px', borderRadius: 6, fontSize: 11, fontWeight: crossType === ct.value ? 700 : 500,
                  background: crossType === ct.value ? 'var(--primary-500)' : 'var(--neutral-50)',
                  color: crossType === ct.value ? 'white' : 'var(--neutral-600)',
                  border: crossType === ct.value ? '1px solid var(--primary-600)' : '1px solid var(--neutral-200)',
                  cursor: 'pointer', textAlign: 'left',
                }}>
                  <div>{ct.label}</div>
                  <div style={{ fontSize: 9, opacity: 0.8 }}>{ct.desc}</div>
                </button>
              ))}
            </div>

            {/* Padre */}
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>
              ♂ Padre
            </label>
            <select
              className="nf-input" value={padre} onChange={e => setPadre(e.target.value)}
              style={{ width: '100%', marginBottom: 12, padding: '8px 10px', fontSize: 13 }}
            >
              <option value="">Seleccionar raza...</option>
              {breeds.map(b => <option key={b.name} value={b.name}>{b.name} ({b.weight_m}kg)</option>)}
            </select>

            {/* Madre */}
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>
              ♀ Madre
            </label>
            <select
              className="nf-input" value={madre} onChange={e => setMadre(e.target.value)}
              style={{ width: '100%', marginBottom: 14, padding: '8px 10px', fontSize: 13 }}
            >
              <option value="">Seleccionar raza...</option>
              {breeds.map(b => <option key={b.name} value={b.name}>{b.name} ({b.weight_f}kg)</option>)}
            </select>

            {/* Simulate button */}
            <button
              onClick={predictCross} disabled={!padre || !madre || predicting}
              className="nf-btn primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: (!padre || !madre) ? 0.5 : 1 }}
            >
              {predicting ? <Loader2 size={14} className="animate-spin" /> : <Dna size={14} />}
              Simular Cruce
            </button>

            {/* Image generation section */}
            {predResult && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--neutral-100)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-700)', marginBottom: 10 }}>Generar imagen IA</div>

                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                  {(['male', 'female'] as const).map(s => (
                    <button key={s} onClick={() => setImgSex(s)} style={{
                      flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: imgSex === s ? 'var(--primary-500)' : 'var(--neutral-50)',
                      color: imgSex === s ? 'white' : 'var(--neutral-600)',
                      border: imgSex === s ? '1px solid var(--primary-600)' : '1px solid var(--neutral-200)',
                      cursor: 'pointer',
                    }}>
                      {s === 'male' ? '♂ Macho' : '♀ Hembra'}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {([['photorealistic','Fotorrealista'],['artistic','Artístico'],['professional','Profesional']] as const).map(([s,label]) => (
                    <button key={s} onClick={() => setImgStyle(s)} style={{
                      flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 10, fontWeight: 600,
                      background: imgStyle === s ? 'var(--primary-500)' : 'var(--neutral-50)',
                      color: imgStyle === s ? 'white' : 'var(--neutral-600)',
                      border: imgStyle === s ? '1px solid var(--primary-600)' : '1px solid var(--neutral-200)',
                      cursor: 'pointer', textTransform: 'capitalize',
                    }}>
                      {label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={generateImage} disabled={generatingImg}
                  style={{
                    width: '100%', padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 700,
                    background: '#8B5CF6', color: 'white', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    opacity: generatingImg ? 0.6 : 1,
                  }}
                >
                  {generatingImg ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  {generatingImg ? 'Generando...' : 'Generar Imagen'}
                </button>
              </div>
            )}
          </div>

          {/* Right panel — results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!predResult && !predicting && (
              <div style={{
                background: 'white', borderRadius: 14, padding: 40, textAlign: 'center',
                border: '1px solid var(--neutral-100)',
              }}>
                <FlaskConical size={36} style={{ color: 'var(--neutral-300)', marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--neutral-500)' }}>Selecciona padre y madre</div>
                <div style={{ fontSize: 12, color: 'var(--neutral-400)', marginTop: 4 }}>
                  Elige un tipo de cruce y las razas parentales para ver la predicción F1
                </div>
              </div>
            )}

            {predicting && (
              <div style={{ background: 'white', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid var(--neutral-100)' }}>
                <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary-500)', marginBottom: 12 }} />
                <div style={{ fontSize: 13, color: 'var(--neutral-600)' }}>Analizando cruce {padre} × {madre}...</div>
              </div>
            )}

            {predResult && (
              <>
                {/* F1 Prediction card */}
                <div style={{
                  background: 'white', borderRadius: 14, overflow: 'hidden',
                  border: '1px solid var(--neutral-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '2px solid var(--primary-500)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Dna size={16} style={{ color: 'var(--primary-500)' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>
                      Predicción {predResult.cross_type}: {predResult.padre} × {predResult.madre}
                    </span>
                    {predResult.f1_prediction.heterosis > 0 && (
                      <span style={{
                        marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '2px 8px',
                        borderRadius: 10, background: '#ECFDF5', color: '#10B981',
                      }}>
                        +{predResult.f1_prediction.heterosis}% heterosis
                      </span>
                    )}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      {[
                        { l: 'Peso ♂', v: `${predResult.f1_prediction.weight_m} kg`, c: '#3B82F6' },
                        { l: 'Peso ♀', v: `${predResult.f1_prediction.weight_f} kg`, c: '#EC4899' },
                        { l: 'Huevos/año', v: predResult.f1_prediction.eggs_per_year, c: '#F59E0B' },
                        { l: '% Canal', v: `${predResult.f1_prediction.carcass_pct}%`, c: '#10B981' },
                        { l: 'Crecimiento', v: predResult.f1_prediction.growth, c: '#8B5CF6' },
                        { l: 'Score Capón', v: predResult.f1_prediction.capon_score?.toFixed(1) || '—', c: '#B07D2B' },
                      ].map(r => (
                        <div key={r.l} style={{ background: 'var(--neutral-25)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                          <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>{r.l}</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: r.c, fontFamily: 'var(--font-mono)' }}>{r.v}</div>
                        </div>
                      ))}
                    </div>
                    {predResult.recommendation && (
                      <div style={{
                        marginTop: 12, padding: 10, borderRadius: 8,
                        background: 'rgba(176,125,43,0.06)', border: '1px solid rgba(176,125,43,0.15)',
                        fontSize: 12, color: 'var(--neutral-700)', lineHeight: 1.5,
                      }}>
                        <strong>💡</strong> {predResult.recommendation}
                      </div>
                    )}
                  </div>
                </div>

                {/* Genetic Analysis card */}
                {genAnalysis && (
                  <div style={{
                    background: 'white', borderRadius: 14, overflow: 'hidden',
                    border: '1px solid var(--neutral-100)',
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '2px solid #8B5CF6', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Microscope size={16} style={{ color: '#8B5CF6' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>Análisis Genético Mendeliano</span>
                    </div>
                    <div style={{ padding: 16, fontSize: 12, lineHeight: 1.6, color: 'var(--neutral-700)' }}>

                      {/* ── Color Genetics ── */}
                      {genAnalysis.color_genetics && (() => {
                        const cg = genAnalysis.color_genetics;
                        return (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontWeight: 700, marginBottom: 8, color: '#8B5CF6', display: 'flex', alignItems: 'center', gap: 6 }}>
                              🎨 Genética del Color
                            </div>
                            {cg.male_color && cg.female_color && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                                <div style={{ background: '#EFF6FF', borderRadius: 8, padding: '8px 12px' }}>
                                  <div style={{ fontSize: 10, color: '#3B82F6', fontWeight: 700, marginBottom: 2 }}>♂ PADRE</div>
                                  <div style={{ fontSize: 12, fontWeight: 600 }}>{cg.male_color}</div>
                                  {cg.male_genotype && <div style={{ fontSize: 10, color: 'var(--neutral-500)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{cg.male_genotype}</div>}
                                </div>
                                <div style={{ background: '#FDF2F8', borderRadius: 8, padding: '8px 12px' }}>
                                  <div style={{ fontSize: 10, color: '#EC4899', fontWeight: 700, marginBottom: 2 }}>♀ MADRE</div>
                                  <div style={{ fontSize: 12, fontWeight: 600 }}>{cg.female_color}</div>
                                  {cg.female_genotype && <div style={{ fontSize: 10, color: 'var(--neutral-500)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{cg.female_genotype}</div>}
                                </div>
                              </div>
                            )}
                            {cg.loci_analysis && (
                              <div style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: 'var(--neutral-600)' }}>Análisis por Locus</div>
                                <div style={{ display: 'grid', gap: 6 }}>
                                  {Object.entries(cg.loci_analysis).map(([key, locus]: [string, any]) => (
                                    <div key={key} style={{ background: 'var(--neutral-25)', borderRadius: 8, padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div>
                                        <span style={{ fontWeight: 700, fontSize: 11 }}>{locus.name || key}</span>
                                        <span style={{ fontSize: 10, color: 'var(--neutral-400)', marginLeft: 6 }}>♂ {locus.male} × ♀ {locus.female}</span>
                                      </div>
                                      <div style={{ fontSize: 11, fontWeight: 600, color: '#8B5CF6', textAlign: 'right', maxWidth: '50%' }}>{locus.f1_prediction}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {cg.interaction_analysis && (
                              <div style={{ background: 'rgba(139,92,246,0.06)', borderRadius: 8, padding: '8px 12px', fontSize: 11, border: '1px solid rgba(139,92,246,0.15)' }}>
                                <strong>🧬 Interacción:</strong> {cg.interaction_analysis}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* ── F1 Prediction ── */}
                      {genAnalysis.f1_prediction && (() => {
                        const fp = genAnalysis.f1_prediction;
                        return (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontWeight: 700, marginBottom: 8, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: 6 }}>
                              🐣 Resultado F1 Esperado
                            </div>
                            {fp.phenotype && (
                              <div style={{ background: '#FFFBEB', borderRadius: 8, padding: '8px 12px', marginBottom: 8, border: '1px solid #FDE68A' }}>
                                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Fenotipo</div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{fp.phenotype}</div>
                                {fp.genotype && <div style={{ fontSize: 10, color: 'var(--neutral-500)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{fp.genotype}</div>}
                              </div>
                            )}
                            {(fp.weight_male_kg || fp.weight_female_kg) && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 8 }}>
                                {fp.weight_male_kg > 0 && <div style={{ background: 'var(--neutral-25)', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
                                  <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>Peso ♂</div>
                                  <div style={{ fontSize: 14, fontWeight: 800, color: '#3B82F6' }}>{fp.weight_male_kg} kg</div>
                                </div>}
                                {fp.weight_female_kg > 0 && <div style={{ background: 'var(--neutral-25)', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
                                  <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>Peso ♀</div>
                                  <div style={{ fontSize: 14, fontWeight: 800, color: '#EC4899' }}>{fp.weight_female_kg} kg</div>
                                </div>}
                                {fp.vigor_hybrid && <div style={{ background: 'var(--neutral-25)', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
                                  <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>Vigor</div>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981' }}>{fp.vigor_hybrid}</div>
                                </div>}
                              </div>
                            )}
                            {fp.color_explanation && (
                              <div style={{ fontSize: 11, color: 'var(--neutral-600)', fontStyle: 'italic', padding: '4px 0' }}>
                                💡 {fp.color_explanation}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* ── Special Traits ── */}
                      {genAnalysis.special_traits && (() => {
                        const st = genAnalysis.special_traits;
                        return (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontWeight: 700, marginBottom: 8, color: '#10B981', display: 'flex', alignItems: 'center', gap: 6 }}>
                              🔬 Rasgos Especiales
                            </div>
                            {st.comb_type && (
                              <div style={{ background: '#ECFDF5', borderRadius: 8, padding: '8px 12px', marginBottom: 8, border: '1px solid #A7F3D0' }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#10B981', marginBottom: 2 }}>TIPO DE CRESTA</div>
                                <div style={{ fontSize: 12, fontWeight: 600 }}>{st.comb_type.type} — {st.comb_type.f1_expression}</div>
                                {st.comb_type.genetics && <div style={{ fontSize: 10, color: 'var(--neutral-500)', marginTop: 2 }}>{st.comb_type.genetics}</div>}
                              </div>
                            )}
                            {st.special_traits && typeof st.special_traits === 'object' && (
                              <div style={{ display: 'grid', gap: 6 }}>
                                {Object.entries(st.special_traits).map(([k, t]: [string, any]) => (
                                  <div key={k} style={{ background: 'var(--neutral-25)', borderRadius: 8, padding: '6px 10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ fontSize: 11, fontWeight: 700 }}>{k.replace(/_/g, ' ')}</span>
                                      <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 6, background: t.inheritance === 'Dominante' ? '#DBEAFE' : '#FEF3C7', color: t.inheritance === 'Dominante' ? '#1D4ED8' : '#92400E' }}>{t.inheritance}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--neutral-600)', marginTop: 2 }}>{t.f1_expression}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {st.structural_traits && typeof st.structural_traits === 'string' && (
                              <div style={{ fontSize: 11, color: 'var(--neutral-500)', marginTop: 6 }}>🏗️ {st.structural_traits}</div>
                            )}
                          </div>
                        );
                      })()}

                      {/* ── Production Morphology ── */}
                      {genAnalysis.production_morphology && (() => {
                        const pm = genAnalysis.production_morphology;
                        return (
                          <div>
                            <div style={{ fontWeight: 700, marginBottom: 8, color: '#B07D2B', display: 'flex', alignItems: 'center', gap: 6 }}>
                              🧩 Morfología y Producción
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                              {pm.body_type && <div style={{ background: 'var(--neutral-25)', borderRadius: 8, padding: '6px 10px' }}>
                                <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>Tipo</div>
                                <div style={{ fontSize: 12, fontWeight: 700 }}>{pm.body_type}</div>
                              </div>}
                              {pm.main_aptitude && <div style={{ background: 'var(--neutral-25)', borderRadius: 8, padding: '6px 10px' }}>
                                <div style={{ fontSize: 10, color: 'var(--neutral-500)' }}>Aptitud</div>
                                <div style={{ fontSize: 12, fontWeight: 700 }}>{pm.main_aptitude}</div>
                              </div>}
                            </div>
                            {pm.rusticity && <div style={{ fontSize: 11, marginBottom: 4 }}>🌿 <strong>Rusticidad:</strong> {pm.rusticity}</div>}
                            {pm.management && <div style={{ fontSize: 11, marginBottom: 4 }}>🏠 <strong>Manejo:</strong> {pm.management}</div>}
                            {pm.market_niche && <div style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, background: 'rgba(176,125,43,0.08)', display: 'inline-block' }}>🎯 {pm.market_niche}</div>}
                          </div>
                        );
                      })()}

                    </div>
                  </div>
                )}

                {/* BLUP button + results */}
                <div style={{
                  background: 'white', borderRadius: 14, padding: 16,
                  border: '1px solid var(--neutral-100)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <BarChart3 size={16} style={{ color: '#10B981' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>Análisis BLUP / EBV</span>
                  </div>

                  {!blupResult && (
                    <button onClick={runBLUP} disabled={analyzingBLUP} className="nf-btn" style={{
                      display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
                      opacity: analyzingBLUP ? 0.6 : 1,
                    }}>
                      {analyzingBLUP ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />}
                      {analyzingBLUP ? 'Calculando...' : 'Ejecutar Análisis Profesional'}
                    </button>
                  )}

                  {blupResult && (() => {
                    const am = blupResult.additive_means || blupResult.blup_adjusted_means || {};
                    const cs = blupResult.capon_score_adjusted ?? blupResult.capon_score_traditional ?? null;
                    const he = blupResult.heterosis_effects || {};
                    const meta = blupResult.analysis_metadata || {};
                    const report = blupResult.technical_report || '';
                    return (
                    <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--neutral-700)' }}>
                      {/* Capon Score badge */}
                      {cs !== null && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 14px', borderRadius: 10, marginBottom: 12,
                          background: cs >= 80 ? '#ECFDF5' : cs >= 60 ? '#FFFBEB' : '#FEF2F2',
                          border: `1px solid ${cs >= 80 ? '#A7F3D0' : cs >= 60 ? '#FDE68A' : '#FECACA'}`,
                        }}>
                          <Star size={16} style={{ color: cs >= 80 ? '#10B981' : cs >= 60 ? '#F59E0B' : '#EF4444' }} />
                          <span style={{ fontWeight: 800, fontSize: 16, color: cs >= 80 ? '#10B981' : cs >= 60 ? '#B45309' : '#DC2626' }}>
                            {cs.toFixed(1)}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--neutral-700)' }}>Score Capón</span>
                          <span style={{
                            marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                            background: cs >= 80 ? '#10B981' : cs >= 60 ? '#F59E0B' : '#EF4444', color: 'white',
                          }}>
                            {cs >= 80 ? 'EXCELENTE' : cs >= 60 ? 'BUENO' : 'MEJORABLE'}
                          </span>
                        </div>
                      )}

                      {/* Additive means grid */}
                      {Object.keys(am).length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: 'var(--neutral-600)' }}>Medias Aditivas Predichas</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                            {[
                              { k: 'body_weight_male_kg', l: 'Peso ♂', u: 'kg', c: '#3B82F6' },
                              { k: 'body_weight_female_kg', l: 'Peso ♀', u: 'kg', c: '#EC4899' },
                              { k: 'eggs_per_year', l: 'Huevos/año', u: '', c: '#F59E0B' },
                              { k: 'carcass_yield_pct', l: '% Canal', u: '%', c: '#10B981' },
                              { k: 'growth_rate_index', l: 'Crecimiento', u: '', c: '#8B5CF6' },
                              { k: 'rusticity_index', l: 'Rusticidad', u: '', c: '#059669' },
                              { k: 'docility_index', l: 'Docilidad', u: '', c: '#6366F1' },
                            ].filter(t => am[t.k] !== undefined).map(t => (
                              <div key={t.k} style={{ background: 'var(--neutral-25)', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
                                <div style={{ fontSize: 9, color: 'var(--neutral-500)' }}>{t.l}</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: t.c, fontFamily: 'var(--font-mono)' }}>
                                  {typeof am[t.k] === 'number' ? am[t.k].toFixed(1) : am[t.k]}{t.u && ` ${t.u}`}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Selection index if available */}
                      {blupResult.selection_index !== undefined && blupResult.selection_index !== null && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 8, background: '#ECFDF5', marginBottom: 10,
                        }}>
                          <Star size={14} style={{ color: '#10B981' }} />
                          <span style={{ fontWeight: 700, color: '#10B981' }}>
                            Índice de selección: {blupResult.selection_index}
                          </span>
                          {blupResult.accuracy && (
                            <span style={{ fontSize: 10, color: 'var(--neutral-500)' }}>
                              (precisión: {(blupResult.accuracy * 100).toFixed(0)}%)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Metadata tag */}
                      {meta.method && (
                        <div style={{ fontSize: 10, color: 'var(--neutral-400)', marginBottom: 8 }}>
                          Método: {meta.method} | Simulaciones: {meta.n_offspring || '—'} | Pedigrí: {meta.used_pedigree ? 'Sí' : 'No'} | Genómico: {meta.used_genotypes ? 'Sí' : 'No'}
                        </div>
                      )}

                      {/* Technical report toggle */}
                      {report && (
                        <div>
                          <button onClick={() => setShowReport(!showReport)} style={{
                            background: 'none', border: '1px solid var(--neutral-200)', borderRadius: 8,
                            padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: 'var(--neutral-600)',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                            📋 {showReport ? 'Ocultar' : 'Ver'} Informe Técnico
                          </button>
                          {showReport && (
                            <pre style={{
                              marginTop: 8, background: 'var(--neutral-25)', borderRadius: 8, padding: 12,
                              fontSize: 10, lineHeight: 1.5, overflow: 'auto', whiteSpace: 'pre-wrap',
                              maxHeight: 300, border: '1px solid var(--neutral-100)',
                            }}>
                              {report}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                    );
                  })()}
                </div>

              </>
            )}
          </div>

          {/* Right panel — AI Image (slides in) */}
          {(genImage || generatingImg || imgError) && (
            <div style={{
              position: 'sticky', top: 80, alignSelf: 'start',
              animation: 'slideInRight 0.4s ease-out',
            }}>
              <div style={{
                background: 'white', borderRadius: 14, overflow: 'hidden',
                border: '1px solid var(--neutral-100)',
                boxShadow: '0 4px 20px rgba(139,92,246,0.12)',
              }}>
                <div style={{
                  padding: '10px 14px', borderBottom: '2px solid #8B5CF6',
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(139,92,246,0.02))',
                }}>
                  <Camera size={14} style={{ color: '#8B5CF6' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-800)' }}>Imagen IA</span>
                  <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--neutral-400)' }}>Flux Schnell</span>
                </div>
                <div style={{ padding: 10, textAlign: 'center' }}>
                  {generatingImg ? (
                    <div style={{ padding: '30px 10px' }}>
                      <Loader2 size={28} className="animate-spin" style={{ color: '#8B5CF6', marginBottom: 10 }} />
                      <div style={{ fontSize: 12, color: 'var(--neutral-500)' }}>Generando...</div>
                      <div style={{ fontSize: 10, color: 'var(--neutral-400)', marginTop: 3 }}>~15-30 seg</div>
                    </div>
                  ) : genImage ? (
                    <div>
                      <img src={genImage} alt={`${padre} × ${madre} F1`} style={{
                        width: '100%', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      }} />
                      <div style={{
                        marginTop: 8, fontSize: 11, fontWeight: 600, color: 'var(--neutral-700)',
                        padding: '4px 8px', background: 'var(--neutral-25)', borderRadius: 6,
                      }}>
                        {imgSex === 'male' ? '♂ Gallo' : '♀ Gallina'} F1: {padre} × {madre}
                      </div>
                      <div style={{
                        marginTop: 6, fontSize: 9, color: 'var(--neutral-400)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      }}>
                        <Camera size={10} /> Generada con IA — Flux Schnell
                      </div>
                    </div>
                  ) : imgError ? (
                    <div style={{ padding: '20px 10px' }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
                      <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, marginBottom: 4 }}>{imgError}</div>
                      <div style={{ fontSize: 10, color: 'var(--neutral-400)' }}>
                        Requiere API key Replicate activa.
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ LIBRARY TAB ═══════════ */}
      {tab === 'library' && (
        <div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {(['F1', 'F2', 'F3'] as const).map(t => (
              <button key={t} onClick={() => setHybridTab(t)} style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: hybridTab === t ? 700 : 500,
                background: hybridTab === t ? 'var(--primary-500)' : 'var(--neutral-50)',
                color: hybridTab === t ? 'white' : 'var(--neutral-600)',
                border: hybridTab === t ? '1px solid var(--primary-600)' : '1px solid var(--neutral-200)',
                cursor: 'pointer',
              }}>
                {t}
              </button>
            ))}
          </div>

          {hybrids.length === 0 ? (
            <div style={{
              background: 'white', borderRadius: 14, padding: 40, textAlign: 'center',
              border: '1px solid var(--neutral-100)',
            }}>
              <Star size={32} style={{ color: 'var(--neutral-300)', marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--neutral-500)' }}>Sin híbridos guardados</div>
              <div style={{ fontSize: 12, color: 'var(--neutral-400)', marginTop: 4 }}>
                Simula cruces y guarda los mejores resultados aquí
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {hybrids.filter((h: any) => h.generation === hybridTab || !h.generation).map((h: any, i: number) => (
                <div key={i} style={{
                  background: 'white', borderRadius: 12, padding: 14,
                  border: '1px solid var(--neutral-100)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}>
                  {h.image_url && (
                    <img src={h.image_url} alt={h.name || 'Hybrid'} style={{
                      width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 10,
                    }} />
                  )}
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>{h.name || `${h.padre} × ${h.madre}`}</div>
                  <div style={{ fontSize: 11, color: 'var(--neutral-500)', marginTop: 4 }}>{h.cross_type || 'F0×F0'}</div>
                  {h.capon_score && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#B07D2B', marginTop: 6 }}>
                      Score capón: {h.capon_score}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
