# LakshPath - Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** LakshPath
**Tagline:** AI-Powered Career Guidance Platform
**App ID:** `io.lakshpath.app`

LakshPath is a full-stack AI-powered career guidance platform that helps students and professionals discover their ideal career paths through intelligent assessment, personalized learning roadmaps, interview preparation, portfolio analysis, and real-time job market intelligence. It uses Google's Gemini AI as the core intelligence engine.

---

## 2. Problem Statement

Students and early-career professionals in India face:
- Lack of personalized career guidance beyond generic advice
- No clear mapping between their skills/interests and viable career options
- Difficulty understanding job market demand and salary expectations
- No structured learning roadmaps tailored to individual skill gaps
- Limited access to interview preparation with real-time AI feedback
- No tools to assess and improve their professional portfolio (GitHub, LinkedIn)
- Unawareness of vocational pathways (NSQF) and government schemes (PMKVY, NAPS, DDU-GKY)

---

## 3. Target Users

| User Segment | Description |
|---|---|
| **Students (Class 10-12)** | Exploring career options after school, need vocational guidance (NSQF) |
| **College Students** | Choosing specializations, building portfolios, preparing for placements |
| **Fresh Graduates** | Job seekers needing market intelligence, interview prep, skill gap analysis |
| **Early-Career Professionals** | Career changers, skill upgraders, looking at growth trajectories |
| **Vocational Learners** | NSQF-aligned certification seekers in India's 19 vocational sectors |

---

## 4. Core Value Proposition

1. **Discover** - AI-assessed career matching based on comprehensive profiling
2. **Plan** - Personalized learning roadmaps with milestone tracking and SMART goals
3. **Prepare** - AI interview practice, portfolio analysis, and skill development
4. **Connect** - Real-time job market intelligence with auto-scouted opportunities
5. **Guide** - 24/7 AI mentor for career, interview, and scholarship guidance

---

## 5. Feature Set (Current State)

### 5.1 Authentication & Onboarding
- Google OAuth 2.0 sign-in
- Demo/Guest mode (explore without account)
- Email/password registration
- Session persistence via JWT (7-day expiry)
- Login tracking (IP, user agent, method logging)

### 5.2 AI Career Assessment
- 12+ question multi-step quiz covering:
  - Education level and background
  - Technical skills (programming, data analysis, design, etc.)
  - Communication and analytical abilities
  - Creativity assessment
  - Career preferences (motivation, work environment, team/solo)
  - Salary expectations
  - Domain interests
- Generates top 5 career matches with:
  - Match score (0-100%)
  - Average salary data
  - Growth rate projections
  - Key skills required
  - Personalized reason for recommendation

### 5.3 Learning Roadmap
- AI-generated month-by-month learning plans
- Milestone-based progress tracking (PENDING / IN_PROGRESS / COMPLETED)
- SMART goal contracts per milestone (success criteria, start/end dates, streak tracking)
- Weekly nudges and reminders
- Domain-aware personalization (6 career domains)

### 5.4 Micro-Coach
- AI-generated micro-learning tasks based on assessment
- Skill snapshots tracking score progression
- Task completion tracking with timestamps
- Resource links for each task

### 5.5 AI Mentor Chat
- Multi-round conversations with context awareness
- Three conversation modes:
  - **Career guidance** - career path advice
  - **Interview coaching** - interview tips and strategies
  - **Scholarship guidance** - scholarship discovery and application help
- Responses include: headline, summary, action plan, follow-ups, nudges, confidence score
- Context enriched with assessment data, domain themes, recent insights

### 5.6 Job Market Intelligence
- Domain-specific market briefs with AI analysis
- Delta summaries (market changes over time)
- Recommendations based on current trends
- Market history snapshots (paginated)
- Refreshable data via Gemini AI

### 5.7 Job Comparison & Auto-Scout
- Manual job description comparison (matches, gaps, suggestions, fast-track items)
- Auto-scout: AI automatically discovers and matches relevant jobs
  - 3-job limit per scout
  - 180-minute cache TTL
  - Domain inference from assessment data
- 6 supported domains: Technology, Healthcare, Business/Finance, Arts/Design, Engineering, Science/Research

### 5.8 Interview Practice
- 4 interview types: Technical, Behavioral, System Design, Coding
- 3 difficulty levels: Easy, Medium, Hard
- Custom target role specification
- AI-generated questions with context
- Real-time answer evaluation with scoring (0-100)
- Detailed feedback: strengths, improvements, STAR analysis (behavioral), code quality (coding)
- Speech analysis (filler words, confidence, pace)
- Session history and performance statistics
- **Enhanced features:**
  - 6 question categories (Arrays, Algorithms, Data Structures, System Design, Behavioral, Concurrency)
  - AI code review with complexity analysis
  - Progressive hints (4 levels)
  - Follow-up question generation
  - Performance analytics and trends

### 5.9 Portfolio Analysis (GitHub)
- GitHub username-based analysis
- Scoring metrics:
  - Overall portfolio score
  - Code quality score
  - Diversity score
  - Contribution score
- Repository-level analysis (README quality, tests, CI detection)
- Strengths and weaknesses identification
- AI recommendations with priority levels (HIGH/MEDIUM/LOW)
- Project ideas to strengthen portfolio with tech stack suggestions
- Achievement badges
- Analysis history

### 5.10 Learning Hub (Enhanced)
- **AI Concept Explainer**: Explain any concept at 4 depth levels (beginner to expert)
  - Summary, detailed explanation, key points, code examples, common mistakes, practice exercises
- **AI Quiz Generator**: Generate quizzes with configurable question types and difficulty
  - Multiple choice, short answer, coding, true/false
  - Immediate AI-powered assessment with scoring
