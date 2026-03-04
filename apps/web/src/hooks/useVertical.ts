'use client';

export interface VerticalConfig {
  vertical: 'avicola';
  brandName: string;
  colors: { primary: string; hover: string; accent: string };
}

export function useVertical(): VerticalConfig {
  return {
    vertical: 'avicola',
    brandName: 'OvoSfera',
    colors: {
      primary: '#B07D2B',
      hover:   '#D4A94E',
      accent:  '#8B5E1A',
    },
  };
}
