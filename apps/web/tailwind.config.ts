import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bodega: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#6f524a',
        },
        wine: {
          50: '#fef2f2',
          100: '#fde6e6',
          200: '#fbd0d0',
          300: '#f8abab',
          400: '#f27878',
          500: '#e84949',
          600: '#d42a2a',
          700: '#722f37',
          800: '#5a1e24',
          900: '#3d1218',
        },
      },
    },
  },
  plugins: [],
}
export default config
