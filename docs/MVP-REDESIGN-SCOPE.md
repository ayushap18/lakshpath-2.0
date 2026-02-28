# LakshPath - MVP Redesign Scope

This document identifies the **core MVP features** vs. **secondary features** to help prioritize a redesign from scratch.

---

## Tier 1: Core MVP (Must-Have)

These features form the essential loop of the product. Without them, the product has no value.

| # | Feature | Why It's Core |
|---|---|---|
| 1 | **Google OAuth Login** | Entry point, identity, frictionless sign-in |
| 2 | **Demo/Guest Mode** | Lets users explore without commitment |
| 3 | **Career Assessment Quiz** | The foundational data collection that powers everything |
| 4 | **AI Career Matching** | Core value prop - top 5 career recommendations |
| 5 | **Learning Roadmap** | Actionable next step after career discovery |
| 6 | **Milestone Tracking** | Progress visibility keeps users engaged |
| 7 | **Dashboard** | Central hub showing recommendations + progress |
| 8 | **User Profile + Progress Stats** | Basic account management |

**Estimated scope:** 8 features, ~5 frontend pages, ~6 API endpoints

---

## Tier 2: High-Value Additions

These features significantly enhance the product but are not strictly required for a working MVP.

| # | Feature | Value Add |
|---|---|---|
| 9 | **AI Mentor Chat** | 24/7 guidance keeps users engaged, reduces drop-off |
| 10 | **Job Market Intelligence** | Real-world data makes recommendations credible |
| 11 | **Job Comparison** | Practical tool for active job seekers |
| 12 | **Interview Practice (Basic)** | Natural next step after career selection |
| 13 | **Micro-Coach Tasks** | Bite-sized actions improve retention |

---

## Tier 3: Differentiation Features

These are unique features that differentiate LakshPath from competitors.

| # | Feature | Differentiator |
|---|---|---|
| 14 | **Auto-Scout Jobs** | Proactive job discovery (not just reactive search) |
| 15 | **NSQF Vocational Pathways** | India-specific vocational guidance (unique in market) |
| 16 | **Government Scheme Discovery** | PMKVY, NAPS, DDU-GKY awareness |
| 17 | **Portfolio Analysis (GitHub)** | Developer-focused career proof |

---

## Tier 4: Advanced/Enhancement Features

Nice to have, but can be added post-launch.

| # | Feature | Notes |
|---|---|---|
| 18 | Enhanced Interview (code review, hints, follow-ups) | Power-user feature |
| 19 | Learning Hub (concept explainer, quiz gen, study plans) | Large scope |
| 20 | LinkedIn Optimization | Not implemented in frontend yet |
| 21 | Speech Analysis | Requires audio input, complex UX |
| 22 | Email Notifications | Backend-only, no user-facing controls |
| 23 | SMART Goal Contracts | Complex goal framework |
| 24 | Scholarship Listings | Currently hardcoded data |

---

## Recommended MVP Page Structure

```
/                    Landing Page
/login               Google OAuth + Demo Login
/assessment          Career Quiz (combine intro + quiz)
/dashboard           Career Matches + Roadmap + Progress + Chat
/learn               Learning Roadmap + Milestones (simplified)
/interview           Basic Interview Practice
/portfolio           GitHub Analysis (optional for MVP)
/profile             User Profile + Settings
```

---

## Recommended MVP API Scope

```
POST /auth/google          Google sign-in
POST /auth/demo            Demo sign-in
GET  /auth/me              Current user

POST /assessment           Submit quiz
GET  /assessment/me        Get results

GET  /careers/matches/:id  Career matches
GET  /roadmap/:id          Active roadmap
PATCH /roadmap/milestone/:id  Update milestone

POST /chat/mentor          AI mentor chat

GET  /user/profile         Profile
GET  /user/progress        Progress stats
```

~12 endpoints for a functional MVP.

---

## Key Redesign Considerations

### Architecture
- Keep the Express + Prisma backend (stable, well-structured)
- Consider upgrading SQLite to PostgreSQL for production
- Frontend pages are too monolithic (Dashboard: 1000+ lines, Learn: 2100+ lines) - break into smaller components
- Add proper state management (Zustand or React Context) instead of localStorage-only

### UI/UX
- Current design: dark theme, glassmorphism, sharp edges
- Consider: more accessible color contrast, better mobile navigation
- Break large pages into tabs or sub-routes
- Add proper loading states and error boundaries
- Consider onboarding tour for first-time users

### Technical Debt
- `firebase` dependency is unused - remove it
- Registration page uses mock auth - either implement or remove
- No global state management - add Zustand or similar
- No test files in the codebase - add testing from the start
- No TypeScript strict mode
- Large page components need decomposition

### Mobile
- Capacitor setup exists but BottomNav component is minimal
- Need proper mobile navigation patterns
- Safe area handling needs expansion
- Consider PWA as alternative to native apps for MVP
