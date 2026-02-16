/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neofarm: {
          primary: '#0F766E',
          'primary-light': '#14B8A6',
          secondary: '#10B981',
          accent: '#F59E0B',
          surface: '#FAFAF9',
          dark: '#0C0C0C',
        },
        bovine: {
          primary: '#1B4332',
          accent: '#40C057',
        },
        porcine: {
          primary: '#7C2D12',
          accent: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
      },
    },
  },
  plugins: [],
}
