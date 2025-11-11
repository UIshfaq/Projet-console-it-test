const express = require('express');
const cors = require('cors')
const app = express();
const pool = require('./db-connection'); // Assurez-vous que ce chemin est correct

app.use(cors());

// 2. Middleware pour lire et parser le corps des requêtes en JSON
app.use(express.json());

// --- Importer et "brancher" les routes ---
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes); // Préfixe: /auth/register, /auth/login, etc.



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