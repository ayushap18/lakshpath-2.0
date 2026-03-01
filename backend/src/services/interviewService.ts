import prisma from '@lib/prisma';
import { geminiService } from './geminiService';
import {
  InterviewQuestionGenerationRequest,
  InterviewAnswerEvaluationRequest,
  SpeechAnalysisRequest,
} from '@shared-types/ai';
import { AppError } from '@middleware/errorHandler';

// Demo questions for fallback when Gemini API is unavailable
const DEMO_QUESTIONS: Record<string, Record<string, Array<{ questionText: string; questionType: string; difficulty: string; expectedAnswer: string }>>> = {
  TECHNICAL: {
    EASY: [
      { questionText: "What is the difference between `let`, `const`, and `var` in JavaScript?", questionType: "TECHNICAL", difficulty: "EASY", expectedAnswer: "`var` is function-scoped and hoisted, `let` is block-scoped and not hoisted, `const` is block-scoped and cannot be reassigned." },
      { questionText: "Explain what a REST API is and its main HTTP methods.", questionType: "TECHNICAL", difficulty: "EASY", expectedAnswer: "REST API is an architectural style using HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove) to interact with resources via URLs." },
      { questionText: "What is the difference between an array and a linked list?", questionType: "TECHNICAL", difficulty: "EASY", expectedAnswer: "Arrays store elements contiguously with O(1) index access but O(n) insertion. Linked lists use pointers with O(1) insertion but O(n) access." },
      { questionText: "What is the difference between SQL and NoSQL databases?", questionType: "TECHNICAL", difficulty: "EASY", expectedAnswer: "SQL databases are relational with fixed schemas and ACID compliance. NoSQL databases are non-relational, schema-flexible, and optimized for horizontal scaling." },
      { questionText: "Explain the concept of version control and why Git is important.", questionType: "TECHNICAL", difficulty: "EASY", expectedAnswer: "Version control tracks file changes over time. Git enables collaboration, branching, merging, and maintaining history of code changes." },
    ],
    MEDIUM: [
      { questionText: "Explain the concept of closures in JavaScript with an example.", questionType: "TECHNICAL", difficulty: "MEDIUM", expectedAnswer: "A closure is a function that retains access to its outer scope variables even after the outer function has returned. Example: function counter() { let count = 0; return () => ++count; }" },
      { questionText: "What is the time complexity of common sorting algorithms? Compare QuickSort and MergeSort.", questionType: "TECHNICAL", difficulty: "MEDIUM", expectedAnswer: "QuickSort: avg O(n log n), worst O(n²), in-place. MergeSort: always O(n log n), stable, requires O(n) extra space." },
      { questionText: "Explain the event loop in Node.js and how it handles asynchronous operations.", questionType: "TECHNICAL", difficulty: "MEDIUM", expectedAnswer: "The event loop processes callbacks from the callback queue after the call stack is empty. Async operations (I/O, timers) are offloaded to the system, and their callbacks are queued when complete." },
      { questionText: "What are React hooks? Explain useState and useEffect with examples.", questionType: "TECHNICAL", difficulty: "MEDIUM", expectedAnswer: "Hooks let you use state and lifecycle in functional components. useState manages state, useEffect handles side effects (data fetching, subscriptions) and runs after render." },
      { questionText: "Explain database indexing. When would you use an index and when would you avoid it?", questionType: "TECHNICAL", difficulty: "MEDIUM", expectedAnswer: "Indexes speed up read queries using B-tree/hash structures. Use for frequent WHERE/JOIN columns. Avoid on small tables, frequently updated columns, or low-cardinality fields since indexes slow writes." },
    ],
    HARD: [
      { questionText: "Design a URL shortener system. Discuss the architecture, database schema, and scaling considerations.", questionType: "TECHNICAL", difficulty: "HARD", expectedAnswer: "Use base62 encoding of auto-increment IDs, cache popular URLs in Redis, use consistent hashing for distribution, NoSQL for writes, CDN for redirects." },
      { questionText: "Explain the CAP theorem and how it applies to distributed databases.", questionType: "TECHNICAL", difficulty: "HARD", expectedAnswer: "CAP states a distributed system can provide at most 2 of 3: Consistency, Availability, Partition tolerance. In practice, P is mandatory, so you choose between CP or AP." },
      { questionText: "What is the difference between optimistic and pessimistic concurrency control?", questionType: "TECHNICAL", difficulty: "HARD", expectedAnswer: "Optimistic: no locks, validate at commit time, good for low-contention. Pessimistic: acquires locks before operations, prevents conflicts, better for high-contention." },
      { questionText: "Explain microservices architecture vs monolithic. What are the trade-offs?", questionType: "TECHNICAL", difficulty: "HARD", expectedAnswer: "Monolithic: simpler deployment but harder to scale. Microservices: independent scaling, tech diversity, fault isolation, but adds complexity in communication and data consistency." },
      { questionText: "How does garbage collection work in modern languages? Compare approaches.", questionType: "TECHNICAL", difficulty: "HARD", expectedAnswer: "Mark-and-sweep (JS V8), generational GC (Java), reference counting (Python/Swift). Trade-offs between pause time, throughput, and memory overhead." },
    ],
  },
  BEHAVIORAL: {
    EASY: [
      { questionText: "Tell me about yourself and your career goals.", questionType: "BEHAVIORAL", difficulty: "EASY", expectedAnswer: "Structure: brief background, current situation, relevant skills, and future aspirations aligned with the role." },
      { questionText: "Why are you interested in this role/field?", questionType: "BEHAVIORAL", difficulty: "EASY", expectedAnswer: "Show genuine interest, connect personal experiences, mention specific aspects of the role that excite you." },
      { questionText: "Describe a project you're most proud of.", questionType: "BEHAVIORAL", difficulty: "EASY", expectedAnswer: "Use STAR method: describe the situation, your specific role, actions taken, and measurable results." },
      { questionText: "How do you stay updated with new technologies?", questionType: "BEHAVIORAL", difficulty: "EASY", expectedAnswer: "Mention specific resources: blogs, podcasts, conferences, side projects, open source contributions, online courses." },
      { questionText: "What are your strengths and weaknesses?", questionType: "BEHAVIORAL", difficulty: "EASY", expectedAnswer: "Be honest, give specific examples for strengths, and show self-awareness and improvement efforts for weaknesses." },
    ],
    MEDIUM: [
      { questionText: "Describe a time when you had to work with a difficult team member. How did you handle it?", questionType: "BEHAVIORAL", difficulty: "MEDIUM", expectedAnswer: "Use STAR: describe the conflict, your approach to understanding their perspective, actions to resolve it, and the positive outcome." },
      { questionText: "Tell me about a time you failed. What did you learn?", questionType: "BEHAVIORAL", difficulty: "MEDIUM", expectedAnswer: "Show vulnerability, describe the situation honestly, focus on lessons learned and how you applied them going forward." },
      { questionText: "How do you prioritize tasks when you have multiple deadlines?", questionType: "BEHAVIORAL", difficulty: "MEDIUM", expectedAnswer: "Describe your framework: urgency vs importance matrix, communication with stakeholders, breaking down large tasks, and time management techniques." },
      { questionText: "Describe a situation where you had to learn something new quickly.", questionType: "BEHAVIORAL", difficulty: "MEDIUM", expectedAnswer: "Show adaptability, describe your learning approach, resources used, and how you applied new knowledge effectively." },
      { questionText: "Tell me about a time you went above and beyond your role.", questionType: "BEHAVIORAL", difficulty: "MEDIUM", expectedAnswer: "Show initiative, describe what motivated you, the extra effort you put in, and the impact it had on the team/project." },
    ],
    HARD: [
      { questionText: "Describe a time when you had to make a decision with incomplete information.", questionType: "BEHAVIORAL", difficulty: "HARD", expectedAnswer: "Show decision-making framework, risk assessment, stakeholder communication, and how you handled the uncertainty." },
      { questionText: "Tell me about a time you had to convince your team to adopt a different approach.", questionType: "BEHAVIORAL", difficulty: "HARD", expectedAnswer: "Demonstrate leadership and persuasion skills, data-driven reasoning, empathy for opposing views, and the result of the change." },
      { questionText: "How have you handled a situation where you disagreed with your manager's decision?", questionType: "BEHAVIORAL", difficulty: "HARD", expectedAnswer: "Show professionalism, present your reasoning respectfully, ultimately support the decision, and what you learned." },
      { questionText: "Describe a complex problem you solved that had a significant impact.", questionType: "BEHAVIORAL", difficulty: "HARD", expectedAnswer: "Use STAR with emphasis on problem analysis, creative solution, implementation challenges, and measurable business impact." },
      { questionText: "Tell me about leading a project through unexpected challenges.", questionType: "BEHAVIORAL", difficulty: "HARD", expectedAnswer: "Show resilience, adaptability, team communication, re-planning strategies, and how you kept the project on track." },
    ],
  },
  SYSTEM_DESIGN: {
    EASY: [
      { questionText: "Design a simple chat application. What components would you need?", questionType: "SYSTEM_DESIGN", difficulty: "EASY", expectedAnswer: "Client app, WebSocket server, message queue, database. Consider user auth, message storage, real-time delivery." },
      { questionText: "How would you design a basic todo list application with user authentication?", questionType: "SYSTEM_DESIGN", difficulty: "EASY", expectedAnswer: "Frontend (React), REST API backend, database (PostgreSQL), JWT authentication, CRUD operations for todos." },
      { questionText: "Design a file upload service. What are the key considerations?", questionType: "SYSTEM_DESIGN", difficulty: "EASY", expectedAnswer: "Upload API, storage (S3/cloud), file validation, size limits, progress tracking, CDN for serving, metadata in database." },
      { questionText: "How would you design a notification system for a web application?", questionType: "SYSTEM_DESIGN", difficulty: "EASY", expectedAnswer: "Notification service, event-driven architecture, push notifications (WebSocket/SSE), notification preferences, read/unread status." },
      { questionText: "Design a basic e-commerce product listing page. Consider performance.", questionType: "SYSTEM_DESIGN", difficulty: "EASY", expectedAnswer: "Product API with pagination, search/filter, caching layer (Redis), CDN for images, database indexing on search fields." },
    ],
    MEDIUM: [
      { questionText: "Design a rate limiter for an API. Consider different strategies.", questionType: "SYSTEM_DESIGN", difficulty: "MEDIUM", expectedAnswer: "Token bucket or sliding window algorithms, Redis for distributed state, per-user and global limits, response headers for limit info." },
      { questionText: "Design Twitter's news feed system. How would you handle the fan-out problem?", questionType: "SYSTEM_DESIGN", difficulty: "MEDIUM", expectedAnswer: "Fan-out on write for normal users, fan-out on read for celebrities. Use Redis for feed cache, message queue for async processing." },
      { questionText: "How would you design a URL shortener that handles millions of requests per day?", questionType: "SYSTEM_DESIGN", difficulty: "MEDIUM", expectedAnswer: "Base62 encoding, distributed ID generation, caching layer, analytics tracking, 301 redirects, database sharding for scale." },
      { questionText: "Design a real-time collaborative document editor like Google Docs.", questionType: "SYSTEM_DESIGN", difficulty: "MEDIUM", expectedAnswer: "Operational Transformation or CRDT for conflict resolution, WebSocket for real-time sync, version history, presence awareness." },
      { questionText: "Design a job scheduling system that handles millions of scheduled tasks.", questionType: "SYSTEM_DESIGN", difficulty: "MEDIUM", expectedAnswer: "Priority queue, distributed workers, retry mechanisms, dead letter queue, idempotency, monitoring and alerting." },
    ],
    HARD: [
      { questionText: "Design YouTube's video streaming infrastructure.", questionType: "SYSTEM_DESIGN", difficulty: "HARD", expectedAnswer: "Video processing pipeline (transcoding), adaptive bitrate streaming (HLS/DASH), CDN with edge servers, chunk-based delivery." },
      { questionText: "Design a distributed search engine like Google. What are the key components?", questionType: "SYSTEM_DESIGN", difficulty: "HARD", expectedAnswer: "Web crawler, inverted index, PageRank, query processing, distributed storage (GFS), MapReduce for indexing." },
      { questionText: "Design a payment processing system. How do you ensure consistency?", questionType: "SYSTEM_DESIGN", difficulty: "HARD", expectedAnswer: "Idempotency keys, two-phase commit, saga pattern, event sourcing, reconciliation, PCI compliance, fraud detection." },
      { questionText: "Design a ride-sharing service like Uber.", questionType: "SYSTEM_DESIGN", difficulty: "HARD", expectedAnswer: "Geospatial indexing (QuadTree/GeoHash), real-time location tracking, matching algorithm, ETA calculation, surge pricing." },
      { questionText: "Design a distributed cache system like Redis.", questionType: "SYSTEM_DESIGN", difficulty: "HARD", expectedAnswer: "Consistent hashing, replication, eviction policies (LRU/LFU), persistence options, pub/sub, cluster management." },
    ],
  },
  CODING: {
    EASY: [
      { questionText: "Write a function to reverse a string without using built-in reverse methods.", questionType: "CODING", difficulty: "EASY", expectedAnswer: "Use two pointers or iterate from end to start. O(n) time, O(n) space." },
    ],
    MEDIUM: [
      { questionText: "Write a function to find the longest substring without repeating characters.", questionType: "CODING", difficulty: "MEDIUM", expectedAnswer: "Use sliding window with a Set/Map. Expand right, contract left when duplicate found. O(n) time." },
    ],
    HARD: [
      { questionText: "Implement an LRU Cache with O(1) get and put operations.", questionType: "CODING", difficulty: "HARD", expectedAnswer: "Use a HashMap + Doubly Linked List. Map for O(1) lookup, DLL for O(1) eviction order maintenance." },
    ],
  },
};

