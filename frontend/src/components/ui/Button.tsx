import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
  icon?: ReactNode;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';

  const variants = {
    primary: 'bg-accent text-white',
    secondary: 'bg-[#111827] text-white border border-white/[0.08]',
    ghost: 'bg-transparent text-secondary hover:text-white hover:bg-white/5',
    danger: 'bg-error/10 text-error border border-error/20',
  };

  const sizes = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  };

  const hoverShadows: Record<string, string> = {
    primary:
      '0 10px 36px rgba(0,102,255,0.4), 0 0 60px rgba(0,102,255,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
    secondary:
      '0 6px 24px rgba(0,102,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
    ghost: 'none',
    danger:
      '0 6px 24px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
  };

  const restShadows: Record<string, string> = {
    primary:
      '0 4px 18px rgba(0,102,255,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
    secondary:
      '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
    ghost: 'none',
    danger:
      '0 2px 8px rgba(239,68,68,0.1), inset 0 1px 0 rgba(255,255,255,0.03)',
  };

  return (
    <motion.button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      whileHover={
        !disabled
          ? {
              y: -2,
              scale: 1.02,
              boxShadow: hoverShadows[variant],
            }
          : undefined
      }
      whileTap={!disabled ? { scale: 0.97, y: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{ boxShadow: restShadows[variant] }}
      {...(props as any)}
    >
      {/* Shimmer shine overlay */}
      {variant === 'primary' && (
        <span
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)',
            backgroundSize: '250% 100%',
            animation: 'shimmer 4s ease-in-out infinite',
          }}
        />
      )}
      {/* Top edge highlight */}
      <span className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {loading ? (
        <motion.span
          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      ) : icon ? (
        icon
      ) : null}
      <span className="relative z-[1]">{children}</span>
    </motion.button>
  );
};

export default Button;
