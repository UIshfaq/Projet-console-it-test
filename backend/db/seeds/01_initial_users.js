// backend/db/seeds/01_initial_users.js

// Tu auras besoin de bcrypt pour hacher les mots de passe
const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {


    // 2. Prépare tes utilisateurs (hache les mots de passe)
    const passwordHash1 = await bcrypt.hash('Password1234!', 10);
    const passwordHash2 = await bcrypt.hash('Password5678!', 10);
    const passwordHash3 = await bcrypt.hash('Password9123!', 10);

    // 3. Insère les nouveaux utilisateurs
    await knex('users').insert([
        { nom: 'Tech 1', email: 'tech1@example.com', password_hash: passwordHash1, role: 'technicien' },
        { nom: 'Tech 2', email: 'tech2@example.com', password_hash: passwordHash2, role: 'technicien' },
        { nom: 'Tech 3', email: 'admin@example.com', password_hash: passwordHash3, role: 'technicien' }
    ]);
};

