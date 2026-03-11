import { motion } from 'framer-motion';
import Icon from './Icon';
import Button from './Button';
import { fadeInUp, SPRING } from '../../lib/animations';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
  compact?: boolean;
}

const EmptyState = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  compact = false,
}: EmptyStateProps) => {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8 px-4' : 'py-16 px-6'} ${className}`}
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={SPRING.gentle}
    >
      <motion.div
        className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-2xl flex items-center justify-center mb-4`}
        style={{
          background: 'rgba(0,102,255,0.08)',
          border: '1px solid rgba(0,102,255,0.15)',
        }}
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Icon name={icon} size={compact ? 24 : 32} style={{ color: '#0066FF' }} />
      </motion.div>

      <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-white mb-1.5`}>
        {title}
      </h3>
      <p className={`${compact ? 'text-xs' : 'text-sm'} text-secondary max-w-xs leading-relaxed mb-5`}>
        {description}
      </p>

      <div className="flex items-center gap-3">
        {action && (
          <Button variant="primary" size={compact ? 'sm' : 'md'} onClick={action.onClick}>
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="ghost" size={compact ? 'sm' : 'md'} onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