- **Learning Insights**: AI-analyzed learning progress
  - Strength/improvement areas with trend analysis
  - Study patterns (average time, productive hours, consistency score, streak)
  - Achievements and AI recommendations
- **Study Plan Generator**: Structured weekly plans based on focus areas
- **Resource Recommendations**: Curated learning materials by topic, style, and budget
- **Next Best Action**: AI-recommended next learning step with reasoning

### 5.11 NSQF Vocational Pathways (India-specific)
- NSQF levels 1-10 (Class 5 through PhD) mapping
- 19 vocational sectors (Agriculture, Automotive, Healthcare, IT/ITeS, Tourism, etc.)
- Features:
  - Vocational pathway generation aligned to NSQF framework
  - Employability prediction for target sectors
  - Skill gap analysis (current vs. required skills)
  - NSQF course recommendations (provider, duration, cost, employability score)
  - 3-5 year career progression forecasts
  - Government scheme discovery (PMKVY, NAPS, DDU-GKY, etc.)
  - Transferable skills analysis for career transitions
  - Multi-language support preference

### 5.12 User Profile & Progress
- Profile management (name, avatar)
- Progress dashboard:
  - Assessments completed
  - Insights generated
  - Jobs compared
  - Milestone tracking (total, completed, in-progress, pending)
- Login history with method and timestamp

### 5.13 Email Notifications
- Welcome email for new users
- Login alerts for existing users
- Goal contract notifications
- Milestone completion alerts
- Supports SMTP (production) and Ethereal (development)

---

## 6. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS 3.4 |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Auth (Frontend)** | @react-oauth/google |
| **HTTP Client** | Axios |
| **Backend** | Node.js, Express, TypeScript |
| **ORM** | Prisma 6.19 |
| **Database** | SQLite (development) |
| **AI Engine** | Google Gemini 2.0 Flash (@google/generative-ai) |
| **Auth (Backend)** | google-auth-library, jsonwebtoken |
| **Email** | Nodemailer |
| **Validation** | Zod |
| **Security** | Helmet, CORS |
| **Mobile** | Capacitor 7.4 (iOS + Android) |
| **OTA Updates** | @capgo/capacitor-updater |

---

## 7. Architecture

```
[React Frontend (Vite)] --> [Axios HTTP] --> [Express API]
       |                                          |
  [Google OAuth]                           [Prisma ORM]
  [@react-oauth/google]                        |
       |                                   [SQLite DB]
  [Capacitor]                                  |
  (iOS/Android)                          [Gemini AI API]
                                               |
                                        [Nodemailer/SMTP]
```

**Pattern:** MVC-style (Routes -> Controllers -> Services -> Database)
**Auth Flow:** Google OAuth -> Backend verifies ID token -> Upsert user -> Issue JWT -> Frontend stores in localStorage

---

## 8. User Flows

### New User Onboarding
```
Landing Page -> Register/Google Sign-In -> Quiz Intro -> Assessment Quiz -> Dashboard
```

### Returning User
```
Landing Page -> Login (Google/Demo) -> Dashboard (if assessed) OR Quiz Intro (if not)
```

### Core Loop (Post-Assessment)
```
Dashboard
  |- View career matches & market brief
  |- Compare jobs / view auto-scouted jobs
  |- Track roadmap milestones
  |- Complete micro-coach tasks
  |- Chat with AI mentor
  |- Practice interviews
  |- Analyze GitHub portfolio
  |- Learn new concepts / take quizzes
  |- Explore NSQF pathways
```

---

## 9. Database Models Summary

| Model | Purpose |
|---|---|
| User | User accounts (email, googleId, name, role, avatar, login stats) |
| LoginLog | Login attempt tracking (method, IP, user agent, success/failure) |
| QuizResult | Assessment quiz answers, AI summary, strengths, weaknesses |
| CareerMatch | Career recommendations with match score and metadata |
| LearningRoadmap | AI-generated learning plans with milestones |
| RoadmapMilestone | Individual milestone steps with status tracking |
| GoalContract | SMART goals per milestone (criteria, dates, streaks, nudges) |
| SkillSnapshot | Skill score tracking over time |
| MicroTask | Micro-learning tasks per skill |
| JDComparison | Job description analysis results |
| MarketSnapshot | Domain market data snapshots |
| MarketBrief | AI-generated market intelligence briefs |
| InterviewSession | Interview practice sessions with scoring |
| InterviewQuestion | Individual interview Q&A with AI feedback |
| PortfolioAnalysis | GitHub portfolio analysis results |
| RepositoryAnalysis | Per-repo quality assessment |
| LinkedInOptimization | LinkedIn profile optimization data |
| Insight | General AI insights and conversation logs |
| DemoRun | Demo mode run tracking |

---

## 10. Design System

- **Theme:** Dark mode (black background, white text)
- **Primary Color:** Cyan/Sky Blue (#0ea5e9)
- **UI Pattern:** Glassmorphism (bg-white/5 backdrop-blur-xl)
- **Typography:** System fonts, weights 400-900, uppercase labels with tracking
- **Layout:** Mobile-first responsive (grid-cols-1 -> md:2 -> lg:3)
- **Animations:** Framer Motion (fade-in, slide-up, scale, stagger)
- **Border Radius:** Sharp-edged modern aesthetic (rounded-sm default)
- **Effects:** Gradients, blur-3xl backgrounds, subtle opacity layers

---

## 11. Deployment

- **Frontend:** Vite build -> `dist` directory
- **Mobile:** Capacitor wraps `dist` for iOS/Android
- **OTA Updates:** @capgo/capacitor-updater for seamless mobile updates
- **Backend:** Node.js Express server
- **Database:** SQLite (dev), upgradeable to PostgreSQL (prod)
