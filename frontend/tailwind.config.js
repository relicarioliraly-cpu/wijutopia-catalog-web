/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        wiju: {
          darkBg: '#0B0B0F',
          lightBg: '#F8F9FA',
          cardDark: '#16161F',
          cardLight: '#FFFFFF',
          crimson: '#E50914',
          crimsonLight: '#C10710',
          gold: '#FFB300',
          goldLight: '#E5A000',
          borderDark: '#262636',
          borderLight: '#E2E8F0',
          textDark: '#F3F4F6',
          textLight: '#111827'
        }
      },
      boxShadow: {
        card: '0 20px 60px rgba(0, 0, 0, 0.25)'
      }
    }
  },
  plugins: []
};
