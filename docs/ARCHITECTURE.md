# LakshPath - Architecture Document

## System Architecture

```
+---------------------------+
|       Mobile Apps         |
|   (Capacitor iOS/Android) |
+------------+--------------+
             |
+------------v--------------+            +------------------+
|     React Frontend        |            | Google OAuth     |
|  (Vite + TypeScript)      +----------->| Consent Screen   |
|  Port: 3000               |            +------------------+
+------------+--------------+
             | Axios HTTP
             | (JWT Bearer Auth)
+------------v--------------+            +------------------+
|     Express Backend       |            | Google Gemini AI |
|  (Node.js + TypeScript)   +----------->| (2.0 Flash)      |
|  Port: 5001               |            +------------------+
+------------+--------------+
             |                           +------------------+
             +-------------------------->| Nodemailer/SMTP  |
             |                           +------------------+
+------------v--------------+
|     SQLite Database       |
|  (via Prisma ORM)         |
+---------------------------+
```

---

## Directory Structure

```
LakshPath/
├── frontend/                          # React frontend app
│   ├── src/
│   │   ├── pages/                     # Route components (9 pages)
│   │   │   ├── LandingPageNew.tsx     # Public landing page
│   │   │   ├── LoginNew.tsx           # Google OAuth + demo login
│   │   │   ├── RegisterNew.tsx        # Email registration
│   │   │   ├── QuizIntro.tsx          # Assessment intro screen
│   │   │   ├── AssessmentQuiz.tsx     # Multi-step quiz
│   │   │   ├── DashboardNew.tsx       # Main dashboard hub
│   │   │   ├── Learn.tsx              # Learning hub + modals
│   │   │   ├── InterviewPractice.tsx  # Interview practice
│   │   │   └── PortfolioAnalysis.tsx  # GitHub analysis
│   │   ├── components/                # Reusable components
│   │   │   ├── ProtectedRoute.tsx     # Auth guard
│   │   │   └── BottomNav.tsx          # Mobile navigation
│   │   ├── services/
│   │   │   └── api.ts                 # Axios client + 13 API modules
│   │   ├── App.tsx                    # Router configuration
│   │   ├── main.tsx                   # React bootstrap + GoogleOAuthProvider
│   │   ├── App.css
│   │   └── index.css
│   ├── capacitor.config.ts           # Mobile app config
│   ├── tailwind.config.js            # Tailwind customization
│   ├── vite.config.ts                # Vite build config
│   ├── tsconfig.json
│   ├── package.json
│   └── .env                           # VITE_API_BASE_URL, VITE_GOOGLE_CLIENT_ID
│
├── backend/                           # Express backend API
│   ├── src/
│   │   ├── routes/                    # Express route definitions
│   │   │   ├── index.ts              # Route aggregator
│   │   │   ├── auth.routes.ts        # /auth/*
│   │   │   ├── assessment.routes.ts  # /assessment/*
│   │   │   ├── careers.routes.ts     # /careers/*
│   │   │   ├── roadmap.routes.ts     # /roadmap/*
│   │   │   ├── chat.routes.ts        # /chat/*
│   │   │   ├── jobs.routes.ts        # /jobs/*
│   │   │   ├── market.routes.ts      # /market/*
│   │   │   ├── user.routes.ts        # /user/*
│   │   │   ├── interview.routes.ts   # /interview/*
│   │   │   ├── interviewEnhanced.routes.ts
│   │   │   ├── portfolio.routes.ts   # /portfolio/*
│   │   │   ├── learningEnhanced.routes.ts
│   │   │   ├── nsqf.routes.ts        # /nsqf/*
│   │   │   ├── scholarships.routes.ts
│   │   │   ├── insights.routes.ts
│   │   │   └── demo.routes.ts
│   │   ├── controllers/              # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── assessmentController.ts
│   │   │   ├── careersController.ts
│   │   │   ├── roadmapController.ts
│   │   │   ├── chatController.ts
│   │   │   ├── jobsController.ts
│   │   │   ├── marketController.ts
│   │   │   ├── userController.ts
│   │   │   ├── interviewController.ts
│   │   │   ├── interviewEnhancedController.ts
│   │   │   ├── portfolioController.ts
│   │   │   ├── learningEnhancedController.ts
│   │   │   ├── nsqfController.ts
│   │   │   ├── scholarshipsController.ts
│   │   │   ├── insightsController.ts
│   │   │   └── demoController.ts
│   │   ├── services/                 # Business logic (18 services)
│   │   │   ├── authService.ts        # Google OAuth, JWT, login logging
│   │   │   ├── assessmentService.ts  # Quiz processing, career matching
│   │   │   ├── geminiService.ts      # All Gemini AI interactions
│   │   │   ├── interviewService.ts   # Interview sessions
│   │   │   ├── interviewEnhancedService.ts
│   │   │   ├── portfolioService.ts   # GitHub analysis
│   │   │   ├── jobsService.ts        # Job matching, auto-scout
│   │   │   ├── marketService.ts      # Market intelligence
│   │   │   ├── roadmapService.ts     # Roadmap management
│   │   │   ├── userService.ts        # Profile, progress
│   │   │   ├── chatService.ts        # Mentor chat
│   │   │   ├── emailService.ts       # Email notifications
│   │   │   ├── insightService.ts     # Insight logging
│   │   │   ├── demoService.ts        # Demo mode
│   │   │   ├── scholarshipService.ts # Scholarships
│   │   │   ├── notificationService.ts
│   │   │   ├── learningEnhancedService.ts
│   │   │   └── nsqfPathwayService.ts # NSQF vocational
│   │   ├── middleware/
│   │   │   ├── authenticate.ts       # JWT verification
│   │   │   └── errorHandler.ts       # Global error handler
│   │   ├── config/
│   │   │   └── env.ts                # Zod-validated env schema
│   │   ├── lib/
│   │   │   ├── prisma.ts             # Prisma client singleton
│   │   │   ├── careerEngine.ts       # Career match scoring
│   │   │   ├── jobsFeed.ts           # Job data management
│   │   │   └── domainThemes.ts       # 6 domain personalities
│   │   ├── utils/
│   │   │   └── json.ts               # Safe JSON parse/stringify
│   │   ├── app.ts                    # Express app setup (CORS, middleware)
│   │   └── server.ts                 # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema (19 models)
│   │   └── migrations/               # 5 migration files
│   ├── package.json
│   └── .env                          # PORT, DB, API keys, CORS origins
│
└── docs/                             # Documentation (this directory)
```

