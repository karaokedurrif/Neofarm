/* ══════════════════════════════════════════════════════════════════
 *  GOMPERTZ SERVICE — Growth Model, Prediction, Calibration
 *  W(t) = A × exp(-exp(-k × (t - t₀)))
 *  Pure functions.
 * ══════════════════════════════════════════════════════════════════ */

import type { GompertzParams, GrowthPrediction, BirdMeasurement, Destination, Sex } from '../types';

/** Calculate weight at age t (days) given Gompertz parameters */
export function gompertzWeight(params: GompertzParams, t: number): number {
  const { A, k, t0 } = params;
  return A * Math.exp(-Math.exp(-k * (t - t0)));
}

/** Generate a full growth curve */
export function gompertzCurve(
  params: GompertzParams,
  tMax = 300,
  step = 1,
): Array<{ t: number; w: number }> {
  const points: Array<{ t: number; w: number }> = [];
  for (let t = 0; t <= tMax; t += step) {
    points.push({ t, w: gompertzWeight(params, t) });
  }
  return points;
}

/** Calculate growth rate at age t (derivative of Gompertz) */
export function gompertzGrowthRate(params: GompertzParams, t: number): number {
  const { A, k, t0 } = params;
  const W = gompertzWeight(params, t);
  return W * k * Math.exp(-k * (t - t0));
}

/** Day of maximum growth rate (inflection point) */
export function dayOfMaxGrowth(params: GompertzParams): number {
  return params.t0;
}

/** Weight at max growth rate (always A/e ≈ 0.368 × A) */
export function weightAtInflection(params: GompertzParams): number {
  return params.A / Math.E;
}

/**
 * Fit Gompertz parameters to real measurements using iterative least-squares.
 * Simplified Levenberg-Marquardt approach.
 */
export function fitGompertz(
  measurements: Array<{ t: number; w: number }>,
  initialParams?: GompertzParams,
): GompertzParams {
  if (measurements.length < 3) {
    return initialParams || { A: 4.0, k: 0.017, t0: 65 };
  }

  // Start with initial guess or estimate from data
  let A = initialParams?.A || Math.max(...measurements.map(m => m.w)) * 1.3;
  let k = initialParams?.k || 0.017;
  let t0 = initialParams?.t0 || 65;

  const lr = 0.001;
  const iterations = 500;

  for (let iter = 0; iter < iterations; iter++) {
    let dA = 0, dk = 0, dt0 = 0;

    for (const { t, w } of measurements) {
      const predicted = A * Math.exp(-Math.exp(-k * (t - t0)));
      const error = predicted - w;
      const expTerm = Math.exp(-k * (t - t0));
      const outerExp = Math.exp(-expTerm);

      // Partial derivatives
      dA += error * outerExp;
      dk += error * A * outerExp * expTerm * (t - t0);
      dt0 += error * A * outerExp * expTerm * (-k);
    }

    const n = measurements.length;
    A -= lr * dA / n;
    k -= lr * dk / n;
    t0 -= lr * dt0 / n;

    // Clamp to reasonable values
    A = Math.max(0.5, Math.min(10, A));
    k = Math.max(0.005, Math.min(0.05, k));
    t0 = Math.max(20, Math.min(120, t0));
  }

  return { A, k, t0 };
}

/**
 * Compare real measurements vs expected curve
 */
export function compareRealVsExpected(
  measurements: Array<{ t: number; w: number }>,
  params: GompertzParams,
): { deviationPct: number; rSquared: number; isAbove: boolean } {
  if (measurements.length === 0) return { deviationPct: 0, rSquared: 1, isAbove: false };

  const latest = measurements[measurements.length - 1];
  const expected = gompertzWeight(params, latest.t);
  const deviationPct = ((latest.w - expected) / expected) * 100;

  // R² calculation
  const meanW = measurements.reduce((s, m) => s + m.w, 0) / measurements.length;
  const ssRes = measurements.reduce((s, m) => s + Math.pow(m.w - gompertzWeight(params, m.t), 2), 0);
  const ssTot = measurements.reduce((s, m) => s + Math.pow(m.w - meanW, 2), 0);
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 1;

  return { deviationPct, rSquared, isAbove: deviationPct > 0 };
}

