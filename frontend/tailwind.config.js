/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    colors: {
      // Colors are now aligned with CORE_RULES.md
      primary: {
        DEFAULT: '#304B60', // الكحلي الوقور
        light: '#4A6A88', // Lighter shade for hover, etc.
        dark: '#1A2C3F',  // Darker shade for active, etc.
      },
      secondary: {
        DEFAULT: '#E3DAD1', // البيج الملكي
        light: '#E8DFD6',   // بيج أفتح قليلاً (بدلاً من الأبيض)
        dark: '#D2C9C0',
      },
      accent: {
        DEFAULT: '#D48161', // النحاسي الفخم
        light: '#E5A88C',
        dark: '#B86B49',
      },
      danger: {
        DEFAULT: '#D32F2F',
        light: '#E57373',
        dark: '#B71C1C',
      },
      success: {
        DEFAULT: '#388E3C',
        light: '#81C784',
        dark: '#1B5E20',
      },
      hint: '#9CA3AF', // As per CORE_RULES for hints
      white: '#FFFFFF',
      black: '#000000',
      transparent: 'transparent',
    },

    extend: {
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'expand-glow': {
            '0%': { transform: 'scale(1)', opacity: '0.05' },
            '100%': { transform: 'scale(100)', opacity: '0' },
        },
        'modal-enter': {
            '0%': { opacity: '0', transform: 'scale(0.95)' },
            '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shake': {
            '0%, 100%': { transform: 'translateX(0)' },
            '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
            '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
        'expand-glow': 'expand-glow 4s ease-out infinite',
        'modal-enter': 'modal-enter 0.3s ease-out forwards',
        'shake': 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
      fontFamily: {
        arabic: ['Amiri', 'Cairo', 'serif'],
        english: ['Cormorant Garamond', 'serif'],
        french: ['EB Garamond', 'serif'],
        'heading-ar': ['Amiri', 'serif'],
        'heading-en': ['Cormorant Garamond', 'serif'],
        'heading-fr': ['EB Garamond', 'serif'],
        'body-ar': ['Amiri', 'Cairo', 'serif'],
        'body-en': ['Cormorant Garamond', 'serif'],
        'body-fr': ['EB Garamond', 'serif'],
      },
    },
  },
  plugins: [],
}
