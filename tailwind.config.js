
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bbnNavy: '#0D1B2A',
        bbnOrange: '#E36A33'
      }
    },
  },
  plugins: [],
}
