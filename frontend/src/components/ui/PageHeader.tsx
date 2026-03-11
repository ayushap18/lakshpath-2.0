import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';
import { fadeInUp, SPRING } from '../../lib/animations';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  backTo?: string;
  onBack?: () => void;
  className?: string;
}

const PageHeader = ({
  title,
  subtitle,
  icon,
  iconColor = '#0066FF',
  badge,
  actions,
  backTo,
  onBack,
  className = '',
}: PageHeaderProps) => {
  return (
    <motion.div
      className={`mb-8 ${className}`}
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={SPRING.smooth}
    >
      {(backTo || onBack) && (
        <button
          onClick={onBack ?? (() => window.history.back())}
          className="flex items-center gap-1.5 text-sm text-secondary hover:text-white transition-colors mb-4 group"
        >
          <Icon name="arrow_back" size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>{backTo ?? 'Back'}</span>
        </button>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `${iconColor}12`,
                border: `1px solid ${iconColor}20`,
              }}
            >
              <Icon name={icon} size={24} style={{ color: iconColor }} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-h2 text-white tracking-tight">{title}</h1>
              {badge}
            </div>
            {subtitle && (
              <p className="text-body text-secondary mt-1 max-w-lg">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PageHeader;
