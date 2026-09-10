/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B5E7B',
          hover: '#164D66',
          light: '#E8F4F8',
          border: '#BFE0EC',
        },
        secondary: {
          DEFAULT: '#E67E22',
          hover: '#D35400',
          light: '#FFF3E0',
          border: '#FAD7A0',
        },
        success: {
          DEFAULT: '#27AE60',
          hover: '#219653',
          light: '#E8F8F0',
          border: '#A9DFBF',
        },
        violation: {
          DEFAULT: '#C0392B',
          hover: '#962D22',
          light: '#FDEDEC',
          border: '#F5B7B1',
        },
        warning: {
          DEFAULT: '#F39C12',
          hover: '#E67E22',
          light: '#FEF9E7',
          border: '#FAD7A0',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#1A1A2E',
        }
      },
      fontFamily: {
        heading: ['"DM Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'card': '8px',
        'badge': '9999px',
      }
    },
  },
  plugins: [],
}
