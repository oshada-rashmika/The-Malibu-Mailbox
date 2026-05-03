/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        'rose-gold': '#E0BFB8',
        'blush-pink': '#F5E1E1',
        'silk-white': '#F9F7F7',
        'deep-velvet': '#2D0B0B',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
        'glass-border': 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
        handwriting: ['var(--font-handwriting)', 'cursive'],
      },
    },
  },
}
