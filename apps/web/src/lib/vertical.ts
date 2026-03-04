export type Vertical = 'avicola';

export function detectVerticalFromHostname(): Vertical {
  return 'avicola';
}

export function getDemoTenant() {
  return {
    id: 'demo-avicola',
    name: 'Granja Demo Avícola',
    species: 'avicola',
    farm_model: 'avicola_extensivo',
  };
}

export function getHubUrl(): string {
  return 'https://hub.ovosfera.com';
}
