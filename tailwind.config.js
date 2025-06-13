/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f9fc',
          100: '#ccf3f9',
          200: '#99e7f3',
          300: '#66dbec',
          400: '#33cfe6',
          500: '#00c3df',
          600: '#009cb2',
          700: '#007586',
          800: '#004e59',
          900: '#00272d',
        },
        secondary: {
          50: '#e6eef1',
          100: '#ccdde3',
          200: '#99bbc7',
          300: '#6699ab',
          400: '#33778f',
          500: '#005573',
          600: '#00445c',
          700: '#003345',
          800: '#00222e',
          900: '#001117',
        },
        dark: {
          DEFAULT: '#1a1a1a',
          light: '#2a2a2a',
        },
      },
      fontFamily: {
        sans: ['Tajawal', 'sans-serif'],
      },
      container: {
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
  plugins: [],
}

