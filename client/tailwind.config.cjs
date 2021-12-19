module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{svelte,css,html}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'dark-blue': '#161f27'
      },
      outline: {
        white: ['2px solid white']
      },
      borderWidth: {
        '3': '3px'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
