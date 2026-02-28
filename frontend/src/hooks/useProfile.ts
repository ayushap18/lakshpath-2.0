import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import type { UserProfileResponse, UserProgressResponse } from '../services/api';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [stats, setStats] = useState<UserProgressResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, progressRes] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getProgress(),
      ]);
      setProfile(profileRes.data);
      setStats(progressRes.data.stats);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, stats, loading, error, refetch: fetchProfile };
};
