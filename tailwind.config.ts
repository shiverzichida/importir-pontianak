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
        navy: {
          DEFAULT: '#0B1F3A',
          light: '#122B4D',
          dark: '#071426',
        },
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
