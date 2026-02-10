import { Request, Response } from 'express';
import db from '../db/db-connection';

// Interface pour étendre la requête Express et y ajouter userId (injecté par le middleware)
interface AuthRequest extends Request {
    userId?: number;
}

export const getProfil = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId;

    // Sécurité TypeScript : on vérifie que le userId est bien là
    if (!userId) {
        res.status(401).json({ message: "Utilisateur non identifié." });
        return;
    }

    try {
        const user = await db('users')
            .where({ id: userId })
            // J'ai ajouté 'role' car c'est souvent utile pour le front (ex: afficher menu admin)
            .select('id', 'nom', 'email', 'phone_number', 'created_at', 'role')
            .first();

        if (!user) {
            res.status(404).json({ message: "Utilisateur non trouvé" });
            return;
        }

        res.status(200).json(user);
    }
    catch (e) {
        console.error("Erreur lors de la récupération du profil utilisateur :", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await db('users')
            .select('id', 'nom', 'email', 'role', 'phone_number', 'created_at')
            .where({ isActive: true }) // On ne récupère que les actifs (Soft Delete)
            .orderBy('nom', 'asc'); // Petit bonus UX : tri alphabétique

        res.status(200).json(users);
    }
    catch (e) {
        console.error("Erreur lors de la récupération des utilisateurs :", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;

    try {
        // Soft Delete : On passe isActive à false (ou 0) au lieu de supprimer la ligne
        const deletedRows = await db('users')
            .where({ id: userId })
            .update({ isActive: false }); // false sera converti en 0 par Knex pour MySQL

        if (deletedRows === 0) {
            res.status(404).json({ message: "Utilisateur non trouvé" });
            return;
        }

        res.status(200).json({ message: "Utilisateur désactivé avec succès" });
    }
    catch (e) {
        console.error("Erreur lors de la désactivation de l'utilisateur :", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
};