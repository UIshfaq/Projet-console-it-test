import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface personnalisée qu'on exporte pour l'utiliser ailleurs
export interface AuthRequest extends Request {
    userId?: number;
    userRole?: string; // Tu utilisais 'userRole' dans ton JS, on garde ça !
}

interface DecodedToken {
    userId: number;
    role: string;
    iat: number;
    exp: number;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    // 1. Récupérer le token
    const authHeader = req.headers['authorization'];

    // On vérifie que le header existe et commence bien par Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Accès refusé. Jeton manquant.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        // Pour éviter que TS râle sur une variable d'env potentiellement undefined
        const secret = process.env.JWT_SECRET || 'secret_temporaire';

        // 2. Vérifier et décoder
        const decoded = jwt.verify(token, secret) as DecodedToken;

        // 3. Attacher les infos à la requête (Cast en AuthRequest)
        (req as AuthRequest).userId = decoded.userId;
        (req as AuthRequest).userRole = decoded.role;

        next();
    } catch (err) {
        console.error("Erreur de validation JWT:", err instanceof Error ? err.message : err);
        res.status(403).json({ message: 'Jeton invalide ou expiré.' });
    }
};