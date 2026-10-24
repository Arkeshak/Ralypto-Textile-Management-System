/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      aspectRatio: {
        '3/4': '3 / 4',
        '4/3': '4 / 3',
        '16/10': '16 / 10',
      },
      colors: {
        // === SEMANTIC SURFACE TOKENS ===
        surface: {
          primary: '#FFFFFF',
          secondary: '#F5F5F7',
          tertiary: '#EBEBF0',
          elevated: '#FFFFFF',
          overlay: 'rgba(0,0,0,0.45)',
        },
        // === TEXT TOKENS ===
        label: {
          primary: '#1D1D1F',
          secondary: '#6E6E73',
          tertiary: '#AEAEB2',
          quaternary: '#C7C7CC',
          inverted: '#FFFFFF',
        },
        // === SEPARATOR/BORDER ===
        separator: {
          DEFAULT: '#D2D2D7',
          opaque: '#C6C6C8',
        },
        // === PRIMARY ACTION (Apple blue derivative) ===
        action: {
          50: '#E8F4FF',
          100: '#CCE5FF',
          200: '#99CBFF',
          300: '#66B0FF',
          400: '#3395FF',
          500: '#0071E3',
          600: '#005DC1',
          700: '#004899',
          800: '#003471',
          900: '#001F49',
        },
        // === FASHION ACCENT (champagne/warm rose) ===
        accent: {
          50: '#FDF8F3',
          100: '#FAF0E4',
          200: '#F4E0C8',
          300: '#EDD0AC',
          400: '#E4BA87',
          500: '#C9956A',
          600: '#A87248',
          700: '#835431',
          800: '#5E3820',
          900: '#3A1F0F',
        },
        // === SUCCESS ===
        success: {
          50: '#F0FAF4',
          100: '#D8F3E4',
          500: '#34C759',
          600: '#28A046',
          700: '#1D7A33',
        },
        // === WARNING ===
        warning: {
          50: '#FFFBF0',
          100: '#FFF3CC',
          500: '#FF9F0A',
          600: '#CC7D00',
          700: '#9A5E00',
        },
        // === ERROR ===
        error: {
          50: '#FFF2F2',
          100: '#FFD9D9',
          500: '#FF3B30',
          600: '#CC2E25',
          700: '#99221B',
        },
        // === NEUTRAL SCALE ===
        neutral: {
          0: '#FFFFFF',
          50: '#F9F9F9',
          100: '#F2F2F2',
          150: '#EBEBEB',
          200: '#E0E0E0',
          300: '#C8C8C8',
          400: '#AEAEAE',
          500: '#8C8C8C',
          600: '#6E6E6E',
          700: '#505050',
          800: '#363636',
          900: '#1D1D1F',
          950: '#0A0A0A',
        },
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        72: '18rem',
        80: '20rem',
        88: '22rem',
        sidebar: '17rem',
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        DEFAULT: '12px',
        md: '14px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '32px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0,0,0,0.04)',
        'sm': '0 2px 6px 0 rgba(0,0,0,0.06)',
        'md': '0 4px 12px 0 rgba(0,0,0,0.08)',
        'lg': '0 8px 24px 0 rgba(0,0,0,0.10)',
        'xl': '0 16px 48px 0 rgba(0,0,0,0.12)',
        '2xl': '0 24px 64px 0 rgba(0,0,0,0.16)',
        'action': '0 4px 16px 0 rgba(0,113,227,0.24)',
        'action-sm': '0 2px 8px 0 rgba(0,113,227,0.18)',
        'inset-sm': 'inset 0 1px 2px rgba(0,0,0,0.06)',
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.01em' }],
        xs: ['12px', { lineHeight: '16px', letterSpacing: '0.005em' }],
        sm: ['13px', { lineHeight: '18px' }],
        base: ['15px', { lineHeight: '22px' }],
        lg: ['17px', { lineHeight: '24px' }],
        xl: ['19px', { lineHeight: '26px' }],
        '2xl': ['22px', { lineHeight: '30px' }],
        '3xl': ['27px', { lineHeight: '36px' }],
        '4xl': ['34px', { lineHeight: '42px' }],
        '5xl': ['42px', { lineHeight: '50px' }],
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '350': '350ms',
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'apple-in': 'cubic-bezier(0.4, 0.0, 1, 1)',
        'apple-out': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.25,0.1,0.25,1) forwards',
        'slide-up': 'slideUp 250ms cubic-bezier(0.25,0.1,0.25,1) forwards',
        'slide-down': 'slideDown 250ms cubic-bezier(0.25,0.1,0.25,1) forwards',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.34,1.56,0.64,1) forwards',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      backdropBlur: {
        xs: '4px',
      },
      gridTemplateColumns: {
        'sidebar-layout': '17rem 1fr',
      },
    },
  },
  plugins: [],
};
