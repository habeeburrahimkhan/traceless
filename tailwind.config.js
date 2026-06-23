function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          50: withOpacity("--zinc-50-rgb"),
          100: withOpacity("--zinc-100-rgb"),
          200: withOpacity("--zinc-200-rgb"),
          300: withOpacity("--zinc-300-rgb"),
          400: withOpacity("--zinc-400-rgb"),
          500: withOpacity("--zinc-500-rgb"),
          650: withOpacity("--zinc-600-rgb"), // Ensure we support any custom zinc-650 in original code
          600: withOpacity("--zinc-600-rgb"),
          750: withOpacity("--zinc-700-rgb"), // Ensure we support any custom zinc-750 in original code
          700: withOpacity("--zinc-700-rgb"),
          855: withOpacity("--zinc-800-rgb"),
          800: withOpacity("--zinc-800-rgb"),
          900: withOpacity("--zinc-900-rgb"),
          955: withOpacity("--zinc-950-rgb"), // Ensure we support any custom zinc-955 in original code
          950: withOpacity("--zinc-950-rgb"),
        },
        cyber: {
          bg: withOpacity("--cyber-bg-rgb"),
          card: withOpacity("--cyber-card-rgb"),
          cardLight: withOpacity("--cyber-cardLight-rgb"),
          border: withOpacity("--cyber-border-rgb"),
          borderLight: withOpacity("--cyber-borderLight-rgb"),
          muted: "var(--cyber-muted)", // simple variable works since it has no slash opacity modifiers in code
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
