import { useState, useEffect } from 'react';
import { assessmentAPI } from '../services/api';

export const useAssessment = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId') || 'me';
      const res = await assessmentAPI.getResults(userId);
      setResults(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return { results, loading, error, refetch: fetchResults };
};
