/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
        },
        surface: {
          50:  '#fafbff',
          100: '#f1f5f9',
          200: '#e8ecf4',
          300: '#d1d9e6',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(99, 102, 241, 0.12)',
        'soft': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card': '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.03)',
        'elevated': '0 10px 25px -5px rgba(99, 102, 241, 0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
        'btn': '0 4px 14px rgba(79, 70, 229, 0.3)',
        'btn-hover': '0 6px 20px rgba(79, 70, 229, 0.4)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
