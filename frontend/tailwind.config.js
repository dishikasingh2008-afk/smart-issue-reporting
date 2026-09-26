/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f7f9fb', 100: '#eff2f8', 200: '#dee6f0', 300: '#ced9e9',
          400: '#becce2', 500: '#adc0da', 600: '#9db3d3', 700: '#8092ac',
          800: '#637186', 900: '#47515f',
        },
        wine: {
          50: '#f1eeef', 100: '#e4dedf', 200: '#c8bcc0', 300: '#ad9ba0',
          400: '#917980', 500: '#765860', 600: '#5a3641', 700: '#3f1521',
          800: '#2f1019', 900: '#200a10',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        cardHover: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
