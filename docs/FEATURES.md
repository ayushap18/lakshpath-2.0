# LakshPath - Features Documentation

> AI-Powered Career Guidance Platform for Students & Professionals

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Authentication & User Management](#1-authentication--user-management)
3. [Career Assessment](#2-career-assessment)
4. [Dashboard](#3-dashboard---central-hub)
5. [AI Mentor Chat](#4-ai-mentor---career-counseling-chat)
6. [Learning Roadmap](#5-learning-roadmap)
7. [Interview Practice Lab](#6-interview-practice-lab)
8. [Enhanced Interview Features](#7-enhanced-interview-features)
9. [Portfolio Analysis Hub](#8-portfolio-analysis-hub)
10. [LinkedIn Optimization](#9-linkedin-profile-optimization)
11. [Career DNA](#10-career-dna---personality--skill-profile)
12. [Resume Builder](#11-resume-builder)
13. [Skill Simulator](#12-skill-simulator---role-based-gap-analyzer)
14. [Placement Prep](#13-placement-prep---company-specific-preparation)
15. [Market Intelligence](#14-market-intelligence)
16. [NSQF Pathways](#15-nsqf-vocational-pathways)
17. [Enhanced Learning Platform](#16-enhanced-learning-platform)
18. [Micro-Coach](#17-micro-coach---daily-tasks)
19. [Scholarships](#18-scholarships)
20. [AI Live Sessions](#19-ai-live-11-sessions)
21. [API Reference](#api-route-structure)
22. [Tech Stack](#tech-stack)

---

## Platform Overview

LakshPath is a full-stack AI-powered career guidance platform that helps students and professionals with:
- Personalized career assessment and matching
- AI mentorship across career, interview, and scholarship domains
- GitHub and LinkedIn portfolio analysis and optimization
- Mock interview practice with AI evaluation
- Company-specific placement preparation
- Real-time job market intelligence
- NSQF-aligned vocational pathways
- Gamified learning with XP, streaks, and badges

---

## 1. Authentication & User Management

**Routes:** `/login`, `/register`, `/profile-setup`

### Features
- **Google OAuth Login** - One-click Google sign-in
- **Email Login** - Traditional email/password authentication
- **Demo Mode** - Anonymous testing without account creation
- **Profile Setup** - Multi-step onboarding with GitHub/LinkedIn connection
- **Login Streak Tracking** - Daily login streaks with gamification
- **XP System** - Points earned from assessments, interviews, and badges

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/google` | Google OAuth |
| GET | `/api/user/streak` | Get streak/XP data |
| GET | `/api/user/settings` | Get user settings |
| PATCH | `/api/user/settings` | Update settings |
| POST | `/api/profile/setup` | Profile setup |
| GET | `/api/profile/full` | Full profile with analysis |

---

## 2. Career Assessment

**Route:** `/assessment`

### Features
- 8-question AI-powered career assessment
- Question types: single choice, multiple choice, rating (1-5), text input
- Real-time pattern detection (shows detected insights as user answers)
- Generates personalized career matches with scores
- Animated progress counter

### Question Topics
- Education level and background
- Programming languages and experience
- Tech domain interests
- DSA and system design proficiency
- Target role preferences
- Career challenges and goals

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assessment/` | Submit assessment answers |
| GET | `/api/assessment/me` | Get latest assessment |
| POST | `/api/assessment/:userId/micro-tasks` | Generate micro-tasks |

### Output
- Top 3-5 career matches with match scores
- Skill snapshots
- Strengths and weaknesses analysis
- Personalized learning recommendations

---

## 3. Dashboard - Central Hub

**Route:** `/dashboard`

### Features
- **Welcome Hero** - Personalized greeting with motivational message
- **XP & Level System** - Gamified progression (Beginner to Expert)
- **Streak Counter** - Daily login streak with fire indicator
- **GitHub Analysis Card** - Connected repos, quality score, contributions
- **LinkedIn Analysis Card** - Connection status and optimization readiness
- **Top Career Match** - Animated circular progress for best role match
- **Quick Actions** - Fast access to AI Mentor, Interview, Portfolio, Market
- **Learning Roadmap Preview** - Visual 4-phase learning timeline
- **Salary Trend Chart** - Mini bar chart for target domain salaries
- **Trending Skills** - In-demand skills for target role
- **Micro-Coach Widget** - Daily/weekly task recommendations
- **Badges & Achievements** - Earned badges with rarity (COMMON, RARE, EPIC, LEGENDARY)
- **Skill Radar** - 6 core skills with proficiency bars
- **Notifications** - Profile completion, upcoming activities

---

## 4. AI Mentor - Career Counseling Chat

**Route:** `/chat`

### Features
- Three conversation categories:
  - **Career** - Career path guidance and recommendations
  - **Interview** - Interview preparation strategies
  - **Scholarship** - Scholarship eligibility and application guidance
- Structured AI responses with:
  - Headlines and summaries
  - Action plans (step-by-step guidance)
  - Follow-up question suggestions
  - Nudges and motivational tips
  - Confidence score and references
- Context-aware: Uses assessment results, skill snapshots, and recent insights
- Domain-specific personality and tone

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/mentor` | Send mentor chat message |

---

## 5. Learning Roadmap

**Route:** `/roadmap`

### Features
- Multi-phase learning structure generated from assessment results
- Animated ring progress indicator per phase
- Milestones with:
  - Title, description, estimated duration
  - Resource links (courses, tutorials, documentation)
  - Completion tracking with animations
  - Connected timeline visualization
- Milestone statuses: PENDING, IN_PROGRESS, COMPLETED
- Phase-level completion badges

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roadmap/:userId` | Get active learning roadmap |
| PATCH | `/api/roadmap/milestone/:milestoneId` | Update milestone status |

---

## 6. Interview Practice Lab

**Route:** `/interview`

### Features

#### Session Setup
- **Types:** Technical, Behavioral, System Design, Coding
- **Difficulty:** Easy, Medium, Hard
- **Target Role:** Optional (e.g., Frontend Developer)

#### Active Session
- Full-screen question presentation
- Code editor for technical/coding questions
- Text area for behavioral/system design answers
- Real-time progress bar
- STAR analysis sidebar for behavioral questions

#### AI Evaluation
- Score per answer (0-100)
- Strengths and improvements feedback
- STAR method analysis for behavioral questions
- Code quality analysis for coding questions
- Speech analysis (confidence, clarity, pace, filler words)

#### Statistics Dashboard
- Total sessions count
- Average and best scores
- Sessions this week
- Score history with color coding

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interview/start` | Start new session |
| POST | `/api/interview/answer` | Submit answer |
| POST | `/api/interview/:id/complete` | Complete session |
| GET | `/api/interview/:id` | Get session details |
| GET | `/api/interview/:id/next` | Get next question |
| GET | `/api/interview/sessions` | List user sessions |
| GET | `/api/interview/stats` | Get statistics |

### Question Bank
- 75+ curated questions across all types and difficulties
- AI-generated questions when Gemini API is available
- Demo fallback for offline/quota scenarios

---

## 7. Enhanced Interview Features

**Endpoints Prefix:** `/api/interview-enhanced`

### Features
- **AI Code Review** - Submit code for detailed review with scoring
- **Progressive Hints** - 4-level hint system (conceptual to near-solution)
- **Follow-up Questions** - AI-generated follow-up questions after answers
- **Category-Based Practice** - Questions organized by DSA category (Arrays, Trees, Graphs, etc.)
- **Performance Analytics** - Track improvement over time

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/interview-enhanced/categories` | Get question categories |
| POST | `/api/interview-enhanced/code-review` | Get AI code review |
| POST | `/api/interview-enhanced/hint` | Get progressive hint (1-4) |
| POST | `/api/interview-enhanced/follow-up-questions` | Get follow-up questions |
| GET | `/api/interview-enhanced/questions/category/:cat` | Questions by category |
| GET | `/api/interview-enhanced/analytics` | Performance analytics |

---

## 8. Portfolio Analysis Hub

**Route:** `/portfolio`

### Multi-Platform Analysis
1. **GitHub Analysis** - Repository quality and portfolio scoring
2. **LinkedIn Analysis** - Profile optimization (uses real API)
3. **Resume Analysis** - ATS score and content quality
4. **Portfolio Website** - Design, SEO, and performance evaluation

### GitHub Analysis Features
- **Overall Score** (0-100) - Composite portfolio score
- **Code Quality Score** - Structure, documentation, tests
- **Diversity Score** - Variety of projects and tech stacks
- **Contribution Score** - Commits, frequency, consistency
- **Per-Repository Insights:**
  - Language, stars, forks, last commit
  - Code quality and complexity assessment
  - README quality evaluation
  - Specific improvements and highlights
- **Portfolio Gaps** - Missing project types for target role
- **Badge Detection** - GitHub achievement badges (Pull Shark, Galaxy Brain, etc.)
- **Fork Analysis** - Distinguishes original repos from authored forks
- **GitHub Token Support** - Optional token for higher API rate limits (5000 req/hour vs 60)

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/portfolio/analyze` | Analyze GitHub portfolio |
| GET | `/api/portfolio/analyses` | List user analyses |
| GET | `/api/portfolio/stats` | Portfolio statistics |
| GET | `/api/portfolio/:id` | Get specific analysis |
| DELETE | `/api/portfolio/:id` | Delete analysis |

---

## 9. LinkedIn Profile Optimization

**Endpoints Prefix:** `/api/linkedin`

### Features
- **AI-Powered Headline Optimization** - Keyword-rich, role-targeted headlines
- **About Section Enhancement** - Professional language with industry keywords
- **ATS Keyword Analysis:**
  - Extract and suggest high-value keywords
  - Identify missing keywords
  - Strategic keyword placement tips
- **Before/After Scoring** - Quantified improvement tracking
- **Improvement Details** - Category-by-category breakdown (Headline, About, Keywords, Tone)
- **Missing Elements Detection** - Professional photo, certifications, endorsements, recommendations
- **Version Comparison** - Compare multiple optimization versions
- **Status Management** - DRAFT, APPLIED, ARCHIVED workflow

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/linkedin/optimize` | Optimize LinkedIn profile |
| GET | `/api/linkedin/optimizations` | List user optimizations |
| GET | `/api/linkedin/stats` | Optimization statistics |
| POST | `/api/linkedin/compare` | Compare versions |
| GET | `/api/linkedin/:id` | Get specific optimization |
| PATCH | `/api/linkedin/:id/status` | Update status |
| DELETE | `/api/linkedin/:id` | Delete optimization |

---

## 10. Career DNA - Personality & Skill Profile

**Route:** `/career-dna`

### Career DNA Types (4 Archetypes)
1. **The Innovator** - Pattern recognition, creative problem-solving
2. **The Strategist** - Systems thinking, long-term planning
3. **The Builder** - Practical execution, hands-on implementation
4. **The Communicator** - Bridging ideas and people

### Skill Dimensions (0-100 each)
- **Technical** - System design, algorithms, cloud architecture
- **Creative** - Design thinking, UX intuition, content strategy
- **Analytical** - Data analysis, critical reasoning, pattern recognition
- **Leadership** - Team guidance, vision alignment, collective effort

### Output
- Personalized DNA type with description
- Role suggestions based on DNA
- Learning focus areas
- Career trajectory insights

---

## 11. Resume Builder

**Route:** `/resume-builder`

### Templates
1. **Modern** - Clean, minimal layout with accent colors
2. **Professional** - Traditional corporate format
3. **Creative** - Design-forward layout for creative roles
4. **IIT** - Indian tech college standard format
5. **FAANG** - Silicon Valley tech company optimized

### Resume Sections
- Personal Information (name, email, phone, LinkedIn, portfolio)
- Professional Summary
- Experience (company, role, duration, description)
- Education (institution, degree, year, GPA)
- Skills (technical and soft)
- Projects (name, description, tech stack, link)
- Certifications (name, issuer, date)

### Features
- Live preview
- ATS score calculation
- One-click PDF download
- Template customization with accent colors

---

## 12. Skill Simulator - Role-Based Gap Analyzer

**Route:** `/skill-simulator`

### Features
- **20+ Predefined Target Roles** with salary ranges and demand levels
- **Skill Gap Analysis:**
  - Current vs. required level for each skill
  - Gap visualization with color coding
  - Priority levels: Critical, Important, Nice-to-have
  - Estimated hours to close each gap
- **Resource Recommendations:**
  - Curated courses, certifications, projects, books
  - Platform-specific (Udemy, Coursera, YouTube, etc.)
  - Duration estimates
- **Learning Roadmap Generation** - Prioritized skill order with timeline

---

## 13. Placement Prep - Company-Specific Preparation

**Route:** `/placement-prep`

### Features
- **20+ Company Packs** (TCS, Infosys, Amazon, Google, Microsoft, etc.)
  - Package information and hiring patterns
  - Difficulty assessment
  - Rounds breakdown (Aptitude, Technical, Managerial, HR)
  - 450+ questions per company
  - Progress tracking
- **Topic-Based Sections:**
  - Aptitude (Quantitative, Logical Reasoning, Verbal)
  - Technical (Data Structures, Algorithms, System Design)
  - Coding (Platform-specific challenges)
  - HR (Behavioral, Situational)
- **Mock Tests** - Full-length, company-specific, time-bound
- **Performance Analytics** - Score tracking and progress

---

## 14. Market Intelligence

**Route:** `/market`

### Features
- **AI Job Scout** - Personalized job recommendations with match scores
- **JD Comparison** - Compare profile against specific job descriptions
- **Market Trends:**
  - Trending skills with demand percentages
  - Hot roles and demand levels
  - Hiring companies and growth trends
- **Salary Intelligence:**
  - Role-based salary ranges (Fresher/Mid/Senior)
  - City-wise variations
  - Cost of living comparison
  - Top hiring companies by city

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/market/brief` | Market brief for domain |
| GET | `/api/market/history` | Market trends history |
| POST | `/api/market/brief/refresh` | Refresh market data |
| GET | `/api/jobs/list` | Job listings by domain |
| POST | `/api/jobs/compare` | Compare profile vs JD |
| GET | `/api/jobs/auto-scout/:userId` | AI job recommendations |

---

## 15. NSQF Vocational Pathways

**Route:** `/nsqf`

### NSQF Level System (1-10)
- Levels 1-2: Basic foundation skills
- Levels 3-4: Intermediate (ITI Certificate)
- Levels 5-6: Advanced/Diploma
- Levels 7-8: Professional (Bachelor's/PG)
- Levels 9-10: Expert/Research

### 10+ Sectors
IT & Software, Healthcare, Manufacturing, Construction, Agriculture, Tourism, Retail, Beauty & Wellness, Automotive, Electronics

### Features
- **Pathway Generation** - Personalized vocational path
- **Employability Prediction** - Job readiness scoring
- **Skill Gap Analysis** - Missing skills identification
- **Course Recommendations** - NSQF-aligned courses
- **Career Forecast** - 5-year career projection
- **Government Schemes** - Applicable support schemes
- **Transferable Skills** - Cross-sector skill mapping

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/nsqf/pathway/generate` | Generate pathway |
| POST | `/api/nsqf/employability/predict` | Predict job readiness |
| POST | `/api/nsqf/skill-gap/analyze` | Analyze skill gaps |
| POST | `/api/nsqf/courses/recommend` | Get course recommendations |
| POST | `/api/nsqf/career/forecast` | Career forecast |
| POST | `/api/nsqf/schemes/applicable` | Government schemes |
| POST | `/api/nsqf/skills/transferable` | Transferable skills |
| GET | `/api/nsqf/sectors` | List sectors |
| GET | `/api/nsqf/level/:level` | Level details |

---

## 16. Enhanced Learning Platform

**Endpoints Prefix:** `/api/learning-enhanced`

### Features
- **Personalized Learning Paths** - Based on career goal, current skills, time commitment, learning style
- **Concept Explanations** - AI-generated at 4 depth levels (Beginner to Expert)
- **Practice Quiz Generation** - Multiple choice, coding, short answer, true/false
- **Answer Assessment** - Detailed feedback with gap identification
- **Study Plan Generation** - Weekly breakdown with daily tasks (1-52 weeks)
- **Resource Recommendations** - Platform-specific, cost-aware, duration-matched
- **Progress Analytics** - Strengths, challenges, improvement suggestions
- **Next Best Action** - AI-recommended next learning step

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/learning-enhanced/path` | Generate learning path |
| POST | `/api/learning-enhanced/explain` | Concept explanation |
| POST | `/api/learning-enhanced/quiz` | Generate quiz |
| POST | `/api/learning-enhanced/assess` | Assess answer |
| POST | `/api/learning-enhanced/study-plan` | Generate study plan |
| POST | `/api/learning-enhanced/recommendations` | Resource recommendations |
| GET | `/api/learning-enhanced/insights` | Progress insights |
| GET | `/api/learning-enhanced/next-action` | Next best action |
| GET | `/api/learning-enhanced/categories` | Learning categories |

---

## 17. Micro-Coach - Daily Tasks

**Route:** `/micro-coach`

### Features
- AI-generated daily/weekly learning tasks
- Task types: Review, Portfolio Update, Mock Interview, Skill Practice
- Per-skill progress tracking with animated bars
- Difficulty indicators: Easy, Medium, Hard
- Time estimates per task
- Streak tracking and gamification

---

## 18. Scholarships

**Integrated in:** AI Mentor Chat (scholarship round)

### Features
- Scholarship database with eligibility criteria
- Profile-based scholarship matching
- Application guidance
- Deadline tracking

---

## 19. AI Live 1:1 Sessions

**Route:** `/ai-live`
**Status:** Coming Soon

### Planned Features
- Voice-based AI conversations
- Real-time interview simulation
- Adaptive difficulty
- Session recording and playback
- Performance analytics

---

## API Route Structure

```
/api
  ├── /auth              - Authentication (login, OAuth)
  ├── /assessment        - Career assessment
  ├── /chat              - AI Mentor conversations
  ├── /roadmap           - Learning roadmap management
  ├── /interview         - Mock interview sessions
  ├── /interview-enhanced - Enhanced interview (code review, hints)
  ├── /portfolio         - GitHub portfolio analysis
  ├── /linkedin          - LinkedIn optimization
  ├── /jobs              - Job listings and comparisons
  ├── /market            - Market intelligence
  ├── /nsqf              - NSQF pathway guidance
  ├── /learning-enhanced - Advanced learning features
  ├── /scholarships      - Scholarship information
  ├── /user              - User data and settings
  ├── /profile           - User profile management
  ├── /features          - Feature-specific endpoints (Career DNA, Resume, Skill Sim, Placement)
  ├── /demo              - Demo mode endpoints
  └── /insights          - AI insight generation
```

---

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router v6** - Navigation
- **Axios** - HTTP client
- **Google Material Icons** - Icon system

### Backend
- **Express.js** with TypeScript
- **Prisma ORM** - Database management
- **SQLite** - Database (development)
- **Google Gemini AI** (gemini-2.0-flash) - All AI features
- **JWT** - Authentication tokens
- **Zod** - Schema validation
- **ts-node-dev** - Development server

### AI Features
- All AI features include demo fallbacks for when API quota is exceeded
- Gemini API powers: assessment, interview questions, answer evaluation, portfolio analysis, LinkedIn optimization, career DNA, resume building, learning paths, and more

---

## Gamification System

| Element | Description |
|---------|-------------|
| **XP Points** | Earned from assessments, interviews, badges |
| **Levels** | Beginner → Intermediate → Advanced → Expert |
| **Streaks** | Daily login streak counter |
| **Badges** | 30+ achievements with rarity: COMMON, RARE, EPIC, LEGENDARY |
| **Progress Bars** | Visual skill and milestone progress |
| **Leaderboard Potential** | Score-based ranking system |

---

## Environment Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port (default: 5001) | Yes |
| `DATABASE_URL` | Prisma database URL | Yes |
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `CLIENT_ORIGIN` | Allowed CORS origins | No |
| `DEMO_MODE_ENABLED` | Enable demo mode | No |
| `GITHUB_TOKEN` | GitHub API token (higher rate limits) | No |
| `FRONTEND_URL` | Frontend URL | No |
| `EMAIL_ENABLED` | Enable email notifications | No |
| `SMTP_*` | SMTP email configuration | No |

---

*Built with Gemini AI | React + Express + Prisma + TypeScript*
