const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {

    // --- 1. NETTOYAGE (On vide tout proprement) ---
    await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
    await knex.raw('TRUNCATE TABLE interventions');
    await knex.raw('TRUNCATE TABLE users');
    await knex.raw('SET FOREIGN_KEY_CHECKS = 1');


    // --- 2. CRÉATION DES UTILISATEURS ---
    // On crée 3 techniciens avec le même mot de passe simple
    const passwordHash = await bcrypt.hash('Password123!', 10);

    await knex('users').insert([
        { nom: 'Sohail Tech', email: 'tech1@example.com', password_hash: passwordHash, role: 'technicien' }, // ID 1 (C'est toi !)
        { nom: 'Autre Tech', email: 'tech2@example.com', password_hash: passwordHash, role: 'technicien' },  // ID 2
        { nom: 'Stagiaire', email: 'tech3@example.com', password_hash: passwordHash, role: 'technicien' }    // ID 3
    ]);


    // --- 3. UTILITAIRE DE DATES (Pour avoir des dates dynamiques) ---
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);

    // Fonction pour formater en 'YYYY-MM-DD' (Format SQL standard)
    const formatDate = (date) => date.toISOString().split('T')[0];


    // --- 4. CRÉATION DES INTERVENTIONS (SCÉNARIOS DE TEST) ---
    await knex('interventions').insert([
        // --- SCÉNARIO 1 : À FAIRE AUJOURD'HUI (Le test principal) ---
        {
            titre: 'Installation Fibre Optique - Box 8',
            adresse: '10 Rue de la Paix, 75002 Paris',
            date: formatDate(today), // C'est pour aujourd'hui
            statut: 'en_cours',
            technicien_id: 1, // Pour toi (tech1)
            description: 'Client VIP. Attention au parquet fragile. Appeler avant d\'arriver.',
            nomClient: "Mme. Dupont",
            rapport: null ,// Pas encore de rapport
            notes_technicien: null
        },

        // --- SCÉNARIO 2 : DÉJÀ TERMINÉ (Pour vérifier l'affichage en lecture seule) ---
        {
            titre: 'Dépannage Réseau - Latence',
            adresse: '5 Avenue Anatole France, 75007 Paris',
            date: formatDate(yesterday), // C'était hier
            statut: 'termine', // Note bien : sans accent comme dans le code
            technicien_id: 1,
            description: 'Le client se plaint de lenteurs en Wi-Fi.',
            nomClient: "Société TechStart",
            rapport: "Remplacement du routeur effectué. Tests de débit OK (900 Mbps). Client satisfait." ,// Rapport déjà rempli
            notes_technicien: "Routeur défectueux remplacé. Penser à vérifier les autres équipements du client lors de la prochaine visite."
        },

        // --- SCÉNARIO 3 : PRÉVU DEMAIN ---
        {
            titre: 'Maintenance Serveur',
            adresse: 'La Défense, Tour First',
            date: formatDate(tomorrow),
            statut: 'prevu', // Sans accent
            technicien_id: 1,
            description: 'Maintenance annuelle contractuelle.',
            nomClient: "La Défense Gestion",
            rapport: null,
            notes_technicien: null
        },

        // --- SCÉNARIO 4 : POUR UN AUTRE TECH (Vérifier que tu ne vois pas ça) ---
        {
            titre: 'Intervention Secrète',
            adresse: 'Marseille',
            date: formatDate(today),
            statut: 'en_cours',
            technicien_id: 2, // Pas pour toi !
            description: 'Tu ne devrais pas voir cette ligne.',
            nomClient: "Inconnu",
            rapport: null,
            notes_technicien: null
        },

        {
            titre: 'Installation Caméras de Sécurité',
            adresse: '20 Boulevard Haussmann, 75009 Paris',
            date: formatDate(nextWeek),
            statut: 'archiver',
            technicien_id: 1,
            description: 'Installation de 4 caméras extérieures et 2 intérieures.',
            nomClient: "Entreprise SécuriTech",
            rapport: "Installation réussie. Configuration du système de surveillance terminée.",
            notes_technicien: "Client satisfait de l'installation."
        }
    ]);
};