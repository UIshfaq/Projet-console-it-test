require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Connexion PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Test de connexion à la DB
pool.connect((err) => {
    if (err) {
        console.error('Erreur connexion DB', err);
    } else {
        console.log('Connecté à PostgreSQL !');
    }
});

// Route test
app.get('/', (req, res) => {
    res.send('API fonctionne !');
});

// Route pour récupérer tous les users
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});






const PORT = process.env.PORT || 3000;

// Démarrage serveur
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});