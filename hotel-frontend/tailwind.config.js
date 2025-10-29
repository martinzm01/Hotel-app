/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Esta línea le dice a Tailwind cómo manejar el modo oscuro
  darkMode: 'class', 
  theme: {
    extend: {},
  },
  plugins: [],
}

