/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:
      {
        primary: {
          '25' : '#DBFCFF',
          '50' : '#C9FAFF',
          '100':'#C9E4F0',
          '150':'#69E2FF',
          '300':'#6CD6FF',
          '200':'#05BAFF',
        },
        secondary: '#FE68E0',
        wierd: "#E5FF01",
        select: "#EEEEEE",
        back:'#000000'
      }
    },
  },
  plugins: [],
}