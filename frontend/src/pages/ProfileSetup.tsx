import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import { profileAPI } from '../services/api';

/* ───── Step definitions ───── */
const STEPS = [
  { id: 'basic', title: 'Basic Info', icon: 'person' },
  { id: 'education', title: 'Education', icon: 'school' },
  { id: 'github', title: 'GitHub', icon: 'code' },
  { id: 'review', title: 'Review', icon: 'check_circle' },
];

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubPreview, setGithubPreview] = useState<any>(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: localStorage.getItem('userName') || '',
    age: '',
    phone: '',
    college: '',
    degree: 'B.Tech',
    branch: '',
    graduationYear: '',
    githubUsername: '',
    linkedinUrl: '',
    bio: '',
  });

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  // Auto-fetch GitHub preview
  useEffect(() => {
    if (form.githubUsername.length >= 2) {
      const timer = setTimeout(async () => {
        setGithubLoading(true);
        try {
          const res = await profileAPI.previewGitHub(form.githubUsername);
          setGithubPreview(res.data.data);
        } catch {
          setGithubPreview(null);
        }
        setGithubLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setGithubPreview(null);
    }
  }, [form.githubUsername]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await profileAPI.setupProfile({
        name: form.name,
        age: form.age ? parseInt(form.age) : undefined,
        college: form.college || undefined,
        degree: form.degree || undefined,
        branch: form.branch || undefined,
        graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
        githubUsername: form.githubUsername || undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        bio: form.bio || undefined,
        phone: form.phone || undefined,
      });
      localStorage.setItem('profileSetupCompleted', 'true');
      if (res.data.user?.name) localStorage.setItem('userName', res.data.user.name);
      navigate('/quiz-intro', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Setup failed');
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return !!form.name.trim();
    if (step === 1) return !!form.degree;
    return true;
  };

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-navy flex">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col p-6 md:p-10 lg:p-16 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#38bdf8] flex items-center justify-center">
              <Icon name="rocket_launch" size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Set Up Your Tech Profile</h1>
              <p className="text-xs text-white/50">This powers your AI career analysis</p>
            </div>
          </div>
        </motion.div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 my-6">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <motion.div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                  i <= step
                    ? 'bg-[#0066FF] text-white'
                    : 'bg-[#111827] text-white/40'
                }`}
                animate={i === step ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {i < step ? <Icon name="check" size={16} /> : i + 1}
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 rounded ${i < step ? 'bg-[#0066FF]' : 'bg-[#111827]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/[0.04] rounded-full mb-8 overflow-hidden">
          <motion.div className="h-full rounded-full bg-[#0066FF]" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} variants={stepVariants} initial="enter" animate="center" exit="exit" className="flex-1">
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-white mb-1">Tell us about yourself</h2>
                <p className="text-white/50 text-sm mb-6">We use this to personalize your AI career guidance.</p>

                <div>
                  <label className="text-sm text-white/50 mb-1 block">Full Name *</label>
                  <input
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#0066FF] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/50 mb-1 block">Age</label>
                    <input
                      type="number"
                      value={form.age}
                      onChange={e => set('age', e.target.value)}
                      placeholder="21"
                      className="w-full bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#0066FF] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/50 mb-1 block">Phone (optional)</label>
                    <input
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#0066FF] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/50 mb-1 block">Short Bio (optional)</label>
                  <textarea
                    value={form.bio}
                    onChange={e => set('bio', e.target.value)}
                    placeholder="Aspiring full-stack developer passionate about AI..."
                    rows={2}
                    className="w-full bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#0066FF] transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 1: Education */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-white mb-1">Your Education</h2>
                <p className="text-white/50 text-sm mb-6">Helps us match careers to your academic background.</p>

                <div>
                  <label className="text-sm text-white/50 mb-1 block">College / University</label>
                  <input
                    value={form.college}
                    onChange={e => set('college', e.target.value)}
                    placeholder="IIT Delhi, VIT Vellore, etc."
                    className="w-full bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#0066FF] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/50 mb-1 block">Degree</label>
                    <select
                      value={form.degree}
                      onChange={e => set('degree', e.target.value)}
                      className="w-full bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3 text-white outline-none focus:border-[#0066FF] transition-colors"
                    >
                      <option value="B.Tech">B.Tech / BE</option>
                      <option value="BCA">BCA</option>
                      <option value="MCA">MCA</option>
                      <option value="M.Tech">M.Tech / ME</option>
                      <option value="BSc CS">BSc Computer Science</option>
                      <option value="MSc CS">MSc Computer Science</option>
                      <option value="BBA">BBA</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-white/50 mb-1 block">Branch</label>
                    <select
                      value={form.branch}
                      onChange={e => set('branch', e.target.value)}
                      className="w-full bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3 text-white outline-none focus:border-[#0066FF] transition-colors"
                    >
                      <option value="">Select branch</option>
                      <option value="CSE">Computer Science (CSE)</option>
                      <option value="IT">Information Technology (IT)</option>
                      <option value="ECE">Electronics & Communication (ECE)</option>
                      <option value="EEE">Electrical Engineering (EEE)</option>
                      <option value="ME">Mechanical Engineering</option>
                      <option value="AI/ML">AI / Machine Learning</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/50 mb-1 block">Graduation Year</label>
                  <select
                    value={form.graduationYear}
                    onChange={e => set('graduationYear', e.target.value)}
                    className="w-full bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3 text-white outline-none focus:border-[#0066FF] transition-colors"
                  >
                    <option value="">Select year</option>
                    {[2024, 2025, 2026, 2027, 2028, 2029].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: GitHub / LinkedIn */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-white mb-1">Connect Your Profiles</h2>
                <p className="text-white/50 text-sm mb-6">Optional — AI will analyze your GitHub for a richer career profile.</p>

                <div>
                  <label className="text-sm text-white/50 mb-1 block">GitHub Username (optional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">github.com/</span>
                    <input
                      value={form.githubUsername}
                      onChange={e => {
                        let val = e.target.value;
                        // Extract username if user pastes full GitHub URL
                        const match = val.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)\/?$/);
                        if (match) val = match[1];
                        set('githubUsername', val);
                      }}
                      placeholder="username"
                      className="w-full bg-[#111827] border border-[#1E293B] rounded-xl pl-[115px] pr-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#0066FF] transition-colors"
                    />
                    {githubLoading && (
                      <motion.div
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    )}
                  </div>
                </div>

                {/* GitHub Preview Card */}
                {githubPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111827] border border-[#0066FF]/30 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img src={githubPreview.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="text-white font-semibold text-sm">{githubPreview.name || githubPreview.username}</p>
                        <p className="text-white/40 text-xs">@{githubPreview.username}</p>
                      </div>
                      <Icon name="check_circle" size={18} className="text-green-500 ml-auto" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white/[0.04] rounded-lg p-2">
                        <p className="text-white font-bold text-lg">{githubPreview.publicRepos}</p>
                        <p className="text-white/40 text-xs">Repos</p>
                      </div>
                      <div className="bg-white/[0.04] rounded-lg p-2">
                        <p className="text-white font-bold text-lg">{githubPreview.totalStars}</p>
                        <p className="text-white/40 text-xs">Stars</p>
                      </div>
                      <div className="bg-white/[0.04] rounded-lg p-2">
                        <p className="text-white font-bold text-lg">{githubPreview.followers}</p>
                        <p className="text-white/40 text-xs">Followers</p>
                      </div>
                    </div>
                    {githubPreview.languages?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {githubPreview.languages.slice(0, 6).map((l: any) => (
                          <span key={l.language} className="px-2 py-1 rounded-md bg-[#0066FF]/10 text-[#0066FF] text-xs font-medium">
                            {l.language} ({l.repoCount})
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                <div>
                  <label className="text-sm text-white/50 mb-1 block">LinkedIn Profile URL (optional)</label>
                  <input
                    value={form.linkedinUrl}
                    onChange={e => set('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                    className="w-full bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#0066FF] transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-white mb-1">Review Your Profile</h2>
                <p className="text-white/50 text-sm mb-6">After this, our AI will analyze your profile and generate career insights.</p>

                <div className="space-y-3">
                  {[
                    { label: 'Name', value: form.name, icon: 'person' },
                    { label: 'Age', value: form.age || 'Not provided', icon: 'cake' },
                    { label: 'College', value: form.college || 'Not provided', icon: 'school' },
                    { label: 'Degree', value: `${form.degree}${form.branch ? ` — ${form.branch}` : ''}`, icon: 'menu_book' },
                    { label: 'Graduation', value: form.graduationYear || 'Not provided', icon: 'calendar_month' },
                    { label: 'GitHub', value: form.githubUsername ? `@${form.githubUsername}` : 'Not connected', icon: 'code' },
                    { label: 'LinkedIn', value: form.linkedinUrl ? 'Connected' : 'Not connected', icon: 'link' },
                  ].map(item => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="flex items-center gap-3 bg-[#111827] rounded-xl p-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
                        <Icon name={item.icon} size={18} className="text-[#0066FF]" />
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">{item.label}</p>
                        <p className="text-white text-sm font-medium">{item.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mt-4 flex items-center gap-2">
            <Icon name="error" size={18} className="text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-4 mt-8">
          {step > 0 && (
            <Button variant="secondary" size="md" onClick={() => setStep(s => s - 1)}>
              <Icon name="arrow_back" size={18} /> Back
            </Button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <Button variant="primary" size="md" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
              Next <Icon name="arrow_forward" size={18} />
            </Button>
          ) : (
            <motion.div whileHover={{ boxShadow: '0 0 20px rgba(0,102,255,0.3)' }}>
              <Button variant="primary" size="md" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Analyzing...
                  </span>
                ) : (
                  <>Complete Setup <Icon name="auto_awesome" size={18} /></>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Right: What's next */}
      <div className="hidden lg:flex w-80 bg-inset border-l border-white/5 p-8 flex-col">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="text-lg font-semibold text-white mb-4">What happens next?</h3>
          <div className="space-y-4">
            {[
              { icon: 'psychology', title: 'AI Profile Analysis', desc: 'Our AI analyzes your skills, education, and GitHub to build your career profile' },
              { icon: 'emoji_events', title: 'Earn Badges', desc: 'Get badges for your skills, GitHub activity, and achievements' },
              { icon: 'quiz', title: 'Quick Assessment', desc: '8 tech-focused questions to fine-tune your career matches' },
              { icon: 'route', title: 'Personalized Roadmap', desc: 'AI-generated learning path tailored to your target role' },
              { icon: 'work', title: 'Placement Prep', desc: 'Company-specific interview prep based on your level' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                  <Icon name={item.icon} size={16} className="text-[#0066FF]" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{item.title}</p>
                  <p className="text-white/40 text-xs">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSetup;
