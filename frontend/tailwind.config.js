/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        navy: '#0A0F1C',
        card: '#1E293B',
        inset: '#0F172A',
        accent: {
          DEFAULT: '#0da2e7',
          light: '#22D3EE',
          dark: '#0b8ecc',
        },
        muted: '#64748B',
        secondary: '#94A3B8',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        violet: '#8B5CF6',
        rose: '#EC4899',
        surface: {
          DEFAULT: '#111827',
          light: '#1F2937',
          lighter: '#374151',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient-x': 'gradientX 6s ease infinite',
        'shimmer-fast': 'shimmerFast 2s ease-in-out infinite',
        'float-gentle': 'floatGentle 4s ease-in-out infinite',
        'breathe': 'breatheSoft 3s ease-in-out infinite',
        'glow-ring': 'glowRing 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(13, 162, 231, 0.2)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(13, 162, 231, 0.15)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmerFast: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        breatheSoft: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.04)', opacity: '1' },
        },
        glowRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(13, 162, 231, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(13, 162, 231, 0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-dark': 'radial-gradient(at 0% 0%, rgba(13,162,231,0.08) 0%, transparent 50%), radial-gradient(at 100% 0%, rgba(139,92,246,0.06) 0%, transparent 50%), radial-gradient(at 50% 100%, rgba(34,211,238,0.04) 0%, transparent 50%)',
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(13,162,231,0.15)',
        'glow': '0 0 24px rgba(13,162,231,0.2), 0 0 48px rgba(13,162,231,0.08)',
        'glow-lg': '0 0 40px rgba(13,162,231,0.3), 0 0 80px rgba(13,162,231,0.12)',
        'glow-violet': '0 0 24px rgba(139,92,246,0.2), 0 0 48px rgba(139,92,246,0.08)',
        'inner-highlight': 'inset 0 1px 0 rgba(255,255,255,0.06)',
        'card-rest': '0 4px 16px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-hover': '0 20px 60px -15px rgba(13,162,231,0.2), 0 0 50px -10px rgba(13,162,231,0.1), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
}
