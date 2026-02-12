/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
    console.log("🌱 Démarrage du seed...");

    // --- 1. NETTOYAGE COMPLET (Ordre important pour les clés étrangères) ---
    await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
    await knex('intervention_technicians').truncate();
    await knex('intervention_materials').truncate();
    await knex('interventions').truncate();
    await knex('users').truncate();
    await knex('materials').truncate();
    await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

    // --- 2. CRÉATION DES UTILISATEURS ---
    // Mot de passe pour tous : "Password123!"
    const passwordHash = await bcrypt.hash('Password123!', 10);

    await knex('users').insert([
        { id: 1, nom: 'Sohail Tech', email: 'tech1@example.com', password_hash: passwordHash, role: 'technicien', phone_number: "+33612345678" },
        { id: 2, nom: 'Thomas Groom', email: 'tech2@example.com', password_hash: passwordHash, role: 'technicien', phone_number: "+33687654321" },
        { id: 3, nom: 'Admin Chef', email: 'admin@example.com', password_hash: passwordHash, role: 'admin', phone_number: "+33100000000" }
    ]);

    // --- 3. CRÉATION DU CATALOGUE MATÉRIEL ---
    await knex('materials').insert([
        { id: 1, name: 'Box Fibre Wi-Fi 7', reference: 'BOX-WF7-PRO', stock_quantity: 50 },
        { id: 2, name: 'Câble Optique (10m)', reference: 'CABLE-OPT-10', stock_quantity: 150 },
        { id: 3, name: 'Boîtier PTO (Mural)', reference: 'PTO-STD', stock_quantity: 300 }, // Souvent sur place
        { id: 4, name: 'Décodeur TV 4K', reference: 'DEC-TV-4K', stock_quantity: 40 }
    ]);

    // --- 4. CRÉATION DES INTERVENTIONS ---
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

    await knex('interventions').insert([
        {
            id: 1,
            titre: 'Installation Fibre - Duo',
            adresse: '10 Rue de la Paix, Paris',
            date: today, // Aujourd'hui
            statut: 'en_cours',
            nomClient: "Mme. Dupont",
            description: "Gros chantier, besoin de 2 techniciens. Attention chien méchant.",
            technicien_id: null // On utilise la table de liaison maintenant
        },
        {
            id: 2,
            titre: 'Dépannage Box - Solo',
            adresse: '5 Avenue Anatole France, Lyon',
            date: today, // Aujourd'hui
            statut: 'prévu',
            nomClient: "Boulangerie Centrale",
            description: "La box ne s'allume plus.",
            technicien_id: null
        },
        {
            id: 3,
            titre: 'Raccordement Immeuble',
            adresse: '22 Rue des Lilas, Marseille',
            date: yesterday, // Hier
            statut: 'termine',
            nomClient: "Syndic Oliviers",
            description: "Installation terminée avec succès.",
            rapport: "Tout fonctionne, débit ok.",
            signature: "signature_client_base64_simulee",
            technicien_id: null
        },
        {
            id: 4,
            titre: 'Installation TV',
            adresse: '8 Impasse du Progrès',
            date: tomorrow, // Demain
            statut: 'prévu',
            nomClient: "Mr. Martin",
            description: "Apporter le nouveau décodeur.",
            technicien_id: null
        }
    ]);

    // --- 5. AFFECTATION DES TECHNICIENS (Multi-tech) ---
    await knex('intervention_technicians').insert([
        // Intervention 1 (Duo) : Sohail (1) + Thomas (2)
        { intervention_id: 1, technician_id: 1 },
        { intervention_id: 1, technician_id: 2 },

        // Intervention 2 (Solo) : Sohail (1)
        { intervention_id: 2, technician_id: 1 },

        // Intervention 3 (Terminée) : Sohail (1)
        { intervention_id: 3, technician_id: 1 },

        // Intervention 4 (Solo) : Thomas (2) (Sohail ne la verra pas)
        { intervention_id: 4, technician_id: 2 }
    ]);

    // --- 6. AFFECTATION MATÉRIEL (Sur place vs À apporter) ---
    await knex('intervention_materials').insert([
        // --- Pour l'Intervention 1 (En cours) ---
        // 1. Box : À APPORTER (to_bring=1) et PAS ENCORE CHECKÉE (is_checked=0)
        { intervention_id: 1, material_id: 1, quantity_required: 1, to_bring: true, is_checked: false },

        // 2. Câble : À APPORTER (to_bring=1) et DÉJÀ CHECKÉ (is_checked=1) -> "Mis dans le camion"
        { intervention_id: 1, material_id: 2, quantity_required: 2, to_bring: true, is_checked: true },

        // 3. PTO : DÉJÀ SUR PLACE (to_bring=0) -> Pas besoin de check, c'est chez le client
        { intervention_id: 1, material_id: 3, quantity_required: 1, to_bring: false, is_checked: true },


        // --- Pour l'Intervention 2 (Prévu) ---
        // Juste une Box à apporter
        { intervention_id: 2, material_id: 1, quantity_required: 1, to_bring: true, is_checked: false },

        // --- Pour l'Intervention 3 (Terminé) ---
        // Tout est checké car fini
        { intervention_id: 3, material_id: 2, quantity_required: 5, to_bring: true, is_checked: true }
    ]);

    console.log("✅ Seed terminé avec succès !");
    console.log("👉 Login Tech 1 : tech1@example.com / Password123!");
};