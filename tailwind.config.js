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
        bg: { DEFAULT: '#070A0F', 2: '#0B1220', 3: '#0F172A', 4: '#111C2E', 5: '#16243A' },
        t: { 1: '#eef1f6', 2: '#8892a4', 3: '#4a5568' },
        neon: { DEFAULT: '#14B8A6', 2: '#0F766E' },
        cyan: '#00d4ff',
        amber: '#ffb84d',
        rose: '#ff6b8a',
        violet: '#a78bfa',
        vacas: '#3D7A5F',
        porc: '#3B6B82',
        ovo: '#B07D2B',
      },
      fontFamily: {
        heading: ['Instrument Serif', 'Georgia', 'serif'],
        body: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float': 'float 5s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
      },
    },
  },
  plugins: [],
}
