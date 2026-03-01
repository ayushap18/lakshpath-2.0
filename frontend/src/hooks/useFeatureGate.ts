import { useCallback, useState } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';

// Features that are completely Pro-only (no access for free users)
const PRO_ONLY_FEATURES = [
  'ai_code_interviewer',
  'resume_builder',
  'skill_simulator',
  'placement_prep',
];

// Features with limited free access
const USAGE_LIMITED_FEATURES: Record<string, { limit: number; period: string }> = {
  ai_chat: { limit: 3, period: 'day' },
  career_dna: { limit: 1, period: 'month' },
  mock_interview: { limit: 2, period: 'month' },
  roadmap: { limit: 1, period: 'month' },
  micro_coach: { limit: 3, period: 'day' },
};

// Map sidebar route paths to feature keys
export const ROUTE_TO_FEATURE: Record<string, string> = {
  '/ai-live': 'ai_code_interviewer',
  '/resume-builder': 'resume_builder',
  '/skill-simulator': 'skill_simulator',
  '/placement-prep': 'placement_prep',
};

// Features that show lock icon in sidebar for free users
export const PRO_SIDEBAR_ROUTES = ['/ai-live', '/resume-builder', '/skill-simulator', '/placement-prep'];

export const useFeatureGate = () => {
  const { isProUser } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');

  const canAccess = useCallback(
    (feature: string): boolean => {
      if (isProUser) return true;
      return !PRO_ONLY_FEATURES.includes(feature);
    },
    [isProUser]
  );

  const isLimited = useCallback(
    (feature: string): boolean => {
      if (isProUser) return false;
      return feature in USAGE_LIMITED_FEATURES;
    },
    [isProUser]
  );

  const getLimit = useCallback((feature: string) => {
    return USAGE_LIMITED_FEATURES[feature] || null;
  }, []);

  const showUpgradePrompt = useCallback((feature: string) => {
    setUpgradeFeature(feature);
    setShowUpgrade(true);
  }, []);

  const hideUpgradePrompt = useCallback(() => {
    setShowUpgrade(false);
    setUpgradeFeature('');
  }, []);

  return {
    canAccess,
    isLimited,
    getLimit,
    isProUser,
    showUpgrade,
    upgradeFeature,
    showUpgradePrompt,
    hideUpgradePrompt,
  };
};
