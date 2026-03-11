/**
 * LakshPath Design System — Animation Tokens
 * Consistent motion language across the entire application.
 */

// Spring presets for Framer Motion
export const SPRING = {
  gentle:  { type: 'spring' as const, stiffness: 120, damping: 14 },
  snappy:  { type: 'spring' as const, stiffness: 400, damping: 25 },
  bouncy:  { type: 'spring' as const, stiffness: 300, damping: 10 },
  smooth:  { type: 'spring' as const, stiffness: 200, damping: 20 },
};

// Duration presets (seconds)
export const DURATION = {
  instant:  0.1,
  fast:     0.2,
  normal:   0.3,
  slow:     0.5,
  dramatic: 0.8,
};

// Easing curves [x1, y1, x2, y2]
export const EASE = {
  out:     [0, 0, 0.2, 1] as const,
  in:      [0.4, 0, 1, 1] as const,
  inOut:   [0.4, 0, 0.2, 1] as const,
  bounce:  [0.68, -0.55, 0.27, 1.55] as const,
};

// Stagger delays (seconds between children)
export const STAGGER = {
  fast:   0.03,
  normal: 0.05,
  slow:   0.08,
};

// Reusable Framer Motion variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit:    { opacity: 0, scale: 0.95 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: 20 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -20 },
};

// Container variant for staggered children
export const staggerContainer = (stagger = STAGGER.normal) => ({
  animate: {
    transition: { staggerChildren: stagger },
  },
});

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

// Page transition preset
export const pageTransition = {
  initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit:    { opacity: 0, y: -8, filter: 'blur(4px)' },
  transition: SPRING.snappy,
};

// Color tokens for programmatic use
export const COLORS = {
  primary:   '#0066FF',
  primaryHover: '#3388FF',
  primaryActive: '#0052CC',
  primaryMuted: 'rgba(0,102,255,0.15)',

  violet:    '#7C3AED',
  violetHover: '#9F67FF',

  cyan:      '#06B6D4',
  cyanLight: '#22D3EE',

  success:   '#10B981',
  warning:   '#F59E0B',
  error:     '#EF4444',
  orange:    '#F97316',
  rose:      '#EC4899',

  bgPrimary: '#030712',
  bgElevated: '#0B1120',
  bgCard:    '#111827',
  bgCardHover: '#1E293B',

  textPrimary:   '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted:     '#64748B',
  textHeading:   '#FFFFFF',

  border:      '#1E293B',
  borderLight: '#334155',
};

// Rarity gradient map
export const RARITY_GRADIENTS = {
  common:    'linear-gradient(135deg, #64748B, #94A3B8)',
  rare:      'linear-gradient(135deg, #0066FF, #06B6D4)',
  epic:      'linear-gradient(135deg, #7C3AED, #EC4899)',
  legendary: 'linear-gradient(135deg, #F59E0B, #EF4444)',
  mythic:    'linear-gradient(135deg, #F59E0B, #7C3AED, #06B6D4)',
};

// Glow shadow generator
export const glowShadow = (color: string, intensity: 'sm' | 'md' | 'lg' = 'md') => {
  const map = {
    sm: `0 0 12px ${color}25`,
    md: `0 0 24px ${color}33, 0 0 48px ${color}14`,
    lg: `0 0 40px ${color}4D, 0 0 80px ${color}1F`,
  };
  return map[intensity];
};
