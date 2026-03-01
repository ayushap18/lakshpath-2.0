# 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LAKSHPATH PLATFORM                          │
│                    Career Development Platform                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  🎤 Interview    │  │  💼 Portfolio    │  │  🌟 LinkedIn     │ │
│  │    Practice      │  │    Analysis      │  │    Optimizer     │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│         ▲                      ▲                      ▲            │
│         │                      │                      │            │
│         └──────────────────────┴──────────────────────┘            │
│                                │                                    │
│                        ┌───────▼────────┐                          │
│                        │   API Client   │                          │
│                        │   (api.ts)     │                          │
│                        └───────┬────────┘                          │
└────────────────────────────────┼─────────────────────────────────┘
                                 │
                          HTTP/REST API
                                 │
┌────────────────────────────────▼─────────────────────────────────┐
│                         BACKEND (Express)                         │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                         ROUTES                               │ │
│  │  /api/interview  │  /api/portfolio  │  /api/linkedin        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                │                                  │
│  ┌─────────────────────────────▼───────────────────────────────┐ │
│  │                      CONTROLLERS                             │ │
│  │  interviewController │ portfolioController │ linkedinController│ │
│  └─────────────────────────────┬────────────────────────────────┘ │
│                                │                                  │
│  ┌─────────────────────────────▼───────────────────────────────┐ │
│  │                       SERVICES                               │ │
│  │  interviewService  │  portfolioService  │  linkedinService  │ │
│  └─────────────┬───────────────┬──────────────────┬────────────┘ │
│                │               │                  │              │
│                └───────────────┼──────────────────┘              │
│                                │                                  │
│                        ┌───────▼────────┐                        │
│                        │  geminiService │                        │
│                        │   (AI Core)    │                        │
│                        └───────┬────────┘                        │
└────────────────────────────────┼─────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
         ┌──────────────────┐      ┌──────────────────┐
         │   Gemini AI      │      │   GitHub API     │
         │   (Google)       │      │   (External)     │
         └──────────────────┘      └──────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE (SQLite/Prisma)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ InterviewSession │  │PortfolioAnalysis │  │LinkedInOptimize  │ │
│  │ InterviewQuestion│  │RepositoryAnalysis│  │                  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│            │                     │                     │           │
│            └─────────────────────┴─────────────────────┘           │
│                                  │                                  │
│                          ┌───────▼────────┐                        │
│                          │      User      │                        │
│                          └────────────────┘                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### Interview Practice Flow
```
User Input → Start Session
    ↓
Generate Questions (AI) → Store in DB
    ↓
Display Question → User Answers
    ↓
Evaluate Answer (AI) → Store Score & Feedback
    ↓
Repeat → Complete Session
    ↓
Calculate Overall Score → Update Statistics
    ↓
Display Results & Progress
```

### Portfolio Analysis Flow
```
GitHub Username → Fetch Repos (GitHub API)
    ↓
Analyze Code Quality (AI)
    ↓
Generate Scores & Insights → Store in DB
    ↓
Create Recommendations
    ↓
Display Analysis & Charts
```

### LinkedIn Optimization Flow
```
Current Profile Input → Analyze with AI
    ↓
Generate Optimized Version
    ↓
Extract ATS Keywords → Store in DB
    ↓
Calculate Before/After Scores
    ↓
Display Comparison & Improvements
```

---

## 🔄 API Request/Response Flow

### Example: Submit Interview Answer

```
Frontend Component (InterviewPractice.tsx)
    ↓
    POST /api/interview/answer
    {
      questionId: "clx...",
      answer: "Binary search is...",
      timeTaken: 120
    }
    ↓
Backend Controller (interviewController.ts)
    ↓
    Validates request
    Extracts userId from JWT
    ↓
Backend Service (interviewService.ts)
    ↓
    Loads question from DB
    Calls AI for evaluation
    ↓
AI Service (geminiService.ts)
    ↓
    Formats prompt
    Calls Gemini API
    Parses response
    ↓
Backend Service
    ↓
    Saves answer & feedback to DB
    Returns evaluation
    ↓
Frontend Component
    ↓
    Displays score & feedback
    Loads next question
```

---

## 🗄️ Database Relationships

```
User (Core Entity)
  ├── InterviewSessions (1:many)
  │     └── InterviewQuestions (1:many)
  │
  ├── PortfolioAnalyses (1:many)
  │     └── RepositoryAnalyses (1:many)
  │
  └── LinkedInOptimizations (1:many)
```

---

## 🔐 Security Flow

```
User Login
    ↓
Generate JWT Token
    ↓
Store in localStorage
    ↓
Every API Request
    ↓
Add Authorization Header
    ↓
Backend Middleware
    ↓
Verify JWT Token
    ↓
Extract User ID
    ↓
Check Data Ownership
    ↓
Process Request
```

---

## 🎯 Feature Integration Points

### Interview Practice
```
Entry Points:
  - Dashboard: "Start Interview" card
  - Navigation: "Interview Practice" link
  - Profile: "Prepare for interviews" CTA

User Journey:
  1. Select interview type & difficulty
  2. Answer questions one by one
  3. Get instant AI feedback
  4. Complete session
  5. View statistics & progress

Data Used:
  - User profile for context
  - Assessment results for tailoring
  - Career goals for relevance
```

