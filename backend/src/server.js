const express = require('express');
const cors = require('cors')
const app = express();
app.use(express.json()); // Middleware pour lire le JSON
app.use(cors());
// On importe le pool juste pour tester la connexion au début
const pool = require('./db-connection');

// --- Importer et "brancher" les routes ---
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes); // Préfixe: /auth/register, /auth/login, etc.


// (Vous pouvez garder vos routes /users ici pour l'instant si vous voulez)
// (Mais idéalement, elles iraient dans 'routes/userRoutes.js')


// --- Démarrage du serveur ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    // Tester la connexion au démarrage
    try {
        await pool.query('SELECT 1');
        console.log('Connecté à MySQL !');
        console.log(`Serveur lancé sur le port ${PORT}`);
    } catch (err) {
        console.error('Erreur de connexion à la DB au démarrage', err);
    }
});