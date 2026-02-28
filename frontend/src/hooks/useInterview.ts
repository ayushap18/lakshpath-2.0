import { useState, useEffect } from 'react';
import { interviewAPI, interviewEnhancedAPI } from '../services/api';

export const useInterview = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, statsRes] = await Promise.all([
        interviewAPI.getSessions(10),
        interviewAPI.getStats(),
      ]);
      setSessions(sessionsRes.data.sessions || []);
      setStats(statsRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load interview data');
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (type: string, difficulty: string, role?: string) => {
    try {
      setLoading(true);
      const res = await interviewAPI.startSession(type, difficulty, role);
      setCurrentSession(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start session');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionId: string, answer: string, timeTaken?: number) => {
    try {
      const res = await interviewAPI.submitAnswer(questionId, answer, timeTaken);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit answer');
      return null;
    }
  };

  const getCodeReview = async (sessionId: string, questionId: string, code: string, language: string) => {
    try {
      const res = await interviewEnhancedAPI.getCodeReview({ sessionId, questionId, code, language });
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get code review');
      return null;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    sessions, stats, currentSession, loading, error,
    startSession, submitAnswer, getCodeReview, refetch: fetchData,
  };
};
