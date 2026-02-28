import { useState, useEffect } from 'react';
import { portfolioAPI } from '../services/api';

export const usePortfolio = () => {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analysesRes, statsRes] = await Promise.all([
        portfolioAPI.getAnalyses(10),
        portfolioAPI.getStats(),
      ]);
      // Backend returns array directly, not wrapped in {analyses: [...]}
      const data = analysesRes.data;
      setAnalyses(Array.isArray(data) ? data : data.analyses || []);
      setStats(statsRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const analyzeGitHub = async (username: string, targetRole?: string) => {
    try {
      setAnalyzing(true);
      const res = await portfolioAPI.analyzeGitHub(username, targetRole);
      await fetchData();
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Analysis failed');
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { analyses, stats, loading, analyzing, error, analyzeGitHub, refetch: fetchData };
};
