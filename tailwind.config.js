/** @type {import('tailwindcss').Config} */
export default {
<<<<<<< HEAD
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        surface: "#F9FAFB",     // page background
        card: "#FFFFFF",        // cards
        ink: "#111827",         // primary text
        subink: "#6B7280",      // secondary
        accent: "#2563EB",      // button blue
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        cardHover: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.05)"
      },
      borderRadius: {
        xl2: "1rem" // slightly larger than rounded-xl
=======
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bbnNavy: '#0D1B2A',
        bbnOrange: '#E36A33'
>>>>>>> c0be2d7 (Initial commit: routing, auth, upload, jobs fixes)
      }
    },
  },
  plugins: [],
<<<<<<< HEAD
}
=======
}
>>>>>>> c0be2d7 (Initial commit: routing, auth, upload, jobs fixes)
