/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0b162a',
          900: '#14284B',
          800: '#1e3865',
          700: '#2a4b82',
          600: '#3c64a5',
          100: '#e8eef8',
        },
        slatebg: '#DCE6F0',
        yellowacc: '#FFD60A',
        amberacc: '#F59E0B',
      },
      fontFamily: {
        serif: ['"Bitter"', '"Source Serif Pro"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
