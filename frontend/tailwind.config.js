/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF5232',
        primaryDark: '#D93B1E',
        black: '#111111',
        warm: '#FFFFFF',
        soft: '#F8F9FA',
        muted: '#555555',
        border: '#E5E7EB',
        error: '#E74C3C',
        success: '#27AE60',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
      borderRadius: {
        sm: '9px',
        md: '11px',
        lg: '14px',
      },
      boxShadow: {
        input: '0 1px 2px rgba(0,0,0,0.05)',
        focus: '0 0 0 3px rgba(255,99,61,0.15)',
      },
    },
  },
};
