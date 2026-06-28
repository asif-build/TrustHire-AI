/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        card: 'rgba(255, 255, 255, 0.03)',
        border: 'rgba(255, 255, 255, 0.08)',
        accent: {
          indigo: '#6366f1',
          violet: '#8b5cf6',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      },
      backdropBlur: {
        md: '12px',
      }
    },
  },
  plugins: [],
}
