/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-background': '#F0F0F0', // Fundo principal cinza claro
        'brand-surface': '#FFFFFF',   // Superfície dos cards
        'brand-text': '#212121',      // Texto principal
        'brand-accent': '#D9D2E9',    // Roxo suave para acentos
        'brand-primary': '#E0C53B',   // Amarelo do título
      }
    },
  },
  plugins: [],
}