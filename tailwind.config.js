/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#000180',
        secondary: '#4f46e4',
      }
    },
  },
  plugins: [],
};
