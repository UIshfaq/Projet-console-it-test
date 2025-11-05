// 1. NE PAS UTILISER dotenv.config(), Docker s'en occupe.
// require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise'); // <--- CHANGEMENT

const app = express();
app.use(express.json());

// 2. Connexion MySQL (avec un Pool)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 3. Test de connexion (optionnel, se fait au premier query)
// Nous allons tester la connexion au démarrage
async function checkDbConnection() {
    try {
        await pool.query('SELECT 1'); // Simple query pour tester
        console.log('Connecté à MySQL !');
    } catch (err) {
        console.error('Erreur de connexion à la DB', err);

    }
}

// Route test
app.get('/', (req, res) => {
    res.send('API fonctionne !');
});

// GET all users
app.get('/users', async (req, res) => {
    try {
        // 4. La syntaxe [rows] est spécifique à mysql2
        const [rows] = await pool.query('SELECT * FROM users');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// GET user by id
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // 5. Utiliser '?' au lieu de '$1'
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).send('Utilisateur non trouvé');
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// POST new user
app.post('/users', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // 6. MySQL n'a pas 'RETURNING *'.
        // On insère, puis on récupère le nouvel utilisateur.
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, password]
        );

        // On récupère l'ID de l'utilisateur inséré
        const newUserId = result.insertId;

        // On re-sélectionne l'utilisateur
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [newUserId]);
        res.status(201).json(rows[0]);

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
        // 7. Logique d'update pour MySQL
        const [result] = await pool.query(
            'UPDATE users SET name=?, email=?, password=? WHERE id=?',
            [name, email, password, id]
        );

        if (result.affectedRows === 0) return res.status(404).send('Utilisateur non trouvé');

        // On re-sélectionne l'utilisateur mis à jour
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        res.json(rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// DELETE user
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // 8. Logique de suppression pour MySQL
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) return res.status(404).send('Utilisateur non trouvé');

        res.send(`Utilisateur ${id} supprimé`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});


// 9. Démarrage du serveur
const PORT = process.env.PORT || 3000; // Doit être 3000

app.listen(PORT, async () => {
    await checkDbConnection(); // On teste la DB avant de dire "OK"
    console.log(`Serveur lancé sur le port ${PORT}`);
});