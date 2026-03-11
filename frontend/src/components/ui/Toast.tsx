import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { SPRING } from '../../lib/animations';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  onDismiss: (id: string) => void;
}

const toastConfig: Record<ToastType, { icon: string; color: string; bg: string; border: string }> = {
  success: {
    icon: 'check_circle',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
  },
  error: {
    icon: 'error',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
  },
  warning: {
    icon: 'warning',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
  },
  info: {
    icon: 'info',
    color: '#0066FF',
    bg: 'rgba(0,102,255,0.08)',
    border: 'rgba(0,102,255,0.2)',
  },
};

const Toast = ({ id, type, title, message, action, onDismiss }: ToastProps) => {
  const config = toastConfig[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={SPRING.snappy}
      className="pointer-events-auto w-[380px] rounded-xl border p-4 flex items-start gap-3"
      style={{
        background: config.bg,
        borderColor: config.border,
        backdropFilter: 'blur(24px) saturate(1.4)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${config.color}15`, border: `1px solid ${config.color}25` }}
      >
        <Icon name={config.icon} size={18} style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        {message && <p className="text-xs text-secondary mt-0.5 leading-relaxed">{message}</p>}
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs font-semibold mt-2 transition-colors"
            style={{ color: config.color }}
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="p-1 rounded-md hover:bg-white/5 text-muted hover:text-white transition-colors flex-shrink-0"
      >
        <Icon name="close" size={16} />
      </button>
    </motion.div>
  );
};

// Toast container — renders at page level
interface ToastContainerProps {
  toasts: Array<{ id: string; type: ToastType; title: string; message?: string; action?: { label: string; onClick: () => void } }>;
  onDismiss: (id: string) => void;
}

export const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps) => (
  <div className="fixed top-4 right-4 z-[500] flex flex-col gap-3 pointer-events-none">
    <AnimatePresence mode="popLayout">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </AnimatePresence>
  </div>
);

export default Toast;
