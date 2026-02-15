/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Construction-themed professional palette
        'construction-orange': '#FF6B35',
        'construction-orange-light': '#FF906E',
        'construction-orange-dark': '#E55A2B',
        'forest-green': '#2F4F2F',
        'forest-green-light': '#4A6C4A',
        'sky-construction': '#87CEEB',
        'steel-gray': '#43464B',
        'tool-steel': '#2C2C34',
        'wood-light': '#DEB887',
        'wood-dark': '#BC9A6A',
        
        // Professional neutrals
        'slate-50': '#F8FAFC',
        'slate-100': '#F1F5F9',
        'slate-200': '#E2E8F0',
        'slate-300': '#CBD5E1',
        'slate-400': '#94A3B8',
        'slate-500': '#64748B',
        'slate-600': '#475569',
        'slate-700': '#334155',
        'slate-800': '#1E293B',
        'slate-900': '#0F172A',
        
        // Status colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'display': ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'construction': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'construction-lg': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      borderRadius: {
        'construction': '12px',
        'construction-sm': '8px',
        'construction-lg': '16px',
      },
    },
  },
  plugins: [],
}
