import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        burdeos: {
          DEFAULT: '#7F1D1D',
          light: '#991B1B',
          dark: '#5C1616',
        },
        dorado: {
          DEFAULT: '#D4A843',
          light: '#E0BC6A',
          dark: '#B8902E',
        },
        surface: {
          DEFAULT: '#1A1A1A',
          hover: '#262626',
          border: '#333333',
        },
        bg: '#0F0F0F',
      },
    },
  },
  plugins: [],
}
export default config
