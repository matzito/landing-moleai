/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F0F2F3',
        surface: '#ffffff',
        persimmon: {
          DEFAULT: '#F4623A',
          hover: '#e85528',
        },
        teal: {
          brand: '#0d9488',
          light: '#14b8a6',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
