
// 1. Importer Express et créer le routeur
const express = require('express');
const router = express.Router();

// 2. Importer tous les outils
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const pool = require('../db-connection'); // Notre connexion BDD

router.post('/register', async (req, res) => {
    try {
        const { nom, email, password } = req.body;

        if (!nom || !email || !password) {
            return res.status(400).json({ message: 'Veuillez remplir tous les champs.' });
        }

        const [existingUser] = await pool.query(
            'SELECT email FROM users WHERE email = ?', [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await pool.query(
            'INSERT INTO users (nom, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [nom, email, passwordHash, 'technicien']
        );

        res.status(201).json({ message: 'Utilisateur créé avec succès !' });

    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Veuillez remplir tous les champs" });
        }

        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        const user = users[0];

        // --- DÉBUT DE LA CORRECTION ---
        // Les 4 lignes de 'register' qui étaient ici ONT ÉTÉ SUPPRIMÉES.
        // On passe directement à la comparaison :
        // --- FIN DE LA CORRECTION ---

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch === false) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        // Création du Token
        const payload = {
            userId: user.id,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Envoyer la réponse de succès
        return res.status(200).json({
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
});


// 3. Exporter le routeur (NE PAS OUBLIER !)
module.exports = router;