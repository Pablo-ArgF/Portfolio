/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'tw-',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#7e22ce',
        secondary: '#080808',
        outlineColor: '#1F2123',
      },
      fontFamily: {
        'ubuntu': ['Ubuntu', 'sans-serif'],
        'dancing': ['Dancing Script', 'cursive'],
      },
      animation: {
        'infinite-scroll': 'infinite-scroll 80s linear infinite',
      },
      keyframes: {
        'infinite-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

