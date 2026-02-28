# LakshPath - Database Schema Reference

**ORM:** Prisma 6.19
**Database:** SQLite (dev), PostgreSQL (production recommended)

---

## Models

### User
Core user model for authentication and profile.

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | String | @id @default(cuid()) | Primary key |
| email | String? | @unique | User email (optional for demo) |
| googleId | String? | @unique | Google OAuth subject ID |
| name | String? | | Display name |
| passwordHash | String? | | For email/password auth |
| role | String | @default("USER") | User role |
| avatarUrl | String? | | Profile picture URL |
| lastLoginAt | DateTime? | | Last login timestamp |
| loginCount | Int | @default(0) | Total login count |
| createdAt | DateTime | @default(now()) | Account creation |
| updatedAt | DateTime | @updatedAt | Last update |

**Relations:** QuizResults, Insights, GoalContracts, JDComparisons, SkillSnapshots, DemoRuns, Roadmaps, LoginLogs, InterviewSessions, PortfolioAnalyses, LinkedInOptimizations

---

### LoginLog
Tracks every login attempt for security auditing.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| userId | String | FK -> User |
| method | String | GOOGLE, EMAIL, or DEMO |
| ipAddress | String? | Client IP |
| userAgent | String? | Browser/device info |
| success | Boolean | Whether login succeeded |
| failReason | String? | Error message if failed |
| createdAt | DateTime | Timestamp |

**Index:** `[userId, createdAt]`

---

### QuizResult
Stores assessment quiz submissions and AI analysis.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| userId | String | FK -> User |
| answers | String | JSON-stringified quiz answers |
| summary | String? | AI-generated profile summary |
| strengths | String? | JSON - identified strengths |
| weaknesses | String? | JSON - identified weaknesses |
| createdAt | DateTime | Submission time |

**Relations:** CareerMatches, LearningRoadmap

---

### CareerMatch
Career recommendations from assessment.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| quizResultId | String | FK -> QuizResult |
| title | String | Career title |
| description | String? | Career description |
| matchScore | Int | 0-100 match percentage |
| avgSalary | String? | Salary range |
| growthRate | String? | Growth projection |
| keySkills | String? | JSON - required skills |
| reason | String? | Why this matches the user |
| createdAt | DateTime | Timestamp |

---

### LearningRoadmap
AI-generated learning plans.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| userId | String | FK -> User |
| quizResultId | String | FK -> QuizResult (unique) |
| title | String | Roadmap title |
| summary | String? | Plan overview |
| duration | String? | Estimated duration |
| source | String | @default("gemini") |
| aiPlan | String? | JSON - structured learning weeks |
| createdAt | DateTime | Timestamp |

**Relations:** Milestones

---

### RoadmapMilestone
Individual steps within a learning roadmap.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| roadmapId | String | FK -> LearningRoadmap |
| title | String | Milestone name |
| description | String? | What to achieve |
| duration | String? | Time estimate |
| resources | String? | JSON - learning resources |
| status | String | PENDING / IN_PROGRESS / COMPLETED |
| position | Int | Order in roadmap |
| createdAt | DateTime | Timestamp |
| updatedAt | DateTime | Last update |

**Relations:** GoalContract (optional)

---

### GoalContract
SMART goals tied to roadmap milestones.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| userId | String | FK -> User |
| milestoneId | String | FK -> RoadmapMilestone (unique) |
| title | String | Goal title |
| successCriteria | String? | What defines success |
| startDate | DateTime? | When to start |
| endDate | DateTime? | Deadline |
| streak | Int | @default(0) - consecutive completions |
| nudges | String? | JSON array - weekly reminders |
| status | String | ACTIVE / COMPLETED |
| createdAt | DateTime | Timestamp |
| updatedAt | DateTime | Last update |

---

### SkillSnapshot
Tracks skill scores over time.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| userId | String | FK -> User |
| skillName | String | Name of the skill |
| score | Float | Current skill score |
| lastRefresh | DateTime | Last update time |
| createdAt | DateTime | Timestamp |

**Unique:** `[userId, skillName]`
**Relations:** MicroTasks

---

### MicroTask
Small learning tasks for skill improvement.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| snapshotId | String | FK -> SkillSnapshot |
| title | String | Task name |
| description | String? | What to do |
| resourceUrl | String? | Learning resource link |
| status | String | PENDING / COMPLETED |
| completedAt | DateTime? | When completed |
| createdAt | DateTime | Timestamp |

---

### JDComparison
Job description analysis results.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| userId | String | FK -> User |
| jobTitle | String | Target job title |
| company | String? | Company name |
| matches | String? | JSON - matching qualifications |
| gaps | String? | JSON - missing qualifications |
| suggestions | String? | JSON - improvement suggestions |
| fastTrack | String? | JSON - quick wins |
| jobMeta | String? | JSON - original JD metadata |
| source | String | MANUAL or API |
| createdAt | DateTime | Timestamp |

