const db = require("../db-connection");

const getIntervToday = async (req, res) => {
    try {
        const interventions = await db('interventions')
            .select(
                'interventions.id',
                'interventions.titre',
                'interventions.adresse',
                'interventions.nomClient',
                'interventions.statut',
                // On récupère tous les noms séparés par des virgules
                db.raw('GROUP_CONCAT(technicien.nom SEPARATOR ", ") as nomsTechniciens')
            )
            // On joint la nouvelle table de liaison
            .leftJoin('intervention_technicians', 'interventions.id', 'intervention_technicians.intervention_id')
            // On joint la table users pour avoir les noms
            .leftJoin('users as technicien', 'intervention_technicians.technician_id', 'technicien.id')
            .whereRaw('DATE(interventions.date) = CURRENT_DATE')
            .groupBy('interventions.id'); // Crucial pour ne pas avoir de doublons [cite: 2026-01-26]

        res.status(200).json(interventions);
    } catch (e) {
        console.error("Erreur stats aujourd'hui :", e);
        res.status(500).json({ message: "Erreur lors de la récupération des données" });
    }
}

module.exports = {
    getIntervToday,
}