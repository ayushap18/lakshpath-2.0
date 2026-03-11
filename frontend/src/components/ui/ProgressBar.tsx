import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'accent' | 'success' | 'warning' | 'error' | 'violet' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const ProgressBar = ({
  value,
  max = 100,
  color = 'accent',
  size = 'md',
  showLabel = false,
  animated = true,
  className = '',
}: ProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colorMap: Record<string, string> = {
    accent: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    violet: 'bg-[#7C3AED]',
    gradient: '',
  };

  const glowMap: Record<string, string> = {
    accent: 'rgba(0,102,255,0.4)',
    success: 'rgba(16,185,129,0.4)',
    warning: 'rgba(245,158,11,0.4)',
    error: 'rgba(239,68,68,0.4)',
    violet: 'rgba(124,58,237,0.4)',
    gradient: 'rgba(0,102,255,0.3)',
  };

  const sizes: Record<string, string> = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const isGradient = color === 'gradient';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-medium text-secondary">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden ${sizes[size]} relative`}
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <motion.div
          className={`${isGradient ? '' : colorMap[color]} ${sizes[size]} rounded-full relative`}
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { duration: 0.8, ease: 'easeOut' } : undefined}
          style={{
            ...(isGradient
              ? { background: 'linear-gradient(90deg, #0066FF, #7C3AED, #06B6D4)' }
              : {}),
            boxShadow: percentage > 0 ? `0 0 8px ${glowMap[color]}` : undefined,
          }}
        >
          {/* Shimmer effect on the filled portion */}
          {percentage > 15 && (
            <span
              className="absolute inset-0 pointer-events-none rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s ease-in-out infinite',
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressBar;
