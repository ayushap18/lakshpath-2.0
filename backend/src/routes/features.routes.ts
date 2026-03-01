import { Router, Request, Response } from 'express';
import { authenticate, attachUserIfPresent } from '@middleware/authenticate';
import prisma from '@lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '@config/env';

const router = Router();

// Use the shared env config for consistent Gemini initialization
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });

// Shared Gemini helper - tries real AI, returns null on failure
async function callGeminiJSON(prompt: string, temperature = 0.7): Promise<any | null> {
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature }
    });

    const text = result.response.text();
    return JSON.parse(text.replace(/^```json/gm, '').replace(/```$/gm, '').trim());
  } catch (err: any) {
    console.warn('[Gemini] AI call failed, using demo data:', err.message?.slice(0, 120));
    return null;
  }
}

// ============================================================
//  DEMO DATA - High-quality fallbacks for when AI is unavailable
// ============================================================

const DEMO = {
  careerDNA: {
    dnaType: "The Innovator",
    tagline: "A visionary builder who thrives at the intersection of technology and creativity",
    overallScore: 87,
    percentile: 92,
    dimensions: [
      { name: "Technical", score: 88, icon: "code", color: "#0da2e7", description: "Strong foundation in programming concepts and system design", subSkills: ["Data Structures", "Algorithms", "System Design"] },
      { name: "Creative", score: 76, icon: "palette", color: "#a855f7", description: "Natural ability to design intuitive user experiences", subSkills: ["UI/UX Design", "Visual Thinking", "Innovation"] },
      { name: "Analytical", score: 91, icon: "analytics", color: "#10b981", description: "Exceptional at breaking down complex problems systematically", subSkills: ["Data Analysis", "Critical Thinking", "Research"] },
      { name: "Leadership", score: 72, icon: "groups", color: "#f59e0b", description: "Emerging leadership with strong team collaboration skills", subSkills: ["Team Management", "Decision Making", "Mentoring"] },
      { name: "Communication", score: 79, icon: "chat", color: "#ef4444", description: "Articulate communicator with strong presentation skills", subSkills: ["Technical Writing", "Presentations", "Collaboration"] },
      { name: "Problem Solving", score: 93, icon: "lightbulb", color: "#06b6d4", description: "Exceptional problem-solving approach with creative solutions", subSkills: ["Algorithm Design", "Debugging", "Optimization"] }
    ],
    personalityTraits: [
      { leftLabel: "Introvert", rightLabel: "Extrovert", value: 45, leftIcon: "person", rightIcon: "groups", color: "#0da2e7" },
      { leftLabel: "Thinker", rightLabel: "Feeler", value: 72, leftIcon: "psychology", rightIcon: "favorite", color: "#a855f7" },
      { leftLabel: "Planner", rightLabel: "Improviser", value: 38, leftIcon: "event", rightIcon: "bolt", color: "#10b981" },
      { leftLabel: "Specialist", rightLabel: "Generalist", value: 55, leftIcon: "target", rightIcon: "explore", color: "#f59e0b" },
      { leftLabel: "Independent", rightLabel: "Collaborative", value: 60, leftIcon: "person", rightIcon: "groups", color: "#ef4444" },
      { leftLabel: "Cautious", rightLabel: "Risk-Taker", value: 65, leftIcon: "shield", rightIcon: "rocket", color: "#06b6d4" }
    ],
    careerMatches: [
      { title: "Full Stack Developer", matchPercent: 94, icon: "code", color: "#0da2e7", salaryRange: "8-25 LPA", growth: "+28%", growthLabel: "Very High", tags: ["Tech", "Product", "Startup-Friendly"] },
      { title: "AI/ML Engineer", matchPercent: 89, icon: "smart_toy", color: "#a855f7", salaryRange: "12-35 LPA", growth: "+42%", growthLabel: "Exceptional", tags: ["AI", "Research", "Innovation"] },
      { title: "Product Manager", matchPercent: 82, icon: "inventory", color: "#10b981", salaryRange: "15-40 LPA", growth: "+22%", growthLabel: "High", tags: ["Strategy", "Leadership", "Tech"] },
      { title: "DevOps Engineer", matchPercent: 78, icon: "cloud", color: "#f59e0b", salaryRange: "10-30 LPA", growth: "+35%", growthLabel: "Very High", tags: ["Cloud", "Automation", "Infrastructure"] },
      { title: "Data Scientist", matchPercent: 85, icon: "bar_chart", color: "#ef4444", salaryRange: "10-32 LPA", growth: "+31%", growthLabel: "Very High", tags: ["Data", "Analytics", "ML"] }
    ],
    strengths: ["Algorithmic Problem Solving", "Full Stack Development", "Data-Driven Decision Making"],
    idealRoles: ["Full Stack Developer", "AI/ML Engineer", "Technical Lead"],
    aiInsight: "Your unique combination of strong analytical thinking and creative problem-solving makes you exceptionally well-suited for roles that bridge technology and innovation. Your technical depth in programming, combined with above-average communication skills, positions you as a potential technical leader. Focus on building projects that showcase both your coding abilities and your system design thinking — this combination is highly valued by top tech companies in India."
  },

  resumeSummary: {
    summary: "Results-driven Computer Science graduate with 2+ years of hands-on project experience in full-stack development and machine learning. Built 5+ production-grade applications serving 500+ users, achieving 40% performance improvements through optimized algorithms. Proficient in React, Node.js, Python, and cloud technologies, seeking to leverage technical expertise in a challenging Software Engineer role.",
    keywords: ["Full Stack Development", "React", "Node.js", "Python", "Machine Learning", "REST APIs", "Git", "Agile"],
    atsScore: 82,
    suggestions: ["Add more quantifiable metrics to experience bullets", "Include specific cloud platform certifications", "Tailor keywords to match the exact job description"]
  },

  resumeEnhance: {
    enhanced: "Architected and deployed a real-time career guidance platform using React and Node.js, serving 500+ students with personalized AI-driven recommendations, reducing career decision time by 60%",
    improvements: [
      { original: "Built a website for career guidance", improved: "Architected and deployed a real-time career guidance platform using React and Node.js", reason: "Uses strong action verb and specifies technologies" },
      { original: "for students", improved: "serving 500+ students with personalized AI-driven recommendations", reason: "Quantifies impact and highlights AI features" }
    ],
    atsKeywords: ["Architected", "React", "Node.js", "AI-driven", "real-time"],
    score: { before: 55, after: 88 },
    tips: ["Always lead with strong action verbs", "Include at least one number in every bullet point", "Match keywords from job descriptions"]
  },

  skillGap: (role: string) => ({
    targetRole: role,
    readinessScore: 68,
    skills: [
      { name: "JavaScript/TypeScript", category: "Languages", currentLevel: 75, requiredLevel: 90, gap: 15, priority: "critical", estimatedHours: 40, resources: [{ name: "Advanced TypeScript", type: "course", platform: "Udemy", duration: "20 hrs" }] },
      { name: "React.js", category: "Frameworks", currentLevel: 70, requiredLevel: 85, gap: 15, priority: "critical", estimatedHours: 35, resources: [{ name: "React - The Complete Guide", type: "course", platform: "Udemy", duration: "40 hrs" }] },
      { name: "Node.js/Express", category: "Frameworks", currentLevel: 65, requiredLevel: 80, gap: 15, priority: "important", estimatedHours: 30, resources: [{ name: "Node.js Developer Course", type: "course", platform: "Udemy", duration: "35 hrs" }] },
      { name: "SQL/Databases", category: "Data", currentLevel: 60, requiredLevel: 80, gap: 20, priority: "important", estimatedHours: 25, resources: [{ name: "SQL for Developers", type: "course", platform: "Coursera", duration: "15 hrs" }] },
      { name: "Data Structures & Algorithms", category: "Core", currentLevel: 55, requiredLevel: 90, gap: 35, priority: "critical", estimatedHours: 80, resources: [{ name: "Strivers A2Z DSA Sheet", type: "website", platform: "TakeUForward", duration: "3 months" }] },
      { name: "System Design", category: "Core", currentLevel: 30, requiredLevel: 70, gap: 40, priority: "important", estimatedHours: 50, resources: [{ name: "System Design Primer", type: "website", platform: "GitHub", duration: "2 months" }] },
      { name: "Git & CI/CD", category: "Tools", currentLevel: 65, requiredLevel: 75, gap: 10, priority: "nice-to-have", estimatedHours: 15, resources: [{ name: "Git & GitHub Bootcamp", type: "course", platform: "Udemy", duration: "10 hrs" }] },
      { name: "AWS/Cloud", category: "Cloud", currentLevel: 25, requiredLevel: 60, gap: 35, priority: "important", estimatedHours: 45, resources: [{ name: "AWS Cloud Practitioner", type: "certification", platform: "AWS", duration: "30 hrs" }] },
      { name: "Docker/Kubernetes", category: "Tools", currentLevel: 20, requiredLevel: 55, gap: 35, priority: "nice-to-have", estimatedHours: 35, resources: [{ name: "Docker & Kubernetes", type: "course", platform: "Udemy", duration: "22 hrs" }] },
      { name: "Communication", category: "Soft Skills", currentLevel: 70, requiredLevel: 80, gap: 10, priority: "nice-to-have", estimatedHours: 20, resources: [{ name: "Business Communication", type: "course", platform: "Coursera", duration: "12 hrs" }] }
    ],
    summaryStats: { skillsMet: 3, totalSkills: 10, estimatedWeeks: 16, topPriorities: ["DSA", "JavaScript/TypeScript", "React.js"] },
    salaryRange: "6-25 LPA",
    demandLevel: "High",
    marketInsight: `${role} is one of the most in-demand roles in India's tech industry with a projected 28% growth. Companies like TCS, Infosys, Flipkart, and Google India actively recruit for this position. Strong DSA skills and framework expertise are the #1 differentiators in campus placements.`
  }),

  placementQuestion: (category: string) => {
    const questions: Record<string, any> = {
      'Aptitude': {
        question: "A train travelling at 72 km/h crosses a platform in 30 seconds and a man standing on the platform in 18 seconds. What is the length of the platform in meters?",
        category: "Aptitude", subCategory: "Time, Speed & Distance", difficulty: "medium",
        options: ["240 meters", "200 meters", "280 meters", "180 meters"],
        correctAnswer: 0,
        explanation: "Speed = 72 km/h = 20 m/s. Length of train = Speed × Time to cross man = 20 × 18 = 360m. Length of (train + platform) = 20 × 30 = 600m. Platform length = 600 - 360 = 240m.",
        concept: "Time, Speed and Distance - relative speed with stationary objects",
        tip: "Convert km/h to m/s by multiplying by 5/18. Time to cross a man gives the length of the train.",
        timeEstimate: "2 minutes", company: "General"
      },
      'Technical': {
        question: "What is the time complexity of finding the middle element of a singly linked list in one pass?",
        category: "Technical", subCategory: "Data Structures", difficulty: "medium",
        options: ["O(n) using two pointers (slow/fast)", "O(n²) using nested loops", "O(1) with direct access", "O(n log n) using divide and conquer"],
        correctAnswer: 0,
        explanation: "Use the Tortoise and Hare approach: slow pointer moves 1 step, fast pointer moves 2 steps. When fast reaches the end, slow is at the middle. This is O(n) time and O(1) space.",
        concept: "Two Pointer Technique - Floyd's Tortoise and Hare",
        tip: "The two-pointer technique is a favorite in placement interviews. Practice it for cycle detection, finding middle elements, and palindrome checks.",
        timeEstimate: "1 minute", company: "General"
      },
      'HR': {
        question: "Tell me about a time when you had to deal with a difficult team member. How did you handle the situation?",
        category: "HR", subCategory: "Behavioral", difficulty: "medium",
        options: ["Use STAR method: describe the Situation, Task, Action, and Result", "Simply say you've never had conflicts", "Blame the difficult team member and explain why they were wrong", "Say you always avoid difficult people"],
        correctAnswer: 0,
        explanation: "The STAR method is the gold standard for behavioral questions. Describe a specific Situation, your assigned Task, the concrete Actions you took, and the positive Result achieved. Interviewers want to see emotional intelligence and conflict resolution.",
        concept: "STAR Method for Behavioral Interviews",
        tip: "Prepare 5-6 STAR stories covering teamwork, leadership, failure, and conflict. Most behavioral questions can be answered with these prepared stories.",
        timeEstimate: "2 minutes", company: "General"
      }
    };
    return questions[category] || questions['Technical'];
  },

  mockTest: (company: string) => ({
    testId: `mock-${Date.now()}`,
    title: `${company || 'General'} Placement Mock Test`,
    company: company || 'General',
    duration: "20 minutes",
    totalQuestions: 10,
    questions: [
      { id: "q1", question: "If 20% of A = 30% of B, what is A:B?", category: "Aptitude", difficulty: "easy", options: ["3:2", "2:3", "5:3", "3:5"], correctAnswer: 0, explanation: "0.2A = 0.3B → A/B = 0.3/0.2 = 3/2", marks: 1, negativeMarks: 0.25, timeEstimate: "30 seconds" },
      { id: "q2", question: "Which data structure uses LIFO principle?", category: "Technical", difficulty: "easy", options: ["Stack", "Queue", "Linked List", "Tree"], correctAnswer: 0, explanation: "Stack follows Last In First Out (LIFO). Push adds to top, Pop removes from top.", marks: 1, negativeMarks: 0.25, timeEstimate: "15 seconds" },
      { id: "q3", question: "What is the worst-case time complexity of QuickSort?", category: "Technical", difficulty: "medium", options: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], correctAnswer: 0, explanation: "QuickSort's worst case occurs when the pivot is always the smallest/largest element, leading to O(n²). Average case is O(n log n).", marks: 1, negativeMarks: 0.25, timeEstimate: "30 seconds" },
      { id: "q4", question: "A man bought a cycle for Rs 1400 and sold it for Rs 1680. What is the profit percentage?", category: "Aptitude", difficulty: "easy", options: ["20%", "15%", "25%", "18%"], correctAnswer: 0, explanation: "Profit = 1680-1400 = 280. Profit% = (280/1400)×100 = 20%", marks: 1, negativeMarks: 0.25, timeEstimate: "30 seconds" },
      { id: "q5", question: "Which of the following is NOT a valid HTTP method?", category: "Technical", difficulty: "easy", options: ["FETCH", "PUT", "PATCH", "DELETE"], correctAnswer: 0, explanation: "FETCH is not a standard HTTP method. Standard methods include GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS.", marks: 1, negativeMarks: 0.25, timeEstimate: "15 seconds" },
      { id: "q6", question: "What is the output of: console.log(typeof null)?", category: "Technical", difficulty: "medium", options: ["'object'", "'null'", "'undefined'", "'boolean'"], correctAnswer: 0, explanation: "This is a well-known JavaScript quirk. typeof null returns 'object' due to a historical bug in the language.", marks: 1, negativeMarks: 0.25, timeEstimate: "15 seconds" },
      { id: "q7", question: "Three pipes A, B, C can fill a tank in 6, 8, 12 hours respectively. How long to fill it together?", category: "Aptitude", difficulty: "medium", options: ["2.67 hours", "3 hours", "4 hours", "2 hours"], correctAnswer: 0, explanation: "Combined rate = 1/6 + 1/8 + 1/12 = 4/24 + 3/24 + 2/24 = 9/24 = 3/8. Time = 8/3 = 2.67 hours.", marks: 1, negativeMarks: 0.25, timeEstimate: "2 minutes" },
      { id: "q8", question: "What is the primary purpose of an index in a database?", category: "Technical", difficulty: "medium", options: ["Speed up data retrieval", "Save storage space", "Ensure data integrity", "Enable transactions"], correctAnswer: 0, explanation: "Database indexes speed up SELECT queries by providing quick lookup paths, similar to a book index. They use extra storage but significantly improve read performance.", marks: 1, negativeMarks: 0.25, timeEstimate: "30 seconds" },
      { id: "q9", question: "Choose the correct sentence:", category: "Verbal", difficulty: "easy", options: ["Neither of the students has completed the assignment", "Neither of the students have completed the assignment", "Neither of the student has completed the assignment", "Neither students has completed the assignment"], correctAnswer: 0, explanation: "'Neither' takes a singular verb. 'Neither of the students has' is grammatically correct.", marks: 1, negativeMarks: 0.25, timeEstimate: "30 seconds" },
      { id: "q10", question: "What does ACID stand for in database transactions?", category: "Technical", difficulty: "easy", options: ["Atomicity, Consistency, Isolation, Durability", "Atomicity, Concurrency, Isolation, Durability", "Accuracy, Consistency, Isolation, Durability", "Atomicity, Consistency, Integration, Durability"], correctAnswer: 0, explanation: "ACID stands for Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent transactions don't interfere), Durability (committed data persists).", marks: 1, negativeMarks: 0.25, timeEstimate: "15 seconds" }
    ],
    passingScore: 60,
    instructions: ["Each question carries 1 mark with -0.25 for wrong answers", "No negative marking for unattempted questions", "Read each question carefully before answering", "Time management is key - don't spend too long on one question"]
  }),

  companyPrep: (company: string) => ({
    company,
    overview: {
      description: `${company} is one of the top recruiters from Indian engineering colleges, known for its rigorous selection process and competitive packages.`,
      averagePackage: "8-15 LPA",
      roles: ["Software Engineer", "Associate Software Engineer", "Full Stack Developer"],
      locations: ["Bangalore", "Hyderabad", "Pune", "Chennai"]
    },
    rounds: [
      { name: "Online Assessment", description: "MCQ-based test covering aptitude, verbal, and technical topics", duration: "90 minutes", sections: [
        { name: "Quantitative Aptitude", topics: ["Percentages", "Profit & Loss", "Time & Work", "Number Series", "Probability"], questionCount: 15, tips: ["Practice mental math", "Learn shortcut formulas"] },
        { name: "Logical Reasoning", topics: ["Puzzles", "Coding-Decoding", "Blood Relations", "Syllogisms"], questionCount: 10, tips: ["Draw diagrams for puzzles", "Use Venn diagrams for syllogisms"] },
        { name: "Technical MCQs", topics: ["DSA", "DBMS", "Operating Systems", "OOP Concepts", "Networking"], questionCount: 20, tips: ["Focus on time complexity questions", "Revise SQL joins and normalization"] },
        { name: "Coding", topics: ["Arrays", "Strings", "Dynamic Programming", "Trees", "Graphs"], questionCount: 2, tips: ["Solve on paper first", "Handle edge cases", "Optimize for time complexity"] }
      ]},
      { name: "Technical Interview (Round 1)", description: "Deep dive into DSA, problem-solving, and CS fundamentals", duration: "45-60 minutes", sections: [
        { name: "Problem Solving", topics: ["Live coding on whiteboard", "Algorithm optimization", "Time-space tradeoffs"], questionCount: 2, tips: ["Think aloud", "Start with brute force, then optimize"] },
        { name: "CS Fundamentals", topics: ["OS concepts", "DBMS normalization", "Network protocols"], questionCount: 3, tips: ["Explain with real examples", "Know differences between similar concepts"] }
      ]},
      { name: "Technical Interview (Round 2)", description: "System design and project discussion", duration: "45 minutes", sections: [
        { name: "System Design", topics: ["URL Shortener", "Chat Application", "E-commerce system"], questionCount: 1, tips: ["Draw clear diagrams", "Discuss scalability upfront"] },
        { name: "Project Discussion", topics: ["Your major projects", "Technologies used", "Challenges faced"], questionCount: 1, tips: ["Know every line of code in your projects", "Prepare to discuss trade-offs"] }
      ]},
      { name: "HR Interview", description: "Cultural fit, behavioral questions, and salary discussion", duration: "20-30 minutes", sections: [
        { name: "Behavioral", topics: ["Tell me about yourself", "Strengths & Weaknesses", "Why this company?", "Conflict resolution"], questionCount: 5, tips: ["Use STAR method", "Be authentic", "Research company values"] }
      ]}
    ],
    topTopics: ["Arrays & Strings", "Dynamic Programming", "SQL & DBMS", "System Design Basics", "OOP Concepts"],
    previousYearPatterns: ["2 coding questions of medium-hard difficulty", "MCQs focus heavily on time complexity", "OS questions about process scheduling and memory management", "At least 1 graph/tree problem in interviews"],
    tips: ["Start DSA practice 3 months before placements", "Build at least 2 strong projects with live demos", "Practice mock interviews with peers", "Prepare a 2-minute 'Tell me about yourself' pitch", "Research the company's tech stack and recent news"],
    commonMistakes: ["Not handling edge cases in coding rounds", "Jumping to code without discussing approach", "Not asking clarifying questions", "Being too vague in HR answers", "Not researching the company culture"],
    resources: [
      { name: "Striver's SDE Sheet", type: "website", url: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/" },
      { name: "LeetCode Company Tags", type: "website", url: null },
      { name: "GeeksforGeeks Company Archives", type: "website", url: null },
      { name: "Cracking the Coding Interview", type: "book", url: null }
    ]
  })
};

