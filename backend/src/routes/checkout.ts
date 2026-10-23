import { Router, Request, Response } from 'express';
import { capturePayPalOrder, CheckoutError, createPayPalOrder } from '../services/checkout.service';

const router = Router();

router.post('/checkout/orders', async (req: Request, res: Response) => {
  try {
    const result = await createPayPalOrder(req.body);
    res.json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (error) {
    if (error instanceof CheckoutError) {
      res.status(error.statusCode).json({ success: false, error: error.message, timestamp: new Date().toISOString() });
      return;
    }
    console.error('PayPal order creation error:', error);
    res.status(502).json({ success: false, error: 'Unable to create PayPal order', timestamp: new Date().toISOString() });
  }
});

router.post('/checkout/orders/:orderId/capture', async (req: Request, res: Response) => {
  try {
    const result = await capturePayPalOrder(req.params.orderId);
    res.json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (error) {
    if (error instanceof CheckoutError) {
      res.status(error.statusCode).json({ success: false, error: error.message, timestamp: new Date().toISOString() });
      return;
    }
    console.error('PayPal capture error:', error);
    res.status(502).json({ success: false, error: 'Unable to verify PayPal payment', timestamp: new Date().toISOString() });
  }
});

export default router;