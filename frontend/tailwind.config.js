/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#050505',
        surface: '#0C0C0C',
        hover: '#161616',
        primary: {
          DEFAULT: '#6366F1',
          50: '#EEEEFF',
          100: '#DEDEFE',
          200: '#BDBDFD',
          300: '#9C9CF9',
          400: '#7B7BF5',
          500: '#6366F1',
          600: '#4346E8',
          700: '#2E31D5',
          800: '#2528B0',
          900: '#1E218E',
        },
        secondary: {
          DEFAULT: '#A855F7',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
        },
      },
      fontFamily: {
        heading: ['Geist', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderColor: {
        subtle: 'rgba(255,255,255,0.08)',
        medium: 'rgba(255,255,255,0.12)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
        'gradient-surface': 'linear-gradient(180deg, #0C0C0C 0%, #050505 100%)',
      },
      animation: {
        shimmer: 'shimmer 1.4s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
        glow: '0 0 20px rgba(99,102,241,0.15)',
        'glow-sm': '0 0 10px rgba(99,102,241,0.10)',
      },
    },
  },
  plugins: [],
};