### Portfolio Analysis
```
Entry Points:
  - Dashboard: "Analyze Portfolio" card
  - Profile: "GitHub Analysis" button
  - Roadmap: "Check your portfolio" CTA

User Journey:
  1. Enter GitHub username
  2. Wait for analysis (15-30s)
  3. View comprehensive report
  4. Review recommendations
  5. Track improvement over time

Data Used:
  - GitHub repositories (public)
  - User target role
  - Career assessment results
```

### LinkedIn Optimizer
```
Entry Points:
  - Dashboard: "Optimize Profile" card
  - Profile: "LinkedIn Helper" button
  - Jobs: "Improve visibility" CTA

User Journey:
  1. Enter target role & current profile
  2. Wait for optimization (10-20s)
  3. View before/after comparison
  4. Review improvements
  5. Apply to actual profile

Data Used:
  - Current LinkedIn content
  - Target role & industry
  - User skills & experience
  - Career assessment
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Production Environment           │
├─────────────────────────────────────────┤
│                                          │
│  Frontend (Netlify/Vercel)              │
│    - Static files served via CDN        │
│    - Environment variables configured   │
│                                          │
│  Backend (Railway/Render/Fly.io)        │
│    - Express server running             │
│    - Environment variables set          │
│    - Database connected                 │
│                                          │
│  Database (SQLite/PostgreSQL)           │
│    - Migrations applied                 │
│    - Indexes created                    │
│    - Backups scheduled                  │
│                                          │
│  External Services                       │
│    - Gemini AI API                      │
│    - GitHub API                         │
│                                          │
└─────────────────────────────────────────┘
```

---

## 📈 Scalability Considerations

### Current Implementation (MVP)
- Single server backend
- SQLite database
- Synchronous AI calls
- In-memory caching

### Future Scaling (if needed)
```
Load Balancer
    ↓
Multiple Backend Instances
    ↓
PostgreSQL (with read replicas)
    ↓
Redis Cache
    ↓
Background Job Queue (for AI calls)
    ↓
Monitoring & Analytics
```

---

## 🔧 Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **State**: React Hooks (useState, useEffect)
- **Routing**: React Router v6
- **API**: Axios with interceptors
- **Build**: Vite

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: Prisma ORM + SQLite
- **Auth**: JWT (JSON Web Tokens)
- **AI**: Google Gemini API
- **Validation**: Custom middleware
- **Error Handling**: Centralized error handler

### AI & External APIs
- **Gemini AI**: Question generation, evaluation, optimization
- **GitHub API**: Repository fetching (REST v3)

---

## 🎨 UI Component Hierarchy

### Interview Practice
```
InterviewPractice (Page)
├── StatsCards (4 metrics)
├── ActiveSession
│   ├── SessionHeader
│   ├── QuestionDisplay
│   ├── AnswerTextarea
│   └── SubmitButton
├── NewSessionForm
│   ├── TypeSelect
│   ├── DifficultySelect
│   ├── RoleInput
│   └── StartButton
└── SessionHistory (List)
```

### Portfolio Analysis
```
PortfolioAnalysis (Page)
├── StatsCards (4 metrics)
├── AnalyzeForm
│   ├── UsernameInput
│   ├── RoleInput
│   └── AnalyzeButton
├── AnalysisDetails (Modal/Card)
│   ├── ScoreCards
│   ├── Summary
│   ├── Strengths/Weaknesses
│   ├── Recommendations
│   └── RepositoryList
└── AnalysisHistory (List)
```

### LinkedIn Optimizer
```
LinkedInOptimizer (Page)
├── StatsCards (4 metrics)
├── OptimizeForm
│   ├── RoleInput
│   ├── IndustryInput
│   ├── HeadlineInput
│   ├── AboutTextarea
│   └── OptimizeButton
├── OptimizationDetails (Modal/Card)
│   ├── ScoreComparison
│   ├── HeadlineComparison
│   ├── AboutComparison
│   ├── Keywords
│   ├── Improvements
│   └── StatusSelect
└── OptimizationHistory (List)
```

---

## 📱 Responsive Breakpoints

```
Mobile:     < 640px   (1 column, stacked)
Tablet:     640-1024px (2 columns)
Desktop:    > 1024px   (4 columns for stats, 2 for content)
```

All components use Tailwind's responsive classes:
- `md:` for tablet breakpoint
- `lg:` for desktop breakpoint

---

## ⚡ Performance Metrics

### Target Response Times
- **Interview Answer Evaluation**: < 5 seconds
- **Portfolio Analysis**: < 30 seconds
- **LinkedIn Optimization**: < 20 seconds
- **Statistics Loading**: < 1 second

### AI API Considerations
- Average Gemini response: 2-5 seconds
- Rate limit: 60 requests/minute
- Retry logic: 3 attempts with backoff
- Timeout: 30 seconds

---

## 🔍 Monitoring Points

### Backend Monitoring
- API response times
- Error rates by endpoint
- AI API success rates
- Database query performance

### Frontend Monitoring
- Page load times
- API call failures
- User interaction events
- Feature adoption rates

### Business Metrics
- Sessions per user
- Completion rates
- Score improvements
- Feature preferences

---

## 🎯 Success Criteria

### Technical
✅ All endpoints respond < 10s  
✅ No runtime errors in production  
✅ Type safety maintained  
✅ Authentication working  

### User Experience
✅ Intuitive navigation  
✅ Clear feedback messages  
✅ Responsive on all devices  
✅ Fast perceived performance  

### Business
✅ High feature adoption  
✅ User satisfaction > 80%  
✅ Measurable career outcomes  
✅ Positive feedback  

---

**Your platform is now a comprehensive AI-powered career development tool!** 🚀
