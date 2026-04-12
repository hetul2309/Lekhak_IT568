/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "primary-gradient": "linear-gradient(90deg, #FF6A00, #FF2D8D)",
      },
      colors: {
        primary: "#FF6A00",
        secondary: "#FF2D8D",
      },
    },
  },
  plugins: [],
};