module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus)', 'sans-serif'],
      },
      colors: {
        bg:           '#030a16',
        surface:      '#071020',
        card:         '#091828',
        border:       '#0d2240',
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
      },
    },
  },
  plugins: [],
};
