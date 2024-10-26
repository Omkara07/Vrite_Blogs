/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        gelasio: ['Gelasio', 'serif'], // Add Gelasio font
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0)' },
          '30%': { transform: 'scale(1.2)' },
          '50%': { transform: 'scale(1.5)' },
          '80%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        pop: 'pop 0.3s ease-out', // animation named 'pop', lasting 0.3s
      },
    },
  },
  plugins: [],
}