/**
 * Predict weight at future days
 */
export function predictWeight(
  params: GompertzParams,
  currentAgeDays: number,
  targetDays: number[],
  sigma = 0.12, // relative standard deviation
): GrowthPrediction[] {
  return targetDays.map(d => {
    const totalDays = currentAgeDays + d;
    const peso = gompertzWeight(params, totalDays);
    return {
      diasDesdeNacimiento: totalDays,
      pesoEsperado: Math.round(peso * 100) / 100,
      icLow: Math.round(peso * (1 - sigma * 1.28) * 100) / 100, // 80% CI
      icHigh: Math.round(peso * (1 + sigma * 1.28) * 100) / 100,
    };
  });
}

/**
 * Find optimal slaughter window for a target canal weight
 */
export function optimalSlaughterWindow(
  params: GompertzParams,
  targetWeight: number,
  canalYield = 0.70,
): { startDay: number; endDay: number; expectedLiveWeight: number } {
  const targetLive = targetWeight / canalYield;

  // Find the day when weight reaches target ±5%
  let startDay = 0;
  let endDay = 0;

  for (let d = 1; d <= 365; d++) {
    const w = gompertzWeight(params, d);
    if (w >= targetLive * 0.95 && startDay === 0) startDay = d;
    if (w >= targetLive * 1.05 && endDay === 0) { endDay = d; break; }
  }

  if (endDay === 0) endDay = 365;

  return {
    startDay,
    endDay,
    expectedLiveWeight: gompertzWeight(params, Math.floor((startDay + endDay) / 2)),
  };
}

/**
 * Classify destination based on predicted weight and sex
 */
export function classifyDestination(
  params: GompertzParams,
  sex: Sex,
  ageAtSlaughterDays?: number,
): Destination {
  if (sex === 'unknown') return 'descarte';

  // Predict canal weights at key ages
  const canalYield = 0.70;

  if (sex === 'F') {
    const w5mo = gompertzWeight(params, 150) * canalYield;
    if (w5mo >= 2.0 && w5mo <= 2.5) return 'pularda';
    if (w5mo >= 1.8) return 'pollo_gourmet';
    return 'descarte';
  }

  // Male
  const w8sem = gompertzWeight(params, 56) * canalYield;
  const w16sem = gompertzWeight(params, 112) * canalYield;
  const w7mo = gompertzWeight(params, 210) * canalYield;
  const w9mo = gompertzWeight(params, 270) * canalYield;

  if (w9mo >= 5.0) return 'capon_grande';
  if (w7mo >= 3.0) return 'capon_medio';
  if (w16sem >= 1.8) return 'pollo_gourmet';
  if (w8sem >= 0.6) return 'picanton_gourmet';
  return 'descarte';
}

/** Human-readable destination label */
export function destinationLabel(d: Destination): string {
  const labels: Record<Destination, string> = {
    reproductor: 'Reproductor',
    picanton_gourmet: 'Picantón Gourmet',
    pollo_gourmet: 'Pollo Gourmet',
    capon_medio: 'Capón Medio',
    capon_grande: 'Capón Grande',
    pularda: 'Pularda',
    descarte: 'Descarte',
  };
  return labels[d] || d;
}

/** Destination emoji */
export function destinationEmoji(d: Destination): string {
  const emojis: Record<Destination, string> = {
    reproductor: '👑',
    picanton_gourmet: '🐤',
    pollo_gourmet: '🍗',
    capon_medio: '🐓',
    capon_grande: '🏆',
    pularda: '🌸',
    descarte: '❌',
  };
  return emojis[d] || '❓';
}
