/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1F3864',
        brand: '#0070C0',
        accent: '#ED7D31',
        success: '#2E8B57',
        surface: '#F7F9FC',
        card: '#FFFFFF',
      },
    },
  },
  plugins: [],
};
