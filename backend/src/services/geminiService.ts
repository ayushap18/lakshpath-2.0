import { VertexAI } from '@google-cloud/vertexai';

import env from '@config/env';
import {
  CareerExplanationRequest,
  CareerExplanationResponse,
  RoadmapRequest,
  RoadmapResponse,
  GoalSuccessCriteriaRequest,
  GoalSuccessCriteriaResponse,
  JDComparatorRequest,
  JDComparatorResponse,
  SkillMicroTaskRequest,
  SkillMicroTaskResponse,
  MentorChatRequest,
  MentorChatResponse,
  MarketBriefResponse,
  InterviewQuestionGenerationRequest,
  InterviewQuestionGenerationResponse,
  InterviewAnswerEvaluationRequest,
  InterviewAnswerEvaluationResponse,
  SpeechAnalysisRequest,
  SpeechAnalysisResponse,
  PortfolioAnalysisRequest,
  PortfolioAnalysisResponse,
  LinkedInOptimizationRequest,
  LinkedInOptimizationResponse,
  CodingQuestionGenerationRequest,
  CodingQuestionGenerationResponse,
  CodeAnalysisRequest,
  CodeAnalysisResponse,
} from '@shared-types/ai';
import { AppError } from '@middleware/errorHandler';

export interface GeminiResult<T> {
  prompt: string;
  raw: string;
  parsed: T;
}

// Vertex AI Gemini — uses GCP service account (ADC).
// Cloud Run's default compute SA has roles/aiplatform.user.
// Billing is charged to the GCP billing account (uses your $20 credits).
const vertexAI = new VertexAI({ project: env.GCP_PROJECT_ID, location: env.GCP_REGION });

type GeminiCallOptions = {
  responseMimeType?: string;
  temperature?: number;
};

