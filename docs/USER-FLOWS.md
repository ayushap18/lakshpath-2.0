# LakshPath - User Flows

## Flow 1: New User Onboarding

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────────┐     ┌───────────┐
│  Landing     │────>│  Register    │────>│  Quiz Intro  │────>│  Assessment    │────>│ Dashboard │
│  Page (/)    │     │  (/register) │     │  (/quiz-intro)│    │  Quiz          │     │           │
│              │     │              │     │              │     │  (/assessment) │     │           │
│ [GET STARTED]│     │ Email+Pass   │     │ [Take Quiz]  │     │ 12+ questions  │     │ Full app  │
│              │     │ form         │     │ or           │     │ AI analysis    │     │ access    │
│              │     │              │     │ [Skip]───────┼─────┼───────────────>│     │           │
└─────────────┘     └──────────────┘     └──────────────┘     └────────────────┘     └───────────┘
```

**Steps:**
1. User lands on homepage, sees feature showcase
2. Clicks "GET STARTED" -> taken to Register page
3. Registers with email/password
4. Session created, redirected to Quiz Intro
5. User chooses: Take Quiz (recommended) or Skip to Dashboard
6. If taking quiz: completes 12+ questions about skills, interests, preferences
7. AI processes answers -> generates career matches + learning roadmap
8. Redirected to Dashboard with personalized data

---

## Flow 2: Returning User (Google Sign-In)

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌───────────┐
│  Landing     │────>│  Login       │────>│  Google OAuth  │────>│ Dashboard │
│  Page (/)    │     │  (/login)    │     │  Popup         │     │ or        │
│              │     │              │     │                │     │ Quiz Intro│
│ [CONTINUE]   │     │ Google btn   │     │ Google consent │     │           │
│ or           │     │ or Demo btn  │     │ -> credential  │     │           │
│ [SIGN IN]    │     │              │     │ -> backend     │     │           │
└─────────────┘     └──────────────┘     └───────────────┘     └───────────┘
```

**Steps:**
1. User clicks "CONTINUE" or "SIGN IN" on landing page
2. Login page shows Google sign-in button + Demo option
3. Google OAuth popup appears, user selects account
4. Google returns ID token to frontend
5. Frontend sends token to backend `/api/auth/google`
6. Backend verifies token, upserts user, returns JWT
7. JWT + user info stored in localStorage
8. If assessment completed -> Dashboard
9. If not assessed -> Quiz Intro

---

