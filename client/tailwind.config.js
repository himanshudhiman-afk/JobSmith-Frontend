/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          50: "#fff7e8",
          100: "#ffedc9",
          200: "#ffdb93",
          300: "#ffc45c",
          400: "#ffad2e",
          500: "#FFA116",
          600: "#9c4f00",
          700: "#7d3f00",
          800: "#633300",
          900: "#4a2700"
        },
        "brand-blue": "#96D1F9",
        "brand-charcoal": "#2E2E2E",
        slate: {
          950: "#0b1020"
        }
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.06), 0 1px 3px 1px rgb(15 23 42 / 0.08)"
      },
      fontFamily: {
        sans: ["EB Garamond", "Georgia", "serif"]
      }
    }
  },
  plugins: []
};
