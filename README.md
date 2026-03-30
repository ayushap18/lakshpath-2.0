# LakshPath 2.0

**AI-Powered Career Guidance Platform for Students**

> From "I don't know what to do" to "I'm interview-ready"

---
https://lakshpath-336426317494.asia-south1.run.app/

## What is LakshPath?

LakshPath is a full-stack AI career copilot that provides personalized career discovery, structured learning roadmaps, portfolio analysis, interview practice, and market intelligence — all in one platform.

## Features at a Glance

| Feature | What it does |
|---------|-------------|
| **Career Assessment** | 8-question AI quiz that profiles your strengths, weaknesses, and matches you to careers with salary data |
| **Career DNA** | Personality + skill profiling across 4 archetypes |
| **Learning Roadmaps** | Auto-generated phase-based paths (Foundation > Core > Advanced > Mastery) with 12+ milestones and curated resources |
| **GitHub Analysis** | Scores ALL your repos — code quality, README quality, improvements, highlights per repo |
| **LinkedIn Optimizer** | ATS keyword scoring, headline optimization, before/after comparison |
| **Interview Lab** | 75+ questions with AI evaluation, 4-level hints, code review, follow-up questions |
| **Placement Prep** | Company-specific guides for TCS, Infosys, Google, Amazon + 15 more (450+ questions) |
| **AI Mentor Chat** | Context-aware career, interview, and scholarship guidance |
| **Resume Builder** | 5 professional templates with ATS score checking |
| **Market Intelligence** | Job trends, skill gap analysis, salary data, 5-year forecasting |
| **NSQF Pathways** | Vocational routes for ITI/Diploma students (10+ sectors) |
| **Gamification** | XP system, badges (Common/Rare/Epic/Legendary), login streaks, levels |
| **Skill Simulator** | Compare skills for different roles, identify gaps |
| **Micro Coach** | Daily/weekly bite-sized learning tasks |

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Capacitor (mobile-ready)

**Backend:** Node.js, Express, TypeScript, Prisma ORM, SQLite, Zod validation

**AI:** Google Gemini 2.0 Flash with intelligent demo fallbacks

**Auth:** JWT + Google OAuth

## Architecture

```
lakshpath/
  frontend/          # React + Vite SPA (port 3000)
    src/pages/       # 20 pages
    src/hooks/       # Custom React hooks
    src/services/    # API client layer
    src/components/  # Reusable UI components
  backend/           # Express + Prisma API (port 5001)
    src/routes/      # 15 route groups, 100+ endpoints
    src/services/    # Business logic layer
    src/controllers/ # Request handlers
    prisma/          # 24 database models
```

## Quick Start

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev          # Runs on :5001

# Frontend
cd frontend
npm install
npm run dev          # Runs on :3000
```

## Environment Variables

```env
# backend/.env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GEMINI_API_KEY="your-gemini-key"
GITHUB_TOKEN=""  # Optional, increases rate limit to 5000/hr
```

## API Overview

| Route Group | Endpoints | Purpose |
|-------------|-----------|---------|
| `/api/auth` | 4 | Google OAuth, demo login, session |
| `/api/user` | 6 | Profile, progress, streak, settings |
| `/api/profile` | 6 | AI analysis, badges, GitHub preview |
| `/api/assessment` | 4 | Career quiz, results, micro-tasks |
| `/api/roadmap` | 3 | Learning paths, milestones, progress |
| `/api/interview` | 7 | Practice sessions, questions, stats |
| `/api/interview-enhanced` | 6 | Categories, hints, code review, analytics |
| `/api/portfolio` | 5 | GitHub analysis, repo scoring |
| `/api/linkedin` | 7 | Profile optimization, ATS keywords |
| `/api/chat` | 1 | AI mentor conversations |
| `/api/jobs` | 4 | Job matching, JD comparison |
| `/api/market` | 3 | Trends, briefs, forecasting |
| `/api/learning-enhanced` | 9 | Study plans, quizzes, explanations |
| `/api/nsqf` | 8 | Vocational pathways, skill gaps |
| `/api/features` | 10 | Career DNA, resume, placement, skill sim |

**Total: 100+ endpoints across 15 route groups**

## Database Models

24 Prisma models covering: Users, Profiles, Assessments, Career Matches, Roadmaps, Milestones, Goals, Interviews, Portfolio Analysis, Repository Analysis, LinkedIn Optimization, Skills, Market Data, Badges, Insights, and more.

## Screenshots

*Run the app locally and navigate to:*
- `/dashboard` — Main hub with XP, streaks, career matches
- `/assessment` — 8-question career assessment
- `/roadmap` — Learning roadmap with phases
- `/portfolio` — GitHub portfolio analysis
- `/interview` — Interview practice lab
- `/career-dna` — Career DNA profiling

## Built By

**Ayush Sharma** — Full-Stack Developer
- GitHub: [@ayushap18](https://github.com/ayushap18)
- Email: iayushsharma.2008@gmail.com

## License

Private — All rights reserved.
