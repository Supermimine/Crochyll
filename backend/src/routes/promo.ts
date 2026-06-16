import { Router, Request, Response } from 'express';
import type { ApiResponse } from '../types';

import type { Promo } from "@core/model/promo";

const router = Router();

const getPromoCodes = (): Promo[] => {
    return [

    ]
}

// GET /api/promoCodes
router.get('/promoCodes', (req: Request, res: Response) => {
    try {
        const promoCodes = getPromoCodes();
        const response: ApiResponse<Promo[]> = {
            success: true,
            data: promoCodes,
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