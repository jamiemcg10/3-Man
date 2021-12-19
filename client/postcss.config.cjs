// postcss.config.js
module.exports = {
	plugins: [
	  // Some plugins, like postcss-nested, need to run before Tailwind
  
	  require('tailwindcss'),
  
	  // But others, like autoprefixer, need to run after
  
	  require('autoprefixer'),
	],
  }