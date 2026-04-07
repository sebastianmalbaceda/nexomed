/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Esto cubrirá src/app/pages/LoginPage.tsx
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}