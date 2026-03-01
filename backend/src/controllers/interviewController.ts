import { Request, Response, NextFunction } from 'express';
import { interviewService } from '@services/interviewService';
import { badgeService } from '@services/badgeService';
import { geminiService } from '@services/geminiService';
import axios from 'axios';
import env from '@config/env';

export const interviewController = {
  /**
   * POST /api/interview/start
   * Start a new interview session
   */
  async startSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { type, difficulty, role } = req.body;

      if (!type || !difficulty) {
        return res.status(400).json({ error: 'Type and difficulty are required' });
      }

      const result = await interviewService.startSession(userId, type, difficulty, role);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/interview/answer
   * Submit answer to a question
   */
  async submitAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { questionId, answer, timeTaken } = req.body;

      if (!questionId || !answer) {
        return res.status(400).json({ error: 'Question ID and answer are required' });
      }

      const result = await interviewService.submitAnswer(
        questionId,
        userId,
        answer,
        timeTaken
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/interview/:sessionId/complete
   * Complete an interview session
   */
  async completeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { sessionId } = req.params;
      const { speechTranscript } = req.body;

      const result = await interviewService.completeSession(
        sessionId,
        userId,
        speechTranscript
      );

      // Check and award badges after interview completion
      const newBadges = await badgeService.checkAndAward(userId);

      res.json({ ...result, newBadges });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/interview/:sessionId
   * Get interview session details
   */
  async getSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { sessionId } = req.params;
      const result = await interviewService.getSession(sessionId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/interview/sessions
   * Get all sessions for a user
   */
  async getUserSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'demo-user';

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const result = await interviewService.getUserSessions(userId, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/interview/stats
   * Get interview statistics
   */
  async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'demo-user';

      const result = await interviewService.getUserStats(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/interview/:sessionId/next
   * Get next question in session
   */
  async getNextQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { sessionId } = req.params;
      const result = await interviewService.getNextQuestion(sessionId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async generateCodingQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { company, difficulty, language, questionIndex } = req.body;
      if (!company || !difficulty || !language) {
        return res.status(400).json({ error: 'Company, difficulty, and language are required' });
      }

      try {
        const result = await geminiService.generateCodingQuestion({
          company,
          difficulty,
          language,
          questionIndex: questionIndex || 1,
        });
        res.json({ question: result.parsed.questions[0] });
      } catch {
        res.json({
          question: {
            problemStatement: `Write a function that takes an array of integers and returns the sum of all positive numbers.\n\nGiven an array of integers (both positive and negative), return the sum of all positive integers in the array. If there are no positive integers, return 0.`,
            constraints: ['1 <= arr.length <= 10^5', '-10^9 <= arr[i] <= 10^9'],
            examples: [
              { input: '5\n1 -2 3 -4 5', output: '9', explanation: 'Positive numbers are 1, 3, 5. Sum = 9' },
              { input: '3\n-1 -2 -3', output: '0', explanation: 'No positive numbers, return 0' },
            ],
            testCases: [
              { input: '5\n1 -2 3 -4 5', expectedOutput: '9', isHidden: false },
              { input: '3\n-1 -2 -3', expectedOutput: '0', isHidden: false },
              { input: '4\n10 20 30 40', expectedOutput: '100', isHidden: true },
              { input: '1\n0', expectedOutput: '0', isHidden: true },
            ],
            expectedTimeComplexity: 'O(n)',
            expectedSpaceComplexity: 'O(1)',
            difficulty: difficulty || 'MEDIUM',
            tags: ['Arrays', 'Basic'],
            starterCode: {
              python: 'n = int(input())\narr = list(map(int, input().split()))\n\ndef solve(arr):\n    # Your code here\n    pass\n\nprint(solve(arr))',
              javascript: 'const readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\nrl.on("line", (line) => lines.push(line));\nrl.on("close", () => {\n  const n = parseInt(lines[0]);\n  const arr = lines[1].split(" ").map(Number);\n  // Your code here\n  console.log(0);\n});',
              java: 'import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int n = sc.nextInt();\n    int[] arr = new int[n];\n    for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n    // Your code here\n    System.out.println(0);\n  }\n}',
              cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n  int n;\n  cin >> n;\n  vector<int> arr(n);\n  for (int i = 0; i < n; i++) cin >> arr[i];\n  // Your code here\n  cout << 0 << endl;\n  return 0;\n}',
              c: '#include <stdio.h>\n\nint main() {\n  int n;\n  scanf("%d", &n);\n  int arr[n];\n  for (int i = 0; i < n; i++) scanf("%d", &arr[i]);\n  // Your code here\n  printf("0\\n");\n  return 0;\n}',
            },
          },
        });
      }
    } catch (error) {
      next(error);
    }
  },

  async analyzeCode(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { problemStatement, code, language, testResults, timeTaken } = req.body;
      if (!code || !language || !problemStatement) {
        return res.status(400).json({ error: 'Code, language, and problem statement are required' });
      }

      if (code.length > 50000) {
        return res.status(400).json({ error: 'Code too long (max 50KB)' });
      }

      try {
        const result = await geminiService.analyzeCode({
          problemStatement,
          code,
          language,
          testResults: testResults || [],
          timeTaken: timeTaken || 0,
        });
        res.json({ analysis: result.parsed });
      } catch {
        const passed = (testResults || []).filter((t: any) => t.passed).length;
        const total = (testResults || []).length;
        const score = total > 0 ? Math.round((passed / total) * 100) : 0;
        res.json({
          analysis: {
            score,
            feedback: `${passed}/${total} test cases passed.`,
            correctness: score,
            timeComplexity: 'N/A',
            spaceComplexity: 'N/A',
            codeQuality: 50,
            edgeCaseHandling: 50,
            namingConventions: 50,
            strengths: passed > 0 ? ['Some test cases passed'] : [],
            improvements: passed < total ? ['Not all test cases passed'] : [],
          },
        });
      }
    } catch (error) {
      next(error);
    }
  },

  async textToSpeech(req: Request, res: Response, next: NextFunction) {
    try {
      const { text, voiceId } = req.body;
      if (!text) return res.status(400).json({ error: 'Text is required' });

      const apiKey = (env as any).ELEVENLABS_API_KEY;
      if (!apiKey) {
        return res.status(404).json({ error: 'TTS not configured', fallback: true });
      }

      const voice = voiceId || '21m00Tcm4TlvDq8ikWAM';
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.5 },
        },
        {
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          responseType: 'arraybuffer',
        }
      );

      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(Buffer.from(response.data));
    } catch (error) {
      next(error);
    }
  },
};
