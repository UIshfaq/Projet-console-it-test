const db = require("../db-connection");

const getIntervToday = async (req, res) => {
    try {
        const interventions = await db('interventions')
            .select(
                'interventions.id',
                'interventions.titre',
                'interventions.adresse',
                'interventions.nomClient',
                'technicien.nom as nomTechnicien'
            )
            .leftJoin('users as technicien', 'interventions.technicien_id', 'technicien.id')
            .whereRaw('DATE(interventions.date) = CURRENT_DATE');

        res.status(200).json(interventions);
    } catch (e) {
        console.error("Erreur stats aujourd'hui :", e);
        res.status(500).json({ message: "Erreur lors de la récupération des données" });
    }
}

module.exports = {
    getIntervToday,
}