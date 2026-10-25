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
        bubblegum: {
          50: '#FFF0F6',
          100: '#FFE4F0',
          200: '#FFC4E1',
          300: '#FFA1CE',
          400: '#FF70B5',
          DEFAULT: '#FF5E97',
          hover: '#F04883',
          600: '#E6397F',
          700: '#C2185B',
        },
        lace: {
          50: '#FDFBF8',
          100: '#FAF5F0',
          200: '#EDE2D8',
          300: '#E0CEBF',
          400: '#BFA999',
          500: '#8E756B',
          DEFAULT: '#FAF5F0',
          card: '#FFFDFB',
          border: '#EDE2D8',
          dark: '#150D14',
          darkCard: '#221520',
          darkElevated: '#2C1A29',
          darkBorder: '#3D2637',
        },
        apple: {
          bg: '#FAF5F0',
          card: '#FFFDFB',
          darkBg: '#150D14',
          darkCard: '#221520',
          darkElevated: '#2C1A29',
          blue: {
            DEFAULT: '#FF5E97',
            hover: '#F04883',
            subtle: '#FFF0F6',
            darkSubtle: 'rgba(255, 94, 151, 0.18)',
          },
          green: {
            DEFAULT: '#10B981',
            subtle: '#ECFDF5',
            darkSubtle: 'rgba(16, 185, 129, 0.18)',
          },
          red: {
            DEFAULT: '#F43F5E',
            subtle: '#FFF1F2',
            darkSubtle: 'rgba(244, 63, 94, 0.18)',
          },
          orange: {
            DEFAULT: '#FB923C',
            subtle: '#FFF7ED',
            darkSubtle: 'rgba(251, 146, 60, 0.18)',
          },
          purple: {
            DEFAULT: '#D946EF',
            subtle: '#FDF2F8',
            darkSubtle: 'rgba(217, 70, 239, 0.18)',
          },
          gray: {
            50: '#FDFBF8',
            100: '#FAF5F0',
            200: '#EDE2D8',
            300: '#D8C6B8',
            400: '#B59F91',
            500: '#8E756B',
            600: '#6E574F',
            700: '#523E37',
            800: '#3D2637',
            850: '#2C1A29',
            900: '#221520',
            950: '#150D14',
          }
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
      boxShadow: {
        'apple-card': '0 2px 8px -2px rgba(0, 0, 0, 0.04), 0 1px 3px -1px rgba(0, 0, 0, 0.02)',
        'apple-card-hover': '0 12px 28px -4px rgba(0, 0, 0, 0.07), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
        'apple-modal': '0 24px 48px -12px rgba(0, 0, 0, 0.18), 0 8px 16px -4px rgba(0, 0, 0, 0.08)',
        'apple-pill': '0 2px 6px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'apple-sm': '10px',
        'apple-md': '14px',
        'apple-lg': '18px',
        'apple-xl': '22px',
        'apple-2xl': '26px',
      }
    },
  },
  plugins: [],
}
