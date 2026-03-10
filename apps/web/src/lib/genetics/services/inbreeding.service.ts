/* ══════════════════════════════════════════════════════════════════
 *  INBREEDING SERVICE — COI, Mean Kinship, Risk Classification
 *  Wright's path coefficient method. Pure functions.
 * ══════════════════════════════════════════════════════════════════ */

import type { Bird, InbreedingRisk, CommonAncestor } from '../types';
import { findCommonAncestors } from './pedigree.service';

/**
 * Calculate COI (Coefficient of Inbreeding) for a bird.
 * Wright's method: Σ (1/2)^(n₁+n₂+1) × (1+Fa)
 * F0 founders have COI = 0 by definition.
 */
export function calculateCOI(birdId: string, birds: Bird[], maxGen = 6): number {
  const bird = birds.find(b => b.id === birdId);
  if (!bird) return 0;

  // F0 or no parents → COI = 0
  if (!bird.padreId || !bird.madreId) return 0;

  const commonAncestors = findCommonAncestors(bird.padreId, bird.madreId, birds, maxGen);
  if (commonAncestors.length === 0) return 0;

  let coi = 0;
  for (const ca of commonAncestors) {
    const ancestorCOI = calculateCOI(ca.ancestor.id, birds, maxGen - 1);
    coi += Math.pow(0.5, ca.pathFromFather + ca.pathFromMother + 1) * (1 + ancestorCOI);
  }

  return Math.min(coi, 1); // Clamp to 0-1
}

/**
 * Estimate COI of hypothetical offspring of father × mother
 */
export function estimateOffspringCOI(
  fatherId: string,
  motherId: string,
  birds: Bird[],
  maxGen = 6,
): number {
  const commonAncestors = findCommonAncestors(fatherId, motherId, birds, maxGen);
  if (commonAncestors.length === 0) return 0;

  let coi = 0;
  for (const ca of commonAncestors) {
    const ancestorCOI = calculateCOI(ca.ancestor.id, birds, maxGen - 1);
    coi += Math.pow(0.5, ca.pathFromFather + ca.pathFromMother + 1) * (1 + ancestorCOI);
  }

  return Math.min(coi, 1);
}

/**
 * Calculate Mean Kinship of a bird with a population
 */
export function calculateMeanKinship(
  birdId: string,
  population: Bird[],
  allBirds: Bird[],
): number {
  if (population.length === 0) return 0;

  let totalKinship = 0;
  for (const other of population) {
    if (other.id === birdId) continue;
    totalKinship += estimateOffspringCOI(birdId, other.id, allBirds);
  }

  return totalKinship / Math.max(population.length - 1, 1);
}

/**
 * Classify inbreeding risk level
 */
export function classifyInbreedingRisk(coi: number): InbreedingRisk {
  if (coi < 0.03125) return 'safe';      // < 3.125%
  if (coi < 0.0625) return 'monitor';     // < 6.25%
  if (coi < 0.125) return 'caution';      // < 12.5%
  return 'danger';                          // ≥ 12.5%
}

/**
 * Human-readable explanation of inbreeding risk
 */
export function explainRisk(
  birdA: Bird,
  birdB: Bird,
  coi: number,
  commonAncestors: CommonAncestor[],
): string {
  const pct = (coi * 100).toFixed(2);
  const risk = classifyInbreedingRisk(coi);

  if (commonAncestors.length === 0) {
    return `No se detectan ancestros comunes entre ${birdA.anilla} y ${birdB.anilla}. ` +
           `El COI estimado es 0%. Cruce seguro desde el punto de vista genético.`;
  }

  const ancestorNames = commonAncestors.slice(0, 3).map(ca =>
    `${ca.ancestor.anilla} (${ca.ancestor.raza})`
  ).join(', ');

  let equivalence = '';
  if (coi >= 0.25) equivalence = 'equivalente a cruce entre hermanos completos';
  else if (coi >= 0.125) equivalence = 'equivalente a cruce entre medio hermanos';
  else if (coi >= 0.0625) equivalence = 'equivalente a hijos de primos hermanos';
  else if (coi >= 0.03125) equivalence = 'con parentesco de primos segundos';
  else equivalence = 'con parentesco lejano';

  let recommendation = '';
  switch (risk) {
    case 'safe':
      recommendation = 'Cruce seguro. La diversidad genética es adecuada.';
      break;
    case 'monitor':
      recommendation = `Cruce posible con vigilancia. Evitar repetir esta combinación en siguiente generación. ` +
                        `Considerar cruce con ${birdA.linea === 'A' ? 'Línea B' : 'Línea A'} para abrir sangre.`;
      break;
    case 'caution':
      recommendation = `Cruce no recomendado salvo necesidad. COI elevado puede causar depresión endogámica. ` +
                        `Se recomienda usar sangre fresca F0 de reserva genética.`;
      break;
    case 'danger':
      recommendation = `⛔ Cruce peligroso. El COI de ${pct}% implica riesgo alto de problemas de salud, ` +
                        `fertilidad reducida y patas torcidas. Usar backcross con F0 de reserva.`;
      break;
  }

  return `COI estimado: ${pct}%, ${equivalence}. ` +
         `Ancestros comunes: ${ancestorNames}. ` +
         recommendation;
}

/**
 * Suggest backcross candidates to reduce COI
 */
export function suggestBackcross(
  reproductores: Bird[],
  allBirds: Bird[],
  coiThreshold = 0.0625,
): Array<{ reserva: Bird; impactoEstimado: number }> {
  // Find F0 reserve birds that are alive
  const reserva = allBirds.filter(
    b => b.generacion === 'F0' && b.linea === 'Reserva Genética' && b.estadoProductivo === 'activo'
  );

  if (reserva.length === 0) return [];

  // For each reserve bird, estimate average COI reduction
  return reserva.map(r => {
    const avgCOI = reproductores.reduce((sum, rep) => {
      const offspring = estimateOffspringCOI(r.id, rep.id, allBirds);
      return sum + offspring;
    }, 0) / Math.max(reproductores.length, 1);

    return { reserva: r, impactoEstimado: avgCOI };
  }).sort((a, b) => a.impactoEstimado - b.impactoEstimado);
}

/**
 * Get COI color for UI semaphore
 */
export function coiColor(coi: number): string {
  const risk = classifyInbreedingRisk(coi);
  switch (risk) {
    case 'safe': return '#16A34A';
    case 'monitor': return '#D97706';
    case 'caution': return '#EA580C';
    case 'danger': return '#DC2626';
  }
}

export function coiLabel(coi: number): string {
  const risk = classifyInbreedingRisk(coi);
  switch (risk) {
    case 'safe': return 'Seguro';
    case 'monitor': return 'Vigilar';
    case 'caution': return 'Precaución';
    case 'danger': return 'Peligroso';
  }
}