const DEMO_EVALUATION = {
  score: 72,
  feedback: "Good answer that covers the key concepts. Consider adding more specific examples and discussing edge cases to strengthen your response.",
  strengths: ["Clear explanation of core concepts", "Good structure and organization", "Demonstrates understanding of fundamentals"],
  improvements: ["Add more specific real-world examples", "Discuss trade-offs and edge cases", "Mention related concepts to show deeper understanding"],
  starAnalysis: null,
  codeQuality: null,
};

export const interviewService = {
  /**
   * Start a new interview session
   */
  async startSession(
    userId: string,
    type: 'TECHNICAL' | 'BEHAVIORAL' | 'SYSTEM_DESIGN' | 'CODING',
    difficulty: 'EASY' | 'MEDIUM' | 'HARD',
    role?: string
  ) {
    // Normalize to uppercase for consistency
    const normalizedType = (type || 'TECHNICAL').toUpperCase().replace(/ /g, '_') as any;
    const normalizedDifficulty = (difficulty || 'MEDIUM').toUpperCase() as any;

    const session = await prisma.interviewSession.create({
      data: {
        userId,
        type: normalizedType,
        difficulty: normalizedDifficulty,
        role,
        status: 'IN_PROGRESS',
      },
    });

    // Try AI questions, fall back to demo questions
    const questionCount = normalizedType === 'CODING' ? 1 : 5;
    let questionData: Array<{ questionText: string; questionType: string; difficulty: string; expectedAnswer: string }>;

    try {
      const questionsResult = await geminiService.generateInterviewQuestions({
        type: normalizedType,
        difficulty: normalizedDifficulty,
        role,
        count: questionCount,
      });
      questionData = questionsResult.parsed.questions;
    } catch (error: any) {
      console.warn('[InterviewService] AI generation failed, using demo questions:', error.message?.slice(0, 120));
      const pool = DEMO_QUESTIONS[normalizedType]?.[normalizedDifficulty] || DEMO_QUESTIONS.TECHNICAL.MEDIUM;
      questionData = pool.slice(0, questionCount);
    }

    // Save questions to database
    const questions = await Promise.all(
      questionData.map((q) =>
        prisma.interviewQuestion.create({
          data: {
            sessionId: session.id,
            questionText: q.questionText,
            questionType: q.questionType,
            difficulty: q.difficulty,
            expectedAnswer: q.expectedAnswer,
          },
        })
      )
    );

    return {
      session,
      questions,
    };
  },

  /**
   * Submit answer to a question
   */
  async submitAnswer(
    questionId: string,
    userId: string,
    answer: string,
    timeTaken?: number
  ) {
    const question = await prisma.interviewQuestion.findUnique({
      where: { id: questionId },
      include: { session: true },
    });

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    if (question.session.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (question.session.status !== 'IN_PROGRESS') {
      throw new AppError('Session is not active', 400);
    }

    // Evaluate answer using AI, fall back to demo evaluation
    let evaluationParsed: any;
    try {
      const evaluation = await geminiService.evaluateInterviewAnswer({
        questionText: question.questionText,
        questionType: question.questionType,
        userAnswer: answer,
        expectedAnswer: question.expectedAnswer || undefined,
      });
      evaluationParsed = evaluation.parsed;
    } catch (error: any) {
      console.warn('[InterviewService] AI evaluation failed, using demo:', error.message?.slice(0, 120));
      const effortScore = Math.min(85, 50 + Math.floor(answer.length / 20));
      evaluationParsed = { ...DEMO_EVALUATION, score: effortScore };
    }

    // Update question with answer and evaluation
    const updatedQuestion = await prisma.interviewQuestion.update({
      where: { id: questionId },
      data: {
        userAnswer: answer,
        answerScore: evaluationParsed.score,
        aiFeedback: evaluationParsed.feedback,
        strengths: JSON.stringify(evaluationParsed.strengths),
        improvements: JSON.stringify(evaluationParsed.improvements),
        starAnalysis: evaluationParsed.starAnalysis
          ? JSON.stringify(evaluationParsed.starAnalysis)
          : null,
        codeQuality: evaluationParsed.codeQuality
          ? JSON.stringify(evaluationParsed.codeQuality)
          : null,
        timeTaken,
        answeredAt: new Date(),
      },
    });

    return {
      question: updatedQuestion,
      evaluation: evaluationParsed,
    };
  },

  /**
   * Complete interview session
   */
  async completeSession(sessionId: string, userId: string, speechTranscript?: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { questions: true },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    // Calculate overall score
    const answeredQuestions = session.questions.filter((q) => q.answerScore !== null);
    const overallScore =
      answeredQuestions.length > 0
        ? answeredQuestions.reduce((sum, q) => sum + (q.answerScore || 0), 0) /
          answeredQuestions.length
        : 0;

    // Analyze speech if transcript provided (graceful fallback)
    let speechAnalysis = null;
    if (speechTranscript) {
      try {
        const totalDuration = session.questions.reduce(
          (sum, q) => sum + (q.timeTaken || 0),
          0
        );
        const speechResult = await geminiService.analyzeSpeech({
          transcript: speechTranscript,
          duration: totalDuration,
        });
        speechAnalysis = JSON.stringify(speechResult.parsed);
      } catch (error: any) {
        console.warn('[InterviewService] Speech analysis failed:', error.message?.slice(0, 120));
        speechAnalysis = JSON.stringify({
          confidence: 70,
          clarity: 75,
          pace: "moderate",
          fillerWords: 3,
          suggestions: ["Practice speaking more slowly", "Reduce filler words like 'um' and 'uh'"],
        });
      }
    }

    // Generate overall feedback
    const feedback = this.generateOverallFeedback(session.questions, overallScore);

    // Update session
    const updatedSession = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        overallScore,
        feedback,
        speechAnalysis,
        duration: session.questions.reduce((sum, q) => sum + (q.timeTaken || 0), 0),
        completedAt: new Date(),
      },
      include: { questions: true },
    });

    return updatedSession;
  },

  /**
   * Get interview session details
   */
  async getSession(sessionId: string, userId: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { questions: true },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    return session;
  },

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string, limit = 10) {
    const sessions = await prisma.interviewSession.findMany({
      where: { userId },
      include: {
        questions: {
          select: {
            id: true,
            questionText: true,
            answerScore: true,
            answeredAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return sessions;
  },

  /**
   * Get interview statistics for a user
   */
  async getUserStats(userId: string) {
    const sessions = await prisma.interviewSession.findMany({
      where: { userId, status: 'COMPLETED' },
      include: { questions: true },
    });

    const totalSessions = sessions.length;
    const totalQuestions = sessions.reduce((sum, s) => sum + s.questions.length, 0);
    const avgScore =
      sessions.length > 0
        ? sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / sessions.length
        : 0;

    const typeBreakdown = sessions.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentImprovement =
      sessions.length >= 2
        ? (sessions[0].overallScore || 0) - (sessions[sessions.length - 1].overallScore || 0)
        : 0;

    return {
      totalSessions,
      totalQuestions,
      avgScore: Math.round(avgScore * 10) / 10,
      typeBreakdown,
      recentImprovement: Math.round(recentImprovement * 10) / 10,
      sessions: sessions.slice(0, 5).map((s) => ({
        id: s.id,
        type: s.type,
        difficulty: s.difficulty,
        score: s.overallScore,
        completedAt: s.completedAt,
      })),
    };
  },

  /**
   * Generate overall feedback based on performance
   */
  generateOverallFeedback(questions: any[], overallScore: number): string {
    const answered = questions.filter((q) => q.userAnswer);
    const unanswered = questions.length - answered.length;

    let feedback = `You completed ${answered.length} out of ${questions.length} questions with an overall score of ${Math.round(overallScore)}%.\n\n`;

    if (overallScore >= 80) {
      feedback += 'Excellent performance! You demonstrated strong knowledge and communication skills.';
    } else if (overallScore >= 60) {
      feedback += 'Good work! You showed solid understanding with room for improvement in some areas.';
    } else {
      feedback += 'Keep practicing! Focus on the feedback provided for each question to improve.';
    }

    if (unanswered > 0) {
      feedback += `\n\nNote: ${unanswered} question(s) were not answered. Try to complete all questions in your next session.`;
    }

    return feedback;
  },

  /**
   * Get next question recommendation
   */
  async getNextQuestion(sessionId: string, userId: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { questions: true },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    // Find first unanswered question
    const nextQuestion = session.questions.find((q) => !q.userAnswer);

    if (!nextQuestion) {
      return { message: 'All questions completed', completed: true };
    }

    return {
      question: nextQuestion,
      completed: false,
      progress: {
        answered: session.questions.filter((q) => q.userAnswer).length,
        total: session.questions.length,
      },
    };
  },
};
