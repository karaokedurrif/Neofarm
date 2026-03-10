/* ══════════════════════════════════════════════════════════════════
 *  SELECTION OS — Core Type Definitions
 *  Avicultura de Selección · NeoFarm
 * ══════════════════════════════════════════════════════════════════ */

/* ── Enums & Literals ──────────────────────────────────────── */

export type Sex = 'M' | 'F' | 'unknown';
export type Generation = 'F0' | 'F1' | 'F2' | 'F3' | 'F4' | 'F5+';
export type Line = 'A' | 'B' | 'C' | 'Fusionada' | 'Sublínea Macho' | 'Sublínea Hembra' | 'Reserva Genética' | 'Clan 1' | 'Clan 2' | 'Clan 3';
export type Origin = 'fundador' | 'nacimiento_programa' | 'adquisicion_externa' | 'backcross';

export type ProductiveStatus = 'activo' | 'enfermo' | 'muerto' | 'sacrificado' | 'vendido';
export type SelectionStatus = 'pendiente' | 'apto' | 'observacion' | 'descartado';
export type CommercialStatus = 'no_asignado' | 'engorde' | 'acabado_epinette' | 'listo_venta' | 'reservado' | 'vendido';
export type Destination = 'reproductor' | 'picanton_gourmet' | 'pollo_gourmet' | 'capon_medio' | 'capon_grande' | 'pularda' | 'descarte';

export type InbreedingRisk = 'safe' | 'monitor' | 'caution' | 'danger';

export type TraitLockLevel = 'absent' | 'emergent' | 'unstable' | 'almost_fixed' | 'fixed';

/* ── Bird (Individual) ─────────────────────────────────────── */

export interface Bird {
  id: string;
  anilla: string;
  nombre?: string;
  sexo: Sex;
  raza: string;
  linea: Line;
  generacion: Generation;

  // Genealogía
  padreId: string | null;
  madreId: string | null;
  origen: Origin;

  // Fenotipo
  fechaNacimiento: string; // ISO date
  colorPlumaje: string;
  pesoActual: number; // kg
  autoSexing: boolean;
  cincoDedos: boolean;
  patasEmplumadas: boolean;
  conformacionPecho: number; // 1-5
  conformacionMuslo: number; // 1-5
  docilidad: number; // 1-5

  // Operativo
  lote: string;
  instalacion: string;
  estadoProductivo: ProductiveStatus;
  estadoSeleccion: SelectionStatus;
  estadoComercial: CommercialStatus;
  destinoRecomendado: Destination;
  fechaCaponizacion?: string;
  fechaPoulardizacion?: string;
  fechaSacrificio?: string;
  fechaVenta?: string;

  // Complementarios
  notas: string;
  fotos: string[];

  // Computed (cached)
  coi?: number;
  selectionScore?: number;
}

/* ── Measurements ──────────────────────────────────────────── */

export interface BirdMeasurement {
  id: string;
  birdId: string;
  fecha: string;
  tipo: 'peso' | 'conformacion' | 'docilidad';
  valor: number;
  notas?: string;
}

/* ── Events ────────────────────────────────────────────────── */

export type EventType = 'nacimiento' | 'pesada' | 'seleccion' | 'cambio_lote' | 'caponizacion' | 'poulardizacion' | 'epinette' | 'sacrificio' | 'venta' | 'vacunacion' | 'nota';

export interface BirdEvent {
  id: string;
  birdId: string;
  tipo: EventType;
  fecha: string;
  descripcion: string;
  datos?: Record<string, any>;
}

/* ── Evaluations ───────────────────────────────────────────── */

export interface CanalEvaluation {
  id: string;
  birdId: string;
  fecha: string;
  pesoVivo: number;
  pesoCanal: number;
  rendimientoCanal: number; // %
  grasaInfiltrada: number; // 1-5
  textura: number; // 1-5
  sabor: number; // 1-5
  notasOrganolepticas: string;
}

/* ── Breeding ──────────────────────────────────────────────── */

export interface BreedingPair {
  id: string;
  machoId: string;
  hembraId: string;
  fechaInicio: string;
  fechaFin?: string;
  activo: boolean;
  objetivo: MatingObjective;
  loteEsperado?: string;
  descendientes: string[]; // bird IDs
  notas: string;
}

export type MatingObjective =
  | 'mejora_sabor'
  | 'mejora_talla'
  | 'mejora_autosexing'
  | 'abrir_sangre'
  | 'fijar_uniformidad'
  | 'linea_macho'
  | 'linea_hembra'
  | 'exploracion';

/* ── Growth Model ──────────────────────────────────────────── */

export interface GompertzParams {
  A: number;  // Asymptotic weight (kg)
  k: number;  // Maturation rate
  t0: number; // Inflection point (days)
}

