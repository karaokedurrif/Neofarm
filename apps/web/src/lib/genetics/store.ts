/* ══════════════════════════════════════════════════════════════════
 *  STORE — localStorage persistence for SelectionProgram
 *  Singleton pattern: loadProgram / saveProgram / resetProgram
 *  Supports farm-scoped programs via setActiveFarm(slug)
 * ══════════════════════════════════════════════════════════════════ */

import type {
  Bird, BirdMeasurement, BirdEvent, CanalEvaluation,
  BreedingPair, GrowthModel, Lot, GeneticLine,
  TraitDefinition, TraitTracking, SelectionWeight,
  SelectionProgram,
} from './types';
import { createSeedProgram } from './seed-data';
import { DEFAULT_SELECTION_WEIGHTS } from './services/scoring.service';

const STORAGE_KEY = 'ovosfera_selection_program';

/* ── Farm-scoped support ── */
let _activeFarmSlug: string | null = null;

export function setActiveFarm(slug: string | null): void {
  _activeFarmSlug = slug;
}

export function getActiveFarm(): string | null {
  return _activeFarmSlug;
}

function _storageKey(): string {
  return _activeFarmSlug ? `${STORAGE_KEY}_${_activeFarmSlug}` : STORAGE_KEY;
}

/** Create a blank program with structural elements but zero birds */
export function createEmptyProgram(name?: string, location?: string): SelectionProgram {
  return {
    nombre: name || 'Mi Programa de Selección',
    descripcion: 'Programa de selección genética. Añade tus aves fundadoras para empezar.',
    ubicacion: location || '',
    fechaInicio: new Date().toISOString().slice(0, 10),
    perfilObjetivo: 'Pendiente de definir',
    birds: [],
    measurements: [],
    events: [],
    evaluations: [],
    breedingPairs: [],
    growthModels: [],
    lots: [],
    lines: [
      { id: 'line-a', nombre: 'A', objetivo: 'Línea principal', descripcion: 'Línea A — objetivo principal', color: '#B07D2B' },
      { id: 'line-b', nombre: 'B', objetivo: 'Línea secundaria', descripcion: 'Línea B — diversidad genética', color: '#3B82F6' },
      { id: 'line-res', nombre: 'Reserva Genética', objetivo: 'Pool de reserva', descripcion: 'Reserva genética para backcross', color: '#10B981' },
    ],
    traits: [
      { id: 'tr-sabor', nombre: 'Sabor excepcional', categoria: 'carne', comoSeEvalua: 'Evaluación de cata' },
      { id: 'tr-grasa', nombre: 'Infiltración grasa', categoria: 'carne', comoSeEvalua: 'Evaluación de canal' },
      { id: 'tr-pecho', nombre: 'Pecho ancho', categoria: 'conformacion', comoSeEvalua: 'Observación + medida' },
      { id: 'tr-muslo', nombre: 'Muslo redondo', categoria: 'conformacion', comoSeEvalua: 'Observación + medida' },
      { id: 'tr-piel', nombre: 'Piel blanca fina', categoria: 'conformacion', comoSeEvalua: 'Observación' },
      { id: 'tr-crecimiento', nombre: 'Crecimiento rápido heritage', categoria: 'productividad', comoSeEvalua: 'Peso a 16 semanas > 2 kg' },
      { id: 'tr-rusticidad', nombre: 'Rusticidad', categoria: 'adaptacion', comoSeEvalua: 'Supervivencia + forrajeo' },
      { id: 'tr-autosexing', nombre: 'Auto-sexing al nacer', categoria: 'genetica', comoSeEvalua: 'Observación al nacimiento' },
      { id: 'tr-docilidad', nombre: 'Docilidad', categoria: 'temperamento', comoSeEvalua: 'Score 1-5' },
      { id: 'tr-fertilidad', nombre: 'Fertilidad', categoria: 'reproductiva', comoSeEvalua: '% eclosión' },
      { id: 'tr-puesta', nombre: 'Puesta invernal', categoria: 'reproductiva', comoSeEvalua: 'Huevos feb-mar' },
      { id: 'tr-5dedos', nombre: 'Cinco dedos', categoria: 'genetica', comoSeEvalua: 'Observación' },
    ],
    traitTracking: [],
    selectionWeights: DEFAULT_SELECTION_WEIGHTS,
  };
}

/* ── Load / Save / Reset ── */

export function loadProgram(): SelectionProgram {
  if (typeof window === 'undefined') {
    return _activeFarmSlug ? createEmptyProgram() : createSeedProgram();
  }
  const key = _storageKey();
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as SelectionProgram;
  } catch { /* corrupt → reinit */ }
  // For farm-scoped: create EMPTY program. For global demo: create seed.
  const prog = _activeFarmSlug ? createEmptyProgram() : createSeedProgram();
  localStorage.setItem(key, JSON.stringify(prog));
  return prog;
}

export function saveProgram(p: SelectionProgram): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(_storageKey(), JSON.stringify(p));
}

export function resetProgram(): SelectionProgram {
  const prog = _activeFarmSlug ? createEmptyProgram() : createSeedProgram();
  if (typeof window !== 'undefined') {
    localStorage.setItem(_storageKey(), JSON.stringify(prog));
  }
  return prog;
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
