/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // zinc-950
        surface: '#18181b', // zinc-900
        border: '#27272a', // zinc-800
        textPrimary: '#f4f4f5', // zinc-100
        textSecondary: '#a1a1aa', // zinc-400
        accent: {
          success: '#10b981', // emerald-500
          danger: '#f43f5e', // rose-500
          ai: '#8b5cf6', // violet-500
          pending: '#f59e0b', // amber-500
          live: '#22d3ee' // cyan-400
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
