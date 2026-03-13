/* ══════════════════════════════════════════════════════════════════
 *  SCORING SERVICE — Selection Index, Rankings
 *  Pure functions.
 * ══════════════════════════════════════════════════════════════════ */

import type { Bird, BirdMeasurement, CanalEvaluation, SelectionWeight } from '../types';
import { calculateCOI } from './inbreeding.service';

/** Default selection weights (prompt Section 4.3) */
export const DEFAULT_SELECTION_WEIGHTS: SelectionWeight[] = [
  { criterio: 'crecimiento', peso: 0.20, descripcion: 'Percentil de peso vs cohorte' },
  { criterio: 'conformacion', peso: 0.15, descripcion: 'Media de pecho + muslo + estructura' },
  { criterio: 'rusticidad', peso: 0.10, descripcion: 'Supervivencia + adaptación' },
  { criterio: 'fertilidad', peso: 0.10, descripcion: '% eclosión + puesta (solo hembras)' },
  { criterio: 'calidad_carne', peso: 0.15, descripcion: 'Evaluaciones de canal/cata' },
  { criterio: 'uniformidad', peso: 0.05, descripcion: 'CV inverso vs progenie' },
  { criterio: 'valor_genetico', peso: 0.10, descripcion: 'Rendimiento de hermanos y descendientes' },
  { criterio: 'penalizacion_coi', peso: -0.10, descripcion: 'Resta proporcional al COI' },
  { criterio: 'aptitud_capon', peso: 0.05, descripcion: 'Docilidad + predicción Gompertz' },
];

interface ScoreBreakdown {
  criterio: string;
  valor: number;  // 0-100 raw
  pesado: number;  // weighted contribution
}

/**
 * Calculate selection score for a bird
 */
export function calculateSelectionScore(
  bird: Bird,
  allBirds: Bird[],
  measurements: BirdMeasurement[],
  evaluations: CanalEvaluation[],
  weights: SelectionWeight[] = DEFAULT_SELECTION_WEIGHTS,
): { total: number; breakdown: ScoreBreakdown[] } {
  const breakdown: ScoreBreakdown[] = [];

  // 1. Crecimiento — percentil de peso en su generación/sexo
  const cohort = allBirds.filter(b => b.generacion === bird.generacion && b.sexo === bird.sexo && b.estadoProductivo === 'activo');
  const cohortWeights = cohort.map(b => b.pesoActual).sort((a, b) => a - b);
  const percentil = cohortWeights.length > 1
    ? (cohortWeights.indexOf(bird.pesoActual) / (cohortWeights.length - 1)) * 100
    : 50;
  breakdown.push({ criterio: 'crecimiento', valor: percentil, pesado: 0 });

  // 2. Conformación
  const conformacion = ((bird.conformacionPecho + bird.conformacionMuslo) / 2) * 20; // scale 1-5 to 0-100
  breakdown.push({ criterio: 'conformacion', valor: conformacion, pesado: 0 });

  // 3. Rusticidad
  const rusticity = bird.estadoProductivo === 'activo' ? 70 : 20;
  const rustScore = (rusticity + bird.docilidad * 10) / 2;
  breakdown.push({ criterio: 'rusticidad', valor: rustScore, pesado: 0 });

  // 4. Fertilidad (hembras only, males get 50)
  const fertilidad = bird.sexo === 'F' ? 60 : 50; // Placeholder — would be real egg data
  breakdown.push({ criterio: 'fertilidad', valor: fertilidad, pesado: 0 });

  // 5. Calidad de carne
  const birdEvals = evaluations.filter(e => e.birdId === bird.id);
  const calidadCarne = birdEvals.length > 0
    ? birdEvals.reduce((sum, e) => sum + (e.sabor + e.textura + e.grasaInfiltrada) / 3, 0) / birdEvals.length * 20
    : 50; // Unknown = neutral
  breakdown.push({ criterio: 'calidad_carne', valor: calidadCarne, pesado: 0 });

  // 6. Uniformidad (placeholder based on conformación variance)
  breakdown.push({ criterio: 'uniformidad', valor: 50, pesado: 0 });

  // 7. Valor genético (based on descendants' scores; founders get baseline credit)
  const descendants = allBirds.filter(b => b.padreId === bird.id || b.madreId === bird.id);
  const isFounder = bird.generacion === 'F0' || bird.origen === 'fundador';
  const valorGenetico = descendants.length > 0
    ? Math.min(100, 40 + descendants.length * 5)
    : isFounder ? 60 : 30; // Founders carry base genetic value even without descendants yet
  breakdown.push({ criterio: 'valor_genetico', valor: valorGenetico, pesado: 0 });

  // 8. Penalización COI (inverted — high COI = low score)
  const coi = calculateCOI(bird.id, allBirds);
  const coiPenalty = Math.max(0, 100 - coi * 1000); // COI of 0.1 (10%) → score 0
  breakdown.push({ criterio: 'penalizacion_coi', valor: coiPenalty, pesado: 0 });

  // 9. Aptitud para capón
  const aptitudCapon = (bird.docilidad * 20 + bird.conformacionPecho * 10) / 2;
  breakdown.push({ criterio: 'aptitud_capon', valor: aptitudCapon, pesado: 0 });

  // Apply weights
  let total = 0;
  for (const b of breakdown) {
    const w = weights.find(w => w.criterio === b.criterio);
    if (w) {
      b.pesado = b.valor * Math.abs(w.peso);
      total += b.valor * w.peso;
    }
  }
  total = Math.max(0, Math.min(100, total));

  return { total: Math.round(total * 10) / 10, breakdown };
}

/**
 * Rank birds by selection score
 */
export function rankBirds(
  birds: Bird[],
  allBirds: Bird[],
  measurements: BirdMeasurement[],
  evaluations: CanalEvaluation[],
  weights?: SelectionWeight[],
): Array<Bird & { score: number }> {
  return birds
    .map(bird => ({
      ...bird,
      score: calculateSelectionScore(bird, allBirds, measurements, evaluations, weights).total,
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Calculate population uniformity (inverse CV of weights)
 */
export function calculateUniformity(weights: number[]): number {
  if (weights.length < 2) return 0;
  const mean = weights.reduce((s, w) => s + w, 0) / weights.length;
  if (mean === 0) return 0;
  const variance = weights.reduce((s, w) => s + Math.pow(w - mean, 2), 0) / weights.length;
  const cv = Math.sqrt(variance) / mean;
  // Invert: low CV = high uniformity. CV of 0 = 100%, CV of 0.5 = 0%
  return Math.max(0, Math.min(100, Math.round((1 - cv * 2) * 100)));
}

/** Score color for UI */
export function scoreColor(score: number): string {
  if (score >= 70) return '#16A34A';
  if (score >= 50) return '#D97706';
  if (score >= 30) return '#EA580C';
  return '#DC2626';
}
