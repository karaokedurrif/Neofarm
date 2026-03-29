export interface Bodega {
  id: string
  name: string
  location: { lat: number; lng: number }
  tenantId: string
}

export interface Wine {
  id: string
  name: string
  variety: string
  vintage: number
  bodegaId: string
}

export interface Sensor {
  id: string
  type: 'temperature' | 'humidity' | 'ph' | 'pressure'
  value: number
  unit: string
  bodegaId: string
  timestamp: Date
}

export type VerticalType = 'bodegadata'
