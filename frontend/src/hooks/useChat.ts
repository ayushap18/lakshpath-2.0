import { useState, useCallback } from 'react';
import { chatAPI } from '../services/api';
import type { MentorChatResponse } from '../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'mentor';
  content: string;
  createdAt: string;
  structured?: MentorChatResponse;
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string, round?: 'career' | 'interview' | 'scholarship') => {
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
      const res = await chatAPI.mentorRound({ userId, message, round });
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
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, loading, error, sendMessage, clearMessages };
};