## Flow 3: Demo/Guest Mode

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  Login       │────>│  Backend     │────>│  Dashboard    │
│  (/login)    │     │  /auth/demo  │     │  (full access)│
│              │     │              │     │               │
│ [Continue    │     │ Creates demo │     │ All features  │
│  as Guest]   │     │ user + JWT   │     │ available     │
└─────────────┘     └──────────────┘     └───────────────┘
```

---

## Flow 4: Career Assessment

```
┌──────────────┐
│  Assessment  │
│  Quiz        │
├──────────────┤
│ Q1: Education level (dropdown)                     │
│ Q2: Technical skills (multi-select rating)         │
│ Q3: Communication skills (rating 1-5)              │
│ Q4: Analytical abilities (rating 1-5)              │
│ Q5: Creativity (rating 1-5)                        │
│ Q6: Career motivation (single select)              │
│ Q7: Work environment preference (single select)    │
│ Q8: Team vs solo (single select)                   │
│ Q9: Salary expectations (range)                    │
│ Q10: Domain interests (multi-select)               │
│ Q11-12+: Additional profile questions              │
├──────────────┤
│ [SUBMIT] ───> Backend processes                    │
│              ├─> careerEngine scores answers        │
│              ├─> Gemini AI explains careers          │
│              ├─> Gemini generates roadmap            │
│              ├─> Creates GoalContracts               │
│              └─> Returns results to frontend         │
└──────────────┘
```

---

## Flow 5: Dashboard Features (Post-Login)

```
┌─────────────────────────────────────────────────────────┐
│                    DASHBOARD                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──── Career Matches ────┐  ┌──── Market Brief ────┐  │
│  │ Top 5 careers with     │  │ Domain trends        │  │
│  │ match %, salary, growth│  │ Delta summary        │  │
│  └────────────────────────┘  │ Recommendations      │  │
│                               └──────────────────────┘  │
│  ┌──── Job Comparison ────┐  ┌──── Auto-Scout ──────┐  │
│  │ Paste JD -> analyze    │  │ AI finds relevant    │  │
│  │ Matches/Gaps/Suggest   │  │ jobs automatically   │  │
│  └────────────────────────┘  └──────────────────────┘  │
│                                                          │
│  ┌──── Active Roadmap ────┐  ┌──── Micro-Coach ─────┐  │
│  │ Milestone list         │  │ Skill tasks          │  │
│  │ Status tracking        │  │ Quick exercises      │  │
│  └────────────────────────┘  └──────────────────────┘  │
│                                                          │
│  ┌──── AI Mentor Chat ────┐  ┌──── Profile/Stats ───┐  │
│  │ Career / Interview /   │  │ Progress metrics     │  │
│  │ Scholarship guidance   │  │ Assessments, Jobs,   │  │
│  │ Multi-round chat       │  │ Milestones           │  │
│  └────────────────────────┘  └──────────────────────┘  │
│                                                          │
│  [LEARN]  [INTERVIEW]  [PORTFOLIO]  [LOGOUT]            │
└─────────────────────────────────────────────────────────┘
```

---

## Flow 6: Interview Practice

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Interview   │────>│  Session     │────>│  Answer      │────>│  Session     │
│  Page        │     │  Setup       │     │  Questions   │     │  Complete    │
├──────────────┤     ├──────────────┤     ├──────────────┤     ├──────────────┤
│ Stats:       │     │ Type:        │     │ Q displayed  │     │ Overall     │
│ - Sessions   │     │ - Technical  │     │ Text area    │     │ score       │
│ - Avg Score  │     │ - Behavioral │     │ [Submit]     │     │ Feedback    │
│ - Questions  │     │ - Coding     │     │   ↓          │     │ Per-Q       │
│ - Improvement│     │ - Sys Design │     │ AI scores    │     │ scores      │
│              │     │ Difficulty:  │     │ feedback     │     │             │
│ [Start New]  │     │ Easy/Med/Hard│     │ strengths    │     │ [View       │
│              │     │ Target Role  │     │ improvements │     │  History]   │
│ Past sessions│     │ [START]      │     │ [Next Q]     │     │             │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## Flow 7: Portfolio Analysis

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────────────────┐
│  Portfolio   │────>│  Analyzing   │────>│  Results                     │
│  Page        │     │  ...         │     ├──────────────────────────────┤
├──────────────┤     │              │     │ Scores: Overall, Code,       │
│ GitHub user  │     │ Fetching     │     │ Diversity, Contribution      │
│ input        │     │ repos from   │     │                              │
│ Target role  │     │ GitHub API   │     │ AI Summary + Developer Type  │
│ (optional)   │     │ Running AI   │     │ Achievement Badges           │
│              │     │ analysis     │     │ Repo Breakdown               │
│ [ANALYZE]    │     │              │     │ Strengths (green)            │
│              │     │              │     │ Weaknesses (orange)          │
│ Stats:       │     │              │     │ Recommendations (priority)   │
│ Past analyses│     │              │     │ Project Ideas (tech stack)   │
└──────────────┘     └──────────────┘     └──────────────────────────────┘
```

---

## Flow 8: Learning Hub

```
┌───────────────────────────────────────────────────────────────────┐
│                        LEARN PAGE                                  │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─── Stats Cards ──────────────────────────────────────────┐     │
│  │ Enrolled | Completed | In Progress | Overall %           │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                    │
│  ┌─── AI Quick Actions ────────────────────────────────────┐      │
│  │ [Concept Explainer] [Quiz Gen] [Insights] [NSQF]       │      │
│  │         ↓                ↓          ↓         ↓          │      │
│  │    Opens Modal      Opens Modal Opens Modal Opens Modal  │      │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                    │
│  ┌─── Next Best Action ────────────────────────────────────┐      │
│  │ AI recommendation with reasoning + resources            │      │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                    │
│  ┌─── Career Roadmap Progress ─────────────────────────────┐      │
│  │ 8-step visual journey tracker                           │      │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                    │
│  ┌─── Skills Progress ─────────────────────────────────────┐      │
│  │ Skill cards with progress bars + recommended courses    │      │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                    │
│  ┌─── Recommended Courses ─────────────────────────────────┐      │
│  │ Filterable/searchable course grid                       │      │
│  └──────────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────────┘
```

---

## Flow 9: NSQF Vocational Pathway

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────────────┐
│  NSQF Form       │────>│  AI Processing   │────>│  Results                  │
├──────────────────┤     │                  │     ├──────────────────────────┤
│ Education level  │     │ Gemini AI        │     │ Employability Score      │
│ Current NSQF lvl │     │ generates:       │     │ Key Factors              │
│ Target NSQF lvl  │     │ - Pathway        │     │                          │
│ Interests (12)   │     │ - Employment     │     │ Learning Pathway Stages  │
│ Skills (10)      │     │ - Skills gap     │     │ (NSQF levels + courses)  │
│ Location         │     │ - Courses        │     │                          │
│ Experience       │     │                  │     │ Skill Gap Analysis       │
│ Learning mode    │     │                  │     │ (missing + priority)     │
│ Budget           │     │                  │     │                          │
│                  │     │                  │     │ Recommended Courses      │
│ [GENERATE]       │     │                  │     │ (provider, cost, score)  │
└──────────────────┘     └──────────────────┘     └──────────────────────────┘
```