const parseJson = <T>(rawText: string): T => {
  try {
    const cleaned = rawText
      .replace(/^```json/gm, '')
      .replace(/```$/gm, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (error) {
    throw new AppError('Failed to parse Gemini response', 502, error);
  }
};

const callGemini = async (prompt: string, options?: GeminiCallOptions, retries = 2) => {
  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const model = vertexAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        generationConfig: {
          ...(options?.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
          ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
        },
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new AppError('Empty response from Gemini', 502);
      return text;
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error (429)
      const isRateLimit = error?.status === 429 || error?.statusCode === 429 ||
                         error?.message?.includes('429') || error?.message?.includes('quota');

      if (isRateLimit) {
        // Daily quota exhausted — no point retrying, fail fast
        const isDailyQuota = error?.message?.includes('PerDay') || error?.message?.includes('per_day');
        if (isDailyQuota || attempt >= retries) {
          throw new AppError('AI service quota reached. Please try again later.', 429, error);
        }
        // Per-minute quota — wait briefly then retry (cap at 8s to stay within Cloud Run timeout)
        const waitTime = Math.min(Math.pow(2, attempt) * 1500, 8000);
        console.log(`[Gemini] Rate limit hit, retrying in ${waitTime}ms (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // If not rate limit or out of retries, throw error
      break;
    }
  }

  // If we get here, all retries failed
  if (lastError instanceof AppError) throw lastError;
  throw new AppError('Gemini API error', 502, lastError);
};

export const geminiService = {
  async explainCareers(payload: CareerExplanationRequest): Promise<GeminiResult<CareerExplanationResponse>> {
    const prompt = `You are an AI career coach. Given the student's profile and their top matches, explain why each career fits.
Return JSON with this shape:
{
  "careers": [
    {
      "title": "",
      "whyItFits": "",
      "strengths": [],
      "weaknesses": [],
      "personalizedAdvice": ""
    }
  ]
}

PROFILE: ${JSON.stringify(payload.profile, null, 2)}
QUIZ_INSIGHTS: ${JSON.stringify(payload.quizInsights, null, 2)}
TOP_CAREERS: ${JSON.stringify(payload.topCareers, null, 2)}
`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
    return { prompt, raw, parsed: parseJson<CareerExplanationResponse>(raw) };
  },

  async generateRoadmap(payload: RoadmapRequest): Promise<GeminiResult<RoadmapResponse>> {
    const prompt = `Design a month-wise ${payload.durationMonths ?? 6}-month learning roadmap for a ${payload.seniority} aiming to become ${payload.careerTitle}.
Return JSON with:
{
  "headline": "",
  "months": [
    { "month": 1, "theme": "", "skills": [], "resources": [], "project": "" }
  ]
}

PROFILE: ${JSON.stringify(payload.profile, null, 2)}
`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
    return { prompt, raw, parsed: parseJson<RoadmapResponse>(raw) };
  },

  async goalSuccessCriteria(payload: GoalSuccessCriteriaRequest): Promise<GeminiResult<GoalSuccessCriteriaResponse>> {
    const prompt = `Craft SMART success criteria and weekly nudges for this milestone.
Return JSON with { "successCriteria": "", "weeklyNudges": [] }
MILESTONE: ${JSON.stringify(payload, null, 2)}
`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
    return { prompt, raw, parsed: parseJson<GoalSuccessCriteriaResponse>(raw) };
  },

  async compareJobDescription(payload: JDComparatorRequest): Promise<GeminiResult<JDComparatorResponse>> {
    const prompt = `Compare this job description with the student's profile and roadmap.
Return JSON { "summary": "", "matches": [], "gaps": [], "fastTrackMilestones": [], "suggestions": [] }
JOB: ${JSON.stringify(payload, null, 2)}
`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
    return { prompt, raw, parsed: parseJson<JDComparatorResponse>(raw) };
  },

  async recommendMicroTasks(payload: SkillMicroTaskRequest): Promise<GeminiResult<SkillMicroTaskResponse>> {
    const prompt = `For each weak skill, create a sentiment and three bite-sized learning tasks.
Return JSON { "heatmap": [{"name":"","score":0,"sentiment":""}], "microTasks": [{"skill":"","title":"","description":"","resourceUrl":""}] }
WEAK_SKILLS: ${JSON.stringify(payload.weakSkills, null, 2)}
`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
    return { prompt, raw, parsed: parseJson<SkillMicroTaskResponse>(raw) };
  },

  async mentorChat(payload: MentorChatRequest): Promise<GeminiResult<MentorChatResponse>> {
    const prompt = `You are "Laksh", a warm, experienced AI Career Mentor. You know this user deeply and provide personalized guidance.

CONVERSATION TYPE: ${payload.round}

USER CONTEXT:
${JSON.stringify(payload.context, null, 2)}

YOUR PERSONALITY:
- Warm and conversational (like talking to a friend who's also a career expert)
- Insightful (notice patterns and connect dots from their journey)
- Actionable (always give concrete next steps)
- Encouraging but honest (celebrate wins, address gaps truthfully)
- Adaptive (match tone to user's needs and message type)

RESPONSE GUIDELINES:
1. If they're greeting you (hi, hello, hey), be warm and give a quick status update
2. For specific questions, provide detailed, actionable guidance
3. Always reference their actual skills, progress, and goals (not generic advice)
4. Action plans should be specific to THEIR situation
5. Nudges should be micro-actions they can do TODAY
6. Follow-ups should push their thinking forward
7. Keep summary conversational (like you're speaking, not writing an essay)

Return strict JSON:
{
  "headline": string,
  "summary": string,
  "actionPlan": [
    { "title": string, "detail": string, "impact": string, "priority": "low" | "medium" | "high" }
  ],
  "followUps": [
    { "question": string, "why": string }
  ],
  "nudges": string[],
  "confidence": number between 0 and 1,
  "references": string[],
  "tone": "supportive" | "challenging" | "encouraging" | "direct"
}

USER MESSAGE: ${payload.message}

Respond as Laksh, their dedicated mentor who truly knows their journey. Make them feel seen and motivated.`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.8 });
    return { prompt, raw, parsed: parseJson<MentorChatResponse>(raw) };
  },

  async marketBrief(payload: { snapshots: string[] }): Promise<GeminiResult<MarketBriefResponse>> {
    const prompt = `Summarize these labor market signals in under 120 words with three recommendations.
Return JSON { "title": "", "deltaSummary": "", "recommendations": [] }
DATA: ${JSON.stringify(payload.snapshots, null, 2)}
`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
    return { prompt, raw, parsed: parseJson<MarketBriefResponse>(raw) };
  },

  // ============================================
  // INTERVIEW PRACTICE AI METHODS
  // ============================================

  async generateInterviewQuestions(payload: InterviewQuestionGenerationRequest): Promise<GeminiResult<InterviewQuestionGenerationResponse>> {
    const count = payload.count || 5;
    const prompt = `You are an expert technical interviewer. Generate ${count} ${payload.difficulty} ${payload.type} interview questions for a ${payload.role || 'Software Engineer'} role.

${payload.profile ? `CANDIDATE PROFILE: ${JSON.stringify(payload.profile, null, 2)}` : ''}

Return JSON with this structure:
{
  "questions": [
    {
      "questionText": "",
      "questionType": "${payload.type}",
      "difficulty": "${payload.difficulty}",
      "expectedAnswer": "",
      "evaluationCriteria": [],
      "hints": []
    }
  ]
}

GUIDELINES:
- For TECHNICAL: focus on concepts, algorithms, system design
- For BEHAVIORAL: use STAR method scenarios (Situation, Task, Action, Result)
- For CODING: include problem statement, constraints, examples
- For SYSTEM_DESIGN: real-world scalability problems
- Make questions relevant to the candidate's level and profile
- Expected answers should be comprehensive but concise
- Include 2-3 evaluation criteria per question
`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
    return { prompt, raw, parsed: parseJson<InterviewQuestionGenerationResponse>(raw) };
  },

  async evaluateInterviewAnswer(payload: InterviewAnswerEvaluationRequest): Promise<GeminiResult<InterviewAnswerEvaluationResponse>> {
    const prompt = `You are an expert interviewer evaluating a candidate's answer. Be constructive but honest.

QUESTION: ${payload.questionText}
QUESTION TYPE: ${payload.questionType}
${payload.expectedAnswer ? `EXPECTED ANSWER: ${payload.expectedAnswer}` : ''}
USER'S ANSWER: ${payload.userAnswer}
${payload.profile ? `CANDIDATE PROFILE: ${JSON.stringify(payload.profile, null, 2)}` : ''}

Return JSON with this structure:
{
  "score": 0-100,
  "feedback": "",
  "strengths": [],
  "improvements": [],
  ${payload.questionType === 'BEHAVIORAL' ? `"starAnalysis": {
    "situation": "",
    "task": "",
    "action": "",
    "result": "",
    "score": 0-100
  },` : ''}
  ${payload.questionType === 'CODING' ? `"codeQuality": {
    "timeComplexity": "",
    "spaceComplexity": "",
    "codeStyle": "",
    "edgeCases": [],
    "score": 0-100
  }` : ''}
}

EVALUATION CRITERIA:
- Accuracy and completeness
- Communication clarity
- Problem-solving approach
- Technical depth
${payload.questionType === 'BEHAVIORAL' ? '- STAR method structure (Situation, Task, Action, Result)' : ''}
${payload.questionType === 'CODING' ? '- Code efficiency, readability, edge case handling' : ''}
`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
    return { prompt, raw, parsed: parseJson<InterviewAnswerEvaluationResponse>(raw) };
  },

  async analyzeSpeech(payload: SpeechAnalysisRequest): Promise<GeminiResult<SpeechAnalysisResponse>> {
    const prompt = `Analyze this interview transcript for speech quality.

TRANSCRIPT: ${payload.transcript}
DURATION: ${payload.duration} seconds

Return JSON:
{
  "confidence": 0-100,
  "fillerWords": [{"word": "", "count": 0}],
  "pace": "TOO_FAST" | "GOOD" | "TOO_SLOW",
  "clarity": 0-100,
  "suggestions": []
}

Analyze:
- Filler words (um, uh, like, you know, etc.)
- Speaking pace (words per minute, normal is 130-150)
- Confidence indicators (hesitations, incomplete thoughts)
- Clarity (sentence structure, coherence)
- Provide 3-5 actionable suggestions
`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
    return { prompt, raw, parsed: parseJson<SpeechAnalysisResponse>(raw) };
  },

  // ============================================
  // PORTFOLIO / GITHUB ANALYSIS AI METHODS
  // ============================================

  async analyzePortfolio(payload: PortfolioAnalysisRequest): Promise<GeminiResult<PortfolioAnalysisResponse>> {
    const prompt = `You are an expert GitHub profile analyzer evaluating a developer's portfolio with high consistency and logical precision.

${payload.repositories ? `REPOSITORIES: ${JSON.stringify(payload.repositories, null, 2)}` : ''}
${payload.profile ? `CANDIDATE PROFILE: ${JSON.stringify(payload.profile, null, 2)}` : ''}

Your evaluation must be based on 10 weighted parameters, each contributing up to 10 points (for a total score out of 100).

Return JSON:
{
  "overallScore": 0-100,
  "codeQualityScore": 0-100,
  "diversityScore": 0-100,
  "contributionScore": 0-100,
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "missingProjectTypes": [],
  "recommendations": [
    {
      "title": "",
      "priority": "LOW" | "MEDIUM" | "HIGH",
      "description": "",
      "impact": ""
    }
  ],
  "repositoryInsights": [
    {
      "repoName": "",
      "score": 0-100,
      "codeQualityScore": 0-100,
      "complexity": "LOW" | "MEDIUM" | "HIGH",
      "readmeQuality": "POOR" | "GOOD" | "EXCELLENT",
      "improvements": [],
      "highlights": []
    }
  ],
  "projectIdeas": [
    {
      "title": "",
      "description": "",
      "techStack": [],
      "impact": ""
    }
  ],
  "developerType": "",
  "tag": {
    "tagName": "",
    "description": ""
  }
}

SCORING METHOD (10 parameters × 10 points each):
1. Repository Quality – based on code quality, stars, forks, and activity (0-10)
2. Repository Diversity – variety in domains, languages, and frameworks used (0-10)
3. Profile Completeness – presence of bio, avatar, and external links (0-10)
4. Popularity – followers, stars, forks, and engagement (0-10)
5. Contribution Activity – frequency and consistency of commits or pull requests (0-10)
6. Documentation & Descriptions – presence and clarity of repo descriptions or READMEs (0-10)
7. Project Impact – originality, public utility, or technical depth (0-10)
8. Skill Representation – clarity and balance of tech stack across repositories (0-10)
9. Professional Presence – presence of pinned repos, portfolio link, and profile readability (0-10)
10. Community Involvement – collaborations, contributions to others' projects, or open-source participation (0-10)

RULES:
- Each parameter is rated from 0 to 10, sum gives the final score out of 100
- Use fixed threshold-based evaluation for consistency. Do not vary scores randomly
- Apply a ±1 variation only when metrics are borderline (never exceed ±1 total variation)
- If data for a parameter is missing, give 0–2 points and mention it in weaknesses
- Use a constructive, analytic tone; never generic or repetitive
- Never invent data — base insights strictly on provided GitHub data
- Always return valid, complete JSON
- Project ideas should be new, non-repetitive, and complement existing portfolio
- Developer type should be inferred from tech stack, repositories, and activeness (e.g., tech explorer, frontend dev, backend dev, fullstack dev, ML engineer, DevOps engineer, mobile dev, game dev, etc.)
- Tag should be a sarcastic or funny tag based on the user profile with a short explanation
- Provide 3 specific project ideas that would strengthen their portfolio for ${payload.targetRole || 'their career goals'}
`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
    return { prompt, raw, parsed: parseJson<PortfolioAnalysisResponse>(raw) };
  },

  // ============================================
  // LINKEDIN PROFILE OPTIMIZER AI METHODS
  // ============================================

  async optimizeLinkedInProfile(payload: LinkedInOptimizationRequest): Promise<GeminiResult<LinkedInOptimizationResponse>> {
    const prompt = `You are a professional career coach and LinkedIn expert. Optimize this profile for a ${payload.targetRole || 'Software Engineer'} role${payload.targetIndustry ? ` in ${payload.targetIndustry}` : ''}.

CURRENT PROFILE:
${payload.currentHeadline ? `Headline: ${payload.currentHeadline}` : 'No headline'}
${payload.currentAbout ? `About: ${payload.currentAbout}` : 'No about section'}
${payload.currentExperience ? `Experience: ${JSON.stringify(payload.currentExperience, null, 2)}` : 'No experience'}
${payload.skills ? `Skills: ${payload.skills.join(', ')}` : 'No skills listed'}
${payload.profile ? `Additional Context: ${JSON.stringify(payload.profile, null, 2)}` : ''}

Return JSON:
{
  "optimizedHeadline": "",
  "optimizedAbout": "",
  ${payload.currentExperience ? `"optimizedExperience": [
    {
      "title": "",
      "company": "",
      "duration": "",
      "optimizedDescription": "",
      "optimizedAchievements": [],
      "improvements": []
    }
  ],` : ''}
  "keywords": [],
  "overallScore": 0-100,
  "beforeScore": 0-100,
  "afterScore": 0-100,
  "improvements": [
    {
      "category": "",
      "before": "",
      "after": "",
      "reason": ""
    }
  ],
  "missingElements": [],
  "atsOptimizationTips": []
}

OPTIMIZATION GUIDELINES:
- Headline: Include role, key skills, value proposition (120 chars max)
- About: Engaging story, achievements, call-to-action (2000 chars max)
- Experience: Start with action verbs, quantify achievements, show impact
- Keywords: ATS-optimized keywords for target role
- Use industry-standard terminology
- Highlight results and metrics (increased X by Y%)
- Make it human and authentic, not robotic
- Ensure it passes ATS (Applicant Tracking Systems)
`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
    return { prompt, raw, parsed: parseJson<LinkedInOptimizationResponse>(raw) };
  },

  // ============================================
  // ENHANCED INTERVIEW PRACTICE AI METHODS
  // ============================================

  async reviewCode(code: string, questionText: string, language: string): Promise<GeminiResult<any>> {
    const prompt = `You are an expert technical interviewer reviewing code during a live interview.

QUESTION: ${questionText}
USER'S CODE:
\`\`\`${language}
${code}
\`\`\`

Provide a comprehensive code review as JSON with this EXACT structure:
{
  "overallScore": 0-100,
  "issues": [
    {
      "type": "bug" | "performance" | "style" | "logic" | "security",
      "severity": "low" | "medium" | "high" | "critical",
      "line": line_number_or_null,
      "message": "clear description of the issue",
      "suggestion": "how to fix it"
    }
  ],
  "suggestions": ["optimization tip 1", "optimization tip 2", ...],
  "complexity": {
    "time": "O(n) notation",
    "space": "O(n) notation", 
    "explanation": "brief explanation of complexity"
  },
  "interviewerFeedback": "What a real interviewer would say about this solution (2-3 sentences, constructive)",
  "strengths": ["strength 1", "strength 2", ...],
  "improvements": ["improvement area 1", "improvement area 2", ...]
}

EVALUATION CRITERIA:
- Correctness: Does it solve the problem?
- Efficiency: Time and space complexity
- Code Quality: Readability, naming, structure
- Edge Cases: Handles nulls, empty inputs, boundaries?
- Best Practices: Follows language conventions?
- Interview Skills: Would this impress an interviewer?

Be constructive but honest. Focus on what matters in an interview setting.`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.7 });
    return { prompt, raw, parsed: parseJson<any>(raw) };
  },

  async generateHint(questionText: string, hintLevel: 1 | 2 | 3 | 4, currentCode?: string): Promise<GeminiResult<{ content: string }>> {
    const hintLevelGuide = {
      1: 'Very subtle hint, no code, just a thought direction (1-2 sentences)',
      2: 'Key concept or data structure to use, no implementation details',
      3: 'Step-by-step approach, pseudocode allowed, but no actual code',
      4: 'Full solution explanation with code structure and logic',
    };

    const prompt = `You are a helpful interview coach providing a Level ${hintLevel} hint.

QUESTION: ${questionText}
${currentCode ? `CURRENT CODE:\n\`\`\`\n${currentCode}\n\`\`\`\n` : ''}

Provide a hint at Level ${hintLevel} difficulty:
${hintLevelGuide[hintLevel]}

Return JSON:
{
  "content": "The hint text (can include markdown formatting)"
}

Make it educational and encouraging. Help them learn, don't just give the answer (except Level 4).`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.8 });
    return { prompt, raw, parsed: parseJson<{ content: string }>(raw) };
  },

  async generateFollowUpQuestions(
    questionText: string,
    userAnswer: string,
    code?: string
  ): Promise<GeminiResult<Array<{ question: string; purpose: string; expectedTopics: string[] }>>> {
    const prompt = `You are a technical interviewer. The candidate just solved a coding problem. Generate 5 follow-up questions.

ORIGINAL QUESTION: ${questionText}
USER'S ANSWER: ${userAnswer}
${code ? `USER'S CODE:\n\`\`\`\n${code}\n\`\`\`\n` : ''}

Generate 5 follow-up questions that:
1. Probe deeper into their solution
2. Test edge cases they might have missed
3. Explore optimizations
4. Check understanding of concepts used
5. Challenge them with variations

Return JSON array:
[
  {
    "question": "The follow-up question",
    "purpose": "Why you're asking this (not shown to candidate)",
    "expectedTopics": ["topic1", "topic2"]
  }
]

Make questions progressive in difficulty. Be a realistic interviewer.`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.8 });
    return { prompt, raw, parsed: parseJson<Array<{ question: string; purpose: string; expectedTopics: string[] }>>(raw) };
  },

  // ============================================
  // LEARNING ENHANCEMENT AI METHODS
  // ============================================

  async generateLearningPath(payload: {
    userId: string;
    careerGoal: string;
    currentSkills: Array<{ name: string; level: number }>;
    targetSkills: Array<{ name: string; targetLevel: number }>;
    timeCommitment: string;
    learningStyle: string;
    userContext: any;
  }): Promise<any> {
    const prompt = `You are an AI learning path designer. Create a personalized, structured learning journey.

USER PROFILE:
- Career Goal: ${payload.careerGoal}
- Time Commitment: ${payload.timeCommitment}
- Learning Style: ${payload.learningStyle}
- User Context: ${JSON.stringify(payload.userContext, null, 2)}

CURRENT SKILLS:
${JSON.stringify(payload.currentSkills, null, 2)}

TARGET SKILLS:
${JSON.stringify(payload.targetSkills, null, 2)}

Design a comprehensive learning path with:
1. Clear phases (beginner → intermediate → advanced)
2. Specific milestones with target dates
3. Practical projects for each phase
4. Resource recommendations
5. Prerequisites and expected outcomes

Return JSON:
{
  "pathId": "unique-id",
  "title": "Professional title for the path",
  "description": "Clear explanation of what they'll achieve",
  "estimatedDuration": "e.g., 6 months",
  "phases": [
    {
      "phaseNumber": 1,
      "title": "Phase name",
      "duration": "4 weeks",
      "skills": ["skill1", "skill2"],
      "topics": ["topic1", "topic2"],
      "resources": [
        {
          "title": "Resource name",
          "type": "video|article|course|book|tutorial|documentation",
          "url": "url or null",
          "platform": "Platform name",
          "duration": "estimated time",
          "difficulty": "beginner|intermediate|advanced|expert",
          "rating": 4.5,
          "cost": "free|paid",
          "aiReasoning": "Why this resource is perfect for you",
          "relevanceScore": 95
        }
      ],
      "projects": [
        {
          "title": "Project name",
          "description": "What to build",
          "difficulty": "beginner|intermediate|advanced",
          "estimatedTime": "20 hours",
          "skills": ["skills practiced"],
          "features": ["feature1", "feature2"]
        }
      ]
    }
  ],
  "milestones": [
    {
      "id": "m1",
      "title": "Milestone name",
      "description": "What to achieve",
      "targetDate": "2024-03-15",
      "skills": ["skill1"],
      "completionCriteria": ["criterion1", "criterion2"]
    }
  ],
  "prerequisites": ["prerequisite1", "prerequisite2"],
  "outcomes": ["outcome1", "outcome2"]
}

Make it realistic, achievable, and tailored to their learning style.`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.7 });
    return { prompt, raw, parsed: parseJson(raw) };
  },

  async explainConceptWithDepth(payload: {
    concept: string;
    depth: string;
    context?: string;
    userId: string;
  }): Promise<any> {
    const depthDescriptions = {
      beginner: 'Complete novice - use simple language, everyday analogies, no jargon',
      intermediate: 'Has basic understanding - explain mechanisms, some technical terms',
      advanced: 'Strong foundation - deep dive into implementation, edge cases, best practices',
      expert: 'Expert level - architecture, performance implications, trade-offs, research-level insights'
    };

    const prompt = `You are an expert educator explaining: **${payload.concept}**

DEPTH LEVEL: ${payload.depth} (${depthDescriptions[payload.depth as keyof typeof depthDescriptions]})
${payload.context ? `CONTEXT: ${payload.context}` : ''}

Provide a comprehensive explanation tailored to this depth level.

Return JSON:
{
  "concept": "${payload.concept}",
  "depth": "${payload.depth}",
  "summary": "One-sentence summary",
  "explanation": "Detailed explanation (3-5 paragraphs, adjust complexity to depth)",
  "keyPoints": ["point1", "point2", "point3"],
  "examples": [
    {
      "title": "Example title",
      "code": "code snippet if applicable",
      "language": "programming language",
      "explanation": "What this example demonstrates"
    }
  ],
  "analogies": ["analogy1", "analogy2"],
  "commonMistakes": ["mistake1", "mistake2"],
  "relatedConcepts": ["concept1", "concept2"],
  "practiceExercises": ["exercise1", "exercise2"],
  "furtherReading": ["resource1", "resource2"]
}

GUIDELINES:
- ${payload.depth === 'beginner' ? 'Use analogies from everyday life. No assumptions about prior knowledge.' : ''}
- ${payload.depth === 'intermediate' ? 'Explain the "how" and "why". Connect to broader concepts.' : ''}
- ${payload.depth === 'advanced' ? 'Discuss implementation details, performance, design patterns.' : ''}
- ${payload.depth === 'expert' ? 'Cover internals, optimization strategies, research papers, trade-offs.' : ''}
- Provide code examples appropriate to the depth level
- Make it engaging and practical`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.7 });
    return { prompt, raw, parsed: parseJson(raw) };
  },

  async generateQuiz(payload: {
    topic: string;
    difficulty: string;
    questionCount: number;
    types: string[];
    userId: string;
  }): Promise<any> {
    const prompt = `Generate a ${payload.difficulty} quiz on **${payload.topic}** with ${payload.questionCount} questions.

QUESTION TYPES TO INCLUDE: ${payload.types.join(', ')}

Create a balanced quiz that tests understanding at ${payload.difficulty} level.

Return JSON:
{
  "quizId": "unique-id",
  "topic": "${payload.topic}",
  "difficulty": "${payload.difficulty}",
  "estimatedTime": "e.g., 20 minutes",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice|coding|short_answer|true_false",
      "question": "The question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "The correct answer",
      "explanation": "Why this is correct and others are wrong",
      "hints": ["subtle hint", "stronger hint", "almost giving it away"],
      "points": 10,
      "topic": "specific sub-topic"
    }
  ]
}

QUESTION GUIDELINES:
- multiple_choice: 4 options, one correct, plausible distractors
- coding: Small coding challenge with expected output
- short_answer: Open-ended, tests conceptual understanding
- true_false: Include explanation for both true and false

Make questions practical and test real understanding, not just memorization.`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.7 });
    return { prompt, raw, parsed: parseJson(raw) };
  },

  async evaluateLearningAnswer(payload: {
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    topic: string;
    userId: string;
  }): Promise<any> {
    const prompt = `Evaluate this learning quiz answer. Be constructive and educational.

QUESTION: ${payload.question}
CORRECT ANSWER: ${payload.correctAnswer}
USER'S ANSWER: ${payload.userAnswer}
TOPIC: ${payload.topic}

Provide detailed, helpful feedback that helps them learn.

Return JSON:
{
  "questionId": "${payload.questionId}",
  "isCorrect": true|false,
  "score": 0-100,
  "maxScore": 100,
  "feedback": "Immediate feedback (1-2 sentences)",
  "detailedExplanation": "Comprehensive explanation of the concept (2-3 paragraphs)",
  "strengthsIdentified": ["strength1", "strength2"],
  "areasToImprove": ["area1", "area2"],
  "recommendedTopics": ["topic1", "topic2"],
  "nextSteps": ["step1", "step2"]
}

EVALUATION CRITERIA:
- For exact matches (multiple choice, true/false): Binary correct/incorrect
- For coding: Check correctness, code quality, efficiency
- For short answer: Partial credit for correct concepts even if not perfect
- Be encouraging but accurate
- Identify specific knowledge gaps
- Recommend concrete next steps`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.6 });
    return { prompt, raw, parsed: parseJson(raw) };
  },

  async generateStudyPlan(payload: {
    userId: string;
    durationWeeks: number;
    hoursPerWeek: number;
    focusAreas: string[];
    userContext: any;
  }): Promise<any> {
    const totalHours = payload.durationWeeks * payload.hoursPerWeek;
    const prompt = `Create a realistic, structured study plan.

PARAMETERS:
- Duration: ${payload.durationWeeks} weeks
- Time Commitment: ${payload.hoursPerWeek} hours/week (${totalHours} total hours)
- Focus Areas: ${payload.focusAreas.join(', ')}
- User Context: ${JSON.stringify(payload.userContext, null, 2)}

Design a day-by-day study schedule that:
1. Balances theory, practice, and projects
2. Builds progressively in difficulty
3. Includes regular review sessions
4. Has realistic daily time blocks
5. Accounts for weekends

Return JSON:
{
  "planId": "unique-id",
  "userId": "${payload.userId}",
  "startDate": "2024-01-15",
  "endDate": "2024-04-15",
  "dailySchedule": [
    {
      "day": "Monday",
      "date": "2024-01-15",
      "blocks": [
        {
          "time": "6:00 PM - 7:30 PM",
          "duration": "1.5 hours",
          "topic": "JavaScript Fundamentals",
          "activity": "Video course + practice problems",
          "resources": ["resource1", "resource2"]
        }
      ]
    }
  ],
  "weeklyGoals": [
    {
      "weekNumber": 1,
      "goals": ["goal1", "goal2"],
      "skills": ["skill1", "skill2"],
      "projects": ["project1"],
      "checkpoints": ["checkpoint1", "checkpoint2"]
    }
  ],
  "adaptiveRecommendations": [
    "If falling behind: recommendation1",
    "If ahead of schedule: recommendation2",
    "For motivation: recommendation3"
  ]
}

Make it achievable and motivating. Include buffer time for review and catch-up.`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.7 });
    return { prompt, raw, parsed: parseJson(raw) };
  },

  async recommendResources(payload: {
    userId: string;
    topic: string;
    learningStyle: string;
    currentLevel: string;
    preferences: {
      costPreference: string;
      duration: string;
      types: string[];
    };
  }): Promise<any> {
    const prompt = `Recommend learning resources for **${payload.topic}**.

USER PREFERENCES:
- Learning Style: ${payload.learningStyle}
- Current Level: ${payload.currentLevel}
- Cost Preference: ${payload.preferences.costPreference}
- Duration Preference: ${payload.preferences.duration}
- Resource Types: ${payload.preferences.types.join(', ')}

Find the BEST resources that match these preferences.

Return JSON array of resources:
[
  {
    "title": "Resource name",
    "type": "video|article|course|book|tutorial|documentation",
    "url": "actual url or null",
    "platform": "Platform name (YouTube, Udemy, freeCodeCamp, etc.)",
    "duration": "Estimated time",
    "difficulty": "beginner|intermediate|advanced|expert",
    "rating": 4.5,
    "cost": "free|paid",
    "aiReasoning": "Why this is perfect for YOU specifically - reference their learning style, level, preferences",
    "relevanceScore": 0-100
  }
]

GUIDELINES:
- Prioritize high-quality, reputable sources
- Match learning style: ${payload.learningStyle === 'visual' ? 'favor videos, diagrams' : payload.learningStyle === 'reading' ? 'favor articles, documentation' : payload.learningStyle === 'hands-on' ? 'favor interactive tutorials, projects' : 'mix of all types'}
- Consider cost preference: ${payload.preferences.costPreference}
- Provide 8-12 diverse recommendations
- Sort by relevanceScore (highest first)
- Be specific about WHY each resource is recommended
- Include mix of quick wins and deeper dives`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.7 });
    const parsed = parseJson<any[]>(raw);
    return { prompt, raw, parsed };
  },

  async analyzeProgressInsights(payload: {
    userId: string;
    quizResults: any[];
    interviewSessions: any[];
    userProfile: {
      createdAt: Date;
      email: string;
    };
  }): Promise<any> {
    const accountAgeDays = Math.floor((Date.now() - new Date(payload.userProfile.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    
    const prompt = `Analyze this user's learning progress and provide actionable insights.

USER DATA:
- Account Age: ${accountAgeDays} days
- Email: ${payload.userProfile.email}
- Quiz Results: ${payload.quizResults.length} completed
- Interview Sessions: ${payload.interviewSessions.length} completed

QUIZ DATA:
${JSON.stringify(payload.quizResults.slice(0, 10), null, 2)}

INTERVIEW DATA:
${JSON.stringify(payload.interviewSessions.slice(0, 5), null, 2)}

Provide comprehensive learning analytics and insights.

Return JSON:
{
  "overallProgress": 0-100,
  "strengthAreas": [
    {
      "skill": "JavaScript",
      "score": 85,
      "trend": "improving|stable|declining"
    }
  ],
  "improvementAreas": [
    {
      "skill": "Algorithms",
      "gap": 35,
      "suggestions": ["suggestion1", "suggestion2"]
    }
  ],
  "studyPatterns": {
    "averageStudyTime": "2 hours/day",
    "mostProductiveTime": "Evening (6-9 PM)",
    "consistencyScore": 75,
    "streakDays": 12
  },
  "learningVelocity": {
    "conceptsLearnedPerWeek": 8,
    "trend": "increasing|stable|decreasing",
    "comparison": "20% faster than average learner at this level"
  },
  "recommendations": [
    "Spend more time on System Design",
    "Your coding interview skills are strong - focus on behavioral prep",
    "Consider building a project using React + Node.js"
  ],
  "motivationalInsights": [
    "You've completed 12 quizzes this month - that's excellent consistency!",
    "Your JavaScript score improved 25% in 2 weeks",
    "You're in the top 15% of learners for interview practice"
  ]
}

Be specific, encouraging, and data-driven. Help them see their growth and where to focus next.`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.7 });
    return { prompt, raw, parsed: parseJson(raw) };
  },

  // =====================================================
  // NSQF PATHWAY METHODS (Inspired by ShikshaDisha)
  // =====================================================

  async generateNSQFPathway(payload: {
    userId: string;
    profile: any;
    vocationalSectors: any;
  }): Promise<GeminiResult<any>> {
    const prompt = `Generate a personalized NSQF-aligned vocational learning pathway.

USER PROFILE:
- Current Education: ${payload.profile.currentEducationLevel}
- Current NSQF Level: ${payload.profile.currentNSQFLevel}
- Target NSQF Level: ${payload.profile.targetNSQFLevel}
- Interests: ${payload.profile.interests.join(', ')}
- Skills: ${payload.profile.skills.join(', ')}
- Location: ${payload.profile.location}
- Preferred Language: ${payload.profile.preferredLanguage}
- Experience: ${payload.profile.experienceYears} years
- Learning Mode: ${payload.profile.learningMode}
- Budget: ${payload.profile.budget}

VOCATIONAL SECTORS AVAILABLE:
${Object.values(payload.vocationalSectors).join(', ')}

Create a comprehensive NSQF vocational pathway with:
1. Progressive stages from current to target NSQF level
2. Sector-specific skills and competencies
3. Government-recognized certifications
4. Employment opportunities at each stage
5. Salary progression estimates
6. Applicable government schemes

Return JSON:
{
  "pathwayId": "unique_id",
  "title": "Pathway title",
  "description": "Comprehensive description",
  "sector": "Primary sector",
  "startLevel": ${payload.profile.currentNSQFLevel},
  "targetLevel": ${payload.profile.targetNSQFLevel},
  "totalDuration": "Total time estimate",
  "stages": [
    {
      "stageNumber": 1,
      "nsqfLevel": ${payload.profile.currentNSQFLevel},
      "title": "Stage title",
      "courses": [
        {
          "courseId": "course_id",
          "title": "Course name",
          "description": "Course description",
          "nsqfLevel": ${payload.profile.currentNSQFLevel},
          "sector": "Sector name",
          "skills": ["skill1", "skill2"],
          "duration": "3 months",
          "certifyingBody": "NSDC/NCVT/Others",
          "employabilityScore": 75,
          "avgSalaryRange": "₹15,000-25,000/month",
          "courseProvider": "Provider name",
          "mode": "${payload.profile.learningMode}",
          "cost": "Cost estimate",
          "language": "${payload.profile.preferredLanguage}",
          "prerequisites": ["prereq1"]
        }
      ],
      "duration": "6 months",
      "outcomes": ["outcome1", "outcome2"],
      "jobRoles": ["role1", "role2"]
    }
  ],
  "employmentOpportunities": ["opportunity1", "opportunity2"],
  "salaryProgression": {
    "entry": "₹15,000-25,000/month",
    "midLevel": "₹30,000-50,000/month",
    "senior": "₹60,000-100,000/month"
  },
  "requiredInvestment": "Total cost estimate",
  "certifications": ["cert1", "cert2"],
  "governmentSchemes": [
    "Pradhan Mantri Kaushal Vikas Yojana (PMKVY)",
    "National Apprenticeship Promotion Scheme (NAPS)"
  ]
}`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.7 });
    const parsed = parseJson<any>(raw);
    return { prompt, raw, parsed };
  },

  async predictNSQFEmployability(payload: {
    userId: string;
    profile: any;
    targetSector: string;
    marketData: any;
  }): Promise<GeminiResult<any>> {
    const prompt = `Predict employability for this NSQF learner profile.

LEARNER PROFILE:
- Current NSQF Level: ${payload.profile.currentNSQFLevel}
- Target NSQF Level: ${payload.profile.targetNSQFLevel}
- Skills: ${payload.profile.skills.join(', ')}
- Experience: ${payload.profile.experienceYears} years
- Location: ${payload.profile.location}
- Target Sector: ${payload.targetSector}

MARKET DATA:
${JSON.stringify(payload.marketData, null, 2)}

Analyze employability and predict employment outcomes.

Return JSON:
{
  "overallScore": 0-100,
  "factors": {
    "skillMatch": 0-100,
    "marketDemand": 0-100,
    "educationLevel": 0-100,
    "experienceWeight": 0-100,
    "locationAdvantage": 0-100
  },
  "employmentProbability": 0.0-1.0,
  "salaryPrediction": {
    "min": 25000,
    "max": 45000,
    "median": 35000,
    "currency": "INR"
  },
  "timeToEmployment": "3-6 months",
  "topJobRoles": [
    {
      "role": "Junior Technician",
      "probability": 0.75,
      "avgSalary": "₹25,000/month",
      "openings": 150
    }
  ],
  "recommendations": [
    "Complete certification in X",
    "Gain hands-on experience in Y",
    "Consider upskilling in Z"
  ]
}`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.6 });
    const parsed = parseJson<any>(raw);
    return { prompt, raw, parsed };
  },

  async analyzeNSQFSkillGap(payload: {
    userId: string;
    currentSkills: string[];
    targetRole: string;
    targetSector: string;
  }): Promise<GeminiResult<any>> {
    const prompt = `Analyze skill gap for career transition to ${payload.targetRole} in ${payload.targetSector}.

CURRENT SKILLS:
${payload.currentSkills.join(', ')}

TARGET ROLE: ${payload.targetRole}
TARGET SECTOR: ${payload.targetSector}

Perform comprehensive skill gap analysis.

Return JSON:
{
  "requiredSkills": ["skill1", "skill2"],
  "currentSkills": ${JSON.stringify(payload.currentSkills)},
  "missingSkills": ["missing1", "missing2"],
  "transferableSkills": ["transferable1", "transferable2"],
  "gapPercentage": 0-100,
  "prioritySkills": [
    {
      "skill": "Python Programming",
      "importance": "critical",
      "learningPath": ["Step 1", "Step 2"],
      "estimatedTime": "2-3 months"
    }
  ]
}`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.5 });
    const parsed = parseJson<any>(raw);
    return { prompt, raw, parsed };
  },

  async recommendNSQFCourses(payload: {
    userId: string;
    profile: any;
    limit: number;
  }): Promise<GeminiResult<any[]>> {
    const prompt = `Recommend top ${payload.limit} NSQF-aligned courses for this learner.

LEARNER PROFILE:
- Current NSQF Level: ${payload.profile.currentNSQFLevel}
- Target NSQF Level: ${payload.profile.targetNSQFLevel}
- Interests: ${payload.profile.interests.join(', ')}
- Skills: ${payload.profile.skills.join(', ')}
- Location: ${payload.profile.location}
- Learning Mode: ${payload.profile.learningMode}
- Budget: ${payload.profile.budget}
- Language: ${payload.profile.preferredLanguage}

Recommend courses that:
1. Align with NSQF framework
2. Match learner's interests and goals
3. Are available in preferred mode and language
4. Fit within budget constraints
5. Have high employability scores

Return JSON array:
[
  {
    "courseId": "course_id",
    "title": "Course name",
    "description": "Course description",
    "nsqfLevel": 5,
    "sector": "Sector name",
    "skills": ["skill1", "skill2"],
    "duration": "6 months",
    "certifyingBody": "NSDC",
    "employabilityScore": 85,
    "avgSalaryRange": "₹25,000-40,000/month",
    "courseProvider": "Provider name",
    "mode": "hybrid",
    "cost": "₹15,000",
    "language": "Hindi/English",
    "prerequisites": ["Class 12"],
    "matchScore": 0-100,
    "reasoning": "Why this course is perfect for you"
  }
]`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.7 });
    const parsed = parseJson<any[]>(raw);
    return { prompt, raw, parsed };
  },

  async forecastNSQFCareer(payload: {
    userId: string;
    profile: any;
    targetSector: string;
    yearsAhead: number;
  }): Promise<GeminiResult<any>> {
    const prompt = `Forecast career progression for ${payload.yearsAhead} years in ${payload.targetSector}.

LEARNER PROFILE:
- Current NSQF Level: ${payload.profile.currentNSQFLevel}
- Skills: ${payload.profile.skills.join(', ')}
- Experience: ${payload.profile.experienceYears} years
- Location: ${payload.profile.location}

TARGET: ${payload.targetSector} sector, ${payload.yearsAhead}-year forecast

Provide realistic career forecast with:
1. Year-by-year progression
2. Role transitions
3. Salary growth
4. Required certifications
5. Market trends impact

Return JSON:
{
  "forecastPeriod": "${payload.yearsAhead} years",
  "targetSector": "${payload.targetSector}",
  "careerTimeline": [
    {
      "year": 1,
      "role": "Junior Technician",
      "nsqfLevel": 5,
      "salary": "₹25,000/month",
      "skills": ["skill1", "skill2"],
      "certifications": ["cert1"],
      "probability": 0.85
    }
  ],
  "salaryGrowth": {
    "currentEstimate": "₹20,000/month",
    "year3": "₹35,000/month",
    "year5": "₹55,000/month",
    "totalGrowth": "175%"
  },
  "careerMilestones": [
    {
      "milestone": "Complete NSQF Level 6 certification",
      "targetDate": "Year 2",
      "impact": "25% salary increase"
    }
  ],
  "marketTrends": {
    "sectorGrowth": "15% YoY",
    "demandOutlook": "High",
    "emergingSkills": ["skill1", "skill2"],
    "automationRisk": "Low"
  },
  "recommendations": [
    "Focus on specialization in X by Year 2",
    "Consider supervisory role transition by Year 3"
  ]
}`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.6 });
    const parsed = parseJson<any>(raw);
    return { prompt, raw, parsed };
  },

  async getApplicableSchemes(payload: {
    userId: string;
    profile: any;
  }): Promise<GeminiResult<any[]>> {
    const prompt = `Identify applicable Indian government schemes for this NSQF learner.

LEARNER PROFILE:
- Current Education: ${payload.profile.currentEducationLevel}
- NSQF Level: ${payload.profile.currentNSQFLevel}
- Interests: ${payload.profile.interests.join(', ')}
- Location: ${payload.profile.location}
- Experience: ${payload.profile.experienceYears} years

Find all applicable government schemes including:
- PMKVY (Pradhan Mantri Kaushal Vikas Yojana)
- NAPS (National Apprenticeship Promotion Scheme)
- DDU-GKY (Deen Dayal Upadhyaya Grameen Kaushalya Yojana)
- State-level schemes
- Sector-specific schemes

Return JSON array:
[
  {
    "schemeId": "pmkvy_2024",
    "name": "Pradhan Mantri Kaushal Vikas Yojana 4.0",
    "description": "Scheme description",
    "benefits": [
      "Free training",
      "₹8,000 monetary reward on certification"
    ],
    "eligibility": ["Age 15-45", "Indian citizen"],
    "applicationProcess": "How to apply",
    "deadline": "Ongoing",
    "website": "https://pmkvyofficial.org",
    "matchScore": 0-100,
    "reasoning": "Why eligible"
  }
]`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.5 });
    const parsed = parseJson<any[]>(raw);
    return { prompt, raw, parsed };
  },

  async analyzeTransferableSkills(payload: {
    userId: string;
    currentSector: string;
    targetSector: string;
    currentSkills: string[];
  }): Promise<GeminiResult<any>> {
    const prompt = `Analyze transferable skills for career transition from ${payload.currentSector} to ${payload.targetSector}.

CURRENT SECTOR: ${payload.currentSector}
TARGET SECTOR: ${payload.targetSector}
CURRENT SKILLS: ${payload.currentSkills.join(', ')}

Identify:
1. Which skills transfer directly
2. Which skills need adaptation
3. New skills needed
4. Career bridge opportunities

Return JSON:
{
  "currentSector": "${payload.currentSector}",
  "targetSector": "${payload.targetSector}",
  "directTransferSkills": [
    {
      "skill": "Communication",
      "relevance": "High",
      "applicability": "100%",
      "examples": ["Client interaction", "Team collaboration"]
    }
  ],
  "adaptableSkills": [
    {
      "skill": "Project Management",
      "currentContext": "Retail operations",
      "targetContext": "IT project delivery",
      "bridgingRequired": "Learn Agile methodology",
      "timeEstimate": "1-2 months"
    }
  ],
  "newSkillsRequired": [
    {
      "skill": "Python Programming",
      "importance": "Critical",
      "learningPath": "Online courses → Projects → Certification",
      "timeEstimate": "3-6 months"
    }
  ],
  "careerBridgeRoles": [
    {
      "role": "Technical Sales",
      "reasoning": "Combines retail experience with tech sector entry",
      "transitionProbability": 0.75,
      "timeToTransition": "6-12 months"
    }
  ],
  "transitionStrategy": {
    "phase1": "Build foundational tech skills (3 months)",
    "phase2": "Apply for bridge roles (months 4-6)",
    "phase3": "Transition to target role (months 7-12)"
  },
  "successProbability": 0.70,
  "recommendations": [
    "Leverage customer service experience",
    "Start with technical support roles",
    "Get IT certifications while working"
  ]
}`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.6 });
    const parsed = parseJson<any>(raw);
    return { prompt, raw, parsed };
  },

  async generateCodingQuestion(
    payload: CodingQuestionGenerationRequest
  ): Promise<GeminiResult<CodingQuestionGenerationResponse>> {
    const companyPatterns: Record<string, string> = {
      TCS: 'Aptitude-style + basic DSA (arrays, strings, sorting). Focus on clean implementation over algorithmic complexity.',
      INFOSYS: 'Moderate DSA problems with emphasis on string manipulation, basic recursion, and simple data structures.',
      WIPRO: 'Basic programming problems focusing on arrays, loops, conditionals, and simple math operations.',
      GOOGLE: 'Hard algorithmic problems: graph algorithms, dynamic programming, advanced data structures. Expect optimal Big-O.',
      AMAZON: 'Medium-hard problems emphasizing hash maps, trees, BFS/DFS, and system-level thinking.',
      MICROSOFT: 'Medium algorithmic problems: trees, graphs, dynamic programming, and design patterns.',
      META: 'Hard problems focusing on graph traversal, interval scheduling, and string manipulation at scale.',
      FLIPKART: 'Medium DSA with focus on arrays, sorting, searching, and basic graph problems.',
      DEFAULT: 'Standard DSA problems appropriate to the difficulty level selected.',
    };

    const pattern = companyPatterns[payload.company.toUpperCase()] || companyPatterns.DEFAULT;
    const count = payload.count || 1;

    const prompt = `You are an expert coding interviewer at ${payload.company}. Generate ${count} coding ${payload.difficulty} problem(s).

COMPANY PATTERN: ${pattern}
PROGRAMMING LANGUAGE: ${payload.language}
QUESTION INDEX: ${payload.questionIndex} of 5 (vary topics across questions)

Return JSON:
{
  "questions": [
    {
      "problemStatement": "Clear problem description with constraints",
      "constraints": ["1 <= n <= 10^5"],
      "examples": [
        { "input": "...", "output": "...", "explanation": "..." }
      ],
      "testCases": [
        { "input": "...", "expectedOutput": "...", "isHidden": false },
        { "input": "...", "expectedOutput": "...", "isHidden": true }
      ],
      "expectedTimeComplexity": "O(n)",
      "expectedSpaceComplexity": "O(1)",
      "difficulty": "${payload.difficulty}",
      "tags": ["Arrays", "Two Pointers"],
      "starterCode": {
        "${payload.language}": "function solve(input) {\\n  // Your code here\\n}"
      }
    }
  ]
}

RULES:
- Include 2-3 visible examples and 3-5 test cases (mix of visible and hidden)
- Test cases must have exact string inputs/outputs matching stdin/stdout format
- Starter code should include function signature and input parsing boilerplate for ${payload.language}
- Ensure test case inputs are newline-separated if multiple values
- Make problems realistic for ${payload.company} interviews at ${payload.difficulty} level`;

    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.8 });
    return { prompt, raw, parsed: parseJson<CodingQuestionGenerationResponse>(raw) };
  },

  async analyzeCode(
    payload: CodeAnalysisRequest
  ): Promise<GeminiResult<CodeAnalysisResponse>> {
    const passedCount = payload.testResults.filter(t => t.passed).length;
    const totalTests = payload.testResults.length;

    const prompt = `You are a senior coding interviewer evaluating submitted code.

PROBLEM: ${payload.problemStatement}
LANGUAGE: ${payload.language}
TIME TAKEN: ${payload.timeTaken} seconds

CODE:
\`\`\`${payload.language}
${payload.code}
\`\`\`

TEST RESULTS: ${passedCount}/${totalTests} passed
${payload.testResults.map((t, i) => `Test ${i + 1}: Input="${t.input}" Expected="${t.expectedOutput}" Got="${t.actualOutput}" ${t.passed ? 'PASS' : 'FAIL'}`).join('\n')}

Return JSON:
{
  "score": 0,
  "feedback": "Comprehensive 2-3 sentence feedback",
  "correctness": 0,
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "codeQuality": 0,
  "edgeCaseHandling": 0,
  "namingConventions": 0,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "optimalApproach": "Brief description if user approach is suboptimal"
}

SCORING (all 0-100):
- Correctness: ${passedCount}/${totalTests} test cases passed (weight ~40%)
- Time/Space complexity vs expected optimal (weight ~20%)
- Code quality: readability, structure, no redundancy (weight ~20%)
- Edge cases + naming conventions (weight ~20%)
- Time taken: penalize slightly if > 20 minutes for EASY, > 30 for MEDIUM, > 45 for HARD`;

    const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.6 });
    return { prompt, raw, parsed: parseJson<CodeAnalysisResponse>(raw) };
  }
};
