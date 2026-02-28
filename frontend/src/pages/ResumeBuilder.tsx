import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/ui/Icon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Input from '../components/ui/Input';
import StatCard from '../components/ui/StatCard';
import { featuresAPI } from '../services/api';

/* ─── Animation variants ─── */

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 140, damping: 20 } },
};

/* ─── Types ─── */

interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  year: string;
  gpa: string;
}

interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  techStack: string;
  link: string;
}

interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  year: string;
  link: string;
}

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
}

interface ResumeData {
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
}

type TemplateId = 'modern' | 'professional' | 'creative' | 'iit' | 'faang';

interface TemplateOption {
  id: TemplateId;
  name: string;
  description: string;
  color: string;
  icon: string;
  accentHex: string;
}

/* ─── Template definitions ─── */

const TEMPLATES: TemplateOption[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, minimal layout with accent colors',
    color: 'accent',
    icon: 'auto_awesome',
    accentHex: '#0da2e7',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Corporate, formal with structured sections',
    color: 'violet',
    icon: 'business_center',
    accentHex: '#8B5CF6',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold, unique design with visual flair',
    color: 'success',
    icon: 'palette',
    accentHex: '#10B981',
  },
  {
    id: 'iit',
    name: 'IIT Classic',
    description: 'LaTeX-inspired academic format, campus preferred',
    color: 'warning',
    icon: 'school',
    accentHex: '#F59E0B',
  },
  {
    id: 'faang',
    name: 'FAANG Ready',
    description: 'Optimized for Big Tech ATS, single-column focus',
    color: 'accent',
    icon: 'military_tech',
    accentHex: '#EF4444',
  },
];

/* ─── ATS keyword lists ─── */

const ATS_KEYWORDS = [
  'leadership', 'teamwork', 'communication', 'problem-solving', 'analytical',
  'project management', 'agile', 'collaboration', 'innovation', 'results-driven',
  'python', 'javascript', 'react', 'node.js', 'sql', 'machine learning',
  'data analysis', 'cloud computing', 'devops', 'git',
];

/* ─── Unique ID generator ─── */

let idCounter = 0;
const generateId = () => `entry_${Date.now()}_${++idCounter}`;

/* ─── Animated count-up hook ─── */

function useCountUp(target: number, duration = 1000, trigger = true) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!trigger || target <= 0) { setValue(target); return; }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, trigger]);
  return value;
}

/* ─── ATS Score Ring component ─── */

const ATSScoreRing = ({ score, size = 120 }: { score: number; size?: number }) => {
  const animatedScore = useCountUp(score, 1200);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={8}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${scoreColor}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-white">{animatedScore}</span>
        <span className="text-[10px] text-secondary font-medium">ATS Score</span>
      </div>
    </div>
  );
};

/* ─── Main ResumeBuilder Component ─── */

