import { ReactNode } from 'react';
import Icon from './Icon';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  children: ReactNode;
  timestamp?: string;
  className?: string;
}

const ChatBubble = ({ role, children, timestamp, className = '' }: ChatBubbleProps) => {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} ${className}`}>
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative"
        style={
          isUser
            ? {
                background: 'rgba(0,102,255,0.12)',
                border: '1px solid rgba(0,102,255,0.2)',
              }
            : {
                background: 'linear-gradient(135deg, #0066FF, #7C3AED)',
                boxShadow: '0 4px 12px rgba(0,102,255,0.3)',
              }
        }
      >
        <Icon
          name={isUser ? 'person' : 'smart_toy'}
          size={18}
          className={isUser ? 'text-accent' : 'text-white'}
        />
        {/* Online dot for AI */}
        {!isUser && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
            style={{
              background: '#10B981',
              borderColor: '#030712',
              boxShadow: '0 0 6px rgba(16,185,129,0.4)',
            }}
          />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 relative overflow-hidden ${
          isUser ? 'rounded-tr-md' : 'rounded-tl-md'
        }`}
        style={
          isUser
            ? {
                background: 'linear-gradient(135deg, #0066FF, #0b8ec9)',
                boxShadow: '0 4px 16px rgba(0,102,255,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
              }
            : {
                background: 'linear-gradient(145deg, rgba(17,24,39,0.6), rgba(15,23,42,0.4))',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
              }
        }
      >
        {/* Top highlight line */}
        <div
          className="absolute top-0 left-3 right-3 h-px pointer-events-none"
          style={{
            background: isUser
              ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
          }}
        />

        <div className="text-sm leading-relaxed text-white relative z-[1]">{children}</div>
        {timestamp && (
          <div
            className={`text-[10px] mt-1.5 flex items-center gap-1 ${
              isUser ? 'text-white/50 justify-end' : 'text-muted'
            }`}
          >
            {isUser && <Icon name="done_all" size={12} style={{ color: 'rgba(255,255,255,0.5)' }} />}
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
