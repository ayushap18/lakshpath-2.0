import { useState, useEffect } from 'react';
import { roadmapAPI } from '../services/api';

export const useRoadmap = () => {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await roadmapAPI.getActive();
      setRoadmap(res.data);
      setError(null);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load roadmap');
      }
      // 404 = no roadmap, that's fine
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async (careerId: string) => {
    try {
      setGenerating(true);
      setError(null);
      const res = await roadmapAPI.generate(careerId);
      setRoadmap(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const toggleMilestone = async (milestoneId: string, completed: boolean) => {
    try {
      await roadmapAPI.updateProgress(milestoneId, completed);
      await fetchRoadmap();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update milestone');
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  return { roadmap, loading, generating, error, toggleMilestone, generateRoadmap, refetch: fetchRoadmap };
};
