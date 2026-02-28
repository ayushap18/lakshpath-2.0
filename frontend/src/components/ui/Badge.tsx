import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'accent' | 'violet' | 'gradient';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const Badge = ({ children, variant = 'default', size = 'sm', className = '', dot = false }: BadgeProps) => {
  const variants: Record<string, string> = {
    default: 'bg-white/[0.06] text-secondary border border-white/[0.06]',
    success: 'bg-success/10 text-success border border-success/15',
    warning: 'bg-warning/10 text-warning border border-warning/15',
    error: 'bg-error/10 text-error border border-error/15',
    accent: 'bg-accent/10 text-accent border border-accent/15',
    violet: 'bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/15',
    gradient: 'text-white border-0',
  };

  const dotColors: Record<string, string> = {
    default: 'bg-secondary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    accent: 'bg-accent',
    violet: 'bg-[#8B5CF6]',
    gradient: 'bg-white',
  };

  const sizes: Record<string, string> = {
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
  };

  const isGradient = variant === 'gradient';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${variants[variant]} ${sizes[size]} ${className}`}
      style={isGradient ? {
        background: 'linear-gradient(135deg, rgba(13,162,231,0.2), rgba(139,92,246,0.15))',
        border: '1px solid rgba(13,162,231,0.2)',
      } : undefined}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} flex-shrink-0`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
