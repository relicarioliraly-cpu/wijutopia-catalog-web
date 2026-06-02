/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        wiju: {
          darkBg: '#08050d',
          lightBg: '#120921',
          cardDark: '#110a24',
          cardLight: '#1e1145',
          crimson: '#8C4FCC',
          crimsonLight: '#A16DE5',
          gold: '#B78CD6',
          goldLight: '#C8A2E5',
          borderDark: '#27144e',
          borderLight: '#5d3b9f',
          textDark: '#F6F0FF',
          textLight: '#F9F5FF',
          purpleNight: '#2a0d4f',
          facadePurple: '#7b4cc7',
          signMagenta: '#9b6aff',
          logoWine: '#7242b8',
          logoWineDark: '#482a7d',
          doorPurple: '#3e2467',
          moonGold: '#a950d4',
          sidewalkBlue: '#6b4ab4',
          tealShadow: '#3e1d76',
          ink: '#0d061a'
        }
      },
      boxShadow: {
        card: '0 20px 60px rgba(0, 0, 0, 0.25)',
        neon: '0 0 28px rgba(151, 101, 255, 0.35), 0 0 56px rgba(101, 53, 183, 0.25)'
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
