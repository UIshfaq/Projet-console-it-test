
// 1. Importer Express et créer le routeur
const express = require('express');
const router = express.Router();

// 2. Importer tous les outils
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const db = require('../db-connection'); // Notre connexion BDD

router.post('/register', async (req, res) => {
    try {
        const { nom, email, password } = req.body;

        if (!nom || !email || !password) {
            return res.status(400).json({ message: 'Veuillez remplir tous les champs.' });
        }

        const existingUser = await db('users').where({ email: email }).first();

        if (existingUser) {
            return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
        }



        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await db('users').insert({
            nom: nom,
            email: email,
            password_hash: passwordHash,
            role: 'technicien'
        });

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

        const user = await db('users')
            .where({ email: email })
            .select('id', 'nom', 'email', 'role', 'password_hash')
            .first();


        if (!user) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        // La comparaison de mot de passe ne change pas
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