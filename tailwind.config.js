/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"IBM Plex Sans Arabic"', 'Tahoma', 'sans-serif'] },
      colors: {
        ink: '#16212b', mist: '#e9eef2', line: '#dbe2e8', soft: '#eef2f5', mute: '#6b7885',
        brand: { DEFAULT: '#0e7c86', dark: '#0a5f67' }, gold: '#c98a12', danger: '#c2352b',
      },
    },
  },
  plugins: [],
};
