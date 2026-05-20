import type { Config } from 'tailwindcss';
import tokens from './src/design-tokens/tokens.json';

// Tailwind v4 config consuming CabinConnect design tokens.
// Token source: src/design-tokens/tokens.json (mirrored to CSS vars in css-vars.css).
// Per DFD §3 + U-D02.

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: tokens.color,
      fontFamily: {
        sans: tokens.font.family.sans,
        mono: tokens.font.family.mono,
      },
      fontSize: tokens.font.size,
      spacing: tokens.space,
      borderRadius: tokens.radius,
      boxShadow: tokens.shadow,
    },
  },
  plugins: [],
};

export default config;
