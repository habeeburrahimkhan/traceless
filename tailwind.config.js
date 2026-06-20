/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#030303",
          card: "#09090b",
          cardLight: "#18181b",
          border: "#1f1f23",
          borderLight: "#2e2e33",
          muted: "#8e8e93",
          emerald: {
            DEFAULT: "#10b981",
            glow: "rgba(16, 185, 129, 0.15)",
          },
          rose: {
            DEFAULT: "#f43f5e",
            glow: "rgba(244, 63, 94, 0.15)",
          },
          cyan: {
            DEFAULT: "#06b6d4",
            glow: "rgba(6, 182, 212, 0.15)",
          },
          amber: {
            DEFAULT: "#fbbf24",
            glow: "rgba(251, 191, 36, 0.15)",
          }
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'grid-scroll': 'gridScroll 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        gridScroll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(40px)' }
        }
      }
    },
  },
  plugins: [],
}
