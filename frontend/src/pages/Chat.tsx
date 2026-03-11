import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import ChatBubble from '../components/ui/ChatBubble';
import { useChat } from '../hooks/useChat';

type Round = 'career' | 'interview' | 'scholarship';

const CATEGORIES: { label: string; value: Round; icon: string }[] = [
  { label: 'Career', value: 'career', icon: 'work' },
  { label: 'Interview', value: 'interview', icon: 'record_voice_over' },
  { label: 'Scholarship', value: 'scholarship', icon: 'school' },
];

/* ── Stagger variants (matches Dashboard pattern) ── */
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 18 },
  },
};

/* ── Typing-dot spring config ── */
const dotVariant = {
  initial: { y: 0 },
  animate: (i: number) => ({
    y: [0, -8, 0],
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 0.4,
      type: 'spring',
      stiffness: 260,
      damping: 12,
    },
  }),
};

/* ── Sparkle keyframe animation ── */
const sparkle = {
  animate: {
    rotate: [0, 15, -10, 12, 0],
    scale: [1, 1.18, 0.95, 1.1, 1],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

/* ── Floating icon bob ── */
const floatingBob = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

const Chat = () => {
  const [round, setRound] = useState<Round>('career');
  const { messages, loading, historyLoading, error, sendMessage, clearMessages } = useChat(round);
  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim(), round);
    setInput('');
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-[calc(100vh-8rem)]"
    >
      {/* ── Gradient header ── */}
      <motion.div
        variants={item}
        className="relative mb-5 rounded-2xl overflow-hidden px-6 py-5"
        style={{
          background:
            'linear-gradient(135deg, rgba(0,102,255,0.15) 0%, rgba(34,211,238,0.08) 50%, rgba(0,102,255,0.05) 100%)',
          border: '1px solid rgba(0,102,255,0.12)',
        }}
      >
        {/* Decorative blurred orb */}
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,102,255,0.2) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />

        <div className="relative flex items-center gap-4">
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#22D3EE] flex items-center justify-center shadow-lg"
            style={{
              boxShadow: '0 4px 20px rgba(0,102,255,0.35)',
              transformStyle: 'preserve-3d',
            }}
            whileHover={{ rotateY: 15, rotateX: -10, scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Icon name="smart_toy" size={26} className="text-white" />
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                AI Mentor
              </h2>
              <motion.span {...sparkle}>
                <Icon
                  name="auto_awesome"
                  size={18}
                  className="text-[#22D3EE]"
                  filled
                />
              </motion.span>
            </div>
            <p className="text-sm text-[#94A3B8] mt-0.5">
              Your intelligent career guide &mdash; always ready to help
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#64748B]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Online
          </div>
        </div>
      </motion.div>

      {/* ── Category chips ── */}
      <motion.div variants={item} className="flex items-center gap-2 mb-4">
        {CATEGORIES.map((cat) => {
          const isActive = round === cat.value;
          return (
            <motion.button
              key={cat.value}
              onClick={() => setRound(cat.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#0066FF] text-white'
                  : 'bg-[#111827] border border-white/5 text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
              whileHover={{
                y: -2,
                boxShadow: isActive
                  ? '0 6px 24px rgba(0,102,255,0.4)'
                  : '0 4px 16px rgba(0,102,255,0.12)',
              }}
              whileTap={{ scale: 0.97 }}
              animate={
                isActive
                  ? { boxShadow: '0 4px 18px rgba(0,102,255,0.3)' }
                  : { boxShadow: '0 0px 0px rgba(0,102,255,0)' }
              }
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Icon name={cat.icon} size={16} />
              {cat.label}
            </motion.button>
          );
        })}

        <div className="flex-1" />

        <AnimatePresence>
          {messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <Button variant="ghost" size="sm" onClick={clearMessages}>
                <Icon name="delete" size={16} /> Clear
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Messages area ── */}
      <motion.div
        variants={item}
        className="flex-1 overflow-y-auto space-y-4 px-1 scrollbar-thin scrollbar-thumb-white/5"
      >
        {historyLoading ? (
          /* ── History loading skeleton ── */
          <div className="flex flex-col gap-3 px-2 pt-4">
            {[0.6, 0.4, 0.7].map((w, i) => (
              <div key={i} className={`h-10 rounded-xl bg-white/5 animate-pulse ${i % 2 === 0 ? 'ml-auto' : ''}`} style={{ width: `${w * 100}%` }} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Floating AI orb with 3D hover */}
            <motion.div
              className="relative mb-6"
              {...floatingBob}
            >
              {/* Glow ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0,102,255,0.15)',
                    '0 0 40px rgba(0,102,255,0.3)',
                    '0 0 20px rgba(0,102,255,0.15)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#22D3EE] flex items-center justify-center relative"
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 8px 32px rgba(0,102,255,0.35)',
                }}
                whileHover={{
                  rotateY: 20,
                  rotateX: -15,
                  scale: 1.1,
                  boxShadow: '0 12px 40px rgba(0,102,255,0.5)',
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Icon name="smart_toy" size={40} className="text-white" />
              </motion.div>
            </motion.div>

            <motion.h3
              className="text-2xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              AI Mentor
            </motion.h3>
            <motion.p
              className="text-[#94A3B8] max-w-md mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              Ask anything about your career journey. I can help with career
              guidance, interview prep, and scholarship advice.
            </motion.p>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2.5 justify-center max-w-lg">
              {[
                'What careers match my skills?',
                'Help me prepare for interviews',
                'What scholarships am I eligible for?',
              ].map((q, i) => (
                <motion.button
                  key={q}
                  onClick={() => setInput(q)}
                  className="bg-[#111827] border border-white/5 px-4 py-2.5 rounded-xl text-sm text-[#94A3B8] hover:text-white transition-colors"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.55 + i * 0.1,
                    type: 'spring',
                    stiffness: 150,
                    damping: 18,
                  }}
                  whileHover={{
                    y: -3,
                    borderColor: 'rgba(0,102,255,0.4)',
                    boxShadow: '0 4px 20px rgba(0,102,255,0.15)',
                    color: '#ffffff',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ── Message list ── */
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{
                    opacity: 0,
                    x: isUser ? 40 : -40,
                    y: 10,
                    scale: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    x: isUser ? 20 : -20,
                    scale: 0.95,
                    transition: { duration: 0.2 },
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 22,
                    mass: 0.8,
                  }}
                  layout
                >
                  <ChatBubble
                    role={isUser ? 'user' : 'assistant'}
                    timestamp={new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  >
                    <div>
                      <p>{msg.content}</p>

                      {/* Action Plan */}
                      {msg.structured?.actionPlan &&
                        msg.structured.actionPlan.length > 0 && (
                          <motion.div
                            className="mt-3 space-y-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                          >
                            <p className="text-xs font-semibold uppercase text-[#0066FF]">
                              Action Plan
                            </p>
                            {msg.structured.actionPlan.map((step, i) => (
                              <motion.div
                                key={i}
                                className="bg-white/5 rounded-lg p-2 text-xs"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay: 0.3 + i * 0.08,
                                  type: 'spring',
                                  stiffness: 180,
                                  damping: 18,
                                }}
                              >
                                <p className="font-medium text-white">
                                  {step.title}
                                </p>
                                <p className="text-[#94A3B8]">{step.detail}</p>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}

                      {/* Follow-ups */}
                      {msg.structured?.followUps &&
                        msg.structured.followUps.length > 0 && (
                          <motion.div
                            className="mt-3 flex flex-wrap gap-1.5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            {msg.structured.followUps.map((fu, i) => (
                              <motion.button
                                key={i}
                                onClick={() => setInput(fu.question)}
                                className="bg-[#0066FF]/10 text-[#0066FF] text-xs px-3 py-1.5 rounded-lg hover:bg-[#0066FF]/20 transition-colors"
                                whileHover={{
                                  y: -1,
                                  boxShadow:
                                    '0 2px 12px rgba(0,102,255,0.2)',
                                }}
                                whileTap={{ scale: 0.96 }}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.45 + i * 0.06 }}
                              >
                                {fu.question}
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                    </div>
                  </ChatBubble>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* ── Typing indicator ── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="flex items-center gap-3 px-4 py-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <div className="flex gap-1.5 bg-[#111827] border border-white/5 px-4 py-2.5 rounded-2xl rounded-tl-sm">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 bg-[#0066FF] rounded-full"
                    variants={dotVariant}
                    initial="initial"
                    animate="animate"
                    custom={i}
                  />
                ))}
              </div>
              <motion.span
                className="text-sm text-[#64748B]"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                AI is thinking...
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="flex items-center gap-2 px-4 text-red-400 text-sm"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <motion.span
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Icon name="error" size={16} />
              </motion.span>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEnd} />
      </motion.div>

      {/* ── Input bar ── */}
      <motion.form
        variants={item}
        onSubmit={handleSubmit}
        className="flex items-center gap-3 mt-4 bg-[#111827] rounded-2xl p-3 transition-all duration-300"
        animate={{
          borderColor: inputFocused
            ? 'rgba(0,102,255,0.4)'
            : 'rgba(255,255,255,0.05)',
          boxShadow: inputFocused
            ? '0 0 0 1px rgba(0,102,255,0.25), 0 4px 24px rgba(0,102,255,0.08)'
            : '0 0 0 1px rgba(255,255,255,0.05), 0 0px 0px rgba(0,102,255,0)',
        }}
        style={{ border: '1px solid rgba(255,255,255,0.05)' }}
        transition={{ duration: 0.3 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder={`Ask about ${round}...`}
          className="flex-1 bg-transparent text-white placeholder-[#64748B] outline-none text-sm"
          disabled={loading}
        />

        <motion.div
          whileHover={
            input.trim() && !loading
              ? {
                  scale: 1.08,
                  boxShadow: '0 4px 20px rgba(0,102,255,0.4)',
                }
              : undefined
          }
          whileTap={
            input.trim() && !loading ? { scale: 0.95 } : undefined
          }
          className="rounded-xl"
        >
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!input.trim() || loading}
          >
            <Icon name="send" size={18} />
          </Button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default Chat;
