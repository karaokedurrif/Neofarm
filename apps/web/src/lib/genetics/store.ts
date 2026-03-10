/* ══════════════════════════════════════════════════════════════════
 *  STORE — localStorage persistence for SelectionProgram
 *  Singleton pattern: loadProgram / saveProgram / resetProgram
 * ══════════════════════════════════════════════════════════════════ */

import type {
  Bird, BirdMeasurement, BirdEvent, CanalEvaluation,
  BreedingPair, GrowthModel, Lot, GeneticLine,
  TraitDefinition, TraitTracking, SelectionWeight,
  SelectionProgram,
} from './types';
import { createSeedProgram } from './seed-data';

const STORAGE_KEY = 'ovosfera_selection_program';

/* ── Load / Save / Reset ── */

export function loadProgram(): SelectionProgram {
  if (typeof window === 'undefined') return createSeedProgram();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SelectionProgram;
  } catch { /* corrupt → reinit */ }
  const seed = createSeedProgram();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

export function saveProgram(p: SelectionProgram): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function resetProgram(): SelectionProgram {
  const seed = createSeedProgram();
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }
  return seed;
}

/* ── Helpers — immutable "reducers" that return new program ── */

export function addBird(prog: SelectionProgram, bird: Bird): SelectionProgram {
  const p = { ...prog, birds: [...prog.birds, bird] };
  saveProgram(p);
  return p;
}

export function updateBird(prog: SelectionProgram, id: string, patch: Partial<Bird>): SelectionProgram {
  const p = { ...prog, birds: prog.birds.map(b => b.id === id ? { ...b, ...patch } : b) };
  saveProgram(p);
  return p;
}

export function removeBird(prog: SelectionProgram, id: string): SelectionProgram {
  const p = {
    ...prog,
    birds: prog.birds.filter(b => b.id !== id),
    measurements: prog.measurements.filter(m => m.birdId !== id),
    events: prog.events.filter(e => e.birdId !== id),
  };
  saveProgram(p);
  return p;
}

export function addMeasurement(prog: SelectionProgram, m: BirdMeasurement): SelectionProgram {
  const p = { ...prog, measurements: [...prog.measurements, m] };
  saveProgram(p);
  return p;
}

export function addEvent(prog: SelectionProgram, e: BirdEvent): SelectionProgram {
  const p = { ...prog, events: [...prog.events, e] };
  saveProgram(p);
  return p;
}

export function addEvaluation(prog: SelectionProgram, e: CanalEvaluation): SelectionProgram {
  const p = { ...prog, evaluations: [...prog.evaluations, e] };
  saveProgram(p);
  return p;
}

export function addBreedingPair(prog: SelectionProgram, bp: BreedingPair): SelectionProgram {
  const p = { ...prog, breedingPairs: [...prog.breedingPairs, bp] };
  saveProgram(p);
  return p;
}

export function updateBreedingPair(prog: SelectionProgram, id: string, patch: Partial<BreedingPair>): SelectionProgram {
  const p = { ...prog, breedingPairs: prog.breedingPairs.map(bp => bp.id === id ? { ...bp, ...patch } : bp) };
  saveProgram(p);
  return p;
}

export function addGrowthModel(prog: SelectionProgram, gm: GrowthModel): SelectionProgram {
  const p = { ...prog, growthModels: [...prog.growthModels, gm] };
  saveProgram(p);
  return p;
}

export function addLot(prog: SelectionProgram, lot: Lot): SelectionProgram {
  const p = { ...prog, lots: [...prog.lots, lot] };
  saveProgram(p);
  return p;
}

export function updateSelectionWeights(prog: SelectionProgram, weights: SelectionWeight[]): SelectionProgram {
  const p = { ...prog, selectionWeights: weights };
  saveProgram(p);
  return p;
}

export function updateTraitTracking(prog: SelectionProgram, tracking: TraitTracking[]): SelectionProgram {
  const p = { ...prog, traitTracking: tracking };
  saveProgram(p);
  return p;
}

/* ── Query helpers ── */

export function getBird(prog: SelectionProgram, id: string): Bird | undefined {
  return prog.birds.find(b => b.id === id);
}

export function getBirdsByGeneration(prog: SelectionProgram, gen: string): Bird[] {
  return prog.birds.filter(b => b.generacion === gen);
}

export function getBirdsByLine(prog: SelectionProgram, linea: string): Bird[] {
  return prog.birds.filter(b => b.linea === linea);
}

export function getMeasurements(prog: SelectionProgram, birdId: string): BirdMeasurement[] {
  return prog.measurements.filter(m => m.birdId === birdId).sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function getEvents(prog: SelectionProgram, birdId: string): BirdEvent[] {
  return prog.events.filter(e => e.birdId === birdId).sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function getEvaluation(prog: SelectionProgram, birdId: string): CanalEvaluation | undefined {
  return prog.evaluations.find(e => e.birdId === birdId);
}

export function getOffspring(prog: SelectionProgram, birdId: string): Bird[] {
  return prog.birds.filter(b => b.padreId === birdId || b.madreId === birdId);
}

export function getParents(prog: SelectionProgram, birdId: string): { padre?: Bird; madre?: Bird } {
  const bird = getBird(prog, birdId);
  if (!bird) return {};
  return {
    padre: bird.padreId ? getBird(prog, bird.padreId) : undefined,
    madre: bird.madreId ? getBird(prog, bird.madreId) : undefined,
  };
}

export function getBreedingPairsFor(prog: SelectionProgram, birdId: string): BreedingPair[] {
  return prog.breedingPairs.filter(bp => bp.machoId === birdId || bp.hembraId === birdId);
}

/* ── Stats ── */

export function programStats(prog: SelectionProgram) {
  const active = prog.birds.filter(b => b.estadoProductivo === 'activo');
  const byGen: Record<string, number> = {};
  for (const b of active) byGen[b.generacion] = (byGen[b.generacion] || 0) + 1;

  const males = active.filter(b => b.sexo === 'M').length;
  const females = active.filter(b => b.sexo === 'F').length;

  return {
    totalBirds: prog.birds.length,
    activeBirds: active.length,
    byGeneration: byGen,
    males,
    females,
    sexRatio: females > 0 ? +(males / females).toFixed(2) : 0,
    breedingPairsActive: prog.breedingPairs.filter(bp => bp.activo).length,
    evaluations: prog.evaluations.length,
    breeds: [...new Set(prog.birds.map(b => b.raza))].length,
    lines: prog.lines.length,
  };
}
