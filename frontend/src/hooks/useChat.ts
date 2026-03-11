import { useState, useCallback, useEffect } from 'react';
import { chatAPI } from '../services/api';
import type { MentorChatResponse } from '../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'mentor';
  content: string;
  createdAt: string;
  structured?: MentorChatResponse;
}

export const useChat = (round?: 'career' | 'interview' | 'scholarship') => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load persisted history on mount
  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('token');
    if (!token) {
      setHistoryLoading(false);
      return;
    }

    chatAPI.getHistory(round)
      .then((res) => {
        if (cancelled) return;
        const history: ChatMessage[] = res.data.messages.map((m) => ({
          id: m.id,
          role: m.role === 'assistant' ? 'mentor' : 'user',
          content: m.content,
          createdAt: m.createdAt,
          structured: m.role === 'assistant' && m.metadata
            ? (() => { try { return JSON.parse(m.metadata!); } catch { return undefined; } })()
            : undefined,
        }));
        setMessages(history);
      })
      .catch(() => {
        // Non-fatal: start with empty history
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });

    return () => { cancelled = true; };
  }, [round]);

  const sendMessage = useCallback(async (message: string, activeRound?: 'career' | 'interview' | 'scholarship') => {
    const userId = localStorage.getItem('userId') || 'demo';
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const res = await chatAPI.mentorRound({ userId, message, round: activeRound ?? round });
      const reply = res.data.reply;
      const mentorMsg: ChatMessage = {
        id: `mentor-${Date.now()}`,
        role: 'mentor',
        content: reply.summary,
        createdAt: new Date().toISOString(),
        structured: reply,
      };
      setMessages((prev) => [...prev, mentorMsg]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  }, [round]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, loading, historyLoading, error, sendMessage, clearMessages };
};
