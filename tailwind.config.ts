import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Terracotta — the primary brand colour
        'okte-terra': {
          50:  '#FDF5F0',
          100: '#FAE6DA',
          200: '#F4C9B0',
          300: '#EDA47E',
          400: '#E07A4E',
          500: '#C4562A',
          600: '#8B3A2A',
          700: '#6B2D1A',
          800: '#4E1F10',
          900: '#311208',
        },
        // Olive / sage — secondary natural tone
        'okte-olive': {
          50:  '#F5F7F0',
          100: '#E8EDD9',
          200: '#CDD8B0',
          300: '#ABBE82',
          400: '#87A055',
          500: '#637A38',
          600: '#4A5C28',
          700: '#354219',
          800: '#232C0F',
          900: '#141A08',
        },
        // Sand / linen — warm neutral
        'okte-sand': {
          50:  '#FDFAF5',
          100: '#F7F0E3',
          200: '#EDDDBE',
          300: '#DEC594',
          400: '#CCAA68',
          500: '#B48E45',
          600: '#8A6C2F',
          700: '#6B5020',
          800: '#4E3914',
          900: '#32240B',
        },
        // Keep gold scale for key-token accent (shifted warmer)
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
        // Semantic aliases → Mediterranean palette
        primary:       '#8B3A2A',   // terracotta-600
        'primary-dark':'#6B2D1A',   // terracotta-700
        accent:        '#C4882F',   // warm honey gold
        danger:        '#C0392B',
        'danger-light':'#FDECEA',
        success:       '#2E7D52',
        'success-light':'#E8F5EE',
        warning:       '#C4882F',
        'warning-light':'#FDF3E0',
        surface:       '#FDFAF5',   // warm linen (not stark white)
        'surface-alt': '#F7F0E3',   // sand-100
        border:        '#E8DCCF',   // warm sand border
        'text-primary':'#2C1810',   // deep warm brown
        'text-muted':  '#8A7560',   // warm stone
        'text-subtle': '#B5A090',   // lightest warm tone
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.15', fontWeight: '700' }],
        'display-lg': ['2.5rem', { lineHeight: '1.2',  fontWeight: '700' }],
        'heading-xl': ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }],
        'heading-lg': ['1.5rem',   { lineHeight: '1.3',  fontWeight: '600' }],
        'heading-md': ['1.25rem',  { lineHeight: '1.4',  fontWeight: '600' }],
        'body-lg':    ['1.125rem', { lineHeight: '1.6' }],
        'body-md':    ['1rem',     { lineHeight: '1.6' }],
        'body-sm':    ['0.875rem', { lineHeight: '1.5' }],
        caption:      ['0.75rem',  { lineHeight: '1.4' }],
      },
      spacing: {
        sidebar:    '16rem',
        'sidebar-sm': '4rem',
        topbar:     '4rem',
      },
      borderRadius: {
        card:  '0.75rem',
        modal: '1rem',
        pill:  '9999px',
      },
      boxShadow: {
        card:       '0 1px 3px 0 rgba(44,24,16,.08), 0 1px 2px -1px rgba(44,24,16,.06)',
        'card-hover':'0 4px 16px 0 rgba(44,24,16,.14)',
        modal:      '0 20px 60px -10px rgba(44,24,16,.28)',
        topbar:     '0 1px 0 0 #E8DCCF',
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
