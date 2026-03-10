/* ══════════════════════════════════════════════════════════════════
 *  SEED DATA — Realistic demo data for a breeding program in progress
 *  F0 founders + F1 with pedigree + F2 explosion
 * ══════════════════════════════════════════════════════════════════ */

import type {
  Bird, BirdMeasurement, BirdEvent, CanalEvaluation,
  BreedingPair, GeneticLine, Lot, TraitDefinition,
  TraitTracking, SelectionWeight, SelectionProgram,
} from './types';
import { DEFAULT_SELECTION_WEIGHTS } from './services/scoring.service';

/* ── Helper ── */
let _id = 0;
const uid = () => `bird-${++_id}`;
const mid = () => `meas-${++_id}`;
const eid = () => `evt-${++_id}`;

function daysBefore(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

/* ══════════════════════════════════════════════════════════════════
 *  F0 FOUNDERS — 10 birds from 4 breeds, 2 lines + reserve
 * ══════════════════════════════════════════════════════════════════ */

const F0: Bird[] = [
  // Línea A — Sabor/Carcasa (Dorking + Sulmtaler)
  { id: 'f0-m1', anilla: 'SEG-F0-001', nombre: 'Arturo', sexo: 'M', raza: 'Dorking', linea: 'A', generacion: 'F0',
    padreId: null, madreId: null, origen: 'fundador', fechaNacimiento: daysBefore(720), colorPlumaje: 'Plateado',
    pesoActual: 4.2, autoSexing: false, cincoDedos: true, patasEmplumadas: false,
    conformacionPecho: 5, conformacionMuslo: 4, docilidad: 5,
    lote: 'Fundadores', instalacion: 'Corral F0', estadoProductivo: 'activo',
    estadoSeleccion: 'apto', estadoComercial: 'no_asignado', destinoRecomendado: 'reproductor',
    notas: 'Macho fundador Línea A. Carne excepcional, cinco dedos.', fotos: [] },

  { id: 'f0-h1', anilla: 'SEG-F0-002', nombre: 'Diana', sexo: 'F', raza: 'Dorking', linea: 'A', generacion: 'F0',
    padreId: null, madreId: null, origen: 'fundador', fechaNacimiento: daysBefore(700), colorPlumaje: 'Plateado',
    pesoActual: 3.3, autoSexing: false, cincoDedos: true, patasEmplumadas: false,
    conformacionPecho: 4, conformacionMuslo: 4, docilidad: 5,
    lote: 'Fundadores', instalacion: 'Corral F0', estadoProductivo: 'activo',
    estadoSeleccion: 'apto', estadoComercial: 'no_asignado', destinoRecomendado: 'reproductor',
    notas: 'Hembra fundadora Línea A. Ponedora decente.', fotos: [] },

  { id: 'f0-h2', anilla: 'SEG-F0-003', nombre: 'Sulmia', sexo: 'F', raza: 'Sulmtaler', linea: 'A', generacion: 'F0',
    padreId: null, madreId: null, origen: 'fundador', fechaNacimiento: daysBefore(710), colorPlumaje: 'Dorado perdiz',
    pesoActual: 2.9, autoSexing: false, cincoDedos: false, patasEmplumadas: false,
    conformacionPecho: 4, conformacionMuslo: 4, docilidad: 4,
    lote: 'Fundadores', instalacion: 'Corral F0', estadoProductivo: 'activo',
    estadoSeleccion: 'apto', estadoComercial: 'no_asignado', destinoRecomendado: 'reproductor',
    notas: 'Sulmtaler pura. Grasa infiltrada excelente.', fotos: [] },

  // Línea B — Talla/Funcionalidad (Malines + Bielefelder)
  { id: 'f0-m2', anilla: 'SEG-F0-004', nombre: 'Hércules', sexo: 'M', raza: 'Malines', linea: 'B', generacion: 'F0',
    padreId: null, madreId: null, origen: 'fundador', fechaNacimiento: daysBefore(730), colorPlumaje: 'Negro cuco',
    pesoActual: 5.3, autoSexing: false, cincoDedos: false, patasEmplumadas: false,
    conformacionPecho: 5, conformacionMuslo: 5, docilidad: 4,
    lote: 'Fundadores', instalacion: 'Corral F0', estadoProductivo: 'activo',
    estadoSeleccion: 'apto', estadoComercial: 'no_asignado', destinoRecomendado: 'reproductor',
    notas: 'Gran macho Malines. Talla excepcional para capón.', fotos: [] },

  { id: 'f0-h3', anilla: 'SEG-F0-005', nombre: 'Frida', sexo: 'F', raza: 'Bielefelder', linea: 'B', generacion: 'F0',
    padreId: null, madreId: null, origen: 'fundador', fechaNacimiento: daysBefore(690), colorPlumaje: 'Kennsperber',
    pesoActual: 3.4, autoSexing: true, cincoDedos: false, patasEmplumadas: false,
    conformacionPecho: 4, conformacionMuslo: 3, docilidad: 5,
    lote: 'Fundadores', instalacion: 'Corral F0', estadoProductivo: 'activo',
    estadoSeleccion: 'apto', estadoComercial: 'no_asignado', destinoRecomendado: 'reproductor',
    notas: 'Bielefelder con autosexing. Muy buena ponedora.', fotos: [] },

  { id: 'f0-h4', anilla: 'SEG-F0-006', nombre: 'Helga', sexo: 'F', raza: 'Malines', linea: 'B', generacion: 'F0',
    padreId: null, madreId: null, origen: 'fundador', fechaNacimiento: daysBefore(720), colorPlumaje: 'Negro',
    pesoActual: 3.9, autoSexing: false, cincoDedos: false, patasEmplumadas: false,
    conformacionPecho: 5, conformacionMuslo: 5, docilidad: 4,
    lote: 'Fundadores', instalacion: 'Corral F0', estadoProductivo: 'activo',
    estadoSeleccion: 'apto', estadoComercial: 'no_asignado', destinoRecomendado: 'reproductor',
    notas: 'Malines hembra. Excelente conformación.', fotos: [] },

  // Reserva Genética (Bresse + Pita Pinta)
  { id: 'f0-m3', anilla: 'SEG-F0-007', nombre: 'Gaston', sexo: 'M', raza: 'Bresse', linea: 'Reserva Genética', generacion: 'F0',
    padreId: null, madreId: null, origen: 'fundador', fechaNacimiento: daysBefore(680), colorPlumaje: 'Blanco',
    pesoActual: 2.8, autoSexing: false, cincoDedos: false, patasEmplumadas: false,
    conformacionPecho: 4, conformacionMuslo: 3, docilidad: 3,
    lote: 'Reserva', instalacion: 'Corral Reserva', estadoProductivo: 'activo',
    estadoSeleccion: 'apto', estadoComercial: 'no_asignado', destinoRecomendado: 'reproductor',
    notas: 'Bresse puro. Reserva para backcross futuro.', fotos: [] },

  { id: 'f0-h5', anilla: 'SEG-F0-008', nombre: 'Blanca', sexo: 'F', raza: 'Bresse', linea: 'Reserva Genética', generacion: 'F0',
    padreId: null, madreId: null, origen: 'fundador', fechaNacimiento: daysBefore(680), colorPlumaje: 'Blanco',
    pesoActual: 2.4, autoSexing: false, cincoDedos: false, patasEmplumadas: false,
    conformacionPecho: 3, conformacionMuslo: 3, docilidad: 3,
    lote: 'Reserva', instalacion: 'Corral Reserva', estadoProductivo: 'activo',
    estadoSeleccion: 'apto', estadoComercial: 'no_asignado', destinoRecomendado: 'reproductor',
    notas: 'Bresse hembra. Patas azules, AOC.', fotos: [] },

  { id: 'f0-m4', anilla: 'SEG-F0-009', nombre: 'Pitu', sexo: 'M', raza: 'Pita Pinta Asturiana', linea: 'Reserva Genética', generacion: 'F0',
    padreId: null, madreId: null, origen: 'fundador', fechaNacimiento: daysBefore(750), colorPlumaje: 'Pinto negro',
    pesoActual: 3.8, autoSexing: false, cincoDedos: false, patasEmplumadas: false,
    conformacionPecho: 3, conformacionMuslo: 4, docilidad: 3,
    lote: 'Reserva', instalacion: 'Corral Reserva', estadoProductivo: 'activo',
    estadoSeleccion: 'apto', estadoComercial: 'no_asignado', destinoRecomendado: 'reproductor',
    notas: 'Pita Pinta Asturiana. Rusticidad extrema.', fotos: [] },

  { id: 'f0-h6', anilla: 'SEG-F0-010', nombre: 'Pinta', sexo: 'F', raza: 'Pita Pinta Asturiana', linea: 'Reserva Genética', generacion: 'F0',
    padreId: null, madreId: null, origen: 'fundador', fechaNacimiento: daysBefore(740), colorPlumaje: 'Pinto rojo',
    pesoActual: 2.8, autoSexing: false, cincoDedos: false, patasEmplumadas: false,
    conformacionPecho: 3, conformacionMuslo: 3, docilidad: 3,
    lote: 'Reserva', instalacion: 'Corral Reserva', estadoProductivo: 'activo',
    estadoSeleccion: 'apto', estadoComercial: 'no_asignado', destinoRecomendado: 'reproductor',
    notas: 'Pita Pinta hembra. Forrajeo excelente.', fotos: [] },
];

/* ══════════════════════════════════════════════════════════════════
 *  F1 — 16 birds with full pedigree (Arturo×Diana, Arturo×Sulmia, Hércules×Frida, Hércules×Helga)
 * ══════════════════════════════════════════════════════════════════ */

function makeF1(id: string, anilla: string, sexo: 'M' | 'F', padre: string, madre: string, linea: 'A' | 'B',
  raza1: string, raza2: string, peso: number, conf: number, doc: number, color: string, lote: string, estado: string = 'apto'): Bird {
  return {
    id, anilla, sexo, raza: `Cruce F1 (${raza1}×${raza2})`, linea, generacion: 'F1',
    padreId: padre, madreId: madre, origen: 'nacimiento_programa',
    fechaNacimiento: daysBefore(380), colorPlumaje: color,
    pesoActual: peso, autoSexing: raza2 === 'Bielefelder', cincoDedos: raza1 === 'Dorking',
    patasEmplumadas: false, conformacionPecho: conf, conformacionMuslo: Math.min(5, conf + 1),
    docilidad: doc, lote, instalacion: 'Corral F1', estadoProductivo: 'activo',
    estadoSeleccion: estado as any, estadoComercial: 'no_asignado',
    destinoRecomendado: sexo === 'M' ? (peso > 3.5 ? 'capon_grande' : 'capon_medio') : 'reproductor',
    notas: '', fotos: [],
  };
}

const F1: Bird[] = [
  // Línea A: Arturo(Dorking) × Diana(Dorking) — pure
  makeF1('f1-m1', 'SEG-F1-001', 'M', 'f0-m1', 'f0-h1', 'A', 'Dorking', 'Dorking', 3.8, 5, 5, 'Plateado', 'Lote F1-A'),
  makeF1('f1-h1', 'SEG-F1-002', 'F', 'f0-m1', 'f0-h1', 'A', 'Dorking', 'Dorking', 3.0, 4, 5, 'Plateado', 'Lote F1-A'),
  // Línea A: Arturo(Dorking) × Sulmia(Sulmtaler)
  makeF1('f1-m2', 'SEG-F1-003', 'M', 'f0-m1', 'f0-h2', 'A', 'Dorking', 'Sulmtaler', 4.1, 4, 4, 'Dorado plateado', 'Lote F1-A'),
  makeF1('f1-h2', 'SEG-F1-004', 'F', 'f0-m1', 'f0-h2', 'A', 'Dorking', 'Sulmtaler', 3.1, 4, 4, 'Dorado perdiz', 'Lote F1-A'),
  makeF1('f1-m3', 'SEG-F1-005', 'M', 'f0-m1', 'f0-h2', 'A', 'Dorking', 'Sulmtaler', 3.9, 4, 5, 'Plateado', 'Lote F1-A'),
  makeF1('f1-h3', 'SEG-F1-006', 'F', 'f0-m1', 'f0-h2', 'A', 'Dorking', 'Sulmtaler', 2.8, 3, 4, 'Perdiz', 'Lote F1-A', 'descartado'),
  // Línea B: Hércules(Malines) × Frida(Bielefelder)
  makeF1('f1-m4', 'SEG-F1-007', 'M', 'f0-m2', 'f0-h3', 'B', 'Malines', 'Bielefelder', 4.8, 5, 5, 'Cuco kennsperber', 'Lote F1-B'),
  makeF1('f1-h4', 'SEG-F1-008', 'F', 'f0-m2', 'f0-h3', 'B', 'Malines', 'Bielefelder', 3.5, 4, 5, 'Dorado', 'Lote F1-B'),
  makeF1('f1-m5', 'SEG-F1-009', 'M', 'f0-m2', 'f0-h3', 'B', 'Malines', 'Bielefelder', 4.5, 4, 4, 'Negro', 'Lote F1-B'),
  // Línea B: Hércules(Malines) × Helga(Malines) — pure
  makeF1('f1-m6', 'SEG-F1-010', 'M', 'f0-m2', 'f0-h4', 'B', 'Malines', 'Malines', 5.0, 5, 4, 'Negro', 'Lote F1-B'),
  makeF1('f1-h5', 'SEG-F1-011', 'F', 'f0-m2', 'f0-h4', 'B', 'Malines', 'Malines', 3.8, 5, 4, 'Negro cuco', 'Lote F1-B'),
  makeF1('f1-h6', 'SEG-F1-012', 'F', 'f0-m2', 'f0-h4', 'B', 'Malines', 'Malines', 3.6, 4, 3, 'Negro', 'Lote F1-B'),
  // Extra F1 for capón evaluation
  makeF1('f1-m7', 'SEG-F1-013', 'M', 'f0-m1', 'f0-h2', 'A', 'Dorking', 'Sulmtaler', 4.3, 5, 5, 'Plateado', 'Lote F1-A capón'),
  makeF1('f1-m8', 'SEG-F1-014', 'M', 'f0-m2', 'f0-h3', 'B', 'Malines', 'Bielefelder', 5.1, 5, 4, 'Cuco', 'Lote F1-B capón'),
  makeF1('f1-h7', 'SEG-F1-015', 'F', 'f0-m1', 'f0-h1', 'A', 'Dorking', 'Dorking', 2.9, 4, 5, 'Gris', 'Lote F1-A'),
  makeF1('f1-h8', 'SEG-F1-016', 'F', 'f0-m2', 'f0-h3', 'B', 'Malines', 'Bielefelder', 3.3, 4, 5, 'Dorado kennsperber', 'Lote F1-B'),
];

// Set some as caponized/sacrificed for evaluations
F1[12].estadoProductivo = 'sacrificado'; F1[12].fechaCaponizacion = daysBefore(330); F1[12].fechaSacrificio = daysBefore(180);
F1[13].estadoProductivo = 'sacrificado'; F1[13].fechaCaponizacion = daysBefore(330); F1[13].fechaSacrificio = daysBefore(175);

/* ══════════════════════════════════════════════════════════════════
 *  F2 — 30 birds, inter-line cross F1-A × F1-B (explosion genética)
 * ══════════════════════════════════════════════════════════════════ */

function makeF2(idx: number, sexo: 'M' | 'F', padre: string, madre: string, peso: number, conf: number, doc: number): Bird {
  const padres = ['f1-m2', 'f1-m4', 'f1-m5'];
  const id = `f2-${sexo.toLowerCase()}${idx}`;
  const anilla = `SEG-F2-${String(idx).padStart(3, '0')}`;
  return {
    id, anilla, sexo, raza: 'Cruce F2', linea: 'Fusionada', generacion: 'F2',
    padreId: padre, madreId: madre, origen: 'nacimiento_programa',
    fechaNacimiento: daysBefore(140), colorPlumaje: ['Plateado', 'Dorado', 'Negro', 'Cuco', 'Perdiz', 'Mixto'][idx % 6],
    pesoActual: peso, autoSexing: Math.random() > 0.7, cincoDedos: Math.random() > 0.6,
    patasEmplumadas: false, conformacionPecho: conf, conformacionMuslo: Math.min(5, conf),
    docilidad: doc, lote: `Lote F2-${idx <= 15 ? 'A' : 'B'}`, instalacion: 'Corral F2',
    estadoProductivo: 'activo', estadoSeleccion: 'pendiente', estadoComercial: 'no_asignado',
    destinoRecomendado: sexo === 'M' ? (peso > 2.0 ? 'capon_medio' : 'pollo_gourmet') : 'reproductor',
    notas: '', fotos: [],
  };
}

const F2_parents = [
  // F1-A males × F1-B females (inter-line)
  { padre: 'f1-m2', madre: 'f1-h4' },
  { padre: 'f1-m2', madre: 'f1-h5' },
  { padre: 'f1-m2', madre: 'f1-h6' },
  { padre: 'f1-m4', madre: 'f1-h1' },
  { padre: 'f1-m4', madre: 'f1-h2' },
  { padre: 'f1-m5', madre: 'f1-h1' },
];

const F2: Bird[] = [];
for (let i = 1; i <= 30; i++) {
  const parents = F2_parents[i % F2_parents.length];
  const sexo: 'M' | 'F' = i <= 15 ? 'M' : 'F';
  // High variability for F2 explosion
  const basePeso = sexo === 'M' ? 2.0 : 1.5;
  const peso = Math.round((basePeso + (Math.random() - 0.3) * 1.5) * 100) / 100;
  const conf = Math.max(1, Math.min(5, Math.round(3 + (Math.random() - 0.5) * 3)));
  const doc = Math.max(1, Math.min(5, Math.round(3.5 + (Math.random() - 0.5) * 3)));
  F2.push(makeF2(i, sexo, parents.padre, parents.madre, peso, conf, doc));
}

/* ── Measurements ── */
const MEASUREMENTS: BirdMeasurement[] = [];
// Add weight measurements at 8, 16, 20 weeks for F1 and F2
for (const bird of [...F1, ...F2]) {
  if (bird.estadoProductivo === 'sacrificado') continue;
  const birthDate = new Date(bird.fechaNacimiento);
  [56, 112, 140].forEach(days => {
    const mDate = new Date(birthDate);
    mDate.setDate(mDate.getDate() + days);
    if (mDate > new Date()) return;
    const factor = bird.sexo === 'M' ? 1 : 0.75;
    const baseW = bird.pesoActual * (days / 200) * factor;
    MEASUREMENTS.push({
      id: mid(), birdId: bird.id, fecha: mDate.toISOString().slice(0, 10),
      tipo: 'peso', valor: Math.round((baseW + (Math.random() - 0.5) * 0.3) * 100) / 100,
    });
  });
}

/* ── Canal Evaluations for sacrificed capons ── */
const EVALUATIONS: CanalEvaluation[] = [
  {
    id: 'eval-1', birdId: 'f1-m7', fecha: daysBefore(180),
    pesoVivo: 4.3, pesoCanal: 3.1, rendimientoCanal: 72,
    grasaInfiltrada: 4, textura: 4, sabor: 5,
    notasOrganolepticas: 'Excelente sabor, carne tierna con grasa infiltrada. Piel fina dorada. Herencia Dorking clara.',
  },
  {
    id: 'eval-2', birdId: 'f1-m8', fecha: daysBefore(175),
    pesoVivo: 5.1, pesoCanal: 3.7, rendimientoCanal: 73,
    grasaInfiltrada: 3, textura: 4, sabor: 4,
    notasOrganolepticas: 'Gran canal, carne firme. Talla Malines muy presente. Buen capón comercial.',
  },
];

/* ── Events ── */
const EVENTS: BirdEvent[] = [
  ...F0.map(b => ({ id: eid(), birdId: b.id, tipo: 'nacimiento' as const, fecha: b.fechaNacimiento, descripcion: `Registro fundador ${b.raza}` })),
  ...F1.map(b => ({ id: eid(), birdId: b.id, tipo: 'nacimiento' as const, fecha: b.fechaNacimiento, descripcion: `Nacimiento F1 — ${b.raza}` })),
  ...F2.map(b => ({ id: eid(), birdId: b.id, tipo: 'nacimiento' as const, fecha: b.fechaNacimiento, descripcion: `Nacimiento F2 — programa selección` })),
  { id: eid(), birdId: 'f1-m7', tipo: 'caponizacion', fecha: daysBefore(330), descripcion: 'Caponización a 7 semanas' },
  { id: eid(), birdId: 'f1-m7', tipo: 'sacrificio', fecha: daysBefore(180), descripcion: 'Sacrificio a 7 meses. Evaluación canal.' },
  { id: eid(), birdId: 'f1-m8', tipo: 'caponizacion', fecha: daysBefore(330), descripcion: 'Caponización a 7 semanas' },
  { id: eid(), birdId: 'f1-m8', tipo: 'sacrificio', fecha: daysBefore(175), descripcion: 'Sacrificio a 7 meses. Evaluación canal.' },
];

/* ── Breeding Pairs ── */
const BREEDING_PAIRS: BreedingPair[] = [
  { id: 'bp-1', machoId: 'f1-m2', hembraId: 'f1-h4', fechaInicio: daysBefore(170), activo: true, objetivo: 'mejora_sabor', descendientes: F2.filter(b => b.padreId === 'f1-m2' && b.madreId === 'f1-h4').map(b => b.id), notas: 'Cruce inter-línea A×B para F2. Dorking×Sulmtaler macho con Malines×Bielefelder hembra.' },
  { id: 'bp-2', machoId: 'f1-m4', hembraId: 'f1-h1', fechaInicio: daysBefore(170), activo: true, objetivo: 'mejora_talla', descendientes: F2.filter(b => b.padreId === 'f1-m4' && b.madreId === 'f1-h1').map(b => b.id), notas: 'Cruce inter-línea B×A. Malines×Bielefelder macho con Dorking hembra pura.' },
  { id: 'bp-3', machoId: 'f1-m5', hembraId: 'f1-h1', fechaInicio: daysBefore(160), activo: false, objetivo: 'exploracion', descendientes: F2.filter(b => b.padreId === 'f1-m5' && b.madreId === 'f1-h1').map(b => b.id), notas: 'Exploración. Malines×Bielefelder sobre Dorking pura.' },
];

/* ── Lines ── */
const LINES: GeneticLine[] = [
  { id: 'line-a', nombre: 'A', objetivo: 'Sabor, conformación, calidad de carne', descripcion: 'Fundada con Dorking + Sulmtaler. Orientada a capón gourmet de sabor excepcional.', color: '#3B82F6' },
  { id: 'line-b', nombre: 'B', objetivo: 'Talla, rusticidad, funcionalidad', descripcion: 'Fundada con Malines + Bielefelder. Orientada a capón grande con auto-sexing.', color: '#8B5CF6' },
  { id: 'line-reserva', nombre: 'Reserva Genética', objetivo: 'Diversidad genética para backcross', descripcion: 'Bresse + Pita Pinta Asturiana. Sangre fresca para F3-F4.', color: '#16A34A' },
];

/* ── Lots ── */
const LOTS: Lot[] = [
  { id: 'lot-f0', nombre: 'Fundadores', tipo: 'nacimiento', generacion: 'F0', fechaCreacion: daysBefore(750), birdIds: F0.map(b => b.id) },
  { id: 'lot-f1a', nombre: 'Lote F1-A', tipo: 'nacimiento', generacion: 'F1', linea: 'A', fechaCreacion: daysBefore(380), birdIds: F1.filter(b => b.linea === 'A').map(b => b.id) },
  { id: 'lot-f1b', nombre: 'Lote F1-B', tipo: 'nacimiento', generacion: 'F1', linea: 'B', fechaCreacion: daysBefore(380), birdIds: F1.filter(b => b.linea === 'B').map(b => b.id) },
  { id: 'lot-f2a', nombre: 'Lote F2-A', tipo: 'nacimiento', generacion: 'F2', fechaCreacion: daysBefore(140), birdIds: F2.filter((_, i) => i < 15).map(b => b.id) },
  { id: 'lot-f2b', nombre: 'Lote F2-B', tipo: 'nacimiento', generacion: 'F2', fechaCreacion: daysBefore(140), birdIds: F2.filter((_, i) => i >= 15).map(b => b.id) },
];

/* ── Trait Definitions & Tracking ── */
const TRAITS: TraitDefinition[] = [
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
];

const TRAIT_TRACKING: TraitTracking[] = [
  // F0 baselines
  { traitId: 'tr-sabor', generacion: 'F0', porcentajeFijacion: 30, nivel: 'emergent' },
  { traitId: 'tr-pecho', generacion: 'F0', porcentajeFijacion: 60, nivel: 'unstable' },
  { traitId: 'tr-docilidad', generacion: 'F0', porcentajeFijacion: 50, nivel: 'unstable' },
  { traitId: 'tr-5dedos', generacion: 'F0', porcentajeFijacion: 20, nivel: 'emergent' },
  { traitId: 'tr-autosexing', generacion: 'F0', porcentajeFijacion: 10, nivel: 'emergent' },
  { traitId: 'tr-rusticidad', generacion: 'F0', porcentajeFijacion: 40, nivel: 'unstable' },
  // F1 progress
  { traitId: 'tr-sabor', generacion: 'F1', porcentajeFijacion: 45, nivel: 'unstable' },
  { traitId: 'tr-pecho', generacion: 'F1', porcentajeFijacion: 70, nivel: 'almost_fixed' },
  { traitId: 'tr-docilidad', generacion: 'F1', porcentajeFijacion: 65, nivel: 'almost_fixed' },
  { traitId: 'tr-5dedos', generacion: 'F1', porcentajeFijacion: 35, nivel: 'unstable' },
  { traitId: 'tr-autosexing', generacion: 'F1', porcentajeFijacion: 20, nivel: 'emergent' },
  { traitId: 'tr-rusticidad', generacion: 'F1', porcentajeFijacion: 55, nivel: 'unstable' },
  { traitId: 'tr-crecimiento', generacion: 'F1', porcentajeFijacion: 60, nivel: 'unstable' },
  // F2 — high variability
  { traitId: 'tr-sabor', generacion: 'F2', porcentajeFijacion: 35, nivel: 'unstable' },
  { traitId: 'tr-pecho', generacion: 'F2', porcentajeFijacion: 55, nivel: 'unstable' },
  { traitId: 'tr-docilidad', generacion: 'F2', porcentajeFijacion: 50, nivel: 'unstable' },
  { traitId: 'tr-crecimiento', generacion: 'F2', porcentajeFijacion: 40, nivel: 'unstable' },
];

/* ══════════════════════════════════════════════════════════════════
 *  EXPORT COMPLETE PROGRAM
 * ══════════════════════════════════════════════════════════════════ */

export function createSeedProgram(): SelectionProgram {
  return {
    nombre: 'Capón Segoviano Premium',
    descripcion: 'Programa de cría F0→F5 para crear una línea propia de ave heritage premium en Segovia.',
    ubicacion: 'Segovia, Castilla y León, España',
    fechaInicio: daysBefore(750),
    perfilObjetivo: 'Capón Premium',
    birds: [...F0, ...F1, ...F2],
    measurements: MEASUREMENTS,
    events: EVENTS,
    evaluations: EVALUATIONS,
    breedingPairs: BREEDING_PAIRS,
    growthModels: [],
    lots: LOTS,
    lines: LINES,
    traits: TRAITS,
    traitTracking: TRAIT_TRACKING,
    selectionWeights: DEFAULT_SELECTION_WEIGHTS,
  };
}