---

### MarketSnapshot
Domain market data points.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| domain | String | Career domain |
| payload | String | JSON - market data |
| metadata | String? | JSON - filtering metadata |
| createdAt | DateTime | Timestamp |

---

### MarketBrief
AI-generated market intelligence.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| domain | String | @unique - career domain |
| deltaSummary | String? | Market changes summary |
| recommendations | String? | JSON array - action items |
| snapshotIds | String? | JSON array - history IDs |
| createdAt | DateTime | Timestamp |
| updatedAt | DateTime | Last refresh |

---

### InterviewSession
Interview practice sessions.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| userId | String | FK -> User |
| type | String | TECHNICAL / BEHAVIORAL / SYSTEM_DESIGN / CODING |
| difficulty | String | EASY / MEDIUM / HARD |
| role | String? | Target role for questions |
| status | String | IN_PROGRESS / COMPLETED / ABANDONED |
| overallScore | Int? | 0-100 session score |
| feedback | String? | AI session feedback |
| speechAnalysis | String? | JSON - speech metrics |
| duration | Int? | Session duration (seconds) |
| createdAt | DateTime | Timestamp |
| completedAt | DateTime? | When finished |

**Index:** `[userId, createdAt]`
**Relations:** Questions

---

### InterviewQuestion
Individual questions within an interview session.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| sessionId | String | FK -> InterviewSession |
| question | String | Question text |
| context | String? | Additional context |
| difficulty | String | Question difficulty |
| category | String? | Question category |
| expectedAnswer | String? | Reference answer |
| userAnswer | String? | User's response |
| answerScore | Int? | 0-100 answer score |
| aiFeedback | String? | Detailed AI feedback |
| strengths | String? | JSON - identified strengths |
| improvements | String? | JSON - areas to improve |
| starAnalysis | String? | JSON - STAR method analysis (behavioral) |
| codeQuality | String? | JSON - code assessment (coding) |
| timeTaken | Int? | Response time (seconds) |
| position | Int | Question order |
| createdAt | DateTime | Timestamp |

**Index:** `[sessionId]`

---

### PortfolioAnalysis
GitHub portfolio assessment results.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| userId | String | FK -> User |
| githubUsername | String | GitHub username analyzed |
| targetRole | String? | Role being targeted |
| overallScore | Int | Aggregate portfolio score |
| codeQualityScore | Int? | Code standards score |
| diversityScore | Int? | Technology variety score |
| contributionScore | Int? | Activity/collaboration score |
| summary | String? | AI-generated summary |
| strengths | String? | JSON array |
| weaknesses | String? | JSON array |
| recommendations | String? | JSON array |
| missingProjectTypes | String? | JSON - gaps for target role |
| createdAt | DateTime | Timestamp |

**Index:** `[userId, createdAt]`
**Relations:** RepositoryAnalyses

---

### RepositoryAnalysis
Per-repository quality assessment.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| portfolioId | String | FK -> PortfolioAnalysis |
| repoName | String | Repository name |
| language | String? | Primary language |
| stars | Int | @default(0) - star count |
| codeQualityScore | Int? | Repo code quality |
| hasReadme | Boolean | @default(false) |
| hasTests | Boolean | @default(false) |
| hasCi | Boolean | @default(false) |
| readmeQuality | String? | POOR / GOOD / EXCELLENT |
| complexity | String? | LOW / MEDIUM / HIGH |
| improvements | String? | JSON array |
| highlights | String? | JSON array |
| createdAt | DateTime | Timestamp |

**Index:** `[portfolioId]`

---

### LinkedInOptimization
LinkedIn profile improvement suggestions.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| userId | String | FK -> User |
| currentHeadline | String? | Current headline |
| optimizedHeadline | String? | Suggested headline |
| currentAbout | String? | Current about section |
| optimizedAbout | String? | Improved about section |
| currentScore | Int? | Before optimization score |
| optimizedScore | Int? | After optimization score |
| keywords | String? | JSON array - ATS keywords |
| improvements | String? | JSON array - suggestions |
| missingElements | String? | JSON array - missing items |
| status | String | DRAFT / APPLIED / ARCHIVED |
| createdAt | DateTime | Timestamp |
| updatedAt | DateTime | Last update |

**Index:** `[userId, createdAt]`

---

### Insight
General-purpose AI insight and conversation log.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| userId | String | FK -> User |
| source | String | @default("gemini") - AI source |
| type | String | Insight classification |
| content | String | Main content/response |
| metadata | String? | JSON - additional context |
| createdAt | DateTime | Timestamp |

---

### DemoRun
Demo mode session tracking.

| Field | Type | Description |
|---|---|---|
| id | String | Primary key |
| userId | String? | FK -> User (optional) |
| scenario | String | Demo scenario name |
| payload | String? | JSON - demo data |
| createdAt | DateTime | Timestamp |
