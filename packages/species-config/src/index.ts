// Razas autóctonas españolas + internacionales
export const RAZAS = [
  'Castellana Negra',
  'Prat Leonada',
  'Plymouth Rock',
  'Sussex',
  'Mos',
  'Empordanesa',
  'Rhode Island Red',
  'Wyandotte',
  'Brahma',
  'Marans',
  'Leghorn'
] as const

export type Raza = typeof RAZAS[number]
