// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#1565D8',
          'blue-light': '#E8F0FE',
        },
        accent: {
          orange: '#FF8A00',
        },
        dark: {
          text: '#1E293B',
          slate: '#121826',
          'near-black': '#0A0F1A',
        },
        light: {
          background: '#F8FAFC',
        },
      },
    },
  },
  plugins: [],
}
