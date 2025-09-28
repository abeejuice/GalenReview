/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        surface: 'var(--color-bg-alt)',
        surfaceMuted: 'var(--color-bg-muted)',
        borderMuted: 'var(--color-border)',
        primary: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--color-accent-foreground)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(234,106,71,0.25), 0 20px 40px -20px rgba(234,106,71,0.4)',
        card: 'var(--shadow-card, 0 12px 30px -20px rgba(0,0,0,0.6))',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
