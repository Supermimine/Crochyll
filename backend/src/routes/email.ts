import { Router, Request, Response } from 'express';
import type { ApiResponse } from '../types';
import { EmailRequest } from '@core/model/email/emailRequest';
import { mailerService } from '../services/mailer.service';
import { normalizeText, validateEmail } from '../security';

const router = Router();

// POST /api/email/send
router.post('/email/send', async (req: Request, res: Response) => {
  try {
    const { to, subject, message }: EmailRequest = req.body;

    const safeTo = validateEmail(to);
    const safeSubject = normalizeText(subject, 120);
    const safeMessage = normalizeText(message, 4000);

    if (!safeTo || !safeSubject || !safeMessage) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid required fields',
        timestamp: new Date().toISOString()
      });
    }

    const result = await mailerService.sendEmail(safeTo, safeSubject, safeMessage);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to send email',
        timestamp: new Date().toISOString()
      });
    }

    const response: ApiResponse<{ messageId: string }> = {
      success: true,
      data: { messageId: result.messageId || '' },
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (error: any) {
    console.error('Email error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email',
      timestamp: new Date().toISOString()
    });
  }
});

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
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to send personalized request email',
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
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/email/order-confirmation
router.post('/email/order-confirmation', async (req: Request, res: Response) => {
  try {
    const { to, orderData } = req.body;

    const safeTo = validateEmail(to);

    if (!safeTo || !orderData || typeof orderData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, orderData',
        timestamp: new Date().toISOString()
      });
    }

    const result = await mailerService.sendOrderConfirmation(safeTo, orderData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to send order confirmation',
        timestamp: new Date().toISOString()
      });
    }

    const response: ApiResponse<{ status: string; messageId: string }> = {
      success: true,
      data: { 
        status: 'Order confirmation sent successfully',
        messageId: result.messageId || ''
      },
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
