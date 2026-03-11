import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { SPRING } from '../../lib/animations';

interface BadgeUnlockProps {
  isOpen: boolean;
  onClose: () => void;
  badge: {
    name: string;
    icon: string;
    rarity: string;
    description?: string;
  } | null;
}

const RARITY_CONFIG: Record<string, { gradient: string; glow: string; label: string }> = {
  COMMON:    { gradient: 'from-slate-400 to-slate-500', glow: 'rgba(148,163,184,0.3)', label: 'Common' },
  UNCOMMON:  { gradient: 'from-emerald-400 to-teal-500', glow: 'rgba(16,185,129,0.3)', label: 'Uncommon' },
  RARE:      { gradient: 'from-[#0066FF] to-[#22D3EE]', glow: 'rgba(0,102,255,0.4)', label: 'Rare' },
  EPIC:      { gradient: 'from-[#7C3AED] to-[#EC4899]', glow: 'rgba(124,58,237,0.4)', label: 'Epic' },
  LEGENDARY: { gradient: 'from-[#F59E0B] to-[#EF4444]', glow: 'rgba(245,158,11,0.5)', label: 'Legendary' },
};

export default function BadgeUnlock({ isOpen, onClose, badge }: BadgeUnlockProps) {
  if (!badge) return null;
  const config = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.COMMON;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Card */}
          <motion.div
            className="relative z-10 flex flex-col items-center text-center px-8 py-10 max-w-sm mx-4"
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ ...SPRING.bouncy, delay: 0.1 }}
          >
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-3xl opacity-40 blur-2xl"
              style={{ background: `radial-gradient(circle, ${config.glow}, transparent 70%)` }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Content container */}
            <div className="relative rounded-3xl p-8 border border-white/[0.08]" style={{ background: 'linear-gradient(135deg, rgba(17,24,39,0.95), rgba(3,7,18,0.95))' }}>
              {/* Badge icon */}
              <motion.div
                className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mx-auto mb-5`}
                style={{ boxShadow: `0 0 40px ${config.glow}` }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...SPRING.bouncy, delay: 0.3 }}
              >
                <Icon name={badge.icon} size={48} className="text-white" />
              </motion.div>

              {/* Label */}
              <motion.p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: config.glow.replace('0.3', '1').replace('0.4', '1').replace('0.5', '1') }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Badge Unlocked!
              </motion.p>

              {/* Name */}
              <motion.h2
                className="text-2xl font-extrabold text-white mb-1 tracking-tight"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {badge.name}
              </motion.h2>

              {/* Rarity */}
              <motion.span
                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${config.gradient} text-white mb-3`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
              >
                {config.label}
              </motion.span>

              {/* Description */}
              {badge.description && (
                <motion.p
                  className="text-sm text-white/50 mt-2 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {badge.description}
                </motion.p>
              )}

              {/* Dismiss */}
              <motion.button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/[0.08] border border-white/[0.06] hover:bg-white/[0.12] transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Awesome!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
