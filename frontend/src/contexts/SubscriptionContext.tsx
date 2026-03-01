import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { billingAPI } from '../services/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export type PlanType = 'FREE' | 'PRO';
export type SubStatusType = 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING';

interface SubscriptionState {
  plan: PlanType;
  status: SubStatusType;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  isProUser: boolean;
  loading: boolean;
}

interface SubscriptionContextValue extends SubscriptionState {
  subscribe: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be inside SubscriptionProvider');
  return ctx;
};

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SubscriptionState>({
    plan: 'FREE',
    status: 'ACTIVE',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    isProUser: false,
    loading: true,
  });

  const refreshSubscription = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }
      const { data } = await billingAPI.getSubscription();
      const sub = data.subscription;
      setState({
        plan: sub.plan || 'FREE',
        status: sub.status || 'ACTIVE',
        currentPeriodEnd: sub.currentPeriodEnd || null,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd || false,
        isProUser: sub.plan === 'PRO' && sub.status === 'ACTIVE',
        loading: false,
      });
    } catch {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  // Re-fetch when user logs in
  useEffect(() => {
    const handler = () => refreshSubscription();
    window.addEventListener('subscription-refresh', handler);
    return () => window.removeEventListener('subscription-refresh', handler);
  }, [refreshSubscription]);

  const subscribe = useCallback(async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      throw new Error('Failed to load Razorpay');
    }

    const { data } = await billingAPI.subscribe();
    const { subscriptionId, razorpayKeyId } = data;

    return new Promise<void>((resolve, reject) => {
      const options = {
        key: razorpayKeyId,
        subscription_id: subscriptionId,
        name: 'LakshPath',
        description: 'Pro Monthly Subscription',
        theme: { color: '#667eea' },
        handler: async (response: any) => {
          try {
            await billingAPI.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            });
            await refreshSubscription();
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  }, [refreshSubscription]);

  const cancelSub = useCallback(async () => {
    await billingAPI.cancelSubscription();
    await refreshSubscription();
  }, [refreshSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        ...state,
        subscribe,
        cancelSubscription: cancelSub,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
