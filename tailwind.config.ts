import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        retrotec: {
          red: '#C8102E',     // Pantone 186C
          yellow: '#FFD100',  // Pantone Yellow C
          darkRed: '#A00D26', // Darker shade for hover states
          lightRed: '#E84855', // Lighter shade for backgrounds
          darkYellow: '#F0C800', // Darker shade for hover
          lightYellow: '#FFE45C', // Lighter shade for backgrounds
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config