import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../services/api';
import Icon from '../components/ui/Icon';

type Tab = 'overview' | 'users' | 'revenue' | 'usage';

interface Stats {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  mrr: number;
  totalRevenue: number;
  conversionRate: number;
}

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  plan: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  loginCount: number;
  subscriptionStatus: string | null;
}

interface PaymentRow {
  id: string;
  userName: string | null;
  userEmail: string | null;
  amount: number;
  status: string;
  plan: string;
  createdAt: string;
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<Record<string, number>>({});
  const [usageData, setUsageData] = useState<Array<{ feature: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [giftModal, setGiftModal] = useState<UserRow | null>(null);
  const [giftDuration, setGiftDuration] = useState(1);
  const [giftUnit, setGiftUnit] = useState<'days' | 'months' | 'years'>('months');
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftSuccess, setGiftSuccess] = useState('');

  // FIX HIGH-13: Debounce search input to avoid firing API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(userSearch), 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await adminAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await adminAPI.getUsers({ page: userPage, limit: 20, search: debouncedSearch });
      setUsers(data.users);
      setUserTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, [userPage, debouncedSearch]);

  const fetchRevenue = useCallback(async () => {
    try {
      const { data } = await adminAPI.getRevenue({ page: 1, limit: 20 });
      setPayments(data.payments);
      setMonthlyRevenue(data.monthlyRevenue);
    } catch (err) {
      console.error('Failed to fetch revenue:', err);
    }
  }, []);

  const fetchUsage = useCallback(async () => {
    try {
      const { data } = await adminAPI.getUsageStats();
      setUsageData(data.featureUsage);
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    }
  }, []);

  const handleGiftPro = async () => {
    if (!giftModal) return;
    setGiftLoading(true);
    try {
      const { data } = await adminAPI.giftPro(giftModal.id, { duration: giftDuration, unit: giftUnit });
      setGiftSuccess(data.message);
      fetchUsers();
      setTimeout(() => { setGiftModal(null); setGiftSuccess(''); setGiftDuration(1); setGiftUnit('months'); }, 2000);
    } catch (err) {
      console.error('Gift Pro failed:', err);
      setGiftSuccess('Failed to gift Pro');
    } finally {
      setGiftLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchStats();
      setLoading(false);
    };
    load();
  }, [fetchStats]);

  useEffect(() => {
    if (tab === 'users') fetchUsers();
    if (tab === 'revenue') fetchRevenue();
    if (tab === 'usage') fetchUsage();
  }, [tab, fetchUsers, fetchRevenue, fetchUsage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'users', label: 'Users', icon: 'people' },
    { id: 'revenue', label: 'Revenue', icon: 'payments' },
    { id: 'usage', label: 'Usage', icon: 'bar_chart' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-white/50 text-sm mt-1">Manage users, billing, and platform analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              tab === t.id
                ? 'text-indigo-400 border-indigo-400'
                : 'text-white/50 border-transparent hover:text-white/70'
            }`}
          >
            <Icon name={t.icon} className="text-lg" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: 'people', color: 'from-blue-500 to-cyan-500' },
            { label: 'Pro Subscribers', value: stats.proUsers, icon: 'workspace_premium', color: 'from-indigo-500 to-purple-500' },
            { label: 'Monthly Revenue', value: `₹${stats.mrr.toLocaleString()}`, icon: 'currency_rupee', color: 'from-emerald-500 to-teal-500' },
            { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: 'trending_up', color: 'from-amber-500 to-orange-500' },
          ].map((card) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-xl p-5 border border-white/10"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                <Icon name={card.icon} className="text-white text-xl" />
              </div>
              <p className="text-white/50 text-sm">{card.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              value={userSearch}
              onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
              placeholder="Search by name or email..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="text-left px-4 py-3 font-medium">User</th>
                  <th className="text-left px-4 py-3 font-medium">Plan</th>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  <th className="text-left px-4 py-3 font-medium">Logins</th>
                  <th className="text-left px-4 py-3 font-medium">Joined</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{u.name || 'Unnamed'}</p>
                      <p className="text-white/40 text-xs">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        u.plan === 'PRO' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/10 text-white/50'
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/60">{u.role}</td>
                    <td className="px-4 py-3 text-white/60">{u.loginCount}</td>
                    <td className="px-4 py-3 text-white/40 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setGiftModal(u); setGiftSuccess(''); }}
                        className="px-3 py-1 text-xs rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
                      >
                        Gift Pro
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-white/50">
            <span>Showing {users.length} of {userTotal} users</span>
            <div className="flex gap-2">
              <button
                disabled={userPage === 1}
                onClick={() => setUserPage(p => p - 1)}
                className="px-3 py-1 rounded bg-white/5 disabled:opacity-30 hover:bg-white/10"
              >
                Previous
              </button>
              <button
                disabled={users.length < 20}
                onClick={() => setUserPage(p => p + 1)}
                className="px-3 py-1 rounded bg-white/5 disabled:opacity-30 hover:bg-white/10"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {tab === 'revenue' && (
        <div className="space-y-6">
          {/* Monthly Revenue Bars */}
          {Object.keys(monthlyRevenue).length > 0 && (
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <h3 className="text-white font-medium mb-4">Monthly Revenue (Last 6 Months)</h3>
              <div className="flex items-end gap-3 h-40">
                {Object.entries(monthlyRevenue)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([month, revenue]) => {
                    const maxRev = Math.max(...Object.values(monthlyRevenue), 1);
                    const height = (revenue / maxRev) * 100;
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-white/60">₹{revenue.toLocaleString()}</span>
                        <div
                          className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-md"
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                        <span className="text-xs text-white/40">{month.slice(5)}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          {/* Payments Table */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="text-left px-4 py-3 font-medium">User</th>
                  <th className="text-left px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="px-4 py-3">
                      <p className="text-white">{p.userName || 'Unknown'}</p>
                      <p className="text-white/40 text-xs">{p.userEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">₹{p.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        p.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-white/30">No payments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Usage Tab */}
      {tab === 'usage' && (
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <h3 className="text-white font-medium mb-4">Feature Usage (Last 30 Days)</h3>
          {usageData.length > 0 ? (
            <div className="space-y-3">
              {usageData
                .sort((a, b) => b.count - a.count)
                .map((item) => {
                  const maxCount = Math.max(...usageData.map(d => d.count), 1);
                  const width = (item.count / maxCount) * 100;
                  return (
                    <div key={item.feature} className="flex items-center gap-4">
                      <span className="text-white/60 text-sm w-40 capitalize">
                        {item.feature.replace(/_/g, ' ')}
                      </span>
                      <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <span className="text-white/50 text-sm w-16 text-right">{item.count}</span>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-white/30 text-center py-8">No usage data yet</p>
          )}
        </div>
      )}

      {/* Gift Pro Modal */}
      {giftModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => !giftLoading && setGiftModal(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1f36] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-1">Gift Pro Subscription</h3>
            <p className="text-white/50 text-sm mb-5">
              Gift Pro to <span className="text-indigo-400 font-medium">{giftModal.name || giftModal.email}</span>
            </p>

            {giftSuccess ? (
              <div className={`p-4 rounded-lg text-center text-sm font-medium ${
                giftSuccess.includes('Failed') ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {giftSuccess}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm block mb-1.5">Duration</label>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={giftDuration}
                      onChange={(e) => setGiftDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm block mb-1.5">Unit</label>
                    <div className="flex gap-2">
                      {(['days', 'months', 'years'] as const).map((u) => (
                        <button
                          key={u}
                          onClick={() => setGiftUnit(u)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            giftUnit === u
                              ? 'bg-indigo-500 text-white'
                              : 'bg-white/5 text-white/50 hover:bg-white/10'
                          }`}
                        >
                          {u.charAt(0).toUpperCase() + u.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-white/40 text-xs">
                    Pro will expire on{' '}
                    <span className="text-white/70">
                      {(() => {
                        const d = new Date();
                        if (giftUnit === 'days') d.setDate(d.getDate() + giftDuration);
                        else if (giftUnit === 'months') d.setMonth(d.getMonth() + giftDuration);
                        else d.setFullYear(d.getFullYear() + giftDuration);
                        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                      })()}
                    </span>
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setGiftModal(null)}
                    className="flex-1 py-2.5 rounded-lg bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGiftPro}
                    disabled={giftLoading}
                    className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {giftLoading ? 'Gifting...' : `Gift ${giftDuration} ${giftUnit}`}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
