/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'inter': ['Inter', 'sans-serif']
    },
    extend: {
      colors: {
        theme_black: '#1D1E20',
        theme_white: '#FEFEFE',
        theme_silver_500: '#8F959E',
        theme_silver_200: '#D9D9D9',
        theme_silver_100: '#F5F6FA',
        theme_purple: '#B66CF5',
        theme_yellow: '#F5FD40'
      }
    },
  },
  plugins: [],
}

