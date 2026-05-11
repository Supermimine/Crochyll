import { Router, Request, Response } from 'express';
import type { ApiResponse, EmailRequest } from '../types';

const router = Router();

// POST /api/email/send - Envoyer un email
router.post('/email/send', async (req: Request, res: Response) => {
  try {
    const { to, subject, message }: EmailRequest = req.body;

    // Validation de base
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, message',
        timestamp: new Date().toISOString()
      });
    }

    // TODO: Implémenter la logique d'envoi d'email
    // Options:
    // 1. Nodemailer pour envoyer directement
    // 2. EmailJS API depuis le backend
    // 3. Service tiers (SendGrid, Mailgun, etc.)

    console.log(`📧 Email request received:`, { to, subject, messageLength: message.length });

    const response: ApiResponse<{ messageId: string }> = {
      success: true,
      data: { messageId: `msg_${Date.now()}` },
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

// POST /api/email/contact - Contact form spécifique
router.post('/email/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        timestamp: new Date().toISOString()
      });
    }

    // TODO: Implémenter l'envoi du formulaire de contact
    console.log(`📧 Contact form received from: ${email}`, { name, subject });

    const response: ApiResponse<{ status: string }> = {
      success: true,
      data: { status: 'Contact email received' },
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
