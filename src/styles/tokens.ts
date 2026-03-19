/**
 * Design Token Sistemi
 * Tüm uygulama boyunca tutarlı değerler için tek kaynak.
 * Tailwind sınıfları veya CSS değişkenleri yerine bu token'ları referans alın.
 */

export const tokens = {
  colors: {
    // Marka renkleri (Tailwind CSS değişkenlerine karşılık gelir)
    primary:    'var(--color-primary, #10b981)',   // emerald-500
    primaryDark:'var(--color-primary-dark, #059669)', // emerald-600
    secondary:  'var(--color-secondary, #0f172a)', // slate-900
    accent:     'var(--color-accent, #6366f1)',    // indigo-500

    // Nötr palet
    background: 'var(--color-bg, #f6f7f9)',
    surface:    'var(--color-surface, #ffffff)',
    border:     'var(--color-border, #e2e8f0)',    // slate-200
    muted:      'var(--color-muted, #94a3b8)',     // slate-400

    // Semantik renkler
    success: '#10b981',
    warning: '#f59e0b',
    error:   '#ef4444',
    info:    '#3b82f6',

    // Metin
    textPrimary:   'var(--color-text-primary, #0f172a)',
    textSecondary: 'var(--color-text-secondary, #475569)',
    textMuted:     'var(--color-text-muted, #94a3b8)',
    textInverse:   '#ffffff',
  },

  spacing: {
    xs:   4,
    sm:   8,
    md:   16,
    lg:   24,
    xl:   32,
    xxl:  48,
    xxxl: 64,
  },

  borderRadius: {
    sm:   4,
    md:   8,
    lg:   12,
    xl:   16,
    xxl:  24,
    full: 9999,
  },

  fontSize: {
    xs:   12,
    sm:   14,
    base: 16,
    lg:   18,
    xl:   20,
    xxl:  24,
    xxxl: 32,
    display: 48,
  },

  fontWeight: {
    regular:  400,
    medium:   500,
    semibold: 600,
    bold:     700,
    extrabold:800,
  },

  lineHeight: {
    tight:  1.25,
    snug:   1.375,
    normal: 1.5,
    relaxed:1.625,
    loose:  2,
  },

  shadows: {
    sm:  '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md:  '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg:  '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl:  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    none:'none',
  },

  transitions: {
    fast:   '150ms ease',
    base:   '250ms ease',
    slow:   '400ms ease',
    bounce: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  zIndex: {
    base:    0,
    raised:  10,
    dropdown:100,
    sticky:  200,
    overlay: 300,
    modal:   400,
    toast:   500,
  },

  breakpoints: {
    sm:  640,
    md:  768,
    lg:  1024,
    xl:  1280,
    xxl: 1536,
  },
} as const;

export type Tokens = typeof tokens;

// Tailwind karşılıkları — bileşenlerde tutarlı class kullanımı için rehber
export const twClasses = {
  // Buton varyantları
  btn: {
    primary:   'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors',
    ghost:     'hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors',
    danger:    'bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors',
  },
  // Input alanları
  input: {
    base: 'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500',
    error:'block w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500',
  },
  // Kart
  card: {
    base:    'rounded-xl border border-slate-200 bg-white shadow-sm',
    elevated:'rounded-xl border border-slate-200 bg-white shadow-md',
  },
  // Rozet/badge
  badge: {
    success: 'inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700',
    warning: 'inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700',
    error:   'inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700',
    info:    'inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700',
    neutral: 'inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600',
  },
} as const;
