import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        primary: "#E91E63",
        "primary-hover": "#C2185B",
        secondary: "#1A1A2E",
        accent: "#FF4081",
        "background-light": "#F3F4F6",
        "background-dark": "#0F172A",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1E293B",
        "card-light": "#FFFFFF",
        "card-dark": "#1E293B",
        "accent-success": "#10B981",
        "accent-warning": "#F59E0B",
        "accent-dark": "#374151"
      },
      fontFamily: {
        sans: ['Cairo', '"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['Cairo', '"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        body: ['Cairo', '"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
      },
      borderRadius: {
        // keeping default border radius so we don't break next.js defaults
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top right, #E91E63 0%, transparent 40%), radial-gradient(circle at bottom left, #3B82F6 0%, transparent 40%)',
        'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.05)',
        'glass-dark': '0 4px 30px rgba(0, 0, 0, 0.3)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0.5', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'marquee': 'marquee 30s linear infinite'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')
  ],
} satisfies Config;
