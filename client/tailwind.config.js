/** @type {import('tailwindcss').Config} */
export default {
  // ── Files to scan for class names ────────────────────────────────────────
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  // ── Dark mode strategy ────────────────────────────────────────────────────
  // 'class' = toggle dark mode by adding the 'dark' class to <html>
  darkMode: 'class',

  theme: {
    extend: {
      // ── Brand Color Palette ─────────────────────────────────────────────
      colors: {
        // Primary — Indigo-based brand color
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',  // ← main brand color
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Surface colors (for dark mode cards, sidebars, etc.)
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          700: '#334155',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#080d1a',
        },
        // Priority color tokens
        priority: {
          none:   '#94a3b8',
          low:    '#22c55e',
          medium: '#f59e0b',
          high:   '#ef4444',
          urgent: '#dc2626',
        },
        // Status color tokens
        status: {
          todo:        '#94a3b8',
          in_progress: '#3b82f6',
          in_review:   '#a855f7',
          done:        '#22c55e',
        },
      },

      // ── Typography ──────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // ── Shadows ─────────────────────────────────────────────────────────
      boxShadow: {
        'card':       '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'modal':      '0 20px 60px -15px rgb(0 0 0 / 0.5)',
        'glow':       '0 0 20px rgb(99 102 241 / 0.3)',
      },

      // ── Border Radius ───────────────────────────────────────────────────
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },

      // ── Animations ──────────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in':        'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'slide-in-left':  'slide-in-left 0.25s ease-out',
        'scale-in':       'scale-in 0.2s ease-out',
        'shimmer':        'shimmer 1.5s infinite linear',
      },

      // ── Transitions ─────────────────────────────────────────────────────
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
      },

      // ── Screens ─────────────────────────────────────────────────────────
      screens: {
        'xs': '475px',
      },
    },
  },

  plugins: [],
}
