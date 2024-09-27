const { Light } = require('three');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./<custom directory>/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors:
        {
          background: {
            light: "EDDDDD",
            dark: "#252422",
          },
          yellow: '#FFD100',
          gray: {
            light: '#EDDDDD',
            dark: '#ACA8A1',
          },
          blue: '#00CECB',
          red: {
            warning: '#EB5E28',
            liked: '#EB5E28',
          }
        }
    },
  },
  plugins: [],
}

