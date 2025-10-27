/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ebf5ff",
          100: "#d0e6ff",
          200: "#a0ceff",
          300: "#70b6ff",
          400: "#409eff",
          500: "#0c87ff",
          600: "#006bd6",
          700: "#0053aa",
          800: "#003c7d",
          900: "#002551",
        },
      },
      boxShadow: {
        subtle: "0 10px 30px -12px rgba(20, 87, 173, 0.25)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        "gentle": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
