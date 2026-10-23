import { Router, Request, Response } from 'express';
import type { ApiResponse } from '../types';
import { mailerService } from '../services/mailer.service';
import { normalizeText, validateEmail } from '../security';

const router = Router();

// POST /api/email/contact
router.post('/email/contact', async (req: Request, res: Response) => {
  try {
    const { username, email, subject, message } = req.body;

    const safeUsername = normalizeText(username, 120);
    const safeEmail = validateEmail(email);
    const safeSubject = normalizeText(subject, 120);
    const safeMessage = normalizeText(message, 4000);

    if (!safeUsername || !safeEmail || !safeSubject || !safeMessage) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid required fields',
        timestamp: new Date().toISOString()
      });
    }

    const result = await mailerService.sendPersonalizedRequestEmail(safeUsername, safeEmail, safeSubject, safeMessage);

    if (!result.success) {
      return res.status(502).json({
        success: false,
        error: 'Unable to send contact email',
        timestamp: new Date().toISOString()
      });
    }

    const response: ApiResponse<{ status: string }> = {
      success: true,
      data: { status: 'Contact email sent successfully' },
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (error: any) {
    console.error('Contact email error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to send contact email',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
