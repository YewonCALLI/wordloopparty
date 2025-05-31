module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'cursor-move': 'cursorMove 2s infinite linear',
      },
      keyframes: {
        cursorMove: {
          '0%': { top: '0%', left: '0%' },
          '25%': { top: '0%', left: '80%' },
          '50%': { top: '80%', left: '80%' },
          '75%': { top: '80%', left: '0%' },
          '100%': { top: '0%', left: '0%' },
        },
      },
    },
  },
  plugins: [],
}
