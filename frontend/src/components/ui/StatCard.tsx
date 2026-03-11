import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: { value: string; positive: boolean };
  children?: ReactNode;
  className?: string;
  accentColor?: string;
}

const StatCard = ({ label, value, icon, trend, children, className = '', accentColor = '#0066FF' }: StatCardProps) => {
  return (
    <motion.div
      className={`rounded-2xl border border-white/[0.06] p-5 relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(145deg, rgba(17,24,39,0.7), rgba(11,17,32,0.5))',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
      whileHover={{
        y: -2,
        borderColor: `${accentColor}30`,
        boxShadow: `0 12px 36px rgba(0,0,0,0.25), 0 0 24px ${accentColor}10, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Subtle accent glow in corner */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accentColor}, transparent 70%)` }}
      />
      {/* Top edge light */}
      <div className="pointer-events-none absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative z-[1]">
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm text-secondary font-medium">{label}</span>
          {icon && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `${accentColor}12`,
                border: `1px solid ${accentColor}18`,
              }}
            >
              <Icon name={icon} size={20} style={{ color: accentColor }} />
            </div>
          )}
        </div>
        <div className="text-[28px] font-extrabold text-white mb-1 tracking-tight">{value}</div>
        {trend && (
          <div className={`flex items-center gap-1.5 text-xs font-medium ${trend.positive ? 'text-success' : 'text-error'}`}>
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center ${
                trend.positive ? 'bg-success/10' : 'bg-error/10'
              }`}
            >
              <Icon name={trend.positive ? 'trending_up' : 'trending_down'} size={14} />
            </div>
            <span>{trend.value}</span>
            <span className="text-muted font-normal">vs last week</span>
          </div>
        )}
        {children}
      </div>
    </motion.div>
  );
};

export default StatCard;
