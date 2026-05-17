import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0d0f0e',
        surface: '#131613',
        accent: '#c9a96e',
        'accent-hover': '#d4b47a',
        'text-primary': '#f0ede6',
        'text-secondary': '#8a8780',
        'text-tertiary': '#5a5855',
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-sm': ['2.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-md': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['5.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-xl': ['7.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
    },
  },
}

export default config
