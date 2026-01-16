/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#707756',
          tan: '#b78c61',
          beige: '#c8b7a4',
          cream: '#edede4',
          text: '#2d3025'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif']
      },
      borderRadius: {
        '3xl': '2rem',
        '4xl': '2.5rem'
      }
    },
  },
  plugins: [],
}