---

## Data Flow

### Authentication Flow
```
1. User clicks "Sign in with Google"
2. @react-oauth/google shows Google consent popup
3. Google returns ID token (credential)
4. Frontend POSTs credential to /api/auth/google
5. Backend verifies token via google-auth-library OAuth2Client
6. Backend upserts user in DB (creates if new)
7. Backend creates JWT token (7-day expiry)
8. Backend returns { token, user, isNewUser }
9. Frontend stores token + user info in localStorage
10. Frontend redirects to /dashboard or /quiz-intro
```

### Assessment Flow
```
1. User completes 12+ question quiz
2. Frontend POSTs answers to /api/assessment
3. Backend processes answers through careerEngine scoring
4. Backend calls Gemini AI for career explanations
5. Backend generates learning roadmap via Gemini
6. Backend creates QuizResult + CareerMatches + LearningRoadmap + Milestones
7. Backend generates SMART GoalContracts per milestone
8. Returns assessment results to frontend
9. Frontend navigates to dashboard
```

### AI Interaction Pattern (All AI Features)
```
1. Frontend sends request to backend endpoint
2. Controller validates input, extracts auth context
3. Service builds prompt with user context
4. geminiService calls Gemini 2.0 Flash API
5. Response parsed from JSON (with retry/fallback)
6. Result stored in DB (insights, sessions, analyses)
7. Formatted response returned to frontend
```

