import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSubscription } from '../contexts/SubscriptionContext';
import { billingAPI } from '../services/api';
import Icon from '../components/ui/Icon';

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited AI Chat & Mentoring',
  'AI Code Interviewer with proctoring',
  'AI Resume Builder',
  'Skill Gap Simulator',
  'Placement Prep Packs',
  'Full Portfolio Analysis',
  'Market Intelligence Reports',
  'Priority Support',
];

const FREE_FEATURES = [
  'Basic career assessment',
  '3 career path suggestions',
  '3 AI chats per day',
  '1 active roadmap',
  '2 mock interviews/month',
  'Community access',
];

export default function Pricing() {
  const navigate = useNavigate();
  const { plan: currentPlan, isProUser, subscribe, status } = useSubscription();
  const [upgrading, setUpgrading] = useState(false);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialError, setTrialError] = useState('');
  const token = localStorage.getItem('token');

  const monthlyPrice = 499;
  const yearlyPrice = 4790;
  const yearlySavings = (monthlyPrice * 12) - yearlyPrice;

  const proPrice = billing === 'monthly' ? monthlyPrice : yearlyPrice;
  const proPeriod = billing === 'monthly' ? '/month' : '/year';

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
      await subscribe(billing);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message !== 'Payment cancelled') {
        console.error('Upgrade failed:', err);
      }
    } finally {
      setUpgrading(false);
    }
  };

  const handleStartTrial = async () => {
    if (!token) {
      navigate('/register?trial=true');
      return;
    }
    try {
      setTrialLoading(true);
      setTrialError('');
      await billingAPI.startTrial();
      window.dispatchEvent(new Event('subscription-refresh'));
      navigate('/dashboard');
    } catch (err: any) {
      setTrialError(err.response?.data?.message || 'Failed to start trial');
    } finally {
      setTrialLoading(false);
    }
  };

  const isTrialing = status === 'TRIALING';

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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Start free and upgrade when you're ready. Pro unlocks the full power of AI for your career growth.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-white' : 'text-white/40'}`}>Monthly</span>
          <button
            onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-14 h-7 rounded-full bg-white/10 border border-white/20 transition-colors"
          >
            <motion.div
              className="absolute top-0.5 w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              animate={{ left: billing === 'yearly' ? '1.75rem' : '0.125rem' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm font-medium ${billing === 'yearly' ? 'text-white' : 'text-white/40'}`}>
            Yearly
          </span>
          {billing === 'yearly' && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold"
            >
              Save ₹{yearlySavings.toLocaleString()}
            </motion.span>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl p-8 border border-white/10 bg-white/5"
          >
            <h3 className="text-xl font-bold text-white mb-1">Free</h3>
            <p className="text-white/40 text-sm mb-4">Get started with basic career guidance</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">Free</span>
            </div>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-sm text-white/70">
                  <Icon name="check_circle" className="text-emerald-400 text-base mt-0.5 flex-shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanAction('FREE')}
              disabled={currentPlan === 'FREE' && !!token}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all border border-white/20 text-white hover:bg-white/5 disabled:opacity-50"
            >
              {currentPlan === 'FREE' && token ? 'Current Plan' : 'Get Started Free'}
            </button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl p-8 border border-indigo-500/50 bg-gradient-to-b from-indigo-500/10 to-transparent"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold">
              Most Popular
            </div>

            <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
            <p className="text-white/40 text-sm mb-4">Unlock full potential with AI-powered tools</p>

            <div className="mb-2">
              <span className="text-4xl font-bold text-white">
                ₹{proPrice.toLocaleString()}
              </span>
              <span className="text-white/40 text-sm">{proPeriod}</span>
            </div>
            {billing === 'yearly' && (
              <p className="text-emerald-400 text-xs mb-4">
                ₹{Math.round(yearlyPrice / 12)}/month — Save {Math.round((yearlySavings / (monthlyPrice * 12)) * 100)}%
              </p>
            )}
            {billing === 'monthly' && <div className="mb-4" />}

            <ul className="space-y-3 mb-6">
              {PRO_FEATURES.map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-sm text-white/70">
                  <Icon name="check_circle" className="text-emerald-400 text-base mt-0.5 flex-shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePlanAction('PRO')}
              disabled={upgrading || isProUser}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50"
            >
              {isProUser
                ? isTrialing ? 'Trial Active' : 'Current Plan'
                : upgrading
                ? 'Processing...'
                : 'Start Pro'}
            </button>

            {/* Free Trial CTA */}
            {!isProUser && !isTrialing && (
              <div className="mt-3 text-center">
                <button
                  onClick={handleStartTrial}
                  disabled={trialLoading}
                  className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors font-medium disabled:opacity-50"
                >
                  {trialLoading ? 'Starting trial...' : 'Or try 7 days free — no card needed'}
                </button>
                {trialError && (
                  <p className="text-red-400 text-xs mt-1">{trialError}</p>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          {[
            { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your Pro subscription at any time. You\'ll retain access until the end of your billing period.' },
            { q: 'What payment methods are accepted?', a: 'We accept all major Indian payment methods through Razorpay — UPI, credit/debit cards, net banking, and wallets.' },
            { q: 'Is there a free trial?', a: 'Yes! Try all Pro features free for 7 days — no credit card required. After that, choose to upgrade or continue with the Free plan.' },
            { q: 'How does the AI Code Interviewer work?', a: 'It simulates real coding interviews with company-specific questions, AI-powered proctoring, and detailed code analysis. Available on the Pro plan.' },
            { q: 'What happens when my yearly plan ends?', a: 'Your subscription auto-renews at ₹4,790/year. You can cancel anytime before renewal to avoid charges.' },
            { q: 'Can I refer friends?', a: 'Yes! Share your referral code and both you and your friend get 1 month of Pro free when they sign up.' },
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
