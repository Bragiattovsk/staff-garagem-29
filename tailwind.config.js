/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        garage: {
          bg: '#09090b',
          card: '#121215',
          red: '#dc2626',
          redHover: '#b91c1c',
          redDark: '#450a0a',
          border: '#27272a',
        },
        staff: {
          bg: '#09090b',
          surface: '#121215',
          card: '#121215',
          cardHover: '#1c1c22',
          border: '#27272a',
          gold: '#dc2626',
          amberGlow: '#ef4444',
          bar: '#ef4444',
          kitchen: '#f97316',
          prep: '#a855f7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