---

## Database Schema (Entity Relationships)

```
User (1) ──── (*) QuizResult
  │                  │
  │                  ├── (*) CareerMatch
  │                  └── (1) LearningRoadmap
  │                            │
  │                            └── (*) RoadmapMilestone
  │                                      │
  │                                      └── (0..1) GoalContract
  │
  ├── (*) SkillSnapshot ──── (*) MicroTask
  ├── (*) JDComparison
  ├── (*) LoginLog
  ├── (*) InterviewSession ──── (*) InterviewQuestion
  ├── (*) PortfolioAnalysis ──── (*) RepositoryAnalysis
  ├── (*) LinkedInOptimization
  ├── (*) Insight
  └── (*) DemoRun

MarketSnapshot (standalone)
MarketBrief (standalone)
```

---

## Key Design Decisions

### Backend
- **SQLite for dev**: Simple, file-based, zero setup. Production should use PostgreSQL.
- **Prisma ORM**: Type-safe database access with migration support.
- **Gemini 2.0 Flash**: Chosen for speed and cost-effectiveness over other models.
- **JWT (not sessions)**: Stateless auth suitable for mobile + web.
- **JSON-in-columns**: Complex objects (skills, nudges, metadata) stored as stringified JSON in SQLite text columns.
- **Exponential backoff**: Retry logic for Gemini API rate limiting.
- **Domain themes**: 6 career domains with distinct personality/tone for personalized UX.

### Frontend
- **Vite over CRA**: Faster builds, better DX, native ESM support.
- **Tailwind CSS**: Utility-first for rapid UI development, no custom CSS files.
- **Framer Motion**: Production-grade animations without CSS complexity.
- **localStorage for auth**: Simple token persistence, cleared on logout/401.
- **Large page components**: Dashboard and Learn pages are monolithic (1000-2000 lines) with embedded sub-components and modals.
- **No global state management**: Uses localStorage + prop drilling (no Redux/Zustand/Context for state).

### Mobile
- **Capacitor over React Native**: Reuse same React web codebase for native apps.
- **OTA updates via Capgo**: Bypass app store reviews for non-native changes.

---

## Security

| Measure | Implementation |
|---|---|
| CORS | Whitelist-based origin validation |
| Helmet | Security headers (CSP, HSTS, X-Frame-Options, etc.) |
| JWT | Signed tokens with 7-day expiry |
| Google OAuth | Server-side ID token verification |
| Input Validation | Zod schemas for env vars; request body checks in controllers |
| Error Handling | Custom AppError class, no stack traces in production |
| Login Auditing | IP, user agent, method, success/failure logged per attempt |

---

## Environment Variables

### Backend (.env)
| Variable | Required | Default | Description |
|---|---|---|---|
| PORT | No | 5000 | Server port |
| DATABASE_URL | No | file:./dev.db | Prisma connection string |
| GEMINI_API_KEY | Yes | - | Google Gemini API key |
| GEMINI_MODEL | No | gemini-2.0-flash | Gemini model to use |
| GOOGLE_CLIENT_ID | Yes | - | Google OAuth client ID |
| CLIENT_ORIGIN | No | - | Comma-separated allowed CORS origins |
| JWT_SECRET | No | lakshpath-dev-secret | JWT signing secret |
| DEMO_MODE_ENABLED | No | true | Enable demo login |
| FRONTEND_URL | No | http://localhost:3000 | Frontend URL |
| EMAIL_ENABLED | No | false | Enable email notifications |
| SMTP_HOST/PORT/USER/PASS | No | - | SMTP configuration |

### Frontend (.env)
| Variable | Required | Description |
|---|---|---|
| VITE_API_BASE_URL | Yes | Backend API URL (e.g., http://localhost:5001/api) |
| VITE_GOOGLE_CLIENT_ID | Yes | Google OAuth client ID |
