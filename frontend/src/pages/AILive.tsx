import { motion } from 'framer-motion';
import Icon from '../components/ui/Icon';

const AILive = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="text-center max-w-lg"
      >
        {/* Animated icon */}
        <motion.div
          className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0da2e7]/20 to-[#8B5CF6]/20 border border-[#0da2e7]/30 flex items-center justify-center mx-auto mb-6"
          animate={{
            boxShadow: [
              '0 0 0px rgba(13,162,231,0)',
              '0 0 30px rgba(13,162,231,0.2)',
              '0 0 0px rgba(13,162,231,0)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Icon name="videocam" size={40} className="text-[#0da2e7]" />
          </motion.div>
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-3">AI Live 1:1 Sessions</h1>
        <p className="text-[#94A3B8] text-lg mb-8">
          Real-time AI-powered mock interviews and career counseling sessions are coming soon.
        </p>

        {/* Feature preview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            { icon: 'mic', title: 'Voice Conversations', desc: 'Talk naturally with AI interviewer' },
            { icon: 'psychology', title: 'Real-time Feedback', desc: 'Get instant feedback on your answers' },
            { icon: 'trending_up', title: 'Adaptive Difficulty', desc: 'Questions adapt to your level' },
            { icon: 'analytics', title: 'Session Analytics', desc: 'Detailed performance breakdown' },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-[#1E293B] border border-white/5 rounded-xl p-4 text-left"
            >
              <Icon name={feat.icon} size={20} className="text-[#0da2e7] mb-2" />
              <p className="text-white text-sm font-semibold">{feat.title}</p>
              <p className="text-[#64748B] text-xs">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Coming soon badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0da2e7]/10 border border-[#0da2e7]/30"
          animate={{
            boxShadow: [
              '0 0 0px rgba(13,162,231,0)',
              '0 0 16px rgba(13,162,231,0.15)',
              '0 0 0px rgba(13,162,231,0)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <Icon name="schedule" size={18} className="text-[#0da2e7]" />
          <span className="text-[#0da2e7] font-semibold text-sm">Coming Soon</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AILive;
