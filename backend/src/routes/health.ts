import { Router, Request, Response } from 'express';
import type { ApiResponse } from '../types';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  const response: ApiResponse<{ status: string }> = {
    success: true,
    data: { status: 'ok' },
    timestamp: new Date().toISOString()
  };
  res.json(response);
});

export default router;
