/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bce0ff",
          300: "#8eceff",
          400: "#59b0ff",
          500: "#338ef7",
          600: "#1d6fe8",
          700: "#1558cc",
          800: "#1747a6",
          900: "#193f85",
        },
      },
    },
  },
  plugins: [],
};
