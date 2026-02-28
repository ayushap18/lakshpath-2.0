# LakshPath - API Reference

**Base URL:** `http://localhost:5001/api`

---

## Authentication

All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

Endpoints marked with `[Auth]` require authentication.
Endpoints marked with `[OptAuth]` work with or without authentication (demo mode fallback).

---

## Auth Endpoints

### POST /auth/google
Google OAuth sign-in.

**Request:**
```json
{ "credential": "<google_id_token>" }
```

**Response (200):**
```json
{
  "token": "<jwt_token>",
  "user": { "id": "...", "name": "...", "email": "...", "avatarUrl": "..." },
  "isNewUser": true
}
```

### POST /auth/demo
Demo mode sign-in (creates demo@lakshpath.ai user).

**Response (200):**
```json
{
  "token": "<jwt_token>",
  "user": { "id": "...", "name": "Demo Explorer", "email": "demo@lakshpath.ai", "avatarUrl": "..." }
}
```

### GET /auth/me `[Auth]`
Get current authenticated user.

**Response (200):**
```json
{ "id": "...", "name": "...", "email": "...", "avatarUrl": "..." }
```

### POST /auth/logout
Logout (stateless - returns success).

---

## Assessment Endpoints

### POST /assessment `[OptAuth]`
Submit career assessment quiz.

