const db = require("../db-connection");

const getAllInterventions = async (req, res) => {
    try {
        const interventions = await db('interventions')
            .orderBy('date', 'asc');

        res.status(200).json(interventions);
    }
    catch (e) {
        console.error("Erreur lors de la récupération des interventions:", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

const addIntervention = async (req, res) => {
    // On récupère technicianIds (le tableau d'IDs) envoyé par le front
    const { interventionData, materials, technicianIds } = req.body;

    try {
        await db.transaction(async (trx) => {

            // 1. Création de l'intervention de base
            const [newInterventionId] = await trx('interventions')
                .insert({
                    titre: interventionData.titre,
                    adresse: interventionData.adresse,
                    date: interventionData.date,
                    statut: 'prévu',
                    // On peut laisser technicien_id à NULL ou mettre le 1er du tableau
                    // si tu n'as pas encore supprimé la colonne
                    technicien_id: technicianIds[0] || null,
                    description: interventionData.description || '',
                    nomClient: interventionData.nomClient
                });

            // 2. NOUVEAU : Gestion des techniciens (Multi-technique)
            if (technicianIds && technicianIds.length > 0) {
                const techsToInsert = technicianIds.map(id => ({
                    intervention_id: newInterventionId,
                    technician_id: id
                }));
                await trx('intervention_technicians').insert(techsToInsert);
            }

            // 3. Gestion du matériel et du stock (Ton code existant)
            if (materials && materials.length > 0) {
                const materialsToInsert = materials.map(item => ({
                    intervention_id: newInterventionId,
                    material_id: item.id,
                    quantity_required: item.quantity,
                    to_bring: 1,
                    is_checked: 0
                }));

                await trx('intervention_materials').insert(materialsToInsert);

                // Mise à jour du stock
                for (const item of materials) {
                    await trx('materials')
                        .where('id', item.id)
                        .decrement('stock_quantity', item.quantity);
                }
            }
        });

        res.status(201).json({ message: "Intervention créée, équipe assignée et stock mis à jour !" });

    } catch (error) {
        console.error("Erreur transaction:", error);
        res.status(500).json({ error: "Erreur lors de la création de l'intervention." });
    }
}
const getAllInterventionsNonTermine = async (req, res) => {
    try {
        const technicienIdConnecte = req.userId;

        const interventions = await db('interventions')
            // On joint la table de liaison
            .join('intervention_technicians', 'interventions.id', 'intervention_technicians.intervention_id')
            // On filtre sur l'ID du tech dans la table de liaison
            .where('intervention_technicians.technician_id', technicienIdConnecte)
            .whereNotIn('statut', ['annule', 'archiver'])
            .select('interventions.*') // On ne veut que les colonnes de l'intervention
            .orderBy('date', 'asc');

        res.status(200).json(interventions);
    } catch (e) {
        console.error("Erreur récup interventions :", e);
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
    const intervId = req.params.id;
    const technicienIdConnecte = req.userId;

    try {
        const interventionData = await db('interventions')
            .leftJoin('intervention_technicians', 'interventions.id', 'intervention_technicians.intervention_id')
            .leftJoin('users', 'intervention_technicians.technician_id', 'users.id')
            .where('interventions.id', intervId)
            .whereIn('interventions.id', function() {
                this.select('intervention_id')
                    .from('intervention_technicians')
                    .where('technician_id', technicienIdConnecte);
            })
            .select(
                'interventions.*',
                db.raw('GROUP_CONCAT(users.nom SEPARATOR ", ") as equipe')
            )
            .groupBy('interventions.id')
            .first();

        if (!interventionData) {
            return res.status(404).json({ message: "L'intervention est introuvable ou vous n'y êtes pas assigné" });
        }

        // Récupération du matériel lié
        const materials = await db('intervention_materials')
            .join('materials', 'intervention_materials.material_id', 'materials.id')
            .where('intervention_materials.intervention_id', intervId)
            .select(
                'materials.name',
                'intervention_materials.quantity_required',
                'intervention_materials.is_checked',
                'intervention_materials.to_bring'
            );

        // On fusionne les données de l'intervention et le tableau de matériels
        res.status(200).json({
            ...interventionData, // Utilise bien le même nom de variable ici
            materials: materials
        });
    } catch (e) {
        console.error("Erreur getInterventionById:", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
}


const terminerIntervention = async (req, res) => {
    const { id } = req.params;
    const { statut, rapport, notes_technicien, failure_reason, signature } = req.body;
    const technicienIdConnecte = req.userId;

    if (!statut || !rapport || rapport.trim() === '') {
        return res.status(400).json({ message: "Le rapport est obligatoire pour terminer l'intervention." });
    }

    if (statut === 'echec') {
        if (!failure_reason || failure_reason.trim().length < 10) {
            return res.status(400).json({
                message: "La raison de l'échec est obligatoire (min 10 caractères)."
            });
        }
    }

    else if (statut === 'termine') {
        if (!signature || signature.trim() === '') {
            return res.status(400).json({
                message: "La signature du client est obligatoire pour valider l'intervention."
            });
        }
    }

    // Préparation des données
    const dataToUpdate = {
        statut: statut,
        rapport: rapport,
        notes_technicien: notes_technicien,
        updated_at: new Date(),
        signature: signature || null
    };

    if (statut === 'echec') {
        dataToUpdate.failure_reason = failure_reason;
    } else {
        dataToUpdate.failure_reason = null;
    }

    try {
        const rowsAffected = await db('interventions')
            .whereIn('id', function() {
                this.select('intervention_id')
                    .from('intervention_technicians')
                    .where('technician_id', technicienIdConnecte)
                    .andWhere('intervention_id', id);
            })
            .update(dataToUpdate);

        if (rowsAffected === 0) {
            return res.status(404).json({ message: "Intervention introuvable ou non attribuée." });
        }

        res.json({ message: "Intervention clôturée avec succès !" });

    } catch (e) {
        console.error("Erreur update :", e);
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
    getAllInterventionsNonTermine,
    getAllInterventionsArchived,
    getInterventionById,
    terminerIntervention,
    archiverIntervention,
    modifierNotes,
    addIntervention
}