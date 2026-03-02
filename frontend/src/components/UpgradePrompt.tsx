import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import Icon from './ui/Icon';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

const FEATURE_BENEFITS: Record<string, { title: string; description: string; icon: string }> = {
  ai_code_interviewer: {
    title: 'AI Code Interviewer',
    description: 'Practice coding interviews with AI-powered proctoring, company-specific questions, and detailed code analysis.',
    icon: 'code',
  },
  resume_builder: {
    title: 'AI Resume Builder',
    description: 'Generate ATS-optimized resumes with AI-powered suggestions tailored to your target roles.',
    icon: 'description',
  },
  skill_simulator: {
    title: 'Skill Gap Simulator',
    description: 'Visualize your skill gaps and get personalized recommendations to bridge them.',
    icon: 'analytics',
  },
  placement_prep: {
    title: 'Placement Prep',
    description: 'Company-specific preparation with mock tests, aptitude practice, and interview coaching.',
    icon: 'school',
  },
  ai_chat: {
    title: 'Unlimited AI Chat',
    description: "You've used all 3 free chats today. Upgrade for unlimited AI mentor guidance.",
    icon: 'chat',
  },
  mock_interview: {
    title: 'Unlimited Mock Interviews',
    description: "You've used your 2 free mock interviews this month. Upgrade for unlimited practice.",
    icon: 'mic',
  },
  career_dna: {
    title: 'Career DNA',
    description: "You've generated your Career DNA this month. Upgrade for unlimited regeneration.",
    icon: 'fingerprint',
  },
  roadmap: {
    title: 'Unlimited Roadmaps',
    description: "You've used your free roadmap slot. Upgrade for unlimited learning roadmaps.",
    icon: 'route',
  },
  micro_coach: {
    title: 'Unlimited Micro-Coaching',
    description: "You've used all 3 free micro-coaching tasks today. Upgrade for unlimited access.",
    icon: 'psychology',
  },
  default: {
    title: 'Pro Feature',
    description: 'Upgrade to Pro to unlock this feature and accelerate your career growth.',
    icon: 'star',
  },
};

export default function UpgradePrompt({ isOpen, onClose, feature = 'default' }: UpgradePromptProps) {
  const { subscribe } = useSubscription();
  const navigate = useNavigate();
  const info = FEATURE_BENEFITS[feature] || FEATURE_BENEFITS.default;

  const handleUpgrade = async () => {
    try {
      await subscribe();
      onClose();
    } catch (err: any) {
      if (err.message !== 'Payment cancelled') {
        console.error('Payment failed:', err);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1a1a2e] rounded-2xl p-8 max-w-md mx-4 border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <Icon name={info.icon} className="text-white text-3xl" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white text-center mb-2">
              Unlock {info.title}
            </h3>

            {/* Description */}
            <p className="text-white/60 text-center mb-6 text-sm leading-relaxed">
              {info.description}
            </p>

            {/* Price */}
            <div className="bg-white/5 rounded-xl p-4 mb-6 text-center">
              <div className="text-3xl font-bold text-white">
                <span className="text-lg text-white/40">₹</span>499
                <span className="text-sm text-white/40 font-normal">/month</span>
              </div>
              <p className="text-white/40 text-xs mt-1">Cancel anytime</p>
            </div>

            {/* Features list */}
            <ul className="space-y-2 mb-6">
              {['Unlimited AI features', 'Code Interviewer with proctoring', 'Resume Builder & Portfolio Analysis', 'Priority support'].map(
                (feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-white/70">
                    <Icon name="check_circle" className="text-emerald-400 text-base" />
                    {feat}
                  </li>
                )
              )}
            </ul>

            {/* Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleUpgrade}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all text-sm"
              >
                Upgrade Now — ₹499/mo
              </button>
              <button
                onClick={() => { onClose(); navigate('/pricing'); }}
                className="w-full px-4 py-2.5 rounded-xl text-indigo-400 text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Or try 7 days free
              </button>
              <button
                onClick={onClose}
                className="text-white/30 text-xs hover:text-white/50 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
