/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        ink: 'var(--ink)',
        inkmuted: 'var(--ink-muted)',
        line: 'var(--line)',
        accent: 'var(--accent)',
        accentink: 'var(--accent-ink)',
        accentsoft: 'var(--accent-soft)',
        gold: 'var(--gold)',
        goldsoft: 'var(--gold-soft)',
        danger: 'var(--danger)',
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
