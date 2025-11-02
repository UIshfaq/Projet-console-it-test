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


// // Test connexion DB
// app.get('/test-db', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT NOW()'); // récupère l'heure actuelle de PostgreSQL
//         res.send(`Connexion OK ! PostgreSQL time: ${result.rows[0].now}`);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Erreur connexion DB');
//     }
// });


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



// GET all users
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// GET user by id
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).send('Utilisateur non trouvé');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// POST new user
app.post('/users', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, password]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// PUT update user
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET name=$1, email=$2, password=$3 WHERE id=$4 RETURNING *',
            [name, email, password, id]
        );
        if (result.rows.length === 0) return res.status(404).send('Utilisateur non trouvé');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// DELETE user
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).send('Utilisateur non trouvé');
        res.send(`Utilisateur ${id} supprimé`);
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