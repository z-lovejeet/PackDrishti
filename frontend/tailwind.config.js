/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Institutional Navy Palette (Department of Consumer Affairs primary)
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#1B365D',
          900: '#0F2540',
          950: '#081526',
        },
        // Saffron & Warm Amber Accent (Official Indian emblem & citizen actions)
        saffron: {
          50: '#FFF9F0',
          100: '#FFF0D6',
          200: '#FFE0A8',
          300: '#FFCD75',
          400: '#F59E0B',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
          800: '#78350F',
          900: '#451A03',
        },
        // Semantic Mappings for backward compatibility & design cohesion
        primary: {
          DEFAULT: '#1B365D',
          hover: '#0F2540',
          light: '#F0F4F8',
          border: '#BCCCDC',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#D97706',
          hover: '#B45309',
          light: '#FFF9F0',
          border: '#FFE0A8',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#059669',
          hover: '#047857',
          light: '#ECFDF5',
          border: '#A7F3D0',
          foreground: '#FFFFFF',
        },
        violation: {
          DEFAULT: '#DC2626',
          hover: '#B91C1C',
          light: '#FEF2F2',
          border: '#FECACA',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#D97706',
          hover: '#B45309',
          light: '#FFFBEB',
          border: '#FDE68A',
          foreground: '#FFFFFF',
        },
        // Modern Slate neutrals for elevated typography and surfaces
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        }
      },
      fontFamily: {
        heading: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"Source Sans 3"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Enforcing minimum 12px for accessibility
        '2xs': ['12px', { lineHeight: '16px' }],
        'xs': ['13px', { lineHeight: '18px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['15px', { lineHeight: '24px' }],
        'lg': ['17px', { lineHeight: '26px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '38px' }],
        '4xl': ['38px', { lineHeight: '46px' }],
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        'card': '10px',
        'badge': '9999px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'sm': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 2px 8px -2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 4px 14px -2px rgba(15, 23, 42, 0.1), 0 2px 6px -2px rgba(15, 23, 42, 0.06)',
        'dropdown': '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
        'modal': '0 20px 35px -5px rgba(15, 23, 42, 0.2), 0 10px 15px -5px rgba(15, 23, 42, 0.08)',
      },
      animation: {
        'fadeIn': 'fadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slideUp': 'slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slideDown': 'slideDown 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
