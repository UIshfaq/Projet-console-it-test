const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {

    // --- 1. NETTOYAGE (On vide tout proprement) ---
    // On désactive la vérification des clés étrangères pour pouvoir vider dans n'importe quel ordre
    await knex.raw('SET FOREIGN_KEY_CHECKS = 0');

    // On vide tes tables existantes
    await knex.raw('TRUNCATE TABLE interventions');
    await knex.raw('TRUNCATE TABLE users');

    // On vide les NOUVELLES tables (Inventaire)
    await knex.raw('TRUNCATE TABLE intervention_materials');
    await knex.raw('TRUNCATE TABLE materials');

    await knex.raw('SET FOREIGN_KEY_CHECKS = 1');


    // --- 2. CRÉATION DES UTILISATEURS ---
    const passwordHash = await bcrypt.hash('Password123!', 10);

    await knex('users').insert([
        { nom: 'Sohail Tech', email: 'tech1@example.com', password_hash: passwordHash, role: 'technicien' }, // ID 1
        { nom: 'Autre Tech', email: 'tech2@example.com', password_hash: passwordHash, role: 'technicien' },  // ID 2
        { nom: 'Stagiaire', email: 'tech3@example.com', password_hash: passwordHash, role: 'technicien' }    // ID 3
    ]);


    // --- 3. UTILITAIRE DE DATES ---
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);
    const formatDate = (date) => date.toISOString().split('T')[0];


    // --- 4. CRÉATION DU STOCK (CATALOGUE GLOBAL) ---
    // Ce sont les articles disponibles au dépôt
    // Comme on a fait un TRUNCATE, les IDs commenceront à 1
    await knex('materials').insert([
        { id: 1, name: 'Box Internet Wi-Fi 6', reference: 'BOX-WF6', stock_quantity: 50 },
        { id: 2, name: 'Câble RJ45 (5m)', reference: 'CABLE-RJ45-5M', stock_quantity: 200 },
        { id: 3, name: 'Jarretière Optique', reference: 'OPT-JARR', stock_quantity: 100 },
        { id: 4, name: 'Boitier PTO (Mural)', reference: 'PTO-STD', stock_quantity: 40 },
        { id: 5, name: 'Décodeur TV 4K', reference: 'TV-4K', stock_quantity: 25 },
        { id: 6, name: 'Caméra IP Extérieure', reference: 'CAM-EXT', stock_quantity: 10 }
    ]);


    // --- 5. CRÉATION DES INTERVENTIONS ---
    await knex('interventions').insert([
        // ID 1 : À FAIRE AUJOURD'HUI (Le test principal)
        {
            id: 1, // On force l'ID pour être sûr de la liaison plus bas
            titre: 'Installation Fibre Optique - Box 8',
            adresse: '10 Rue de la Paix, 75002 Paris',
            date: formatDate(today),
            statut: 'en_cours',
            technicien_id: 1,
            description: 'Client VIP. Attention au parquet fragile.',
            nomClient: "Mme. Dupont",
            rapport: null,
            notes_technicien: null
        },
        // ID 2 : DÉJÀ TERMINÉ
        {
            id: 2,
            titre: 'Dépannage Réseau - Latence',
            adresse: '5 Avenue Anatole France, 75007 Paris',
            date: formatDate(yesterday),
            statut: 'termine',
            technicien_id: 1,
            description: 'Le client se plaint de lenteurs en Wi-Fi.',
            nomClient: "Société TechStart",
            rapport: "Remplacement du routeur effectué.",
            notes_technicien: "Routeur défectueux remplacé."
        },
        // ID 3 : PRÉVU DEMAIN
        {
            id: 3,
            titre: 'Maintenance Serveur',
            adresse: 'La Défense, Tour First',
            date: formatDate(tomorrow),
            statut: 'prevu',
            technicien_id: 1,
            description: 'Maintenance annuelle contractuelle.',
            nomClient: "La Défense Gestion",
            rapport: null,
            notes_technicien: null
        },
        // ID 4 : AUTRE TECH
        {
            id: 4,
            titre: 'Intervention Secrète',
            adresse: 'Marseille',
            date: formatDate(today),
            statut: 'en_cours',
            technicien_id: 2,
            description: 'Tu ne devrais pas voir cette ligne.',
            nomClient: "Inconnu",
            rapport: null,
            notes_technicien: null
        },
        // ID 5 : SEMAINE PROCHAINE
        {
            id: 5,
            titre: 'Installation Caméras de Sécurité',
            adresse: '20 Boulevard Haussmann, 75009 Paris',
            date: formatDate(nextWeek),
            statut: 'prevu', // J'ai corrigé 'archiver' en 'prevu' pour que ce soit logique
            technicien_id: 1,
            description: 'Installation de 4 caméras extérieures.',
            nomClient: "Entreprise SécuriTech",
            rapport: null,
            notes_technicien: null
        },
        // ID 6 : ECHEC
        {
            id: 6,
            titre: 'Mise à Niveau du Système Wi-Fi',
            adresse: '15 Rue du Faubourg, 75011 Paris',
            date: formatDate(yesterday),
            statut: 'echec',
            technicien_id: 1,
            description: 'Mise à niveau points d\'accès.',
            nomClient: "Café Connecté",
            rapport: "Incompatible.",
            notes_technicien: "Matériel incompatible.",
            failure_reason: "Incompatibilité matériel."
        },
        // ID 7 : ARCHIVE
        {
            id: 7,
            titre: 'Réparation Ligne Téléphonique',
            adresse: '8 Place de la République',
            date: formatDate(today),
            statut: 'archiver',
            technicien_id: 1,
            description: 'Réparation ligne.',
            nomClient: "Mme. Martin",
            rapport: "Ligne réparée.",
            notes_technicien: "Client satisfait.",
        }
    ]);


    // --- 6. LIENS MATERIEL <-> INTERVENTION (LA CHECKLIST) ---
    await knex('intervention_materials').insert([

        // POUR L'INTERVENTION 1 (Installation Fibre - Aujourd'hui)
        {
            intervention_id: 1,
            material_id: 1,     // Box Internet
            quantity_required: 1,
            to_bring: true,      // [ ] À mettre dans le camion
            is_checked: false
        },
        {
            intervention_id: 1,
            material_id: 3,     // Jarretière Optique
            quantity_required: 2,
            to_bring: true,      // [ ] À mettre dans le camion
            is_checked: false
        },
        {
            intervention_id: 1,
            material_id: 4,     // Boitier PTO Mural
            quantity_required: 1,
            to_bring: false,     // ℹ️ Déjà chez le client
            is_checked: false
        },

        // POUR L'INTERVENTION 5 (Caméras - Semaine prochaine)
        {
            intervention_id: 5,
            material_id: 6,     // Caméras
            quantity_required: 4,
            to_bring: true,
            is_checked: false
        },
        {
            intervention_id: 5,
            material_id: 2,     // Câbles RJ45
            quantity_required: 10,
            to_bring: true,
            is_checked: false
        }
    ]);

    console.log("Seed terminé avec succès !");
};