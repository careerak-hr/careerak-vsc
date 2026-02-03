/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: '#1A365D',
        light: '#274C7A',
        dark: '#102A4C',
      },
      secondary: {
        DEFAULT: '#E3DAD0',
        light: '#EFE9E3',
        dark: '#CFC5BA',
      },
      accent: {
        DEFAULT: '#C97A3D',
        light: '#E2A36F',
        dark: '#A8612E',
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
      hint: '#9CA3AF',
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
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
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
  plugins: [
    require('tailwindcss-animate'),
  ],
}
