/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // DT Growth Partners brand colors
        brand: {
          50: '#e6f3ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#26BDF0',
          500: '#0F76D6',
          600: '#0B5FAE',
          700: '#084986',
          800: '#05335E',
          900: '#021D36',
        },
        surface: {
          50: '#2A2A2A',
          100: '#1F1F1F',
          200: '#1A1A1A',
          300: '#151515',
          400: '#121212',
          500: '#0D0D0D',
          600: '#0A0A0A',
          700: '#070707',
          800: '#050505',
          900: '#020202',
        },
        muted: {
          50: '#E0E0E0',
          100: '#BDBDBD',
          200: '#999999',
          300: '#757575',
          400: '#616161',
          500: '#4A4A4A',
          600: '#383838',
          700: '#2D2D2D',
          800: '#262626',
          900: '#1A1A1A',
        },
        accent: {
          cyan: '#C2FBFF',
          blue: '#26BDF0',
          glow: '#0F76D6',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-down': 'fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-left': 'slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'count-up': 'countUp 0.8s ease-out forwards',
        'progress-bar': 'progressBar 1.5s ease-in-out infinite',
        'gradient-x': 'gradientX 3s ease infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up-fade': 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'ripple': 'ripple 0.6s ease-out',
        'border-glow': 'borderGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.08)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        progressBar: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(15, 118, 214, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(15, 118, 214, 0.35)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideUpFade: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(15, 118, 214, 0.3)' },
          '50%': { borderColor: 'rgba(38, 189, 240, 0.6)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(135deg, #0F76D6 0%, #26BDF0 50%, #C2FBFF 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0A0A0A 0%, #121212 100%)',
        'card-gradient': 'linear-gradient(180deg, #151515 0%, #0D0D0D 100%)',
        'hero-glow': 'radial-gradient(ellipse at 50% 0%, rgba(15, 118, 214, 0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(15, 118, 214, 0.15)',
        'glow-lg': '0 0 40px rgba(15, 118, 214, 0.25)',
        'glow-xl': '0 0 60px rgba(15, 118, 214, 0.3)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(15, 118, 214, 0.1)',
        'navbar': '0 1px 3px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
};
