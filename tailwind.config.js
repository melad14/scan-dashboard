/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0e172a',
        tealBrand: '#0d9488',
        amberBrand: '#f59e0b',
      }
    },
  },
  plugins: [],
}
