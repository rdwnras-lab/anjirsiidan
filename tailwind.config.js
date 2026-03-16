module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      colors: {
        // Store colors
        bg:           '#040d1f',
        surface:      '#071020',
        card:         '#091828',
        border:       '#0e2445',
        accent:       '#1d6fff',
        'accent-h':   '#1558e0',
        'accent-light':'#60a5fa',
        'accent-dark': '#0d3b8a',
        gold:         '#f59e0b',
        success:      '#10b981',
        danger:       '#ef4444',
        muted:        '#3d5a7a',
        dim:          '#7bafd4',
        text:         '#e8f4ff',
        // Template gray scale
        gray: {
          25:  '#fcfcfd',
          50:  '#f9fafb',
          100: '#f2f4f7',
          200: '#e4e7ec',
          300: '#d0d5dd',
          400: '#98a2b3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#1d2939',
          900: '#101828',
          950: '#0c111d',
        },
        // Template brand blue
        brand: {
          50:  '#ecf3ff',
          100: '#dde9ff',
          200: '#c2d6ff',
          300: '#9cb9ff',
          400: '#7592ff',
          500: '#465fff',
          600: '#3641f5',
          700: '#2a31d8',
        },
      },
    },
  },
  plugins: [],
};
