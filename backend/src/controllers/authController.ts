import { Request, Response } from 'express'; // 1. Import indispensable pour les types
import bcrypt from 'bcrypt'; // On reste sur bcrypt standard
import jwt from "jsonwebtoken";
import db from '../db/db-connection';

interface RegisterBody {
    email: string;
    password: string;
    nom: string;
    role?: string;
    phone_number?: string;
}

interface LoginBody {
    email: string;
    password: string;
}

export const addUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // On force le typage du body
        const { nom, email, password, role, phone_number } = req.body as RegisterBody;

        if (!nom || !email || !password) {
            res.status(400).json({ message: 'Veuillez remplir les champs obligatoires (nom, email, password).' });
            return;
        }

        const existingUser = await db('users').where({ email: email }).first();

        if (existingUser) {
            res.status(409).json({ message: 'Cet email est déjà utilisé.' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await db('users').insert({
            nom: nom,
            email: email,
            password_hash: passwordHash, // Attention: vérifie bien le nom de colonne en BDD
            role: role || 'technician',
            phone_number: phone_number || null,
            isActive: 1 // MySQL utilise 1 pour true
        });

        res.status(201).json({ message: 'Utilisateur créé avec succès !' });

    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body as LoginBody;

        if (!email || !password) {
            res.status(400).json({ message: "Veuillez remplir tous les champs" });
            return;
        }

        const user = await db('users')
            .where({ email: email }) // On vérifie isActive après pour donner un message plus clair
            .first();

        if (!user) {
            res.status(401).json({ message: "Email ou mot de passe incorrect." });
            return;
        }

        // Vérification du hash
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            res.status(401).json({ message: "Email ou mot de passe incorrect." });
            return;
        }

        // Vérification compte actif
        if (user.isActive === 0) { // 0 = false
            res.status(403).json({ message: "Ce compte a été désactivé." });
            return;
        }

        // Création du Token
        // On sécurise le process.env pour éviter que TS râle "possibly undefined"
        const secret = process.env.JWT_SECRET || 'secret_temporaire';

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            secret,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Connexion réussie",
            token: token,
            user: {
                id: user.id,
                nom: user.nom,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Erreur lors de la CONNEXION:", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
