const db = require("../db-connection");


const getAllInterventions = async (req, res) => {
    try {

        const technicienIdConnecte = req.userId;

        const interventions = await db('interventions')
            .where({ technicien_id: technicienIdConnecte })
            .whereNotIn('statut', ['annule', 'archiver'])
            .orderBy('date', 'asc');

        res.status(200).json(interventions);

    } catch (e) {
        console.error("Erreur lors de la récupération des interventions:", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

const getAllInterventionsArchived = async (req, res) => {
    const technicienIdConnecte = req.userId

    try {
        const interventionsArchivees = await db('interventions')
            .where({ statut: 'archiver', technicien_id: technicienIdConnecte })
            .orderBy('date', 'desc');

        if (interventionsArchivees.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(interventionsArchivees)

    }
    catch (e) {
        console.error("Erreur lors de la récupération des interventions archivées :", e)
        res.status(500).json({ message: "Erreur serveur" })
    }
}

const getInterventionById = async (req, res) => {
    const intervId = req.params.id
    const technicienIdConnecte = req.userId

    console.log(`Intervention ID (param) : ${intervId}`)
    console.log(`Technicien ID (JWT) : ${technicienIdConnecte}`)

    try {
        const interventionById = await db('interventions')
            .where({
                id: intervId,
                technicien_id: technicienIdConnecte
            })
            .first()
        if (!interventionById) {
            return res.status(404).json({ message: "L'intervention est introuvable" })
        }

        res.status(200).json(interventionById)

    }
    catch (e) {
        console.log("Erreur lors de la récuperation des détails")
        res.status(500).json({ message: "Erreur serveur" })

    }
}

const terminerIntervention = async (req, res) => {
    const { id } = req.params;
    const { statut, rapport, notes_technicien, failure_reason } = req.body;
    const technicienIdConnecte = req.userId;

    if (!statut || !rapport || rapport.trim() === '') {
        return res.status(400).json({ message: "Le rapport est obligatoire pour terminer l'intervention." });
    }

    if (statut === 'echec') {
        if (!failure_reason || failure_reason.trim().length < 10) {
            return res.status(400).json({
                message: "La raison de l'échec est obligatoire et doit être détaillée (minimum 10 caractères)."
            });
        }
    }

    const dataToUpdate = {
        statut: statut,
        rapport: rapport,
        notes_technicien: notes_technicien,
        updated_at: new Date()
    };

    if (statut === 'echec') {
        dataToUpdate.failure_reason = failure_reason;
    }
    else {
        dataToUpdate.failure_reason = null;
    }

    try {
        const rowsAffected = await db('interventions')
            .where({ id: id, technicien_id: technicienIdConnecte })
            .update(dataToUpdate);

        if (rowsAffected === 0) {
            return res.status(404).json({ message: "Intervention non trouvée ou non attribuée." });
        }

        res.json({ message: "Modification de l'état de intervention réussie" });

    } catch (e) {
        console.error("Erreur lors de l'update :", e);
        res.status(500).json({ message: "Erreur serveur." });
    }
}

const archiverIntervention = async (req, res) => {
    const { id } = req.params
    const technicienIdConnecte = req.userId

    try {
        const rowsAffected = await db('interventions')
            .where({ id: id, technicien_id: technicienIdConnecte })
            .update({ statut: 'archiver' });

        if (rowsAffected === 0) {
            return res.status(404).json({ message: "Intervention non trouvée ou non autorisée." });
        }

        res.status(200).json({ message: "L'intervention est archivée avec succès. " });

    }
    catch (e) {
        res.status(500).json({ message: "Erreur serveur." })
    }
}

const modifierNotes = async (req, res) => {
    const idInterv = req.params.id
    const idTech = req.userId
    const { notes_technicien, rapport } = req.body;

    const updates = {};

    if (notes_technicien !== undefined && notes_technicien !== null && notes_technicien.trim() !== "") {
        updates.notes_technicien = notes_technicien;
    }

    if (rapport !== undefined && rapport !== null && rapport.trim() !== "") {
        updates.rapport = rapport;
    }

    try {
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "Veuillez fournir au moins les notes ou le rapport avec un contenu valide." });
        }
        updates.updated_at = new Date();

        const updatedRows = await db('interventions')
            .where({
                id: idInterv,
                technicien_id: idTech
            })
            .whereNot({
                statut: 'archiver'
            })
            .update(updates);

        if (updatedRows === 0) {
            return res.status(404).json({ message: "Intervention introuvable ou non assignée à cet utilisateur." });
        }

        res.status(200).json({ message: "L'intervention a été modifiée avec succès." });
    }
    catch (e) {
        console.error("Erreur lors de la modification :", e);
        res.status(500).json({ message: "Erreur serveur." })

    }
}

module.exports = {
    getAllInterventions,
    getAllInterventionsArchived,
    getInterventionById,
    terminerIntervention,
    archiverIntervention,
    modifierNotes
}