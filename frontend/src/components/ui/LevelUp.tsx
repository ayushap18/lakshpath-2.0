import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { SPRING } from '../../lib/animations';

interface LevelUpProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  label: string;
}

const LEVEL_COLORS: Record<number, { gradient: string; glow: string }> = {
  1:  { gradient: 'from-slate-400 to-slate-500', glow: 'rgba(148,163,184,0.3)' },
  2:  { gradient: 'from-emerald-400 to-teal-500', glow: 'rgba(16,185,129,0.3)' },
  3:  { gradient: 'from-[#0066FF] to-[#22D3EE]', glow: 'rgba(0,102,255,0.4)' },
  4:  { gradient: 'from-[#7C3AED] to-[#EC4899]', glow: 'rgba(124,58,237,0.4)' },
  5:  { gradient: 'from-[#F59E0B] to-[#EF4444]', glow: 'rgba(245,158,11,0.5)' },
};

export default function LevelUp({ isOpen, onClose, level, label }: LevelUpProps) {
  const config = LEVEL_COLORS[Math.min(level, 5)] || LEVEL_COLORS[3];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 flex flex-col items-center text-center max-w-sm mx-4"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ ...SPRING.bouncy, delay: 0.1 }}
          >
            {/* Pulsing glow */}
            <motion.div
              className="absolute inset-0 rounded-3xl blur-3xl"
              style={{ background: `radial-gradient(circle, ${config.glow}, transparent 60%)` }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <div className="relative rounded-3xl p-10 border border-white/[0.08]" style={{ background: 'linear-gradient(135deg, rgba(17,24,39,0.95), rgba(3,7,18,0.95))' }}>
              {/* Level badge */}
              <motion.div
                className={`w-28 h-28 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center mx-auto mb-6`}
                style={{ boxShadow: `0 0 50px ${config.glow}` }}
                initial={{ scale: 0, rotate: -360 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
              >
                <div className="text-center">
                  <Icon name="arrow_upward" size={28} className="text-white/80 mx-auto" />
                  <span className="text-3xl font-black text-white">{level}</span>
                </div>
              </motion.div>

              <motion.p
                className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Level Up!
              </motion.p>

              <motion.h2
                className="text-2xl font-extrabold text-white mb-2 tracking-tight"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {label}
              </motion.h2>

              <motion.p
                className="text-sm text-white/50 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                You've reached a new milestone. Keep going!
              </motion.p>

              <motion.button
                onClick={onClose}
                className={`px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${config.gradient} hover:shadow-lg transition-shadow`}
                style={{ boxShadow: `0 4px 20px ${config.glow}` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Let's Go!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
