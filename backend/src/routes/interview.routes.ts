import { Router } from 'express';
import { interviewController } from '@controllers/interviewController';
import { authenticate, attachUserIfPresent } from '@middleware/authenticate';
import { usageLimit } from '@middleware/usageLimit';

const router = Router();

// All routes allow optional authentication (demo mode supported)
router.use(attachUserIfPresent);

// User data routes (must come before parameterized routes)
router.get('/sessions', interviewController.getUserSessions);
router.get('/stats', interviewController.getUserStats);

// Coding interview endpoints
router.post('/coding-question', interviewController.generateCodingQuestion);
router.post('/analyze-code', interviewController.analyzeCode);
router.post('/tts', interviewController.textToSpeech);

// Interview session routes — starting a session is usage-limited for free users (2/month)
router.post('/start', authenticate, usageLimit('mock_interview', 2, 'month'), interviewController.startSession);
router.post('/answer', interviewController.submitAnswer);
router.post('/:sessionId/complete', interviewController.completeSession);
router.get('/:sessionId', interviewController.getSession);
router.get('/:sessionId/next', interviewController.getNextQuestion);

export default router;
