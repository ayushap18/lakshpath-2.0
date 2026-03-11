import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../components/ui/Icon';

type ToastType = 'success' | 'error' | 'info' | 'badge';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  addToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: string; iconColor: string }> = {
  success: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', icon: 'check_circle', iconColor: '#10B981' },
  error: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: 'error', iconColor: '#EF4444' },
  info: { bg: 'rgba(0,102,255,0.08)', border: 'rgba(0,102,255,0.2)', icon: 'info', iconColor: '#0066FF' },
  badge: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: 'emoji_events', iconColor: '#F59E0B' },
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Listen for custom DOM events
  useEffect(() => {
    const onBadgeEarned = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.badges?.length) {
        detail.badges.forEach((b: any) => {
          addToast('badge', `Badge Earned: ${b.name}`, b.description);
        });
      }
    };
    const onAuthExpired = () => {
      addToast('error', 'Session expired', 'Please log in again.');
    };

    window.addEventListener('badge-earned', onBadgeEarned);
    window.addEventListener('auth-expired', onAuthExpired);
    return () => {
      window.removeEventListener('badge-earned', onBadgeEarned);
      window.removeEventListener('auth-expired', onAuthExpired);
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 360 }}>
        <AnimatePresence>
          {toasts.map(toast => {
            const style = TOAST_STYLES[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl backdrop-blur-md shadow-lg cursor-pointer"
                style={{ background: style.bg, border: `1px solid ${style.border}` }}
                onClick={() => removeToast(toast.id)}
              >
                <Icon name={style.icon} size={20} style={{ color: style.iconColor }} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{toast.title}</p>
                  {toast.message && <p className="text-xs text-[#94A3B8] mt-0.5">{toast.message}</p>}
                </div>
                <button className="text-[#64748B] hover:text-white transition-colors flex-shrink-0 mt-0.5">
                  <Icon name="close" size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
