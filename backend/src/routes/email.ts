import { Router, Request, Response } from 'express';
import type { ApiResponse } from '../types';
import { EmailRequest } from '@core/model/email/emailRequest';
import { mailerService } from '../services/mailer.service';

const router = Router();

// POST /api/email/send
router.post('/email/send', async (req: Request, res: Response) => {
  try {
    const { to, subject, message }: EmailRequest = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, message',
        timestamp: new Date().toISOString()
      });
    }

    const result = await mailerService.sendEmail(to, subject, message);

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

    if (!username || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        timestamp: new Date().toISOString()
      });
    }

    const result = await mailerService.sendPersonalizedRequestEmail(username, email, subject, message);

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

    if (!to || !orderData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, orderData',
        timestamp: new Date().toISOString()
      });
    }

    // Envoyer la confirmation de commande
    const result = await mailerService.sendOrderConfirmation(to, orderData);

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
