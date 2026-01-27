/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    colors: {
      // الألوان الأساسية المستخرجة من اللوجو
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

      // رمادي محايد — استخدام إرشادي فقط
      hint: '#9CA3AF', // Light Neutral Gray (placeholders & hints)

      // ألوان حيادية تقنية
      white: '#FFFFFF',
      black: '#000000',
      transparent: 'transparent',
    },

    extend: {
      animation: {
        'spin-slow': 'spin 8s linear infinite',
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
