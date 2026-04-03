import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral grayscale — replaces terracotta/olive/sand
        'okte-gray': {
          50:  '#FAFAFA',
          100: '#F5F5F5',
          200: '#EFEFEF',
          300: '#E5E5E5',
          400: '#CCCCCC',
          500: '#999999',
          600: '#6B6B6B',
          700: '#444444',
          800: '#1A1A1A',
          900: '#0A0A0A',
        },
        // Gold — the only brand accent colour (key icon, CTAs)
        'okte-gold': {
          50:  '#FDF8ED',
          100: '#FAEECF',
          200: '#F5D99E',
          300: '#EEC060',
          400: '#E4A32C',
          500: '#C4882F',
          600: '#A06A1A',
          700: '#7A4F10',
          800: '#58390A',
          900: '#362204',
        },
        // Semantic aliases — black / white / gold
        primary:        '#0A0A0A',
        'primary-dark': '#000000',
        accent:         '#C4882F',
        danger:         '#C0392B',
        'danger-light': '#FDECEA',
        success:        '#2E7D52',
        'success-light':'#E8F5EE',
        warning:        '#C4882F',
        'warning-light':'#FFF8ED',
        surface:        '#FFFFFF',
        'surface-alt':  '#F5F5F5',
        border:         '#E5E5E5',
        'text-primary': '#0A0A0A',
        'text-muted':   '#6B6B6B',
        'text-subtle':  '#999999',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem',   { lineHeight: '1.15', fontWeight: '700' }],
        'display-lg': ['2.5rem',   { lineHeight: '1.2',  fontWeight: '700' }],
        'heading-xl': ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }],
        'heading-lg': ['1.5rem',   { lineHeight: '1.3',  fontWeight: '600' }],
        'heading-md': ['1.25rem',  { lineHeight: '1.4',  fontWeight: '600' }],
        'body-lg':    ['1.125rem', { lineHeight: '1.6' }],
        'body-md':    ['1rem',     { lineHeight: '1.6' }],
        'body-sm':    ['0.875rem', { lineHeight: '1.5' }],
        caption:      ['0.75rem',  { lineHeight: '1.4' }],
      },
      spacing: {
        sidebar:      '16rem',
        'sidebar-sm': '4rem',
        topbar:       '4rem',
      },
      borderRadius: {
        card:  '0.75rem',
        modal: '1rem',
        pill:  '9999px',
      },
      boxShadow: {
        card:        '0 1px 3px 0 rgba(0,0,0,.08), 0 1px 2px -1px rgba(0,0,0,.06)',
        'card-hover':'0 4px 16px 0 rgba(0,0,0,.12)',
        modal:       '0 20px 60px -10px rgba(0,0,0,.25)',
        topbar:      '0 1px 0 0 #E5E5E5',
      },
      keyframes: {
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.2s ease-out',
        'fade-in':        'fade-in 0.15s ease-out',
        'slide-up':       'slide-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
