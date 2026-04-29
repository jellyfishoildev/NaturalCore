/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Prompt', 'sans-serif'],
        body: ['Prompt', 'sans-serif'],
        mono: ['Prompt', 'sans-serif'],
      },
      colors: {
        sage: {
          50: '#f4f7f4',
          100: '#e4ede4',
          200: '#c9dbc9',
          300: '#a2c1a2',
          400: '#74a074',
          500: '#4f7f4f',
          600: '#3c633c',
          700: '#314f31',
          800: '#293f29',
          900: '#223522',
        },
        cream: {
          50: '#fdfcf8',
          100: '#faf7ee',
          200: '#f4edd8',
          300: '#ebdebb',
          400: '#dfca96',
          500: '#d2b472',
        },
        bark: {
          500: '#8b6f47',
          700: '#5c4a30',
          900: '#2d2218',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
