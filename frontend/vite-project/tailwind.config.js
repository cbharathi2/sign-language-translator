/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0fdfe',
          100: '#ccf7fe',
          200: '#99eefe',
          300: '#4ddefa',
          400: '#18c7f1',
          500: '#06aad8',
          600: '#0788b5',
          700: '#0c6d93',
          800: '#145878',
          900: '#154965',
        },
        dark: {
          bg:      '#0e0f14',
          surface: '#13141a',
          surface2:'#181920',
          offset:  '#1e1f28',
          offset2: '#23242e',
          border:  '#2a2b36',
          divider: '#313240',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 4s linear infinite',
        'gradient': 'gradient 6s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(6,170,216,0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(6,170,216,0.6)' },
        },
      },
      backgroundSize: {
        '300%': '300% 300%',
      }
    }
  },
  plugins: [],
}