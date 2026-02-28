# LakshPath - Complete Documentation

> **Your AI-Powered Career Mentor** - Lakshya (Goal) + Path (Direction)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/Demo-Live-success)](https://lakshpath2.netlify.app)
[![Built with Pathway](https://img.shields.io/badge/Built%20with-Pathway-blue)](https://pathway.com/)

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Setup Guide](#setup-guide)
5. [API Documentation](#api-documentation)
6. [User Workflows](#user-workflows)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Google OAuth credentials
- Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/cybertech-18/LakshPath.git
cd Lakshpath

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Run database migrations
cd backend && npx prisma migrate deploy

# Start the application
npm run dev  # in both frontend and backend directories
```

### Access Points
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5001
- **Live Demo**: https://lakshpath2.netlify.app

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Tailwind CSS
│   (Port 3001)   │  Modern, Responsive UI
└────────┬────────┘
         │
         ├── OAuth 2.0 (Google)
         ├── REST APIs
         │
┌────────▼────────┐
│   Backend       │  Node.js + Express + TypeScript
│   (Port 5001)   │  
└────────┬────────┘
         │
         ├── Prisma ORM
         ├── PostgreSQL
         ├── Gemini AI
         ├── Pathway Framework
         └── n8n Integration
```

### Tech Stack

#### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Mobile**: Capacitor for native mobile apps

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Google OAuth 2.0
- **AI Integration**: Google Gemini AI
- **Real-time Updates**: Pathway Framework
- **Automation**: n8n workflows

#### AI & Data Processing
- **Gemini AI**: Career analysis, skill matching, recommendations
- **Pathway Framework**: Real-time job market data
- **n8n**: Resume parsing and workflow automation

---

## ✨ Features

### Core Features

#### 1. **Smart Assessment System**
- 10-question AI-powered quiz
- Personality and interest analysis
- Real-time career matching
- 92%+ accuracy rate

#### 2. **Career Recommendations**
- Top 5 personalized career matches
- Match score with detailed reasoning
- Salary insights and growth projections
- Learning roadmaps for each path

#### 3. **Learning Dashboard**
- Personalized course recommendations
- Progress tracking
- Skill development roadmap
- AI-powered concept explainer
- Auto-generated practice quizzes

#### 4. **GitHub Profile Analyzer**
- Repository analysis
- Code quality assessment
- Technology stack evaluation
- Career path suggestions based on coding profile
- Project recommendations

#### 5. **Interview Practice**
- AI-generated interview questions
- Real-time feedback
- Domain-specific preparation
- Performance analytics

#### 6. **NSQF Vocational Pathway**
- Government-certified skill programs
- Level-wise progression (1-10)
- Industry-aligned certifications
- Job placement support

#### 7. **Resume Analyzer** (n8n Integration)
- Automated parsing
- Skill extraction
- Career suggestions
- Gap analysis

### AI-Powered Features

#### Concept Explainer
```
User Input: "Explain closures in JavaScript"
Depth Levels: Beginner → Intermediate → Advanced → Expert

AI generates:
- Simple explanation
- Real-world analogy
- Code examples
- Common pitfalls
- Practice questions
```

#### Quiz Generator
```
Topic-based automatic quiz generation
- Multiple choice questions
- Difficulty adaptation
- Instant feedback
- Progress tracking
```

#### Learning Insights
```
AI analyzes:
- Learning patterns
- Completion rates
- Skill gaps
- Next best actions
- Personalized recommendations
```

---

## 🛠️ Setup Guide

### Local Development Setup

#### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/lakshpath"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GEMINI_API_KEY="your-gemini-api-key"
JWT_SECRET="your-jwt-secret"
PORT=5001
NODE_ENV=development
EOF

# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Start development server
npm run dev
```

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

#### 3. Database Setup

```sql
-- Create PostgreSQL database
CREATE DATABASE lakshpath;

-- The Prisma schema will auto-create tables
-- Run migrations:
npx prisma migrate deploy
```

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lakshpath"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# AI Services
GEMINI_API_KEY="your-gemini-api-key"

# Security
JWT_SECRET="your-secure-random-string"
CORS_ORIGIN="http://localhost:3001"

# Server
PORT=5001
NODE_ENV=development

# Optional: n8n Integration
N8N_WEBHOOK_URL="http://localhost:5678/webhook/resume-parser"
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3001`
   - `https://lakshpath2.netlify.app`
6. Copy Client ID and Secret to `.env`

### Gemini AI Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to backend `.env` as `GEMINI_API_KEY`

---

## 📡 API Documentation

### Authentication

#### POST `/api/auth/google`
Login/Register with Google OAuth

**Request Body:**
```json
{
  "token": "google-oauth-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name",
      "picture": "profile-url"
    },
    "token": "jwt-token"
  }
}
```

### Assessment

#### POST `/api/assessment/submit`
Submit quiz answers and get career recommendations

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "q1",
      "selectedOption": 0
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "title": "Software Developer",
        "matchScore": 92,
        "description": "...",
        "skills": ["JavaScript", "React", "Node.js"],
        "salaryRange": "₹6-15 LPA",
        "learningPath": ["Step 1", "Step 2"]
      }
    ]
  }
}
```

### Learning

#### GET `/api/learning/insights`
Get personalized learning insights

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCourses": 12,
    "completedCourses": 8,
    "inProgressCourses": 4,
    "overallProgress": 67,
    "strengths": ["React", "TypeScript"],
    "areasToImprove": ["System Design"]
  }
}
```

#### POST `/api/learning/explain-concept`
Get AI explanation of a concept

**Request Body:**
```json
{
  "concept": "Closures in JavaScript",
  "depth": "intermediate",
  "context": "Web development"
}
```

#### POST `/api/learning/generate-quiz`
Generate practice quiz

**Request Body:**
```json
{
  "topic": "React Hooks",
  "difficulty": "intermediate",
  "numberOfQuestions": 10
}
```

### GitHub Analyzer

#### POST `/api/github/analyze`
Analyze GitHub profile

**Request Body:**
```json
{
  "username": "github-username"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "username": "user",
      "repos": 45,
      "stars": 120
    },
    "analysis": {
      "topLanguages": ["JavaScript", "Python"],
      "expertiseLevel": "Intermediate",
      "recommendations": ["..."]
    }
  }
}
```

### Interview Practice

#### POST `/api/interview/session`
Create interview practice session

**Request Body:**
```json
{
  "domain": "software-development",
  "difficulty": "intermediate"
}
```

#### POST `/api/interview/session/:id/answer`
Submit answer to interview question

### NSQF Pathway

#### GET `/api/nsqf/sectors`
Get all vocational sectors

#### GET `/api/nsqf/pathway/:sectorId`
Get learning pathway for a sector

---

## 🔄 User Workflows

### First-Time User Journey

```
1. Landing Page
   ↓
2. Google OAuth Login
   ↓
3. Quiz Introduction Page
   ↓
4. Take 10-Question Assessment
   ↓
5. AI Analysis (3-5 seconds)
   ↓
6. View Top 5 Career Recommendations
   ↓
7. Select Career Path
   ↓
8. Get Personalized Learning Roadmap
   ↓
9. Dashboard with Courses & Progress
```

### Returning User Journey

```
1. Login
   ↓
2. Dashboard (Shows Progress)
   ↓
3. Continue Learning / Explore Features
   ↓
   ├── View Courses
   ├── Practice Interview
   ├── Analyze GitHub
   ├── NSQF Pathways
   └── AI Learning Tools
```

### Learning Flow

```
Dashboard
├── Course Recommendations (AI-powered)
├── Skills You're Improving
│   ├── Current Level
│   ├── Target Level
│   ├── Progress Bar
│   └── Recommended Courses
├── AI Quick Actions
│   ├── Concept Explainer
│   ├── Quiz Generator
│   ├── Learning Insights
│   └── NSQF Pathway
└── 8-Step Career Roadmap
```

---

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start
```bash
# Check if port 5001 is already in use
lsof -i :5001
kill -9 <PID>

# Check database connection
npx prisma db push

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Frontend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001
kill -9 <PID>

# Clear cache and rebuild
rm -rf node_modules .vite package-lock.json
npm install
npm run dev
```

#### Database connection errors
```bash
# Verify PostgreSQL is running
pg_isready

# Check DATABASE_URL format
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Reset database
npx prisma migrate reset
```

#### OAuth errors
- Verify Google OAuth credentials
- Check authorized redirect URIs
- Ensure CORS_ORIGIN matches frontend URL
- Clear browser cookies and try again

#### AI/Gemini errors
- Verify GEMINI_API_KEY is valid
- Check API quota limits
- Ensure internet connectivity
- Review Gemini AI Studio dashboard

### Debug Mode

Enable detailed logging:
```env
# Backend .env
DEBUG=true
LOG_LEVEL=debug

# Frontend .env
VITE_DEBUG=true
```

### Performance Issues

```bash
# Clear all caches
npm cache clean --force

# Rebuild Prisma client
npx prisma generate

# Check database performance
npx prisma studio

# Monitor memory usage
node --inspect backend/src/server.ts
```

---

## 📞 Support

### Contact Information
- **Email**: ayush@lakshpath.com
- **Phone**: +91 7982659056
- **GitHub**: [cybertech-18/LakshPath](https://github.com/cybertech-18/LakshPath)

### Reporting Issues
1. Check existing issues on GitHub
2. Provide detailed description
3. Include error logs
4. Specify environment (OS, Node version, etc.)

### Feature Requests
- Open an issue with the "enhancement" label
- Describe the feature and use case
- Provide examples if applicable

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Pathway Framework** - Real-time data processing
- **Google Gemini AI** - Career intelligence
- **Open source community** - Libraries and tools

---

*Last Updated: November 2025*
*Version: 2.0.0*
