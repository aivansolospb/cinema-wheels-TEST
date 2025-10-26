/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tg-bg': 'var(--tg-theme-bg-color, #ffffff)',
        'tg-text': 'var(--tg-theme-text-color, #000000)',
        'tg-hint': 'var(--tg-theme-hint-color, #999999)',
        'tg-link': 'var(--tg-theme-link-color, #007aff)',
        'tg-button': 'var(--tg-theme-button-color, #007aff)',
        'tg-button-text': 'var(--tg-theme-button-text-color, #ffffff)',
        'tg-secondary-bg': 'var(--tg-theme-secondary-bg-color, #f2f2f7)',
        'tg-error': '#ff3b30',
        'tg-success': '#34c759',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        slideInUp: {
            '0%': { transform: 'translateY(100%)' },
            '100%': { transform: 'translateY(0)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out forwards',
        fadeInUp: 'fadeInUp 0.5s ease-out forwards',
        scaleIn: 'scaleIn 0.2s ease-out forwards',
        slideInUp: 'slideInUp 0.35s cubic-bezier(.21,1.02,.73,1) forwards',
      },
    },
  },
  plugins: [],
}