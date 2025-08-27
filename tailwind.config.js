/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)', 'Inter', 'sans-serif'],
        crimson: ['Crimson Text', 'Georgia', 'serif'],
      },
      colors: {
        arena: {
          navy: '#0f1419',
          'navy-light': '#1a2332',
          'navy-lighter': '#2a3441',
          gold: '#d4af37',
          'gold-light': '#f4e8a8',
          'gold-dark': '#b8941f',
          cream: '#fefcf7',
          // Earth-tone palette
          'hunter-green': '#3A4A3F',
          'night-brown': '#322D25',
          'sunrise': '#F4BF77',
          'bright-umber': '#826644',
          'foggy-pith': '#FBF6EF',
          'abilene-lace': '#EAE3D2',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'float': 'float 6s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'arena-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'arena-md': '0 4px 14px 0 rgba(0, 0, 0, 0.1), 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'arena-lg': '0 20px 40px -4px rgba(0, 0, 0, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
        'arena-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 10px 20px -4px rgba(0, 0, 0, 0.1)',
        'arena-gold': '0 4px 14px 0 rgba(212, 175, 55, 0.25)',
        'arena-gold-lg': '0 8px 25px 0 rgba(212, 175, 55, 0.4)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      letterSpacing: {
        'tighter': '-0.025em',
        'tight': '-0.02em',
        'snug': '-0.015em',
        'normal': '-0.011em',
        'relaxed': '-0.005em',
      },
      lineHeight: {
        'tight': '1.1',
        'snug': '1.2',
        'normal': '1.3',
        'relaxed': '1.4',
        'loose': '1.6',
        'extra-loose': '1.7',
      },
    },
  },
  plugins: [],
}

