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
        apple: {
          bg: '#F5F5F7',
          card: '#FFFFFF',
          darkBg: '#0A0A0C',
          darkCard: '#151518',
          darkElevated: '#1C1C20',
          blue: {
            DEFAULT: '#0071E3',
            hover: '#0077ED',
            subtle: '#EBF4FF',
            darkSubtle: 'rgba(0, 113, 227, 0.15)',
          },
          green: {
            DEFAULT: '#34C759',
            subtle: '#EDFDF2',
            darkSubtle: 'rgba(52, 199, 89, 0.15)',
          },
          red: {
            DEFAULT: '#FF3B30',
            subtle: '#FFF1F0',
            darkSubtle: 'rgba(255, 59, 48, 0.15)',
          },
          orange: {
            DEFAULT: '#FF9500',
            subtle: '#FFF8EB',
            darkSubtle: 'rgba(255, 149, 0, 0.15)',
          },
          purple: {
            DEFAULT: '#AF52DE',
            subtle: '#FBF2FF',
            darkSubtle: 'rgba(175, 82, 222, 0.15)',
          },
          gray: {
            50: '#F5F5F7',
            100: '#EBEBF0',
            200: '#DCDCE2',
            300: '#C7C7CC',
            400: '#AEAEC2',
            500: '#8E8E93',
            600: '#636366',
            700: '#48484A',
            800: '#2C2C2E',
            850: '#222226',
            900: '#1C1C1E',
            950: '#121214',
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
