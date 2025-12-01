// backend/db/seeds/01_initial_users.js
const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {

    // 1. DÉSACTIVER LES CLÉS ÉTRANGÈRES
    await knex.raw('SET FOREIGN_KEY_CHECKS = 0');

    // 2. VIDER ET RÉINITIALISER LES TABLES
    // On vide les 'enfants' (interventions) en premier
    await knex.raw('TRUNCATE TABLE interventions');
    // On vide les 'parents' (users) ensuite
    await knex.raw('TRUNCATE TABLE users');

    // 3. RÉACTIVER LES CLÉS ÉTRANGÈRES
    await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

    // 4. CRÉER LES NOUVEAUX UTILISATEURS (Ils auront les ID 1, 2, 3)
    const passwordHash1 = await bcrypt.hash('Password123!', 10);
    const passwordHash2 = await bcrypt.hash('Password456!', 10);
    const passwordHash3 = await bcrypt.hash('Password789!', 10);

    await knex('users').insert([
        { nom: 'Tech 1', email: 'tech1@example.com', password_hash: passwordHash1, role: 'technicien' }, // ID 1
        { nom: 'Tech 2', email: 'tech2@example.com', password_hash: passwordHash2, role: 'technicien' }, // ID 2
        { nom: 'Tech 3', email: 'tech3@example.com', password_hash: passwordHash3, role: 'technicien' }      // ID 3
    ]);

    // 5. CRÉER LES NOUVELLES INTERVENTIONS (MAINTENANT ÇA MARCHE)
    await knex('interventions').insert([
        {
            titre: 'Intervention 1',
            adresse: 'Paris',
            date: '2025-11-15',
            statut: 'en_cours',
            technicien_id: 1,
            description: 'Vérification du système électrique.',
            latitude: 48.8566,
            longitude: 2.3522,
            nomClient: "Jean Jaques"
        },
        {
            titre: 'Intervention 2',
            adresse: 'Lyon',
            date: '2025-11-16',
            statut: 'termine',
            technicien_id: 2,
            description: 'Remplacement des pièces défectueuses.',
            latitude: 45.7640,
            longitude: 4.8357,
            nomClient: "Paul Batiste"
        },
        {
            titre: 'Intervention 3',
            adresse: 'Marseille',
            date: '2025-11-17',
            statut: 'prévu',
            technicien_id: 1,
            description: 'Inspection générale du site.',
            latitude: 43.2965,
            longitude: 5.3698,
            nomClient: "Durant Edward"
        }
    ]);
};