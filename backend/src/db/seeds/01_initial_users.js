const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
    // --- 1. NETTOYAGE COMPLET ---
    await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
    await knex.raw('TRUNCATE TABLE intervention_technicians'); // NOUVELLE TABLE
    await knex.raw('TRUNCATE TABLE intervention_materials');
    await knex.raw('TRUNCATE TABLE interventions');
    await knex.raw('TRUNCATE TABLE users');
    await knex.raw('TRUNCATE TABLE materials');
    await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

    // --- 2. CRÉATION DES UTILISATEURS ---
    const passwordHash = await bcrypt.hash('Password123!', 10);
    await knex('users').insert([
        { id: 1, nom: 'Sohail Tech', email: 'tech1@example.com', password_hash: passwordHash, role: 'technicien', phone_number: "+33123456789" },
        { id: 2, nom: 'Thomas Groom', email: 'tech2@example.com', password_hash: passwordHash, role: 'technicien', phone_number: "+33687654321" },
        { id: 3, nom: 'Stagiaire', email: 'tech3@example.com', password_hash: passwordHash, role: 'technicien', phone_number: "+33953741235" },
        { id: 4, nom: 'Admin User', email: 'admin1@example.com', password_hash: passwordHash, role: 'admin', phone_number: "+33111222333" }
    ]);

    // --- 3. UTILITAIRE DE DATES ---
    const today = new Date().toISOString().split('T')[0];

    // --- 4. CATALOGUE MATÉRIEL ---
    await knex('materials').insert([
        { id: 1, name: 'Box Internet Wi-Fi 6', reference: 'BOX-WF6', stock_quantity: 50 },
        { id: 2, name: 'Câble RJ45 (5m)', reference: 'CABLE-RJ45-5M', stock_quantity: 200 }
    ]);

    // --- 5. CRÉATION DES INTERVENTIONS ---
    // Note : On ne remplit plus 'technicien_id' ici car on passe par la table de liaison
    await knex('interventions').insert([
        {
            id: 1,
            titre: 'Installation Fibre - Chantier Binôme',
            adresse: '10 Rue de la Paix, Paris',
            date: today,
            statut: 'en_cours',
            nomClient: "Mme. Dupont",
            description: "Installation complexe nécessitant deux personnes."
        },
        {
            id: 2,
            titre: 'Maintenance Solo',
            adresse: '5 Avenue Anatole France, Paris',
            date: today,
            statut: 'prévu',
            nomClient: "Boulangerie Centrale",
            description: "Simple vérification des branchements."
        }
    ]);

    // --- 6. LIENS ÉQUIPES (LA PARTIE MULTI-TECH) ---
    await knex('intervention_technicians').insert([
        // Intervention 1 : Sohail (1) ET Thomas (2) travaillent ensemble
        { intervention_id: 1, technician_id: 1 },
        { intervention_id: 1, technician_id: 2 },

        // Intervention 2 : Sohail (1) est seul
        { intervention_id: 2, technician_id: 1 }
    ]);

    // --- 7. LIENS MATÉRIEL ---
    await knex('intervention_materials').insert([
        { intervention_id: 1, material_id: 1, quantity_required: 1, to_bring: true, is_checked: false }
    ]);

    console.log("Seed Multi-techniciens terminé !");
};