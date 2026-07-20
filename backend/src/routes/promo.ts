import { Router, Request, Response } from 'express';
import type { ApiResponse } from '../types';
import type { Promo } from "@core/model/promo";
import { validatePromoCode } from '../security';

const router = Router();

const getPromoCodes = (): Promo[] => {
    return [

    ];
};


// POST /api/promoCodes/check
router.post('/promoCodes/check', (req: Request, res: Response) => {
    try {
        const { code } = req.body;

        const cleanCode = validatePromoCode(code);

        if (!cleanCode) {
            return res.status(400).json({
                success: false,
                error: "Le code promo est requis et doit être une chaîne de caractères valide.",
                timestamp: new Date().toISOString()
            });
        }

        const promoCodes = getPromoCodes();
        const foundPromo = promoCodes.find((p) => p.code === cleanCode);

        if (!foundPromo) {
            return res.status(404).json({
                success: false,
                error: "Code promo invalide.",
                timestamp: new Date().toISOString()
            });
        }

        if (foundPromo.expiresAt && new Date() > new Date(foundPromo.expiresAt)) {
            return res.status(410).json({
                success: false,
                error: "Ce code promo a expiré.",
                timestamp: new Date().toISOString()
            });
        }

        const finalDiscount = foundPromo.discount || 0;
        if (finalDiscount < 0 || finalDiscount > 100) {
            return res.status(500).json({
                success: false,
                error: "Configuration de remise invalide sur le serveur.",
                timestamp: new Date().toISOString()
            });
        }

        const response: ApiResponse<{ isValid: boolean; discount: number }> = {
            success: true,
            data: {
                isValid: true,
                discount: finalDiscount
            },
            timestamp: new Date().toISOString()
        };

        return res.json(response);

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;