// ============================================================
//  CAREER DNA - Generate AI-powered career identity card
// ============================================================

router.post('/career-dna/generate', attachUserIfPresent, async (req: Request, res: Response) => {
  try {
    const { profile, assessmentData } = req.body;
    const userId = req.user?.id;

    const prompt = `You are an expert career psychologist and data analyst. Generate a comprehensive "Career DNA" identity card for this student.

${assessmentData ? `ASSESSMENT DATA:\n${JSON.stringify(assessmentData, null, 2)}` : ''}
${profile ? `USER PROFILE:\n${JSON.stringify(profile, null, 2)}` : ''}

Analyze their personality, skills, and aptitude to create a unique career identity.

Return JSON:
{
  "dnaType": "The Innovator" or "The Strategist" or "The Creator" etc. (a memorable archetype),
  "tagline": "A one-line description of their career personality (like a motto)",
  "overallScore": 0-100,
  "percentile": 0-100 (among similar students),
  "dimensions": [
    { "name": "Technical", "score": 0-100, "icon": "code", "color": "#0da2e7", "description": "Brief description", "subSkills": ["sub1", "sub2", "sub3"] }
  ],
  "personalityTraits": [
    { "leftLabel": "Introvert", "rightLabel": "Extrovert", "value": 0-100, "leftIcon": "person", "rightIcon": "groups", "color": "#0da2e7" }
  ],
  "careerMatches": [
    { "title": "Full Stack Developer", "matchPercent": 0-100, "icon": "code", "color": "#0da2e7", "salaryRange": "6-15 LPA", "growth": "+25%", "growthLabel": "Very High", "tags": ["Tech", "Product"] }
  ],
  "strengths": ["strength1", "strength2", "strength3"],
  "idealRoles": ["role1", "role2", "role3"],
  "aiInsight": "A paragraph of personalized career insight"
}

Provide exactly 6 dimensions, 6 personality traits, and 5 career matches.
Use these dimension names: Technical, Creative, Analytical, Leadership, Communication, Problem Solving.
Use these trait spectrums: Introvert/Extrovert, Thinker/Feeler, Planner/Improviser, Specialist/Generalist, Independent/Collaborative, Cautious/Risk-Taker.
Salary ranges should be in Indian LPA format.`;

    const parsed = await callGeminiJSON(prompt, 0.8);
    const data = parsed || DEMO.careerDNA;

    // Store as insight if user is authenticated
    if (userId) {
      await prisma.insight.create({
        data: {
          userId,
          type: 'career_dna',
          source: 'FEATURES',
          prompt: 'Career DNA generation',
          response: JSON.stringify(data),
          summary: data.tagline || 'Career DNA card generated',
        },
      });
    }

    res.json({ success: true, data, aiPowered: !!parsed });
  } catch (error: any) {
    console.error('Career DNA generation failed:', error);
    // Always return demo data as fallback
    res.json({ success: true, data: DEMO.careerDNA, aiPowered: false });
  }
});

