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
          textLight: '#111827',
          purpleNight: '#24113F',
          facadePurple: '#5B2A86',
          signMagenta: '#8B1D57',
          doorPurple: '#3B2063',
          moonGold: '#F4B23A',
          sidewalkBlue: '#244C73',
          tealShadow: '#0E3A3B',
          ink: '#100817'
        }
      },
      boxShadow: {
        card: '0 20px 60px rgba(0, 0, 0, 0.25)',
        neon: '0 0 28px rgba(244, 178, 58, 0.35), 0 0 56px rgba(139, 29, 87, 0.25)'
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        glow: 'glow 2.8s ease-in-out infinite alternate',
        marquee: 'marquee 18s linear infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 0 rgba(244, 178, 58, 0)' },
          '100%': { boxShadow: '0 0 32px rgba(244, 178, 58, 0.55)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      }
    }
  },
  plugins: []
};
