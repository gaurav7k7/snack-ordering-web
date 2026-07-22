import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgb(0 0 0 / 0.06), 0 8px 30px -12px rgb(0 0 0 / 0.12)',
        'soft-lg': '0 4px 16px -4px rgb(0 0 0 / 0.08), 0 16px 40px -16px rgb(0 0 0 / 0.18)',
        glow: '0 0 0 1px hsl(var(--primary) / 0.15), 0 8px 24px -8px hsl(var(--primary) / 0.35)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
        'gradient-brand-soft': 'linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--secondary) / 0.12))',
      },
      keyframes: {
        // Width-independent ticker crawl: `100vw` moves the element (from its
        // natural x=0 position) by a full viewport width, so it starts fully
        // off-screen right regardless of the element's own width; `-100%` is
        // relative to the element's own width, so it ends fully off-screen
        // left. This works correctly at any text length or viewport width
        // without measuring anything in JS.
        ticker: {
          '0%': { transform: 'translateX(100vw)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        // Unlike `ticker` above (one message, enters/exits the viewport), a
        // logo strip renders its list TWICE back to back and slides the
        // whole track by exactly half its own width — the second copy lands
        // pixel-for-pixel where the first started, so the loop point is
        // invisible and the strip never shows a gap.
        'logo-scroll': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        ticker: 'ticker 16s linear infinite',
        'logo-scroll': 'logo-scroll 28s linear infinite',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