router.get('/career-dna', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const insight = await prisma.insight.findFirst({
      where: { userId, type: 'career_dna' },
      orderBy: { createdAt: 'desc' },
    });

    if (!insight) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: insight.response ? JSON.parse(insight.response) : null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
//  RESUME BUILDER - AI-powered resume generation & enhancement
// ============================================================

router.post('/resume/generate-summary', attachUserIfPresent, async (req: Request, res: Response) => {
  try {
    const { personalInfo, experience, education, skills, targetRole } = req.body;

    const prompt = `You are an expert resume writer and career coach. Generate a professional resume summary.

PERSONAL INFO: ${JSON.stringify(personalInfo)}
EXPERIENCE: ${JSON.stringify(experience)}
EDUCATION: ${JSON.stringify(education)}
SKILLS: ${JSON.stringify(skills)}
TARGET ROLE: ${targetRole || 'Software Engineer'}

Return JSON:
{
  "summary": "A compelling 3-4 sentence professional summary optimized for ATS",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "atsScore": 0-100,
  "suggestions": ["improvement1", "improvement2"]
}

Make the summary:
- Start with years of experience and key expertise
- Include 2-3 quantifiable achievements
- Mention target role alignment
- Use industry keywords for ATS optimization
- Keep it under 80 words`;

    const parsed = await callGeminiJSON(prompt, 0.7);
    res.json({ success: true, data: parsed || DEMO.resumeSummary, aiPowered: !!parsed });
  } catch (error: any) {
    res.json({ success: true, data: DEMO.resumeSummary, aiPowered: false });
  }
});

router.post('/resume/enhance', attachUserIfPresent, async (req: Request, res: Response) => {
  try {
    const { section, content, targetRole } = req.body;

    const prompt = `You are an expert resume writer. Enhance this resume ${section} section.

SECTION: ${section}
CURRENT CONTENT: ${JSON.stringify(content)}
TARGET ROLE: ${targetRole || 'Software Engineer'}

Return JSON:
{
  "enhanced": "The improved content with action verbs and metrics",
  "improvements": [
    { "original": "old text", "improved": "new text", "reason": "why this is better" }
  ],
  "atsKeywords": ["keyword1", "keyword2"],
  "score": { "before": 0-100, "after": 0-100 },
  "tips": ["tip1", "tip2"]
}

Enhancement rules:
- Start bullets with strong action verbs
- Add quantifiable metrics
- Use industry-standard terminology
- Optimize for ATS scanning`;

    const parsed = await callGeminiJSON(prompt, 0.7);
    res.json({ success: true, data: parsed || DEMO.resumeEnhance, aiPowered: !!parsed });
  } catch (error: any) {
    res.json({ success: true, data: DEMO.resumeEnhance, aiPowered: false });
  }
});

router.post('/resume/ats-check', attachUserIfPresent, async (req: Request, res: Response) => {
  try {
    const { resumeData, targetRole } = req.body;

    const prompt = `You are an ATS expert. Analyze this resume for ATS compatibility.

RESUME DATA: ${JSON.stringify(resumeData)}
TARGET ROLE: ${targetRole || 'Software Engineer'}

Return JSON:
{
  "atsScore": 0-100,
  "sectionScores": { "contact": 0-100, "summary": 0-100, "experience": 0-100, "education": 0-100, "skills": 0-100, "formatting": 0-100 },
  "keywordsFound": ["keyword1", "keyword2"],
  "keywordsMissing": ["keyword1", "keyword2"],
  "issues": [{ "severity": "critical", "section": "section", "message": "issue", "fix": "how to fix" }],
  "strengths": ["strength1", "strength2"],
  "recommendations": ["rec1", "rec2"]
}`;

    const parsed = await callGeminiJSON(prompt, 0.5);
    const fallback = { atsScore: 72, sectionScores: { contact: 90, summary: 70, experience: 65, education: 85, skills: 75, formatting: 80 }, keywordsFound: ["React", "JavaScript", "Node.js"], keywordsMissing: ["TypeScript", "AWS", "Docker"], issues: [{ severity: "warning", section: "experience", message: "Missing quantifiable metrics", fix: "Add numbers to your achievements" }], strengths: ["Clean formatting", "Good skill keywords"], recommendations: ["Add more action verbs", "Include 2+ projects"] };
    res.json({ success: true, data: parsed || fallback, aiPowered: !!parsed });
  } catch (error: any) {
    res.json({ success: true, data: { atsScore: 72 }, aiPowered: false });
  }
});

// ============================================================
//  SKILL GAP SIMULATOR - AI-powered role analysis
// ============================================================

router.post('/skill-simulator/analyze', attachUserIfPresent, async (req: Request, res: Response) => {
  try {
    const { targetRole, currentSkills, profile } = req.body;

    const prompt = `You are an expert career advisor and skills analyst. Analyze the skill gap for someone targeting the "${targetRole}" role.

${currentSkills ? `CURRENT SKILLS:\n${JSON.stringify(currentSkills, null, 2)}` : ''}
${profile ? `USER PROFILE:\n${JSON.stringify(profile, null, 2)}` : ''}

Provide a thorough skill gap analysis for the "${targetRole}" role in the Indian job market.

Return JSON:
{
  "targetRole": "${targetRole}",
  "readinessScore": 0-100,
  "skills": [
    {
      "name": "Skill Name",
      "category": "Languages" | "Frameworks" | "Tools" | "Soft Skills" | "Core" | "Data" | "Cloud",
      "currentLevel": 0-100,
      "requiredLevel": 0-100,
      "gap": number,
      "priority": "critical" | "important" | "nice-to-have",
      "estimatedHours": number,
      "resources": [{ "name": "Resource", "type": "course", "platform": "Platform", "duration": "duration" }]
    }
  ],
  "summaryStats": { "skillsMet": number, "totalSkills": number, "estimatedWeeks": number, "topPriorities": ["skill1", "skill2"] },
  "salaryRange": "X-Y LPA",
  "demandLevel": "High" | "Medium" | "Low",
  "marketInsight": "Brief market insight"
}

Provide 10-12 skills. Salary in Indian LPA. Real platforms for resources.`;

    const parsed = await callGeminiJSON(prompt, 0.6);
    const data = parsed || DEMO.skillGap(targetRole);

    if (req.user?.id) {
      await prisma.insight.create({
        data: {
          userId: req.user.id,
          type: 'skill_gap_analysis',
          source: 'FEATURES',
          prompt: `Skill gap analysis for ${targetRole}`,
          response: JSON.stringify(data),
          summary: `${targetRole} readiness: ${data.readinessScore || 'N/A'}%`,
        },
      });
    }

    res.json({ success: true, data, aiPowered: !!parsed });
  } catch (error: any) {
    res.json({ success: true, data: DEMO.skillGap(req.body?.targetRole || 'Software Engineer'), aiPowered: false });
  }
});

router.post('/skill-simulator/compare', attachUserIfPresent, async (req: Request, res: Response) => {
  try {
    const { roleA, roleB, currentSkills } = req.body;

    const prompt = `Compare two career roles side by side for a student deciding between them.

ROLE A: ${roleA}
ROLE B: ${roleB}
${currentSkills ? `CURRENT SKILLS:\n${JSON.stringify(currentSkills, null, 2)}` : ''}

Return JSON:
{
  "roleA": { "title": "${roleA}", "matchPercent": 0-100, "uniqueSkills": ["skill1"], "salaryRange": "X-Y LPA", "demandLevel": "High", "growthRate": "+X%" },
  "roleB": { "title": "${roleB}", "matchPercent": 0-100, "uniqueSkills": ["skill1"], "salaryRange": "X-Y LPA", "demandLevel": "High", "growthRate": "+X%" },
  "sharedSkills": ["skill1"],
  "recommendation": "Which role is better suited and why",
  "transitionEase": "How easy to switch between roles"
}`;

    const parsed = await callGeminiJSON(prompt, 0.6);
    const fallback = {
      roleA: { title: roleA, matchPercent: 78, uniqueSkills: ["Frontend Frameworks", "UI/UX"], salaryRange: "8-25 LPA", demandLevel: "High", growthRate: "+28%" },
      roleB: { title: roleB, matchPercent: 72, uniqueSkills: ["Data Analysis", "Statistics"], salaryRange: "10-30 LPA", demandLevel: "High", growthRate: "+35%" },
      sharedSkills: ["Python", "Problem Solving", "Communication"],
      recommendation: `Both ${roleA} and ${roleB} are excellent choices. ${roleA} offers more immediate opportunities while ${roleB} has higher long-term growth potential.`,
      transitionEase: "Moderate - shared foundational skills make switching feasible within 6-12 months of focused learning"
    };
    res.json({ success: true, data: parsed || fallback, aiPowered: !!parsed });
  } catch (error: any) {
    res.json({ success: true, data: { recommendation: "Both roles are excellent choices for your profile." }, aiPowered: false });
  }
});

// ============================================================
//  PLACEMENT PREP - AI-powered placement preparation
// ============================================================

router.post('/placement/generate-question', attachUserIfPresent, async (req: Request, res: Response) => {
  try {
    const { category, subCategory, difficulty, company } = req.body;

    const prompt = `You are a placement preparation coach for Indian engineering college campus placements.

Generate a ${difficulty || 'medium'} difficulty ${category} question${subCategory ? ` in ${subCategory}` : ''}${company ? ` for ${company} placement pattern` : ''}.

Return JSON:
{
  "question": "The question text",
  "category": "${category}",
  "subCategory": "${subCategory || 'General'}",
  "difficulty": "${difficulty || 'medium'}",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0-3,
  "explanation": "Detailed step-by-step explanation",
  "concept": "The underlying concept",
  "tip": "A pro tip for similar questions",
  "timeEstimate": "1 minute",
  "company": "${company || 'General'}"
}

Make it realistic - similar to actual Indian IT placement exam patterns.`;

    const parsed = await callGeminiJSON(prompt, 0.8);
    res.json({ success: true, data: parsed || DEMO.placementQuestion(req.body?.category || 'Technical'), aiPowered: !!parsed });
  } catch (error: any) {
    res.json({ success: true, data: DEMO.placementQuestion(req.body?.category || 'Technical'), aiPowered: false });
  }
});

router.post('/placement/generate-mock-test', attachUserIfPresent, async (req: Request, res: Response) => {
  try {
    const { company, questionCount, categories } = req.body;
    const count = questionCount || 10;

    const prompt = `Generate a complete mock placement test ${company ? `in the pattern of ${company}` : 'for Indian IT campus placements'}.

Generate exactly ${count} questions covering: ${categories ? categories.join(', ') : 'Aptitude, Technical, Verbal'}.

Return JSON:
{
  "testId": "mock-${Date.now()}",
  "title": "${company ? company + ' Mock Test' : 'General Placement Mock Test'}",
  "company": "${company || 'General'}",
  "duration": "${count * 2} minutes",
  "totalQuestions": ${count},
  "questions": [
    { "id": "q1", "question": "text", "category": "Aptitude", "difficulty": "medium", "options": ["A","B","C","D"], "correctAnswer": 0, "explanation": "why", "marks": 1, "negativeMarks": 0.25, "timeEstimate": "1 min" }
  ],
  "passingScore": 60,
  "instructions": ["instruction1"]
}

Make questions realistic and similar to actual placement patterns.`;

    const parsed = await callGeminiJSON(prompt, 0.7);
    res.json({ success: true, data: parsed || DEMO.mockTest(company || 'General'), aiPowered: !!parsed });
  } catch (error: any) {
    res.json({ success: true, data: DEMO.mockTest(req.body?.company || 'General'), aiPowered: false });
  }
});

router.post('/placement/evaluate-answer', attachUserIfPresent, async (req: Request, res: Response) => {
  try {
    const { question, userAnswer, correctAnswer, category } = req.body;

    const prompt = `Evaluate this placement exam answer.

QUESTION: ${question}
CATEGORY: ${category}
USER'S ANSWER: ${userAnswer}
CORRECT ANSWER: ${correctAnswer}

Return JSON:
{
  "isCorrect": true | false,
  "score": 0-100,
  "feedback": "Immediate feedback",
  "detailedExplanation": "Step-by-step explanation",
  "concept": "Concept tested",
  "similarQuestionTip": "How to approach similar questions",
  "relatedTopics": ["topic1", "topic2"],
  "difficulty": "medium"
}`;

    const parsed = await callGeminiJSON(prompt, 0.5);
    const isCorrect = userAnswer === correctAnswer;
    const fallback = {
      isCorrect, score: isCorrect ? 100 : 0,
      feedback: isCorrect ? "Correct! Well done." : "Incorrect. Review the explanation below.",
      detailedExplanation: `The correct answer is "${correctAnswer}". This tests fundamentals of ${category}.`,
      concept: category, similarQuestionTip: "Practice more questions in this category to build speed and accuracy.",
      relatedTopics: [category, "Problem Solving"], difficulty: "medium"
    };
    res.json({ success: true, data: parsed || fallback, aiPowered: !!parsed });
  } catch (error: any) {
    res.json({ success: true, data: { isCorrect: false, feedback: "Unable to evaluate. Please try again." }, aiPowered: false });
  }
});

// ---- Placement Session Persistence ----

router.post('/placement/save-session', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { company, targetRole, questionsData, score, status } = req.body;

    const session = await prisma.placementPrepSession.upsert({
      where: { id: req.body.sessionId || '' },
      create: { userId, company, targetRole, questionsData: JSON.stringify(questionsData), score, status: status || 'IN_PROGRESS' },
      update: { questionsData: JSON.stringify(questionsData), score, status, updatedAt: new Date() },
    });

    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/placement/sessions', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const sessions = await prisma.placementPrepSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ success: true, data: sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/placement/submit-test', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { testId, company, questionsData, score, totalQuestions, timeTaken } = req.body;

    const session = await prisma.placementPrepSession.create({
      data: {
        userId,
        company: company || 'General',
        targetRole: testId,
        questionsData: JSON.stringify(questionsData),
        score,
        status: 'COMPLETED',
      },
    });

    res.json({ success: true, data: { sessionId: session.id, score, totalQuestions, timeTaken } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/placement/company-prep', attachUserIfPresent, async (req: Request, res: Response) => {
  try {
    const { company, profile } = req.body;

    const prompt = `Create a comprehensive placement preparation guide for ${company} campus recruitment in India.

${profile ? `STUDENT PROFILE:\n${JSON.stringify(profile, null, 2)}` : ''}

Return JSON:
{
  "company": "${company}",
  "overview": { "description": "About recruitment process", "averagePackage": "X LPA", "roles": ["role1"], "locations": ["city1"] },
  "rounds": [
    { "name": "Round", "description": "What to expect", "duration": "time", "sections": [{ "name": "Section", "topics": ["t1"], "questionCount": 10, "tips": ["tip1"] }] }
  ],
  "topTopics": ["topic1"],
  "previousYearPatterns": ["pattern1"],
  "tips": ["tip1"],
  "commonMistakes": ["mistake1"],
  "resources": [{ "name": "Resource", "type": "website", "url": null }]
}

Be specific to ${company}'s actual known recruitment patterns.`;

    const parsed = await callGeminiJSON(prompt, 0.7);
    res.json({ success: true, data: parsed || DEMO.companyPrep(company), aiPowered: !!parsed });
  } catch (error: any) {
    res.json({ success: true, data: DEMO.companyPrep(req.body?.company || 'TCS'), aiPowered: false });
  }
});

export default router;
