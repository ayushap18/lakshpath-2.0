import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSubscription } from '../contexts/SubscriptionContext';
import Icon from '../components/ui/Icon';

const PLANS = [
  {
    id: 'FREE' as const,
    name: 'Free',
    price: 0,
    description: 'Get started with basic career guidance',
    features: [
      'Basic career assessment',
      '3 career path suggestions',
      '3 AI chats per day',
      '1 active roadmap',
      '2 mock interviews/month',
      'Community access',
    ],
    cta: 'Get Started Free',
    gradient: 'from-slate-500 to-slate-600',
  },
  {
    id: 'PRO' as const,
    name: 'Pro',
    price: 499,
    description: 'Unlock full potential with AI-powered tools',
    badge: 'Most Popular',
    features: [
      'Everything in Free',
      'Unlimited AI Chat & Mentoring',
      'AI Code Interviewer with proctoring',
      'AI Resume Builder',
      'Skill Gap Simulator',
      'Placement Prep Packs',
      'Full Portfolio Analysis',
      'Market Intelligence Reports',
      'Priority Support',
    ],
    cta: 'Start Pro',
    gradient: 'from-indigo-500 to-purple-600',
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { plan: currentPlan, isProUser, subscribe } = useSubscription();
  const [upgrading, setUpgrading] = useState(false);
  const token = localStorage.getItem('token');

  const handlePlanAction = async (planId: 'FREE' | 'PRO') => {
    if (!token) {
      navigate(planId === 'PRO' ? '/register?plan=pro' : '/register');
      return;
    }

    if (planId === 'FREE') {
      navigate('/dashboard');
      return;
    }

    if (isProUser) return;

    try {
      setUpgrading(true);
      await subscribe();
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message !== 'Payment cancelled') {
        console.error('Upgrade failed:', err);
      }
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0f0f1a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <Icon name="arrow_back" className="text-xl" />
            <span className="text-sm">Back</span>
          </button>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            LakshPath
          </span>
          {token ? (
            <button onClick={() => navigate('/dashboard')} className="text-sm text-white/60 hover:text-white">
              Dashboard
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="text-sm text-white/60 hover:text-white">
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Start free and upgrade when you're ready. Pro unlocks the full power of AI for your career growth.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 border ${
                plan.id === 'PRO'
                  ? 'border-indigo-500/50 bg-gradient-to-b from-indigo-500/10 to-transparent'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-white/40 text-sm mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-white/40 text-sm">/month</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-white/70">
                    <Icon name="check_circle" className="text-emerald-400 text-base mt-0.5 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanAction(plan.id)}
                disabled={upgrading || (plan.id === 'PRO' && isProUser) || (plan.id === 'FREE' && currentPlan === 'FREE' && !!token)}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.id === 'PRO'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50'
                    : 'border border-white/20 text-white hover:bg-white/5 disabled:opacity-50'
                }`}
              >
                {plan.id === 'PRO' && isProUser
                  ? 'Current Plan'
                  : plan.id === 'FREE' && currentPlan === 'FREE' && token
                  ? 'Current Plan'
                  : upgrading
                  ? 'Processing...'
                  : plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          {[
            { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your Pro subscription at any time. You\'ll retain access until the end of your billing period.' },
            { q: 'What payment methods are accepted?', a: 'We accept all major Indian payment methods through Razorpay — UPI, credit/debit cards, net banking, and wallets.' },
            { q: 'Is there a free trial?', a: 'The Free plan is available forever! You can try basic features and upgrade to Pro when you need more.' },
            { q: 'How does the AI Code Interviewer work?', a: 'It simulates real coding interviews with company-specific questions, AI-powered proctoring, and detailed code analysis. Available on the Pro plan.' },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-white/10 py-4">
              <h3 className="text-white font-medium mb-1">{q}</h3>
              <p className="text-white/40 text-sm">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
