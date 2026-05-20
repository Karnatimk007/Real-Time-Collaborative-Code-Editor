/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F0A16",
        surface: "#181025",
        card: "#261C39",
        border: "#33284A",
        primary: "#A25AFA",
        primaryHover: "#B46CFF",
        text: "#F5F5F7",
        textMuted: "#9699A6",
        success: "#22BC5C",
        danger: "#EF4E4B",
        // Map existing UI classes to the new theme colors
        cyber: {
          900: "#0F0A16", // maps to background
          800: "#181025", // maps to surface
          700: "#33284A", // maps to border
          600: "#33284A", // maps to border
          500: "#9699A6", // maps to textMuted
          400: "#C8C5CB", // maps to textSecondary
        },
        neon: {
          purple: "#A25AFA", // maps to primary
          blue: "#B46CFF", // maps to primaryHover
          green: "#22BC5C", // maps to success
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #8B46F8 0%, #A25AFA 100%)',
      }
    },
  },
  plugins: [],
}