**Request:**
```json
{
  "answers": { "q1": "...", "q2": "...", ... },
  "demo": false,
  "profile": { "name": "...", "education": "...", "interests": ["..."] },
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

**Response (200):** Assessment results with career matches and roadmap.

### GET /assessment/me `[Auth]`
Get authenticated user's latest assessment.

### GET /assessment/:userId
Get user's latest assessment by ID.

### POST /assessment/:userId/micro-tasks
Generate micro-learning tasks from assessment.

---

## Career Endpoints

### GET /careers/matches/:userId
Get career matches from latest assessment.

**Response (200):**
```json
{
  "matches": [
    {
      "title": "Software Engineer",
      "matchScore": 92,
      "avgSalary": "12-25 LPA",
      "growthRate": "High",
      "keySkills": ["JavaScript", "React", "Node.js"],
      "reason": "Strong technical skills align with..."
    }
  ]
}
```

---

## Roadmap Endpoints

### GET /roadmap/:userId
Get active learning roadmap with milestones.

### PATCH /roadmap/milestone/:milestoneId
Update milestone status.

**Request:**
```json
{ "completed": true }
```

---

## Chat Endpoints

### POST /chat/mentor
AI mentor conversation.

**Request:**
```json
{
  "userId": "...",
  "message": "How do I prepare for a frontend interview?",
  "round": "interview",
  "context": {}
}
```

**Response (200):**
```json
{
  "reply": {
    "headline": "...",
    "summary": "...",
    "actionPlan": [{ "title": "...", "detail": "...", "impact": "...", "priority": "high" }],
    "followUps": [{ "question": "...", "why": "..." }],
    "nudges": ["..."],
    "confidence": 0.92
  }
}
```

---

## Jobs Endpoints

### GET /jobs/list
List available jobs. Optional query: `?domain=Technology`

### POST /jobs/compare
Compare user profile against job description.

**Request:**
```json
{
  "userId": "...",
  "jobTitle": "Frontend Developer",
  "company": "Google",
  "jobDescription": "..."
}
```

### GET /jobs/comparisons/:userId
Get user's past job comparisons.

### GET /jobs/auto-scout/:userId
Auto-scout relevant jobs. Optional queries: `?domain=...&limit=3&refresh=true`

---

## Market Endpoints

### GET /market/brief
Get market brief. Optional query: `?domain=Technology`

### GET /market/history
Get market history. Optional queries: `?domain=...&limit=5`

### POST /market/brief/refresh
Refresh market brief for a domain.

---

## User Endpoints `[Auth]`

### GET /user/profile
Get user profile with latest assessment and active roadmap.

### PATCH /user/profile
Update profile.

**Request:**
```json
{ "name": "New Name", "avatarUrl": "https://..." }
```

### GET /user/progress
Get progress stats.

**Response (200):**
```json
{
  "stats": {
    "assessmentsCompleted": 1,
    "insightsGenerated": 5,
    "jobsCompared": 3,
    "milestones": { "total": 8, "completed": 3, "inProgress": 1, "pending": 4 }
  }
}
```

---

## Interview Endpoints `[OptAuth]`

### POST /interview/start
Start interview session.

**Request:**
```json
{ "type": "TECHNICAL", "difficulty": "MEDIUM", "role": "Frontend Developer" }
```

### POST /interview/answer
Submit answer.

**Request:**
```json
{ "questionId": "...", "answer": "...", "timeTaken": 120 }
```

### POST /interview/:sessionId/complete
Complete session. Optional: `{ "speechTranscript": "..." }`

### GET /interview/:sessionId
Get session details.

### GET /interview/:sessionId/next
Get next question in session.

### GET /interview/sessions
List sessions. Optional: `?limit=10`

### GET /interview/stats
Get interview statistics.

---

## Enhanced Interview Endpoints `[Auth]`

### GET /interview-enhanced/categories
Get question categories.

### POST /interview-enhanced/code-review
AI code review.

**Request:**
```json
{ "sessionId": "...", "questionId": "...", "code": "...", "language": "javascript" }
```

### POST /interview-enhanced/hint
Get progressive hint (levels 1-4).

**Request:**
```json
{ "questionId": "...", "hintLevel": 1, "currentCode": "..." }
```

### POST /interview-enhanced/follow-up-questions
Generate follow-up questions.

### GET /interview-enhanced/questions/category/:category
Filter questions. Optional: `?difficulty=MEDIUM&limit=10`

### GET /interview-enhanced/analytics
Get performance analytics.

---

## Portfolio Endpoints `[OptAuth]`

### POST /portfolio/analyze
Analyze GitHub portfolio.

**Request:**
```json
{ "githubUsername": "octocat", "targetRole": "Full Stack Developer" }
```

### GET /portfolio/analyses
List analyses. Optional: `?limit=10`

### GET /portfolio/stats
Get portfolio statistics.

### GET /portfolio/:analysisId
Get specific analysis.

### DELETE /portfolio/:analysisId
Delete analysis.

---

## Learning Enhanced Endpoints `[Auth]`

### POST /learning-enhanced/path
Generate personalized learning path.

### POST /learning-enhanced/explain
Explain concept at depth level.

**Request:**
```json
{ "concept": "Binary Search Trees", "depth": "intermediate", "context": "preparing for interviews" }
```

### POST /learning-enhanced/quiz
Generate practice quiz.

**Request:**
```json
{ "topic": "React Hooks", "difficulty": "intermediate", "questionCount": 5, "types": ["multiple_choice", "short_answer"] }
```

### POST /learning-enhanced/assess
Assess quiz answer.

### POST /learning-enhanced/study-plan
Generate study plan.

**Request:**
```json
{ "durationWeeks": 4, "hoursPerWeek": 10, "focusAreas": ["React", "Node.js"] }
```

### POST /learning-enhanced/recommendations
Get resource recommendations.

### GET /learning-enhanced/insights
Get learning progress insights.

### GET /learning-enhanced/next-action
Get next best learning action.

### GET /learning-enhanced/categories
Get all learning categories.

---

## NSQF Endpoints `[OptAuth]`

### POST /nsqf/pathway/generate
Generate NSQF vocational pathway.

### POST /nsqf/employability/predict
Predict employability for sector.

### POST /nsqf/skill-gap/analyze
Analyze skill gaps.

### POST /nsqf/courses/recommend
Get NSQF course recommendations.

### POST /nsqf/career/forecast
Get career progression forecast.

### POST /nsqf/schemes/applicable
Get applicable government schemes.

### POST /nsqf/skills/transferable
Identify transferable skills.

### GET /nsqf/sectors
Get all vocational sectors.

### GET /nsqf/level/:level
Get NSQF level information (1-10).

---

## Other Endpoints

### GET /scholarships
List available scholarships.

### POST /demo/run
Run demo scenario.

### GET /insights/:userId
List user insights (max 50).

### GET /health
Health check. Returns `{ "status": "ok", "timestamp": "..." }`