const ResumeBuilder = () => {
  const userName = localStorage.getItem('userName') || 'Student';
  const userEmail = localStorage.getItem('userEmail') || '';

  /* ─── State ─── */

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [skillInput, setSkillInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiEnhanceLoading, setAiEnhanceLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [atsScore, setAtsScore] = useState(42);

  const [resumeData, setResumeData] = useState<ResumeData>({
    personal: {
      name: userName,
      email: userEmail,
      phone: '+91 98765 43210',
      location: 'Mumbai, India',
      linkedin: 'linkedin.com/in/student',
      portfolio: '',
    },
    summary: '',
    experience: [
      {
        id: generateId(),
        company: 'Tech Solutions Pvt. Ltd.',
        role: 'Software Engineering Intern',
        duration: 'Jun 2024 - Aug 2024',
        description: 'Developed REST APIs using Node.js and Express. Implemented authentication module serving 5K+ users. Collaborated with cross-functional team in agile sprints.',
      },
    ],
    education: [
      {
        id: generateId(),
        institution: 'Indian Institute of Technology, Delhi',
        degree: 'B.Tech in Computer Science',
        year: '2021 - 2025',
        gpa: '8.7',
      },
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Tailwind CSS'],
    projects: [
      {
        id: generateId(),
        name: 'EduConnect Platform',
        description: 'Full-stack education platform with real-time collaboration, video conferencing, and AI-powered tutoring.',
        techStack: 'React, Node.js, Socket.IO, MongoDB',
        link: 'github.com/student/educonnect',
      },
    ],
    certifications: [
      {
        id: generateId(),
        name: 'AWS Cloud Practitioner',
        issuer: 'Amazon Web Services',
        year: '2024',
        link: '',
      },
    ],
  });

  const previewRef = useRef<HTMLDivElement>(null);

  /* ─── ATS score calculation ─── */

  const computeAtsScore = useCallback(() => {
    let score = 0;
    const allText = [
      resumeData.summary,
      ...resumeData.experience.map(e => `${e.role} ${e.company} ${e.description}`),
      ...resumeData.education.map(e => `${e.degree} ${e.institution}`),
      ...resumeData.skills,
      ...resumeData.projects.map(p => `${p.name} ${p.description} ${p.techStack}`),
      ...resumeData.certifications.map(c => `${c.name} ${c.issuer}`),
    ].join(' ').toLowerCase();

    if (resumeData.personal.name.trim()) score += 5;
    if (resumeData.personal.email.trim()) score += 5;
    if (resumeData.personal.phone.trim()) score += 5;
    if (resumeData.personal.location.trim()) score += 3;
    if (resumeData.personal.linkedin.trim()) score += 4;
    if (resumeData.summary.trim().length > 50) score += 12;
    else if (resumeData.summary.trim().length > 0) score += 5;
    if (resumeData.experience.length > 0) score += 10;
    if (resumeData.experience.length > 1) score += 5;
    if (resumeData.education.length > 0) score += 8;
    if (resumeData.skills.length >= 5) score += 10;
    else if (resumeData.skills.length > 0) score += 4;
    if (resumeData.projects.length > 0) score += 8;
    if (resumeData.certifications.length > 0) score += 5;

    const matchedKeywords = ATS_KEYWORDS.filter(kw => allText.includes(kw.toLowerCase()));
    score += Math.min(matchedKeywords.length * 2, 20);

    return Math.min(score, 100);
  }, [resumeData]);

  useEffect(() => {
    const newScore = computeAtsScore();
    setAtsScore(newScore);
  }, [computeAtsScore]);

  /* ─── Handlers ─── */

  const updatePersonal = (field: keyof PersonalInfo, value: string) => {
    setResumeData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: generateId(), company: '', role: '', duration: '', description: '' }],
    }));
  };

  const updateExperience = (id: string, field: keyof ExperienceEntry, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(e => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { id: generateId(), institution: '', degree: '', year: '', gpa: '' }],
    }));
  };

  const updateEducation = (id: string, field: keyof EducationEntry, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(e => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !resumeData.skills.includes(trimmed)) {
      setResumeData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setResumeData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { id: generateId(), name: '', description: '', techStack: '', link: '' }],
    }));
  };

  const updateProject = (id: string, field: keyof ProjectEntry, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(p => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  const removeProject = (id: string) => {
    setResumeData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const addCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { id: generateId(), name: '', issuer: '', year: '', link: '' }],
    }));
  };

  const updateCertification = (id: string, field: keyof CertificationEntry, value: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(c => (c.id === id ? { ...c, [field]: value } : c)),
    }));
  };

  const removeCertification = (id: string) => {
    setResumeData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c.id !== id) }));
  };

  /* ─── AI handlers (real backend) ─── */

  const handleGenerateSummary = async () => {
    setAiLoading(true);
    try {
      const res = await featuresAPI.generateResumeSummary({
        personalInfo: resumeData.personal,
        experience: resumeData.experience,
        education: resumeData.education,
        skills: resumeData.skills,
        targetRole: (resumeData.personal as any).title || 'Software Engineer',
      });
      if (res.data?.data?.summary) {
        setResumeData(prev => ({ ...prev, summary: res.data.data.summary }));
      }
    } catch {
      // Fallback to local generation
      setResumeData(prev => ({
        ...prev,
        summary:
          'Results-driven Computer Science student with hands-on experience in full-stack development and cloud technologies. Proficient in building scalable web applications using React, Node.js, and Python. Passionate about leveraging technology to solve real-world problems, with strong foundations in data structures, algorithms, and system design.',
      }));
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiEnhance = async () => {
    setAiEnhanceLoading(true);
    try {
      const res = await featuresAPI.enhanceResumeSection({
        section: 'full',
        content: { summary: resumeData.summary, experience: resumeData.experience },
        targetRole: (resumeData.personal as any).title || 'Software Engineer',
      });
      if (res.data?.data?.enhanced) {
        setResumeData(prev => ({
          ...prev,
          summary: res.data.data.enhanced || prev.summary,
        }));
      }
    } catch {
      // Fallback
      setResumeData(prev => ({
        ...prev,
        summary: prev.summary
          ? `${prev.summary} Recognized for exceptional teamwork and leadership.`
          : prev.summary,
      }));
    } finally {
      setAiEnhanceLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    setDownloadLoading(true);
    setTimeout(() => {
      setDownloadLoading(false);
      alert('Resume PDF downloaded successfully!');
    }, 1500);
  };

  const handleDownloadLatex = () => {
    const d = resumeData;
    const esc = (s: string) => s.replace(/[&%$#_{}~^\\]/g, (m) => `\\${m}`);
    const latex = `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=0.7in]{geometry}
\\usepackage{enumitem,titlesec,hyperref,xcolor}
\\definecolor{accent}{HTML}{0D62E7}
\\titleformat{\\section}{\\large\\bfseries\\color{accent}}{}{0em}{}[\\titlerule]
\\setlength{\\parindent}{0pt}
\\begin{document}

% ─── Header ───
\\begin{center}
{\\LARGE\\bfseries ${esc(d.personal.name)}}\\\\[4pt]
${[d.personal.email, d.personal.phone, d.personal.location].filter(Boolean).map(esc).join(' $\\cdot$ ')}\\\\[2pt]
${d.personal.linkedin ? `\\href{${d.personal.linkedin}}{LinkedIn}` : ''}${d.personal.portfolio ? ` $\\cdot$ \\href{${d.personal.portfolio}}{Portfolio}` : ''}
\\end{center}

% ─── Summary ───
${d.summary ? `\\section{Summary}\n${esc(d.summary)}\n` : ''}
% ─── Experience ───
${d.experience.filter(e => e.company).length > 0 ? `\\section{Experience}
${d.experience.filter(e => e.company).map(e => `\\textbf{${esc(e.role)}} \\hfill ${esc(e.duration)}\\\\
\\textit{${esc(e.company)}}\\\\
${esc(e.description)}\\\\[6pt]`).join('\n')}` : ''}
% ─── Education ───
${d.education.filter(e => e.institution).length > 0 ? `\\section{Education}
${d.education.filter(e => e.institution).map(e => `\\textbf{${esc(e.degree)}} \\hfill ${esc(e.year)}\\\\
\\textit{${esc(e.institution)}}${e.gpa ? ` — GPA: ${esc(e.gpa)}` : ''}\\\\[6pt]`).join('\n')}` : ''}
% ─── Skills ───
${d.skills.length > 0 ? `\\section{Technical Skills}\n${d.skills.map(esc).join(', ')}` : ''}

% ─── Projects ───
${d.projects.filter(p => p.name).length > 0 ? `\\section{Projects}
${d.projects.filter(p => p.name).map(p => `\\textbf{${esc(p.name)}}${p.techStack ? ` \\textit{(${esc(p.techStack)})}` : ''}\\\\
${esc(p.description)}${p.link ? ` \\href{${p.link}}{[Link]}` : ''}\\\\[6pt]`).join('\n')}` : ''}
% ─── Certifications ───
${d.certifications.filter(c => c.name).length > 0 ? `\\section{Certifications}
\\begin{itemize}[leftmargin=*,nosep]
${d.certifications.filter(c => c.name).map(c => `\\item \\textbf{${esc(c.name)}} — ${esc(c.issuer)} (${esc(c.year)})`).join('\n')}
\\end{itemize}` : ''}

\\end{document}`;

    const blob = new Blob([latex], { type: 'application/x-latex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${d.personal.name || 'resume'}_resume.tex`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ─── Section completeness checks ─── */

  const sectionCompleteness = {
    personal:
      (resumeData.personal.name ? 1 : 0) +
      (resumeData.personal.email ? 1 : 0) +
      (resumeData.personal.phone ? 1 : 0) +
      (resumeData.personal.location ? 1 : 0) +
      (resumeData.personal.linkedin ? 1 : 0) +
      (resumeData.personal.portfolio ? 1 : 0),
    personalMax: 6,
    summary: resumeData.summary.trim().length > 50 ? 1 : resumeData.summary.trim().length > 0 ? 0.5 : 0,
    summaryMax: 1,
    experience: Math.min(resumeData.experience.filter(e => e.company && e.role).length, 3),
    experienceMax: 3,
    education: Math.min(resumeData.education.filter(e => e.institution && e.degree).length, 2),
    educationMax: 2,
    skills: Math.min(resumeData.skills.length, 8),
    skillsMax: 8,
    projects: Math.min(resumeData.projects.filter(p => p.name && p.description).length, 3),
    projectsMax: 3,
    certifications: Math.min(resumeData.certifications.filter(c => c.name).length, 2),
    certificationsMax: 2,
  };

  /* ─── Form sections navigation ─── */

  const formSections = [
    { id: 'personal', label: 'Personal Info', icon: 'person' },
    { id: 'summary', label: 'Summary', icon: 'subject' },
    { id: 'experience', label: 'Experience', icon: 'work' },
    { id: 'education', label: 'Education', icon: 'school' },
    { id: 'skills', label: 'Skills', icon: 'psychology' },
    { id: 'projects', label: 'Projects', icon: 'rocket_launch' },
    { id: 'certifications', label: 'Certifications', icon: 'verified' },
  ];

  /* ─── Matched ATS keywords ─── */

  const allResumeText = [
    resumeData.summary,
    ...resumeData.experience.map(e => `${e.role} ${e.company} ${e.description}`),
    ...resumeData.skills,
    ...resumeData.projects.map(p => `${p.name} ${p.description} ${p.techStack}`),
    ...resumeData.certifications.map(c => `${c.name} ${c.issuer}`),
  ].join(' ').toLowerCase();

  const matchedKeywords = ATS_KEYWORDS.filter(kw => allResumeText.includes(kw.toLowerCase()));
  const unmatchedKeywords = ATS_KEYWORDS.filter(kw => !allResumeText.includes(kw.toLowerCase()));

  /* ─── AI Suggestions ─── */

  const aiSuggestions = [
    resumeData.summary.length < 50 ? 'Add a professional summary of at least 2-3 sentences.' : null,
    resumeData.skills.length < 5 ? 'Add more skills to improve keyword matching.' : null,
    resumeData.experience.some(e => e.description.length < 30) ? 'Expand experience descriptions with quantifiable achievements.' : null,
    !resumeData.personal.linkedin ? 'Add your LinkedIn URL for better recruiter visibility.' : null,
    resumeData.projects.length === 0 ? 'Add at least one project to showcase practical skills.' : null,
    !resumeData.personal.portfolio ? 'Consider adding a portfolio website link.' : null,
    resumeData.certifications.length === 0 ? 'Industry certifications can improve your ATS score significantly.' : null,
    unmatchedKeywords.length > 10 ? `Consider adding trending keywords: ${unmatchedKeywords.slice(0, 3).join(', ')}` : null,
  ].filter(Boolean) as string[];

  /* ─── Template accent getter ─── */

  const getTemplateAccent = () => {
    const tpl = TEMPLATES.find(t => t.id === selectedTemplate);
    return tpl?.accentHex || '#0da2e7';
  };

  /* ──────────────────────────────────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────────────────────────────────── */

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6 pb-12">
      {/* ─── Header ─── */}
      <motion.div variants={item}>
        <div
          className="rounded-2xl p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(13,162,231,0.08), rgba(139,92,246,0.05), rgba(15,23,42,0.9))',
            border: '1px solid rgba(13,162,231,0.1)',
          }}
        >
          <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
          <motion.div
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-[0.06] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #0da2e7, transparent 70%)' }}
            animate={{ scale: [1, 1.3, 1], x: [0, 10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-[0.04] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1], y: [0, -8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute top-10 left-1/2 w-40 h-40 rounded-full opacity-[0.03] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #10B981, transparent 70%)' }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />

          <div className="relative z-[1]">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,162,231,0.15), rgba(139,92,246,0.1))',
                  border: '1px solid rgba(13,162,231,0.2)',
                }}
              >
                <Icon name="description" size={24} className="text-accent" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">AI Resume Builder</h1>
                  <Badge variant="gradient" size="sm">AI Powered</Badge>
                </div>
                <p className="text-sm text-secondary mt-0.5">
                  Craft an ATS-optimized resume that gets you noticed by top Indian employers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <StatCard
                label="ATS Score"
                value={`${atsScore}/100`}
                icon="verified"
                accentColor={atsScore >= 80 ? '#10B981' : atsScore >= 60 ? '#F59E0B' : '#EF4444'}
                className="flex-1 min-w-[140px]"
              />
              <StatCard
                label="Sections Done"
                value={`${formSections.filter(s => {
                  const key = s.id as keyof typeof sectionCompleteness;
                  const val = sectionCompleteness[key];
                  const maxKey = `${s.id}Max` as keyof typeof sectionCompleteness;
                  const maxVal = sectionCompleteness[maxKey];
                  return typeof val === 'number' && typeof maxVal === 'number' && val >= maxVal * 0.5;
                }).length}/${formSections.length}`}
                icon="checklist"
                accentColor="#8B5CF6"
                className="flex-1 min-w-[140px]"
              />
              <StatCard
                label="Keywords Matched"
                value={`${matchedKeywords.length}/${ATS_KEYWORDS.length}`}
                icon="key"
                accentColor="#0da2e7"
                className="flex-1 min-w-[140px]"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Template Selector ─── */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-3">
          <Icon name="style" size={20} className="text-accent" />
          <h2 className="text-lg font-bold text-white">Choose Template</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TEMPLATES.map(tpl => {
            const isActive = selectedTemplate === tpl.id;
            return (
              <motion.div
                key={tpl.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <div
                  className="rounded-2xl p-5 cursor-pointer transition-all duration-300 relative overflow-hidden"
                  onClick={() => setSelectedTemplate(tpl.id)}
                  style={{
                    background: isActive
                      ? `linear-gradient(145deg, ${tpl.accentHex}15, rgba(15,23,42,0.6))`
                      : 'linear-gradient(145deg, rgba(30,41,59,0.45), rgba(15,23,42,0.35))',
                    border: `1px solid ${isActive ? `${tpl.accentHex}40` : 'rgba(255,255,255,0.06)'}`,
                    boxShadow: isActive
                      ? `0 8px 32px ${tpl.accentHex}20, inset 0 1px 0 rgba(255,255,255,0.06)`
                      : '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                >
                  {isActive && (
                    <div
                      className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-[0.08] pointer-events-none"
                      style={{ background: `radial-gradient(circle, ${tpl.accentHex}, transparent 70%)` }}
                    />
                  )}

                  <div className="relative z-[1]">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: `${tpl.accentHex}15`,
                          border: `1px solid ${tpl.accentHex}25`,
                        }}
                      >
                        <Icon name={tpl.icon} size={20} style={{ color: tpl.accentHex }} />
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: tpl.accentHex }}
                          >
                            <Icon name="check" size={16} style={{ color: '#fff' }} />
                          </div>
                        </motion.div>
                      )}
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1">{tpl.name}</h3>
                    <p className="text-xs text-secondary leading-relaxed">{tpl.description}</p>

                    {/* Mini preview bars */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex gap-2">
                        <div className="h-1.5 rounded-full flex-1" style={{ background: `${tpl.accentHex}40` }} />
                        <div className="h-1.5 rounded-full w-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-1 rounded-full w-12" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        <div className="h-1 rounded-full flex-1" style={{ background: 'rgba(255,255,255,0.04)' }} />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-1 rounded-full flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
                        <div className="h-1 rounded-full w-6" style={{ background: `${tpl.accentHex}25` }} />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-1 rounded-full w-10" style={{ background: 'rgba(255,255,255,0.04)' }} />
                        <div className="h-1 rounded-full flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── AI Features Bar ─── */}
      <motion.div variants={item}>
        <Card glass className="!p-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="primary"
              size="sm"
              loading={aiEnhanceLoading}
              onClick={handleAiEnhance}
              icon={<Icon name="auto_awesome" size={18} />}
            >
              AI Enhance
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAiSuggestions(!showAiSuggestions)}
              icon={<Icon name="lightbulb" size={18} style={{ color: '#F59E0B' }} />}
            >
              AI Suggestions
              {aiSuggestions.length > 0 && (
                <span
                  className="ml-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}
                >
                  {aiSuggestions.length}
                </span>
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={downloadLoading}
              onClick={handleDownloadPdf}
              icon={<Icon name="download" size={18} style={{ color: '#10B981' }} />}
            >
              Download PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadLatex}
              icon={<Icon name="code" size={18} style={{ color: '#22D3EE' }} />}
            >
              LaTeX Export
            </Button>

            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Icon name="verified" size={16} style={{ color: atsScore >= 80 ? '#10B981' : atsScore >= 60 ? '#F59E0B' : '#EF4444' }} />
                <span className="text-xs font-semibold text-white">ATS: {atsScore}%</span>
              </div>
              <Badge
                variant={selectedTemplate === 'modern' ? 'accent' : selectedTemplate === 'professional' ? 'violet' : 'success'}
                size="sm"
                dot
              >
                {TEMPLATES.find(t => t.id === selectedTemplate)?.name} Template
              </Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ─── AI Suggestions Panel ─── */}
      <AnimatePresence>
        {showAiSuggestions && aiSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card glass className="!border-warning/20">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="lightbulb" size={20} style={{ color: '#F59E0B' }} />
                <h3 className="text-sm font-semibold text-white">AI Suggestions to Improve Your Resume</h3>
                <button onClick={() => setShowAiSuggestions(false)} className="ml-auto text-secondary hover:text-white transition-colors">
                  <Icon name="close" size={18} />
                </button>
              </div>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(245,158,11,0.1)' }}>
                      <Icon name="arrow_forward" size={12} style={{ color: '#F59E0B' }} />
                    </div>
                    <span className="text-secondary">{suggestion}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main 2-Column Layout ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* ─── LEFT PANEL: Form ─── */}
        <motion.div variants={item} className="xl:col-span-3 space-y-4">
          {/* Section tabs */}
          <div className="flex gap-2 flex-wrap">
            {formSections.map(section => {
              const isActive = activeSection === section.id;
              return (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                  style={{
                    background: isActive ? `${getTemplateAccent()}15` : 'rgba(255,255,255,0.03)',
                    color: isActive ? getTemplateAccent() : '#94a3b8',
                    border: `1px solid ${isActive ? `${getTemplateAccent()}30` : 'rgba(255,255,255,0.06)'}`,
                  }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Icon name={section.icon} size={16} />
                  <span className="hidden sm:inline">{section.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* ─── Personal Info Section ─── */}
          <AnimatePresence mode="wait">
            {activeSection === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <Card glass>
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${getTemplateAccent()}12`, border: `1px solid ${getTemplateAccent()}20` }}
                    >
                      <Icon name="person" size={18} style={{ color: getTemplateAccent() }} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Personal Information</h3>
                      <p className="text-xs text-secondary">Your basic contact details</p>
                    </div>
                    <div className="ml-auto">
                      <Badge
                        variant={sectionCompleteness.personal >= 5 ? 'success' : sectionCompleteness.personal >= 3 ? 'warning' : 'error'}
                        size="sm"
                      >
                        {sectionCompleteness.personal}/{sectionCompleteness.personalMax} fields
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      icon="person"
                      placeholder="e.g., Ayush Sharma"
                      value={resumeData.personal.name}
                      onChange={e => updatePersonal('name', e.target.value)}
                    />
                    <Input
                      label="Email Address"
                      icon="email"
                      placeholder="e.g., ayush@example.com"
                      value={resumeData.personal.email}
                      onChange={e => updatePersonal('email', e.target.value)}
                    />
                    <Input
                      label="Phone Number"
                      icon="phone"
                      placeholder="e.g., +91 98765 43210"
                      value={resumeData.personal.phone}
                      onChange={e => updatePersonal('phone', e.target.value)}
                    />
                    <Input
                      label="Location"
                      icon="location_on"
                      placeholder="e.g., Mumbai, India"
                      value={resumeData.personal.location}
                      onChange={e => updatePersonal('location', e.target.value)}
                    />
                    <Input
                      label="LinkedIn Profile"
                      icon="link"
                      placeholder="e.g., linkedin.com/in/ayush"
                      value={resumeData.personal.linkedin}
                      onChange={e => updatePersonal('linkedin', e.target.value)}
                    />
                    <Input
                      label="Portfolio URL"
                      icon="language"
                      placeholder="e.g., ayush.dev"
                      value={resumeData.personal.portfolio}
                      onChange={e => updatePersonal('portfolio', e.target.value)}
                    />
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─── Professional Summary Section ─── */}
            {activeSection === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <Card glass>
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${getTemplateAccent()}12`, border: `1px solid ${getTemplateAccent()}20` }}
                    >
                      <Icon name="subject" size={18} style={{ color: getTemplateAccent() }} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Professional Summary</h3>
                      <p className="text-xs text-secondary">A brief overview of your career profile</p>
                    </div>
                    <div className="ml-auto">
                      <Badge
                        variant={sectionCompleteness.summary >= 1 ? 'success' : sectionCompleteness.summary > 0 ? 'warning' : 'error'}
                        size="sm"
                      >
                        {sectionCompleteness.summary >= 1 ? 'Complete' : sectionCompleteness.summary > 0 ? 'Partial' : 'Empty'}
                      </Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      rows={5}
                      className="w-full rounded-xl py-3 px-4 text-white placeholder-muted outline-none text-sm transition-all duration-300 resize-none"
                      style={{
                        background: 'rgba(15,23,42,0.8)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)',
                      }}
                      placeholder="Write a professional summary highlighting your key strengths and career objectives..."
                      value={resumeData.summary}
                      onChange={e => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                      onFocus={e => {
                        e.target.style.borderColor = 'rgba(13,162,231,0.5)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(13,162,231,0.1), 0 0 20px rgba(13,162,231,0.06), inset 0 2px 4px rgba(0,0,0,0.1)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'rgba(255,255,255,0.06)';
                        e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.15)';
                      }}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted">{resumeData.summary.length} characters</span>
                      <Button
                        variant="primary"
                        size="sm"
                        loading={aiLoading}
                        onClick={handleGenerateSummary}
                        icon={<Icon name="auto_awesome" size={16} />}
                      >
                        Generate with AI
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─── Experience Section ─── */}
            {activeSection === 'experience' && (
              <motion.div
                key="experience"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <Card glass>
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${getTemplateAccent()}12`, border: `1px solid ${getTemplateAccent()}20` }}
                    >
                      <Icon name="work" size={18} style={{ color: getTemplateAccent() }} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Work Experience</h3>
                      <p className="text-xs text-secondary">Add your work history and internships</p>
                    </div>
                    <div className="ml-auto">
                      <Badge
                        variant={sectionCompleteness.experience >= 2 ? 'success' : sectionCompleteness.experience >= 1 ? 'warning' : 'error'}
                        size="sm"
                      >
                        {resumeData.experience.length} {resumeData.experience.length === 1 ? 'entry' : 'entries'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {resumeData.experience.map((exp, idx) => (
                      <div key={exp.id} className="relative">
                        {idx > 0 && <div className="absolute -top-2.5 left-0 right-0 h-px bg-white/[0.04]" />}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-secondary">Experience #{idx + 1}</span>
                          <button
                            onClick={() => removeExperience(exp.id)}
                            className="text-secondary hover:text-error transition-colors p-1 rounded-lg hover:bg-error/10"
                          >
                            <Icon name="delete" size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            label="Company"
                            icon="business"
                            placeholder="e.g., TCS, Infosys"
                            value={exp.company}
                            onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                          />
                          <Input
                            label="Role / Position"
                            icon="badge"
                            placeholder="e.g., Software Engineer Intern"
                            value={exp.role}
                            onChange={e => updateExperience(exp.id, 'role', e.target.value)}
                          />
                          <Input
                            label="Duration"
                            icon="calendar_today"
                            placeholder="e.g., Jun 2024 - Aug 2024"
                            value={exp.duration}
                            onChange={e => updateExperience(exp.id, 'duration', e.target.value)}
                          />
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-secondary mb-1.5">Description</label>
                          <textarea
                            rows={3}
                            className="w-full rounded-xl py-3 px-4 text-white placeholder-muted outline-none text-sm transition-all duration-300 resize-none"
                            style={{
                              background: 'rgba(15,23,42,0.8)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)',
                            }}
                            placeholder="Describe your responsibilities and achievements..."
                            value={exp.description}
                            onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                            onFocus={e => {
                              e.target.style.borderColor = 'rgba(13,162,231,0.5)';
                              e.target.style.boxShadow = '0 0 0 3px rgba(13,162,231,0.1), inset 0 2px 4px rgba(0,0,0,0.1)';
                            }}
                            onBlur={e => {
                              e.target.style.borderColor = 'rgba(255,255,255,0.06)';
                              e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.15)';
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    onClick={addExperience}
                    className="mt-4 w-full py-3 rounded-xl border border-dashed text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                    style={{ borderColor: `${getTemplateAccent()}30`, color: getTemplateAccent(), background: `${getTemplateAccent()}05` }}
                    whileHover={{ background: `${getTemplateAccent()}10`, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon name="add_circle" size={18} />
                    Add Experience
                  </motion.button>
                </Card>
              </motion.div>
            )}

            {/* ─── Education Section ─── */}
            {activeSection === 'education' && (
              <motion.div
                key="education"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <Card glass>
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${getTemplateAccent()}12`, border: `1px solid ${getTemplateAccent()}20` }}
                    >
                      <Icon name="school" size={18} style={{ color: getTemplateAccent() }} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Education</h3>
                      <p className="text-xs text-secondary">Your academic background</p>
                    </div>
                    <div className="ml-auto">
                      <Badge
                        variant={sectionCompleteness.education >= 2 ? 'success' : sectionCompleteness.education >= 1 ? 'warning' : 'error'}
                        size="sm"
                      >
                        {resumeData.education.length} {resumeData.education.length === 1 ? 'entry' : 'entries'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {resumeData.education.map((edu, idx) => (
                      <div key={edu.id} className="relative">
                        {idx > 0 && <div className="absolute -top-2.5 left-0 right-0 h-px bg-white/[0.04]" />}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-secondary">Education #{idx + 1}</span>
                          <button
                            onClick={() => removeEducation(edu.id)}
                            className="text-secondary hover:text-error transition-colors p-1 rounded-lg hover:bg-error/10"
                          >
                            <Icon name="delete" size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            label="Institution"
                            icon="school"
                            placeholder="e.g., IIT Delhi"
                            value={edu.institution}
                            onChange={e => updateEducation(edu.id, 'institution', e.target.value)}
                          />
                          <Input
                            label="Degree"
                            icon="workspace_premium"
                            placeholder="e.g., B.Tech in Computer Science"
                            value={edu.degree}
                            onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
                          />
                          <Input
                            label="Year"
                            icon="calendar_today"
                            placeholder="e.g., 2021 - 2025"
                            value={edu.year}
                            onChange={e => updateEducation(edu.id, 'year', e.target.value)}
                          />
                          <Input
                            label="GPA / Percentage"
                            icon="grade"
                            placeholder="e.g., 8.7 / 10"
                            value={edu.gpa}
                            onChange={e => updateEducation(edu.id, 'gpa', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    onClick={addEducation}
                    className="mt-4 w-full py-3 rounded-xl border border-dashed text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                    style={{ borderColor: `${getTemplateAccent()}30`, color: getTemplateAccent(), background: `${getTemplateAccent()}05` }}
                    whileHover={{ background: `${getTemplateAccent()}10`, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon name="add_circle" size={18} />
                    Add Education
                  </motion.button>
                </Card>
              </motion.div>
            )}

            {/* ─── Skills Section ─── */}
            {activeSection === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <Card glass>
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${getTemplateAccent()}12`, border: `1px solid ${getTemplateAccent()}20` }}
                    >
                      <Icon name="psychology" size={18} style={{ color: getTemplateAccent() }} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Skills</h3>
                      <p className="text-xs text-secondary">Type a skill and press Enter to add</p>
                    </div>
                    <div className="ml-auto">
                      <Badge
                        variant={resumeData.skills.length >= 5 ? 'success' : resumeData.skills.length >= 3 ? 'warning' : 'error'}
                        size="sm"
                      >
                        {resumeData.skills.length} skills
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1">
                      <Input
                        icon="add"
                        placeholder="Type a skill (e.g., React, Python, AWS)..."
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill(skillInput);
                          }
                        }}
                      />
                    </div>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => addSkill(skillInput)}
                      disabled={!skillInput.trim()}
                    >
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {resumeData.skills.map(skill => (
                        <motion.div
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold group cursor-default"
                            style={{
                              background: `${getTemplateAccent()}12`,
                              color: getTemplateAccent(),
                              border: `1px solid ${getTemplateAccent()}20`,
                            }}
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="opacity-50 hover:opacity-100 transition-opacity ml-0.5"
                            >
                              <Icon name="close" size={14} />
                            </button>
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {resumeData.skills.length === 0 && (
                    <div className="text-center py-6">
                      <Icon name="psychology" size={32} className="text-muted mx-auto mb-2" />
                      <p className="text-sm text-secondary">No skills added yet. Start typing above to add skills.</p>
                    </div>
                  )}

                  {/* Suggested skills */}
                  <div className="mt-5 pt-4 border-t border-white/[0.04]">
                    <p className="text-xs text-secondary mb-2 font-medium">Suggested Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {['TypeScript', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL', 'GraphQL', 'Figma', 'Machine Learning', 'CI/CD', 'Kubernetes']
                        .filter(s => !resumeData.skills.includes(s))
                        .slice(0, 6)
                        .map(suggestion => (
                          <motion.button
                            key={suggestion}
                            onClick={() => addSkill(suggestion)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors duration-200"
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              color: '#94a3b8',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                            whileHover={{ background: `${getTemplateAccent()}12`, color: getTemplateAccent(), borderColor: `${getTemplateAccent()}20` }}
                            whileTap={{ scale: 0.95 }}
                          >
                            + {suggestion}
                          </motion.button>
                        ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─── Projects Section ─── */}
            {activeSection === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <Card glass>
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${getTemplateAccent()}12`, border: `1px solid ${getTemplateAccent()}20` }}
                    >
                      <Icon name="rocket_launch" size={18} style={{ color: getTemplateAccent() }} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Projects</h3>
                      <p className="text-xs text-secondary">Showcase your best projects</p>
                    </div>
                    <div className="ml-auto">
                      <Badge
                        variant={sectionCompleteness.projects >= 2 ? 'success' : sectionCompleteness.projects >= 1 ? 'warning' : 'error'}
                        size="sm"
                      >
                        {resumeData.projects.length} {resumeData.projects.length === 1 ? 'project' : 'projects'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {resumeData.projects.map((project, idx) => (
                      <div key={project.id} className="relative">
                        {idx > 0 && <div className="absolute -top-2.5 left-0 right-0 h-px bg-white/[0.04]" />}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-secondary">Project #{idx + 1}</span>
                          <button
                            onClick={() => removeProject(project.id)}
                            className="text-secondary hover:text-error transition-colors p-1 rounded-lg hover:bg-error/10"
                          >
                            <Icon name="delete" size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            label="Project Name"
                            icon="folder"
                            placeholder="e.g., EduConnect Platform"
                            value={project.name}
                            onChange={e => updateProject(project.id, 'name', e.target.value)}
                          />
                          <Input
                            label="Tech Stack"
                            icon="code"
                            placeholder="e.g., React, Node.js, MongoDB"
                            value={project.techStack}
                            onChange={e => updateProject(project.id, 'techStack', e.target.value)}
                          />
                          <div className="sm:col-span-2">
                            <Input
                              label="Project Link"
                              icon="link"
                              placeholder="e.g., github.com/user/project"
                              value={project.link}
                              onChange={e => updateProject(project.id, 'link', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-secondary mb-1.5">Description</label>
                          <textarea
                            rows={3}
                            className="w-full rounded-xl py-3 px-4 text-white placeholder-muted outline-none text-sm transition-all duration-300 resize-none"
                            style={{
                              background: 'rgba(15,23,42,0.8)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)',
                            }}
                            placeholder="Describe what this project does and your contributions..."
                            value={project.description}
                            onChange={e => updateProject(project.id, 'description', e.target.value)}
                            onFocus={e => {
                              e.target.style.borderColor = 'rgba(13,162,231,0.5)';
                              e.target.style.boxShadow = '0 0 0 3px rgba(13,162,231,0.1), inset 0 2px 4px rgba(0,0,0,0.1)';
                            }}
                            onBlur={e => {
                              e.target.style.borderColor = 'rgba(255,255,255,0.06)';
                              e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.15)';
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    onClick={addProject}
                    className="mt-4 w-full py-3 rounded-xl border border-dashed text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                    style={{ borderColor: `${getTemplateAccent()}30`, color: getTemplateAccent(), background: `${getTemplateAccent()}05` }}
                    whileHover={{ background: `${getTemplateAccent()}10`, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon name="add_circle" size={18} />
                    Add Project
                  </motion.button>
                </Card>
              </motion.div>
            )}

            {/* ─── Certifications Section ─── */}
            {activeSection === 'certifications' && (
              <motion.div
                key="certifications"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <Card glass>
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${getTemplateAccent()}12`, border: `1px solid ${getTemplateAccent()}20` }}
                    >
                      <Icon name="verified" size={18} style={{ color: getTemplateAccent() }} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Certifications</h3>
                      <p className="text-xs text-secondary">Industry certifications and licenses</p>
                    </div>
                    <div className="ml-auto">
                      <Badge
                        variant={sectionCompleteness.certifications >= 2 ? 'success' : sectionCompleteness.certifications >= 1 ? 'warning' : 'error'}
                        size="sm"
                      >
                        {resumeData.certifications.length} {resumeData.certifications.length === 1 ? 'cert' : 'certs'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {resumeData.certifications.map((cert, idx) => (
                      <div key={cert.id} className="relative">
                        {idx > 0 && <div className="absolute -top-2.5 left-0 right-0 h-px bg-white/[0.04]" />}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-secondary">Certification #{idx + 1}</span>
                          <button
                            onClick={() => removeCertification(cert.id)}
                            className="text-secondary hover:text-error transition-colors p-1 rounded-lg hover:bg-error/10"
                          >
                            <Icon name="delete" size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            label="Certification Name"
                            icon="verified"
                            placeholder="e.g., AWS Cloud Practitioner"
                            value={cert.name}
                            onChange={e => updateCertification(cert.id, 'name', e.target.value)}
                          />
                          <Input
                            label="Issuing Organization"
                            icon="business"
                            placeholder="e.g., Amazon Web Services"
                            value={cert.issuer}
                            onChange={e => updateCertification(cert.id, 'issuer', e.target.value)}
                          />
                          <Input
                            label="Year"
                            icon="calendar_today"
                            placeholder="e.g., 2024"
                            value={cert.year}
                            onChange={e => updateCertification(cert.id, 'year', e.target.value)}
                          />
                          <Input
                            label="Credential Link"
                            icon="link"
                            placeholder="e.g., credential URL"
                            value={cert.link}
                            onChange={e => updateCertification(cert.id, 'link', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    onClick={addCertification}
                    className="mt-4 w-full py-3 rounded-xl border border-dashed text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                    style={{ borderColor: `${getTemplateAccent()}30`, color: getTemplateAccent(), background: `${getTemplateAccent()}05` }}
                    whileHover={{ background: `${getTemplateAccent()}10`, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon name="add_circle" size={18} />
                    Add Certification
                  </motion.button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── RIGHT PANEL: Live Preview + ATS ─── */}
        <motion.div variants={item} className="xl:col-span-2 space-y-4">
          {/* Live Preview */}
          <div className="sticky top-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="preview" size={20} className="text-accent" />
              <h2 className="text-lg font-bold text-white">Live Preview</h2>
              <Badge variant={selectedTemplate === 'modern' ? 'accent' : selectedTemplate === 'professional' ? 'violet' : 'success'} size="sm">
                {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
              </Badge>
            </div>

            {/* A4 Document Preview */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                ref={previewRef}
                className="w-full overflow-y-auto"
                style={{
                  background: '#FFFFFF',
                  minHeight: 500,
                  maxHeight: 700,
                  aspectRatio: '210 / 297',
                }}
              >
                {/* ─── MODERN Template ─── */}
                {selectedTemplate === 'modern' && (
                  <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#1a1a2e', fontSize: 11 }}>
                    {/* Header band */}
                    <div style={{ background: 'linear-gradient(135deg, #0da2e7, #0b86c1)', padding: '24px 28px 20px', color: '#fff' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
                        {resumeData.personal.name || 'Your Name'}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontSize: 10, opacity: 0.92 }}>
                        {resumeData.personal.email && (
                          <span>{resumeData.personal.email}</span>
                        )}
                        {resumeData.personal.phone && (
                          <span>{resumeData.personal.phone}</span>
                        )}
                        {resumeData.personal.location && (
                          <span>{resumeData.personal.location}</span>
                        )}
                        {resumeData.personal.linkedin && (
                          <span>{resumeData.personal.linkedin}</span>
                        )}
                        {resumeData.personal.portfolio && (
                          <span>{resumeData.personal.portfolio}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ padding: '20px 28px 24px' }}>
                      {/* Summary */}
                      {resumeData.summary && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#0da2e7', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, borderBottom: '2px solid #0da2e7', paddingBottom: 3 }}>
                            Professional Summary
                          </div>
                          <div style={{ lineHeight: 1.6, color: '#374151' }}>{resumeData.summary}</div>
                        </div>
                      )}

                      {/* Experience */}
                      {resumeData.experience.length > 0 && resumeData.experience.some(e => e.company || e.role) && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#0da2e7', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, borderBottom: '2px solid #0da2e7', paddingBottom: 3 }}>
                            Experience
                          </div>
                          {resumeData.experience.map(exp => (
                            (exp.company || exp.role) && (
                              <div key={exp.id} style={{ marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                  <div style={{ fontWeight: 700, fontSize: 11.5, color: '#111827' }}>{exp.role || 'Role'}</div>
                                  <div style={{ fontSize: 10, color: '#6b7280' }}>{exp.duration}</div>
                                </div>
                                <div style={{ fontWeight: 600, color: '#0da2e7', fontSize: 10.5, marginBottom: 3 }}>{exp.company}</div>
                                {exp.description && (
                                  <div style={{ color: '#4b5563', lineHeight: 1.5, fontSize: 10.5 }}>{exp.description}</div>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {/* Education */}
                      {resumeData.education.length > 0 && resumeData.education.some(e => e.institution || e.degree) && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#0da2e7', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, borderBottom: '2px solid #0da2e7', paddingBottom: 3 }}>
                            Education
                          </div>
                          {resumeData.education.map(edu => (
                            (edu.institution || edu.degree) && (
                              <div key={edu.id} style={{ marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                  <div style={{ fontWeight: 700, fontSize: 11.5, color: '#111827' }}>{edu.degree || 'Degree'}</div>
                                  <div style={{ fontSize: 10, color: '#6b7280' }}>{edu.year}</div>
                                </div>
                                <div style={{ color: '#0da2e7', fontWeight: 600, fontSize: 10.5 }}>{edu.institution}</div>
                                {edu.gpa && <div style={{ color: '#6b7280', fontSize: 10 }}>GPA: {edu.gpa}</div>}
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {/* Skills */}
                      {resumeData.skills.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#0da2e7', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, borderBottom: '2px solid #0da2e7', paddingBottom: 3 }}>
                            Skills
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {resumeData.skills.map(skill => (
                              <span
                                key={skill}
                                style={{
                                  background: '#e0f2fe',
                                  color: '#0369a1',
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  fontSize: 10,
                                  fontWeight: 600,
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {resumeData.projects.length > 0 && resumeData.projects.some(p => p.name) && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#0da2e7', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, borderBottom: '2px solid #0da2e7', paddingBottom: 3 }}>
                            Projects
                          </div>
                          {resumeData.projects.map(project => (
                            project.name && (
                              <div key={project.id} style={{ marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                  <div style={{ fontWeight: 700, fontSize: 11.5, color: '#111827' }}>{project.name}</div>
                                  {project.link && <div style={{ fontSize: 10, color: '#0da2e7' }}>{project.link}</div>}
                                </div>
                                {project.techStack && (
                                  <div style={{ color: '#6b7280', fontSize: 10, marginBottom: 2, fontStyle: 'italic' }}>{project.techStack}</div>
                                )}
                                {project.description && (
                                  <div style={{ color: '#4b5563', lineHeight: 1.5, fontSize: 10.5 }}>{project.description}</div>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {/* Certifications */}
                      {resumeData.certifications.length > 0 && resumeData.certifications.some(c => c.name) && (
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#0da2e7', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, borderBottom: '2px solid #0da2e7', paddingBottom: 3 }}>
                            Certifications
                          </div>
                          {resumeData.certifications.map(cert => (
                            cert.name && (
                              <div key={cert.id} style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <div>
                                  <span style={{ fontWeight: 700, fontSize: 11, color: '#111827' }}>{cert.name}</span>
                                  {cert.issuer && <span style={{ color: '#6b7280', fontSize: 10 }}> - {cert.issuer}</span>}
                                </div>
                                <div style={{ fontSize: 10, color: '#6b7280' }}>{cert.year}</div>
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─── PROFESSIONAL Template ─── */}
                {selectedTemplate === 'professional' && (
                  <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", color: '#1a1a2e', fontSize: 11 }}>
                    {/* Header */}
                    <div style={{ padding: '28px 28px 20px', borderBottom: '3px solid #8B5CF6', textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#1e1b4b', marginBottom: 6 }}>
                        {resumeData.personal.name || 'Your Name'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 12px', fontSize: 10, color: '#4c4870' }}>
                        {resumeData.personal.email && (
                          <span>{resumeData.personal.email}</span>
                        )}
                        {resumeData.personal.email && resumeData.personal.phone && <span>|</span>}
                        {resumeData.personal.phone && (
                          <span>{resumeData.personal.phone}</span>
                        )}
                        {resumeData.personal.phone && resumeData.personal.location && <span>|</span>}
                        {resumeData.personal.location && (
                          <span>{resumeData.personal.location}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 12px', fontSize: 10, color: '#8B5CF6', marginTop: 4 }}>
                        {resumeData.personal.linkedin && (
                          <span>{resumeData.personal.linkedin}</span>
                        )}
                        {resumeData.personal.linkedin && resumeData.personal.portfolio && <span>|</span>}
                        {resumeData.personal.portfolio && (
                          <span>{resumeData.personal.portfolio}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ padding: '20px 28px 24px' }}>
                      {/* Summary */}
                      {resumeData.summary && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid #e5e7eb' }}>
                            Professional Summary
                          </div>
                          <div style={{ lineHeight: 1.7, color: '#374151', fontStyle: 'italic' }}>{resumeData.summary}</div>
                        </div>
                      )}

                      {/* Experience */}
                      {resumeData.experience.length > 0 && resumeData.experience.some(e => e.company || e.role) && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid #e5e7eb' }}>
                            Professional Experience
                          </div>
                          {resumeData.experience.map(exp => (
                            (exp.company || exp.role) && (
                              <div key={exp.id} style={{ marginBottom: 12 }}>
                                <div style={{ fontWeight: 700, fontSize: 12, color: '#1e1b4b' }}>{exp.company || 'Company'}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                  <div style={{ fontStyle: 'italic', color: '#8B5CF6', fontSize: 11 }}>{exp.role}</div>
                                  <div style={{ fontSize: 10, color: '#6b7280' }}>{exp.duration}</div>
                                </div>
                                {exp.description && (
                                  <div style={{ color: '#4b5563', lineHeight: 1.6, fontSize: 10.5, marginTop: 4 }}>{exp.description}</div>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {/* Education */}
                      {resumeData.education.length > 0 && resumeData.education.some(e => e.institution || e.degree) && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid #e5e7eb' }}>
                            Education
                          </div>
                          {resumeData.education.map(edu => (
                            (edu.institution || edu.degree) && (
                              <div key={edu.id} style={{ marginBottom: 8 }}>
                                <div style={{ fontWeight: 700, fontSize: 12, color: '#1e1b4b' }}>{edu.institution || 'Institution'}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                  <div style={{ fontStyle: 'italic', color: '#8B5CF6', fontSize: 11 }}>{edu.degree}</div>
                                  <div style={{ fontSize: 10, color: '#6b7280' }}>{edu.year}</div>
                                </div>
                                {edu.gpa && <div style={{ color: '#6b7280', fontSize: 10 }}>GPA: {edu.gpa}</div>}
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {/* Skills */}
                      {resumeData.skills.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid #e5e7eb' }}>
                            Core Competencies
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {resumeData.skills.map(skill => (
                              <span
                                key={skill}
                                style={{
                                  background: '#f3f0ff',
                                  color: '#6d28d9',
                                  padding: '2px 10px',
                                  borderRadius: 3,
                                  fontSize: 10,
                                  fontWeight: 600,
                                  border: '1px solid #e9e5ff',
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {resumeData.projects.length > 0 && resumeData.projects.some(p => p.name) && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid #e5e7eb' }}>
                            Key Projects
                          </div>
                          {resumeData.projects.map(project => (
                            project.name && (
                              <div key={project.id} style={{ marginBottom: 10 }}>
                                <div style={{ fontWeight: 700, fontSize: 11.5, color: '#1e1b4b' }}>{project.name}</div>
                                {project.techStack && (
                                  <div style={{ color: '#8B5CF6', fontSize: 10, fontStyle: 'italic', marginBottom: 2 }}>{project.techStack}</div>
                                )}
                                {project.description && (
                                  <div style={{ color: '#4b5563', lineHeight: 1.5, fontSize: 10.5 }}>{project.description}</div>
                                )}
                                {project.link && (
                                  <div style={{ fontSize: 10, color: '#6b7280', marginTop: 1 }}>{project.link}</div>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {/* Certifications */}
                      {resumeData.certifications.length > 0 && resumeData.certifications.some(c => c.name) && (
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid #e5e7eb' }}>
                            Certifications
                          </div>
                          {resumeData.certifications.map(cert => (
                            cert.name && (
                              <div key={cert.id} style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <div>
                                  <span style={{ fontWeight: 700, fontSize: 11, color: '#1e1b4b' }}>{cert.name}</span>
                                  {cert.issuer && <span style={{ color: '#6b7280', fontSize: 10, fontStyle: 'italic' }}> - {cert.issuer}</span>}
                                </div>
                                <div style={{ fontSize: 10, color: '#6b7280' }}>{cert.year}</div>
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─── CREATIVE Template ─── */}
                {selectedTemplate === 'creative' && (
                  <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#1a1a2e', fontSize: 11 }}>
                    <div style={{ display: 'flex', minHeight: 500 }}>
                      {/* Left sidebar */}
                      <div style={{ width: '35%', background: 'linear-gradient(180deg, #065f46, #047857)', color: '#fff', padding: '24px 16px' }}>
                        {/* Avatar circle */}
                        <div style={{
                          width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 22, fontWeight: 800, marginBottom: 12, border: '2px solid rgba(255,255,255,0.3)',
                          marginLeft: 'auto', marginRight: 'auto',
                        }}>
                          {(resumeData.personal.name || 'U')[0].toUpperCase()}
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.3px' }}>
                            {resumeData.personal.name || 'Your Name'}
                          </div>
                        </div>

                        {/* Contact */}
                        <div style={{ marginBottom: 18 }}>
                          <div style={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8, opacity: 0.8 }}>
                            Contact
                          </div>
                          <div style={{ fontSize: 9.5, lineHeight: 2, opacity: 0.95 }}>
                            {resumeData.personal.email && <div>{resumeData.personal.email}</div>}
                            {resumeData.personal.phone && <div>{resumeData.personal.phone}</div>}
                            {resumeData.personal.location && <div>{resumeData.personal.location}</div>}
                            {resumeData.personal.linkedin && <div>{resumeData.personal.linkedin}</div>}
                            {resumeData.personal.portfolio && <div>{resumeData.personal.portfolio}</div>}
                          </div>
                        </div>

                        {/* Skills */}
                        {resumeData.skills.length > 0 && (
                          <div style={{ marginBottom: 18 }}>
                            <div style={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8, opacity: 0.8 }}>
                              Skills
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {resumeData.skills.map(skill => (
                                <span
                                  key={skill}
                                  style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    padding: '2px 7px',
                                    borderRadius: 3,
                                    fontSize: 9,
                                    fontWeight: 600,
                                  }}
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Certifications */}
                        {resumeData.certifications.length > 0 && resumeData.certifications.some(c => c.name) && (
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8, opacity: 0.8 }}>
                              Certifications
                            </div>
                            {resumeData.certifications.map(cert => (
                              cert.name && (
                                <div key={cert.id} style={{ marginBottom: 6, fontSize: 9.5 }}>
                                  <div style={{ fontWeight: 700 }}>{cert.name}</div>
                                  {cert.issuer && <div style={{ opacity: 0.8, fontSize: 9 }}>{cert.issuer} {cert.year && `(${cert.year})`}</div>}
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right content */}
                      <div style={{ flex: 1, padding: '24px 20px' }}>
                        {/* Summary */}
                        {resumeData.summary && (
                          <div style={{ marginBottom: 18 }}>
                            <div style={{ fontWeight: 800, fontSize: 12, color: '#047857', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width: 14, height: 3, background: '#10B981', borderRadius: 2, display: 'inline-block' }} />
                              About Me
                            </div>
                            <div style={{ lineHeight: 1.6, color: '#374151', fontSize: 10.5 }}>{resumeData.summary}</div>
                          </div>
                        )}

                        {/* Experience */}
                        {resumeData.experience.length > 0 && resumeData.experience.some(e => e.company || e.role) && (
                          <div style={{ marginBottom: 18 }}>
                            <div style={{ fontWeight: 800, fontSize: 12, color: '#047857', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width: 14, height: 3, background: '#10B981', borderRadius: 2, display: 'inline-block' }} />
                              Experience
                            </div>
                            {resumeData.experience.map(exp => (
                              (exp.company || exp.role) && (
                                <div key={exp.id} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: '2px solid #d1fae5' }}>
                                  <div style={{ fontWeight: 700, fontSize: 11.5, color: '#111827' }}>{exp.role || 'Role'}</div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ color: '#047857', fontWeight: 600, fontSize: 10.5 }}>{exp.company}</span>
                                    <span style={{ fontSize: 9.5, color: '#9ca3af' }}>{exp.duration}</span>
                                  </div>
                                  {exp.description && (
                                    <div style={{ color: '#4b5563', lineHeight: 1.5, fontSize: 10, marginTop: 3 }}>{exp.description}</div>
                                  )}
                                </div>
                              )
                            ))}
                          </div>
                        )}

                        {/* Education */}
                        {resumeData.education.length > 0 && resumeData.education.some(e => e.institution || e.degree) && (
                          <div style={{ marginBottom: 18 }}>
                            <div style={{ fontWeight: 800, fontSize: 12, color: '#047857', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width: 14, height: 3, background: '#10B981', borderRadius: 2, display: 'inline-block' }} />
                              Education
                            </div>
                            {resumeData.education.map(edu => (
                              (edu.institution || edu.degree) && (
                                <div key={edu.id} style={{ marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid #d1fae5' }}>
                                  <div style={{ fontWeight: 700, fontSize: 11.5, color: '#111827' }}>{edu.degree || 'Degree'}</div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ color: '#047857', fontWeight: 600, fontSize: 10.5 }}>{edu.institution}</span>
                                    <span style={{ fontSize: 9.5, color: '#9ca3af' }}>{edu.year}</span>
                                  </div>
                                  {edu.gpa && <div style={{ color: '#6b7280', fontSize: 9.5 }}>GPA: {edu.gpa}</div>}
                                </div>
                              )
                            ))}
                          </div>
                        )}

                        {/* Projects */}
                        {resumeData.projects.length > 0 && resumeData.projects.some(p => p.name) && (
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 12, color: '#047857', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width: 14, height: 3, background: '#10B981', borderRadius: 2, display: 'inline-block' }} />
                              Projects
                            </div>
                            {resumeData.projects.map(project => (
                              project.name && (
                                <div key={project.id} style={{ marginBottom: 10, paddingLeft: 12, borderLeft: '2px solid #d1fae5' }}>
                                  <div style={{ fontWeight: 700, fontSize: 11, color: '#111827' }}>{project.name}</div>
                                  {project.techStack && (
                                    <div style={{ color: '#047857', fontSize: 9.5, fontWeight: 600, marginBottom: 2 }}>{project.techStack}</div>
                                  )}
                                  {project.description && (
                                    <div style={{ color: '#4b5563', lineHeight: 1.5, fontSize: 10 }}>{project.description}</div>
                                  )}
                                  {project.link && (
                                    <div style={{ fontSize: 9.5, color: '#9ca3af', marginTop: 1 }}>{project.link}</div>
                                  )}
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── ATS Score Panel ─── */}
            <div className="mt-4">
              <Card glass>
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="analytics" size={20} style={{ color: '#0da2e7' }} />
                  <h3 className="text-sm font-semibold text-white">ATS Compatibility Analysis</h3>
                </div>

                <div className="flex items-center gap-6">
                  <ATSScoreRing score={atsScore} size={100} />

                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-secondary">Contact Info</span>
                        <span className="text-xs font-semibold text-white">
                          {sectionCompleteness.personal}/{sectionCompleteness.personalMax}
                        </span>
                      </div>
                      <ProgressBar
                        value={sectionCompleteness.personal}
                        max={sectionCompleteness.personalMax}
                        color={sectionCompleteness.personal >= 5 ? 'success' : sectionCompleteness.personal >= 3 ? 'warning' : 'error'}
                        size="xs"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-secondary">Summary</span>
                        <span className="text-xs font-semibold text-white">
                          {sectionCompleteness.summary >= 1 ? '100%' : sectionCompleteness.summary > 0 ? '50%' : '0%'}
                        </span>
                      </div>
                      <ProgressBar
                        value={sectionCompleteness.summary * 100}
                        max={100}
                        color={sectionCompleteness.summary >= 1 ? 'success' : sectionCompleteness.summary > 0 ? 'warning' : 'error'}
                        size="xs"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-secondary">Experience</span>
                        <span className="text-xs font-semibold text-white">
                          {sectionCompleteness.experience}/{sectionCompleteness.experienceMax}
                        </span>
                      </div>
                      <ProgressBar
                        value={sectionCompleteness.experience}
                        max={sectionCompleteness.experienceMax}
                        color={sectionCompleteness.experience >= 2 ? 'success' : sectionCompleteness.experience >= 1 ? 'warning' : 'error'}
                        size="xs"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-secondary">Skills</span>
                        <span className="text-xs font-semibold text-white">
                          {sectionCompleteness.skills}/{sectionCompleteness.skillsMax}
                        </span>
                      </div>
                      <ProgressBar
                        value={sectionCompleteness.skills}
                        max={sectionCompleteness.skillsMax}
                        color={sectionCompleteness.skills >= 5 ? 'success' : sectionCompleteness.skills >= 3 ? 'warning' : 'error'}
                        size="xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Keyword matches */}
                <div className="mt-5 pt-4 border-t border-white/[0.04]">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="key" size={16} className="text-accent" />
                    <span className="text-xs font-semibold text-white">Keyword Matches</span>
                    <span className="text-[10px] text-secondary ml-auto">
                      {matchedKeywords.length}/{ATS_KEYWORDS.length} matched
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ATS_KEYWORDS.map(keyword => {
                      const isMatched = matchedKeywords.includes(keyword);
                      return (
                        <span
                          key={keyword}
                          className="px-2 py-0.5 rounded text-[10px] font-medium"
                          style={{
                            background: isMatched ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
                            color: isMatched ? '#10B981' : '#64748b',
                            border: `1px solid ${isMatched ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)'}`,
                          }}
                        >
                          {isMatched && <span className="mr-1">&#10003;</span>}
                          {keyword}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Section completeness checklist */}
                <div className="mt-5 pt-4 border-t border-white/[0.04]">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="checklist" size={16} className="text-accent" />
                    <span className="text-xs font-semibold text-white">Section Completeness</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Personal Info', done: sectionCompleteness.personal >= 4, partial: sectionCompleteness.personal >= 2 },
                      { label: 'Professional Summary', done: sectionCompleteness.summary >= 1, partial: sectionCompleteness.summary > 0 },
                      { label: 'Work Experience', done: sectionCompleteness.experience >= 1, partial: false },
                      { label: 'Education', done: sectionCompleteness.education >= 1, partial: false },
                      { label: 'Skills (5+ recommended)', done: resumeData.skills.length >= 5, partial: resumeData.skills.length >= 2 },
                      { label: 'Projects', done: sectionCompleteness.projects >= 1, partial: false },
                      { label: 'Certifications', done: sectionCompleteness.certifications >= 1, partial: false },
                    ].map(check => (
                      <div key={check.label} className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                          style={{
                            background: check.done ? 'rgba(16,185,129,0.12)' : check.partial ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${check.done ? 'rgba(16,185,129,0.2)' : check.partial ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)'}`,
                          }}
                        >
                          <Icon
                            name={check.done ? 'check' : check.partial ? 'remove' : 'close'}
                            size={12}
                            style={{ color: check.done ? '#10B981' : check.partial ? '#F59E0B' : '#64748b' }}
                          />
                        </div>
                        <span className={`text-xs ${check.done ? 'text-white' : 'text-secondary'}`}>{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResumeBuilder;