export interface GrowthModel {
  id: string;
  raza: string;
  sexo: Sex;
  linea?: Line;
  params: GompertzParams;
  esCustom: boolean;
}

/* ── Breed Catalog ─────────────────────────────────────────── */

export interface BreedCatalogEntry {
  nombre: string;
  origen: string;
  descripcion: string;
  pesoMachoKg: number;
  pesoHembraKg: number;
  huevosAnuales: number;
  rendimientoCanal: number; // %
  crecimiento: 'lento' | 'medio' | 'rapido';
  rusticidad: number; // 1-5
  docilidad: number; // 1-5
  rasgosEspeciales: string[];
  gompertzMacho: GompertzParams;
  gompertzHembra: GompertzParams;
}

/* ── Generations ───────────────────────────────────────────── */

export interface GenerationStats {
  generacion: Generation;
  nacidos: number;
  vivos: number;
  reproductores: number;
  descartados: number;
  uniformidad: number; // 0-100%
  coiMedio: number;
  scoreMedio: number;
  ramasActivas: string[];
  mejorIndividuo?: string; // bird ID
  peorIndividuo?: string;
}

/* ── Trait Tracking ────────────────────────────────────────── */

export interface TraitDefinition {
  id: string;
  nombre: string;
  categoria: 'carne' | 'conformacion' | 'productividad' | 'adaptacion' | 'genetica' | 'temperamento' | 'reproductiva';
  comoSeEvalua: string;
}

export interface TraitTracking {
  traitId: string;
  generacion: Generation;
  porcentajeFijacion: number; // 0-100
  nivel: TraitLockLevel;
}

/* ── Lots ───────────────────────────────────────────────────── */

export interface Lot {
  id: string;
  nombre: string;
  tipo: 'nacimiento' | 'engorde' | 'venta';
  generacion: Generation;
  linea?: Line;
  fechaCreacion: string;
  birdIds: string[];
  notas?: string;
}

/* ── Lines ──────────────────────────────────────────────────── */

export interface GeneticLine {
  id: string;
  nombre: Line;
  objetivo: string;
  descripcion: string;
  color: string; // hex color for UI
}

/* ── Selection Criteria Config ─────────────────────────────── */

export interface SelectionWeight {
  criterio: string;
  peso: number;
  descripcion: string;
}

/* ── Pedigree Tree (computed) ──────────────────────────────── */

export interface PedigreeNode {
  bird: Bird | null;
  padre?: PedigreeNode;
  madre?: PedigreeNode;
  depth: number;
}

/* ── Common Ancestor ───────────────────────────────────────── */

export interface CommonAncestor {
  ancestor: Bird;
  pathFromFather: number; // generations
  pathFromMother: number;
  contribution: number; // (1/2)^(n1+n2+1)
}

/* ── Mating Projection ─────────────────────────────────────── */

export interface MatingProjection {
  machoId: string;
  hembraId: string;
  coiEstimado: number;
  riesgo: InbreedingRisk;
  ancestrosComunes: CommonAncestor[];
  generacionEsperada: Generation;
  scoreCombinado: number;
  rasgosMejoran: string[];
  rasgosEmpeoran: string[];
  rasgosNeutros: string[];
  destinoProbable: Destination;
  contribucionGenetica: Record<string, number>; // breed → %
}

/* ── Growth Prediction ─────────────────────────────────────── */

export interface GrowthPrediction {
  diasDesdeNacimiento: number;
  pesoEsperado: number;
  icLow: number;
  icHigh: number;
}

/* ── Alerts ─────────────────────────────────────────────────── */

export type AlertType = 'endogamia' | 'peso' | 'hito' | 'seleccion' | 'sangre_fresca' | 'evaluacion_pendiente' | 'consanguinidad_alta' | 'deficit_reproductores';
export type AlertSeverity = 'info' | 'warning' | 'danger';

export interface SelectionAlert {
  id: string;
  tipo: AlertType;
  severidad: AlertSeverity;
  titulo: string;
  descripcion: string;
  fecha: string;
  accion?: string;
  link?: string;
}

/* ── Full Program State ────────────────────────────────────── */

export interface SelectionProgram {
  nombre: string;
  descripcion: string;
  ubicacion: string;
  fechaInicio: string;
  perfilObjetivo: string; // e.g. "Capón Premium"

  birds: Bird[];
  measurements: BirdMeasurement[];
  events: BirdEvent[];
  evaluations: CanalEvaluation[];
  breedingPairs: BreedingPair[];
  growthModels: GrowthModel[];
  lots: Lot[];
  lines: GeneticLine[];
  traits: TraitDefinition[];
  traitTracking: TraitTracking[];
  selectionWeights: SelectionWeight[];
}
