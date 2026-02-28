import { useState, useEffect } from 'react';
import { marketAPI, jobsAPI } from '../services/api';

export const useMarket = () => {
  const [brief, setBrief] = useState<any>(null);
  const [jobs] = useState<any[]>([]);
  const [autoScout, setAutoScout] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId') || 'demo';
      const [briefRes, jobsRes] = await Promise.all([
        marketAPI.getBrief(),
        jobsAPI.autoScout(userId, { limit: 10 }),
      ]);
      setBrief(briefRes.data);
      setAutoScout(jobsRes.data.matches || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const compareJob = async (jobTitle: string, company: string, jobDescription: string) => {
    try {
      const userId = localStorage.getItem('userId') || 'demo';
      const res = await jobsAPI.compare({ userId, jobTitle, company, jobDescription });
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Comparison failed');
      return null;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { brief, jobs, autoScout, loading, error, compareJob, refetch: fetchData };
};
