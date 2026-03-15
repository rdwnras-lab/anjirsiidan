module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus)', 'sans-serif'],
      },
      colors: {
        bg:      '#05050d',
        surface: '#0c0c18',
        card:    '#101020',
        border:  '#1a1a2e',
        accent:  '#7c3aed',
        'accent-h': '#6d28d9',
        'accent-light': '#a78bfa',
        gold:    '#f59e0b',
        success: '#10b981',
        danger:  '#ef4444',
        muted:   '#4b5563',
        dim:     '#9ca3af',
        text:    '#f1f0ff',
      },
    },
  },
  plugins: [],
};
