import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1049B2',
          dark: '#0C3B94',
          soft: '#EEF4FC',
        },
        navy: {
          DEFAULT: '#0B2351',
          light: '#14397E',
          dark: '#081B3E',
        },
        ink: '#0D224A',
        gold: {
          DEFAULT: '#FACC15',
          dark: '#EAB308',
        },
        wa: {
          DEFAULT: '#15803D',
          dark: '#166534',
        },
        ice: '#F4F8FF',
        teal: {
          DEFAULT: '#0F766E',
          light: '#14B8A6',
          dark: '#115E59',
        },
        amber: {
          DEFAULT: '#B45309',
          light: '#F59E0B',
          dark: '#92400E',
        },
        paper: '#F6F5F1',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
