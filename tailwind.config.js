/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        appBackground: "#F6F8FC",
        surface: "#FFFFFF",
        sidebar: "#071A2E",
        sidebarElevated: "#132A43",
        sidebarBorder: "#223B56",
        textPrimary: "#111827",
        textSecondary: "#667085",
        textMuted: "#98A2B3",
        border: "#E4E7EC",
        borderStrong: "#D0D5DD",
        primary: {
          DEFAULT: "#4055E8",
          hover: "#3548D6",
          soft: "#EEF0FF",
        },
        cyan: {
          DEFAULT: "#2E90FA",
          soft: "#EAF4FF",
        },
        success: {
          DEFAULT: "#12B76A",
          soft: "#EAFBF3",
        },
        warning: {
          DEFAULT: "#F79009",
          soft: "#FFF5E6",
        },
        danger: {
          DEFAULT: "#F04438",
          soft: "#FFF0EE",
        },
        purple: {
          DEFAULT: "#7A5AF8",
          soft: "#F2EEFF",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(16,24,40,0.04)',
      },
    },
  },
  plugins: [],
}
