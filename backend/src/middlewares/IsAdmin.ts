import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware'; // On réutilise l'interface

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    // On vérifie le rôle (req.userRole a été rempli par verifyToken)
    if (req.userRole && req.userRole === 'admin') {
        next(); // C'est tout bon
    } else {
        res.status(403).json({
            message: "Accès refusé. Droits administrateur requis pour cette action."
        });
    }
};