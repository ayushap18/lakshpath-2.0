# LakshPath 2.0 — Project Report

**Team Code Catalyst**
Hackathon Project Submission for VC Investor Referral

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Project Ideology & Vision](#3-project-ideology--vision)
4. [Tech Stack](#4-tech-stack)
5. [System Architecture](#5-system-architecture)
6. [Key Features & Implementation Details](#6-key-features--implementation-details)
7. [Database Design](#7-database-design)
8. [AI Integration Strategy](#8-ai-integration-strategy)
9. [Security & Production Hardening](#9-security--production-hardening)
10. [Deployment Infrastructure](#10-deployment-infrastructure)
11. [Business Model](#11-business-model)
12. [Market Opportunity](#12-market-opportunity)
13. [Competitive Landscape](#13-competitive-landscape)
14. [Growth Roadmap](#14-growth-roadmap)
15. [Links & Deliverables](#15-links--deliverables)
16. [Team Contact Details](#16-team-contact-details)

---

## 1. Executive Summary

**LakshPath** (Hindi: लक्ष्यपथ — "Path to Your Goal") is a full-stack, AI-powered career intelligence platform designed for Indian students and early-career professionals. It replaces fragmented career guidance with a single, unified platform that handles everything from career discovery and skill assessment to interview preparation, portfolio analysis, and job matching — all powered by Google Gemini AI.

The platform addresses a $15B+ Indian EdTech and career services market where 80% of graduates feel underprepared for the job market despite having access to learning resources. LakshPath bridges the gap between "learning" and "landing a job" by providing personalized, AI-driven career pathways.

| Metric | Value |
|--------|-------|
| Codebase | 25,000+ lines of TypeScript |
| API Endpoints | 100+ across 15 route groups |
| AI-Powered Features | 15+ distinct modules |
| Database Models | 24 Prisma models |
| Company Prep Packs | 20+ (TCS, Infosys, Google, Amazon, etc.) |
| Badge System | 14 automated badges, 4 rarity tiers |
| Deployment | Google Cloud Run (serverless, auto-scaling) |

---

## 2. Problem Statement

### The Gap in Indian Career Guidance

India produces **10 million+ graduates annually**, yet:

- **80% lack structured career guidance** — school/college counselling is absent or generic
- **65% of engineering graduates are unemployable** (NASSCOM/Aspiring Minds) due to skill misalignment
- **Students use 5-7 disconnected tools** — one for learning, one for interviews, one for resume, one for job search — with no unified intelligence
- **Vocational students (ITI/Diploma) are completely ignored** by mainstream career platforms
- **Rural and tier-2/3 students** have zero access to the mentorship available at IITs/NITs
- **Interview preparation is generic** — no personalization based on actual skill gaps

### What Exists Today (And Why It Fails)

| Platform | Problem |
|----------|---------|
| LinkedIn Learning | Western-centric, no career matching, expensive |
| Naukri/Indeed | Job listing only — no skill development or prep |
| InterviewBit/LeetCode | Coding-only, no career discovery or soft skills |
| College Placement Cells | Manual, inconsistent, zero AI personalization |
| Career Counsellors | Expensive (₹5,000-50,000), one-time interaction |

**LakshPath solves this by combining career discovery, skill building, interview prep, portfolio optimization, and job matching into one AI-powered platform — free and accessible to every Indian student.**

---

## 3. Project Ideology & Vision

### Core Philosophy

> *"Every student deserves a personalized career mentor — not just those at IITs."*

LakshPath democratizes career intelligence by making AI-powered guidance available to every student regardless of their college tier, location, or economic background.

### Three Pillars

1. **Discover** — AI-powered career assessment that goes beyond simple quizzes to build a "Career DNA" profile using 4 archetypes and 6-dimension skill radar
2. **Develop** — Personalized learning roadmaps with micro-tasks, milestone tracking, and skill simulation that adapt to the student's pace
3. **Deploy** — Interview preparation, portfolio optimization, resume building, and job matching that prepare students for actual placement success

### Vision Statement

To become India's default career intelligence layer — the platform every student opens before their first job, and every professional returns to before their next career move.

---

## 4. Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2 | UI framework with hooks-based state management |
| TypeScript | 5.3 | Type-safe development across entire codebase |
| Vite | 5.0 | Fast build tooling with HMR |
| Tailwind CSS | 3.4 | Utility-first responsive styling |
| Framer Motion | 10.16 | Smooth page transitions and micro-animations |
| React Router | 6.20 | Client-side routing with protected routes |
| Recharts | 2.10 | Data visualization (skill radar, analytics charts) |
| Axios | 1.6 | HTTP client with interceptors for auth and badge events |
| Capacitor | 7.4 | Cross-platform mobile app support (iOS/Android) |
| Lucide React | 0.300 | Consistent icon system |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20 (Alpine) | Server runtime |
| Express.js | 4.18 | HTTP framework |
| TypeScript | 5.3 | Type-safe server code |
| Prisma | 6.19 | Database ORM with migrations |
| SQLite / PostgreSQL | — | Dev / Production database |
| JWT | 9.0 | Stateless authentication |
| google-auth-library | 9.4 | Google OAuth 2.0 integration |
| Zod | 3.22 | Runtime input validation schemas |
| Helmet.js | 7.0 | Security headers |
| express-rate-limit | 8.2 | API rate limiting (3 tiers) |
| Morgan | 1.10 | HTTP request logging |
| Nodemailer | 7.0 | Transactional emails |

### AI & External Services

| Service | Usage |
|---------|-------|
| Google Gemini 2.0 Flash | Primary AI engine for all 15+ intelligent features |
| GitHub REST API v3 | Portfolio analysis, repository scoring, badge detection |
| Google OAuth 2.0 | One-click authentication |

### DevOps & Deployment

| Tool | Purpose |
|------|---------|
| Docker | Multi-stage containerized builds |
| Google Cloud Run | Serverless auto-scaling production hosting |
| Google Artifact Registry | Container image storage |
| Netlify | Frontend static hosting with SPA routing |
| Firebase Hosting | Alternative frontend deployment |
| Neon PostgreSQL | Managed production database (free tier) |

---

## 5. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  React 18 + TypeScript + Tailwind + Framer Motion       │
│  Hosted: Netlify / Firebase Hosting                     │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS (Axios + JWT)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   API Gateway                           │
│  Express.js + Helmet + CORS + Rate Limiting             │
│  Hosted: Google Cloud Run (serverless)                  │
├─────────────────────────────────────────────────────────┤
│  Middleware Pipeline:                                   │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐  │
│  │ Helmet   │→│ CORS     │→│ Rate Limit│→│ JWT Auth │  │
│  └──────────┘ └──────────┘ └───────────┘ └──────────┘  │
├─────────────────────────────────────────────────────────┤
│  15 Route Groups → Controllers → 21 Services            │
└──────┬───────────────────────────────┬──────────────────┘
       │                               │
       ▼                               ▼
┌──────────────┐              ┌────────────────────┐
│  PostgreSQL  │              │  Google Gemini AI   │
│  (Prisma ORM)│              │  + GitHub API       │
│  24 Models   │              │  + Google OAuth     │
└──────────────┘              └────────────────────┘
```

### Backend Service Architecture

```
Routes (15 groups, 100+ endpoints)
    │
    ├── Middleware: authenticate, validate(Zod), rateLimiter
    │
    ▼
Controllers (request/response handling)
    │
    ▼
Services (21 business logic modules)
    │
    ├── geminiService (AI calls with retry + fallback)
    ├── badgeService (automated gamification)
    ├── assessmentService (career analysis)
    ├── interviewService (mock interviews)
    ├── portfolioService (GitHub analysis)
    ├── linkedinService (profile optimization)
    ├── roadmapService (learning paths)
    ├── marketService (salary/trend intelligence)
    └── ... (13 more services)
    │
    ▼
Prisma ORM → PostgreSQL / SQLite
```

### Frontend Architecture

```
App.tsx
  │
  ├── ToastProvider (global notification system)
  │     └── Listens for: badge-earned, auth-expired events
  │
  ├── Router (React Router v6)
  │     ├── Public Routes: Landing, Login, Register
  │     └── Protected Routes (ProtectedRoute wrapper)
  │           ├── Enforces: Profile Setup → Assessment → Dashboard flow
  │           ├── Dashboard (central hub)
  │           ├── 15+ feature pages
  │           └── Profile & Settings
  │
  └── API Layer (Axios)
        ├── Request interceptor: JWT token injection
        └── Response interceptor: badge events + 401 handling
```

---

## 6. Key Features & Implementation Details

### 6.1 AI Career Assessment & Career DNA

**What it does:** An 8-question adaptive assessment that builds a comprehensive Career DNA profile, matching students to their top 3-5 career paths with confidence scores.

**Implementation:**
- Backend sends structured prompts to Gemini AI with the student's responses
- AI returns a Career DNA profile with 4 archetypes (Builder, Analyst, Creator, Connector)
- 6-dimension skill radar (Technical, Analytical, Creative, Communication, Leadership, Domain)
- Top career matches include: role name, match percentage, salary range, growth trajectory, required skills
- Results stored in `QuizResult` + `CareerMatch` Prisma models

**Why it matters:** Traditional career tests give generic results. LakshPath's AI analyzes response patterns, not just answers, providing nuanced career matching that improves with more data.

### 6.2 Personalized Learning Roadmap

**What it does:** Generates a 4-phase learning path (Foundation → Core → Advanced → Mastery) with 12+ trackable milestones, resource links, and progress analytics.

**Implementation:**
- `roadmapService` takes career match + current skills as input
- Gemini generates phase-specific milestones with estimated durations
- Each milestone tracks: title, description, resources, completion status
- Micro-Coach generates daily/weekly bite-sized tasks from roadmap gaps
- Stored in `LearningRoadmap` + `RoadmapMilestone` models

### 6.3 AI Interview Preparation

**What it does:** Full mock interview system with 4 types (Technical, Behavioral, System Design, Coding), 3 difficulty levels, AI evaluation with scoring, and progressive hints.

**Implementation:**
- `interviewService` manages sessions with 75+ curated questions + AI-generated questions
- Each answer is evaluated by Gemini AI on a 0-100 scale with detailed feedback
- 4-level progressive hint system (Conceptual → Directional → Structural → Near-solution)
- Code review feature analyzes code quality, complexity, and style
- STAR analysis for behavioral questions
- Follow-up questions generated contextually
- Session analytics track score trends over time
- Stored in `InterviewSession` + `InterviewQuestion` models
- Badge automation: completes interview → `badgeService.checkAndAward()` triggers

### 6.4 GitHub Portfolio Analysis

**What it does:** Analyzes a student's GitHub profile and scores it across multiple dimensions — code quality, diversity, contribution patterns — with per-repository recommendations.

**Implementation:**
- `portfolioService` calls GitHub REST API to fetch all public repos
- Analyzes: stars, forks, languages, commit frequency, README quality
- Generates scores: Overall (0-100), Code Quality, Diversity, Contribution
- Detects GitHub achievement badges (Pull Shark, Galaxy Brain, etc.)
- Distinguishes original repos from forks
- Identifies portfolio gaps for target career roles
- Per-repo improvement recommendations via Gemini AI
- Stored in `PortfolioAnalysis` + `RepositoryAnalysis` models

### 6.5 LinkedIn Profile Optimization

**What it does:** Analyzes and optimizes LinkedIn profiles for ATS visibility with headline rewriting, about section enhancement, keyword optimization, and before/after scoring.

**Implementation:**
- `linkedinService` takes profile sections as input
- Gemini rewrites headline with role-targeted keywords
- About section enhanced with professional language + ATS keywords
- Keyword extraction identifies missing high-impact terms
- Before/after scoring (0-100) shows improvement
- Version comparison tracks optimization history
- Status workflow: DRAFT → APPLIED → ARCHIVED
- Stored in `LinkedInOptimization` model

### 6.6 Company-Specific Placement Preparation

**What it does:** Provides targeted preparation packs for 20+ Indian companies (TCS, Infosys, Wipro, Google, Amazon, Microsoft, etc.) with 450+ questions covering aptitude, technical, coding, and HR rounds.

**Implementation:**
- Pre-structured question banks per company
- Topics: Quantitative Aptitude, Logical Reasoning, Verbal Ability, DSA, System Design, Coding Challenges, HR/Behavioral
- Progress tracking per company, per topic
- Mock tests with time-bound sessions
- Stored in `PlacementPrepSession` model

### 6.7 Vocational Pathways (NSQF Integration)

**What it does:** Provides career pathways for vocational students (ITI/Diploma) across 10+ sectors using India's National Skills Qualifications Framework (NSQF Levels 1-10).

**Implementation:**
- 10+ sectors: IT, Healthcare, Manufacturing, Agriculture, Retail, etc.
- AI-generated pathway with NSQF level progression
- Employability prediction scores
- Skill gap analysis for target NSQF levels
- Government scheme matching (PM Kaushal Vikas Yojana, etc.)
- Course recommendations from recognized institutions
- 5-year career forecasts

**Why it matters:** 60%+ of Indian students are in vocational tracks, yet every career platform ignores them. This is a massive underserved market.

### 6.8 Gamification & Badge System

**What it does:** Automated gamification with XP points, leveling (Beginner → Expert), 14 automated badges across 4 rarity tiers, and daily login streaks.

**Implementation:**
- Centralized `badgeService` with 14 badge definitions:
  - **Profile badges (3):** Profile Complete, GitHub Connected, LinkedIn Linked
  - **Skill badges (3):** DSA Warrior, Architect Mind, Polyglot Dev
  - **Achievement badges (6):** Code Machine, Open Source Champion, Star Collector, GitHub Celebrity, Interview Rookie, Interview Pro
  - **Streak badges (1):** Streak Starter
  - **Milestone badges (1):** Rising Star
- 4 rarity levels: COMMON, RARE, EPIC, LEGENDARY
- Auto-triggered after: interview completion, profile analysis, assessment submission
- Toast notifications via custom event system (`badge-earned` DOM events)
- Frontend badge catalog fetched from API (data-driven, not hardcoded)

### 6.9 Toast Notification System

**What it does:** Global notification system for real-time feedback on badge earning, settings saves, errors, and session expiry.

**Implementation:**
- React Context (`ToastProvider`) with Framer Motion animations
- 4 types: success (green), error (red), info (blue), badge (purple/gold)
- Auto-dismiss after 4 seconds, stacked bottom-right
- Listens for `badge-earned` and `auth-expired` custom DOM events
- Axios response interceptor dispatches events automatically

### 6.10 Sequential Onboarding

**What it does:** Ensures every user completes a logical onboarding flow — Profile Setup → Career Assessment → Dashboard — preventing empty/broken experiences.

**Implementation:**
- `ProtectedRoute` component checks localStorage flags
- `profileSetupCompleted` → redirects to `/profile-setup` if false
- `assessmentCompleted` → redirects to `/quiz-intro` if false
- Auth response includes onboarding status from database
- Exempt paths prevent redirect loops

### 6.11 AI Mentor Chat

**What it does:** Context-aware conversational AI mentor for career guidance, interview strategy, and scholarship eligibility queries.

**Implementation:**
- 3 categories: Career Path, Interview Strategy, Scholarship Eligibility
- Structured AI responses with action plans, follow-ups, confidence scores
- Conversation history maintained per session

### 6.12 Resume Builder

**What it does:** Professional resume creation with 5 templates (Modern, Professional, Creative, IIT, FAANG), live preview, ATS scoring, and one-click PDF export.

### 6.13 Market Intelligence

**What it does:** Real-time salary trends, skill demand analysis, and 5-year career forecasting for matched career paths.

### 6.14 Skill Simulator

**What it does:** Role-based gap analysis showing exactly which skills a student needs to develop, with readiness scoring.

---

## 7. Database Design

### Schema Overview (24 Models)

```
User (central entity)
  │
  ├── LoginLog (auth history, streak tracking)
  ├── Badge (14 types, 4 rarity levels)
  │
  ├── QuizResult (career assessment)
  │     └── CareerMatch (top matched roles)
  │
  ├── ProfileAnalysis (composite profile scoring)
  │     └── SkillSnapshot (per-skill tracking)
  │           └── MicroTask (daily learning tasks)
  │
  ├── LearningRoadmap
  │     └── RoadmapMilestone (12+ checkpoints)
  │
  ├── InterviewSession
  │     └── InterviewQuestion (Q&A with AI evaluation)
  │
  ├── PortfolioAnalysis
  │     └── RepositoryAnalysis (per-repo scoring)
  │
  ├── LinkedInOptimization (profile versions)
  ├── JDComparison (job description matching)
  ├── MarketSnapshot (cached market data)
  ├── PlacementPrepSession (company-specific prep)
  ├── GoalContract (SMART goals with streaks)
  └── Insight (AI-generated career insights)
```

### Key Design Decisions

- **JSON fields** for flexible nested data (AI responses, skill breakdowns)
- **Cascade deletes** on user removal (complete data isolation)
- **Compound unique constraints** (e.g., `[userId, name]` on badges prevents duplicates)
- **Indexed fields** on `userId` and `createdAt` for query performance
- **Automatic timestamps** (`createdAt`, `updatedAt`) on all records
- **SQLite for development**, seamless migration to **PostgreSQL for production** via Prisma

---

## 8. AI Integration Strategy

### Gemini AI Usage Pattern

Every AI-powered feature follows a resilient 3-layer pattern:

```
Layer 1: Primary AI Call
  ├── Structured prompt with user context
  ├── JSON response schema validation
  └── Timeout: 30 seconds
      │
      ▼ (on failure)
Layer 2: Retry with Backoff
  ├── 3 attempts: 1s → 2s → 4s
  ├── Handles 429 (rate limit) gracefully
  └── Logs failure for monitoring
      │
      ▼ (on persistent failure)
Layer 3: Graceful Fallback
  ├── Returns curated demo data
  ├── User experience never breaks
  └── Feature remains functional
```

### AI Cost Efficiency

| Model | Input Cost | Output Cost |
|-------|-----------|-------------|
| Gemini 2.0 Flash | $0.075 / 1M tokens | $0.30 / 1M tokens |

At current usage patterns, estimated cost per active user is **< $0.02/month** — enabling a sustainable free tier.

---

## 9. Security & Production Hardening

| Layer | Implementation |
|-------|---------------|
| **Authentication** | JWT tokens + Google OAuth 2.0 |
| **Rate Limiting** | 3-tier: Global (100/15min), Auth (10/15min), AI (20/15min) |
| **Input Validation** | Zod schemas on all user-facing endpoints |
| **Security Headers** | Helmet.js (CSP, HSTS, X-Frame-Options, etc.) |
| **CORS** | Whitelisted origins only |
| **Secrets Management** | Environment variables, `.env` files excluded from git |
| **Session Expiry** | Auto-logout on 401 with `auth-expired` event |
| **Data Isolation** | Cascade deletes, user-scoped queries |

---

## 10. Deployment Infrastructure

### Production Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Netlify    │     │ Cloud Run    │     │    Neon      │
│   (Frontend) │────▶│  (Backend)   │────▶│ (PostgreSQL) │
│   CDN + SSL  │     │  Serverless  │     │  Managed DB  │
└──────────────┘     └──────────────┘     └──────────────┘
                           │
                     ┌─────┴─────┐
                     │           │
                ┌────▼───┐ ┌────▼────┐
                │ Gemini │ │ GitHub  │
                │   AI   │ │   API   │
                └────────┘ └─────────┘
```

### Deployment Specs

| Component | Platform | Config |
|-----------|----------|--------|
| Frontend | Netlify + Firebase Hosting | Vite build → static CDN |
| Backend | Google Cloud Run | Docker, 512MB RAM, 1 CPU, 0-3 instances |
| Database | Neon PostgreSQL | Free tier, auto-scaling |
| Container | Google Artifact Registry | Multi-stage Docker build |
| CI/CD | Cloud Build | Automated via deploy.sh |

### Auto-Scaling

- **Min instances:** 0 (zero cost when idle)
- **Max instances:** 3 (handles traffic spikes)
- **Cold start:** ~2 seconds (optimized Alpine image)
- **Request timeout:** 300 seconds (for AI-heavy operations)

---

## 11. Business Model

### Revenue Streams

#### Stream 1: Freemium SaaS (B2C)

| Tier | Price | Features |
|------|-------|----------|
| **Free** | ₹0 | Career assessment, basic roadmap, 3 interviews/month, portfolio analysis |
| **Pro** | ₹199/month | Unlimited interviews, all company packs, LinkedIn optimizer, priority AI |
| **Premium** | ₹499/month | Everything + 1:1 AI live sessions, resume builder, placement guarantee program |

**Target:** Individual students (10M+ graduates/year)

#### Stream 2: B2B (College Partnerships)

| Package | Price | Offering |
|---------|-------|----------|
| **College License** | ₹50,000-2,00,000/year | Bulk access for all students, placement cell dashboard, analytics |
| **Training Institute** | ₹30,000-1,00,000/year | Branded version, progress tracking, batch management |

**Target:** 40,000+ colleges and 50,000+ training institutes in India

#### Stream 3: B2B (Corporate)

| Package | Price | Offering |
|---------|-------|----------|
| **Hiring Partner** | ₹1,00,000-5,00,000/year | Access to pre-assessed talent pool, skill-matched candidates |
| **Assessment API** | Usage-based | White-label assessment for company hiring pipelines |

#### Stream 4: Affiliate & Partnerships

- Course platform referrals (Coursera, Udemy, UpGrad) — 10-30% commission
- Certification partner integration
- Job board premium listings

### Unit Economics (Projected)

| Metric | Value |
|--------|-------|
| AI cost per user | < ₹1.5/month |
| Infrastructure per user | < ₹0.5/month |
| Customer Acquisition Cost (CAC) | ₹50-150 (organic + college partnerships) |
| Monthly ARPU (blended) | ₹80-120 |
| LTV (12-month) | ₹960-1,440 |
| LTV:CAC Ratio | 6-10x |

---

## 12. Market Opportunity

### Total Addressable Market (TAM)

| Segment | Size | Value |
|---------|------|-------|
| Indian EdTech Market (2025) | — | $10.4 billion |
| Career Services Market | — | $4.2 billion |
| Online Assessment Market | — | $1.8 billion |
| **Combined TAM** | — | **$16.4 billion** |

### Serviceable Market (SAM)

| Segment | Users | Revenue Potential |
|---------|-------|-------------------|
| Engineering graduates | 1.5M/year | ₹300Cr/year |
| MBA/Commerce graduates | 3M/year | ₹450Cr/year |
| Vocational students (ITI/Diploma) | 5M/year | ₹500Cr/year |
| Working professionals (career switch) | 2M/year | ₹400Cr/year |
| **Total SAM** | **11.5M/year** | **₹1,650Cr/year** |

### Why Now?

1. **AI costs dropping 10x** — Gemini Flash makes AI-at-scale viable at < ₹2/user/month
2. **NEP 2020** mandates career counselling in every institution — platforms like LakshPath become essential infra
3. **Post-COVID digital adoption** — students comfortable with online career tools
4. **Skill India 2.0 / NSQF** — government push for vocational skilling creates regulatory tailwind
5. **Placement season pressure** — 10M+ students compete for shrinking campus placement slots every year

---

## 13. Competitive Landscape

| Feature | LakshPath | LinkedIn | Naukri | InterviewBit | Hirect |
|---------|-----------|----------|--------|--------------|--------|
| AI Career Assessment | Yes | No | No | No | No |
| Personalized Roadmap | Yes | No | No | No | No |
| AI Mock Interviews | Yes | No | No | Partial | No |
| GitHub Portfolio Analysis | Yes | No | No | No | No |
| LinkedIn Optimization | Yes | N/A | No | No | No |
| Company-Specific Prep | Yes (20+ companies) | No | No | Partial | No |
| Vocational Pathways (NSQF) | Yes | No | No | No | No |
| Gamification | Yes | Basic | No | Yes | No |
| Free Tier | Yes | Limited | Limited | Limited | Yes |
| India-Focused | Yes | Global | Yes | Global | Yes |
| AI-Powered Throughout | Yes | Partial | No | No | No |

### Competitive Moat

1. **All-in-one platform** — No competitor covers discovery + development + deployment in one place
2. **NSQF integration** — First platform to serve India's 5M+ vocational students
3. **Company-specific prep** — 20+ Indian company packs (TCS, Infosys, etc.) that generic platforms ignore
4. **AI cost advantage** — Gemini Flash enables features at 1/10th the cost of GPT-4 based competitors
5. **Data network effects** — Every assessment improves AI matching accuracy for future users

---

## 14. Growth Roadmap

### Phase 1: Foundation (Current)

- [x] Core platform with 15+ AI features
- [x] Production deployment on Google Cloud Run
- [x] Rate limiting, validation, security hardening
- [x] Gamification with automated badge system
- [x] 20+ company placement prep packs

### Phase 2: Scale

- [ ] AI Live 1:1 voice sessions (adaptive difficulty)
- [ ] Mobile app release via Capacitor (iOS + Android)
- [ ] Leaderboard and social features
- [ ] Video interview recording with playback + analytics
- [ ] Multi-language support (Hindi, Tamil, Telugu, Bengali)

### Phase 3: Monetize

- [ ] Pro/Premium subscription tiers
- [ ] College partnership program (pilot with 10 institutions)
- [ ] Course affiliate integration (Coursera, UpGrad)
- [ ] Assessment API for corporate hiring

### Phase 4: Expand

- [ ] Mentor marketplace (connect students with industry professionals)
- [ ] Job board integration (Indeed, LinkedIn Jobs API)
- [ ] Scholarship automation (auto-apply to eligible schemes)
- [ ] Southeast Asia expansion (similar education challenges)

---

## 15. Links & Deliverables

| Resource | Link |
|----------|------|
| **GitHub Repository** | [github.com/ayushap18/lakshpath-2.0](https://github.com/ayushap18/lakshpath-2.0) |
| **Deployed App (Firebase)** | [lakshpath-36f54.web.app](https://lakshpath-36f54.web.app) |
| **Deployed API (Cloud Run)** | [lakshpath-api-336426317494.asia-south1.run.app](https://lakshpath-api-336426317494.asia-south1.run.app) |
| **Netlify Mirror** | [lakshpath2.netlify.app](https://lakshpath2.netlify.app) |

---

## 16. Team Contact Details

### Team Code Catalyst

| Name | Role | Phone | Email |
|------|------|-------|-------|
| **Ayush Sharma** | Team Leader & Full Stack Developer | +91 79826 59056 | iayushsharma.2008@gmail.com |
| **Yatharth** | UI/UX Designer (Figma) | +91 93184 13020 | — |
| **Vardaan** | Data Extraction & Research | +91 95400 60986 | — |
| **Paavni** | Speaker & Presentation | +91 91383 29387 | — |

**Primary Contact:** Ayush Sharma — iayushsharma.2008@gmail.com

---

*This report was prepared by Team Code Catalyst for VC investor referral consideration. All code is open-source and available for technical due diligence at the GitHub repository linked above.*
