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
          DEFAULT: "#3D3D3D",
          hover: "#1A1A1A"
        },
        background: "#F7F7F5",
        surface: {
          DEFAULT: "#FFFFFF",
          container: "#F1EDEC", // from html
          bright: "#FDF8F8" // from html
        },
        accent: {
          DEFAULT: "#D4880F",
          muted: "rgba(212, 136, 15, 0.15)"
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#737373"
        },
        danger: {
          DEFAULT: "#DC2626",
          surface: "#FEF2F2"
        },
        success: {
          surface: "#F0FDF4"
        },
        safeBlue: "#2563EB",
        // Mappings for the HTML classes used in the design code
        'on-surface': '#1A1A1A',
        'on-surface-variant': '#737373',
        'surface-variant': '#e5e2e1',
        'on-primary': '#FFFFFF',
        'outline-variant': '#c4c7c7'
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
