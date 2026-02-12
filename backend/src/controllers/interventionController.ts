import { Request, Response } from 'express';
import db from '../db/db-connection';
import { Intervention } from '../interfaces/Interventions';


interface AuthRequest extends Request {
    userId?: number;
}

interface AddInterventionBody {
    interventionData: Partial<Intervention>;
    materials?: { id: number; quantity: number }[];
    technicianIds?: number[];
}


export const getAllInterventions = async (req: Request, res: Response): Promise<void> => {
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

export const addIntervention = async (req: Request, res: Response): Promise<void> => {
    const { interventionData, materials, technicianIds } = req.body as AddInterventionBody;

    try {
        await db.transaction(async (trx) => {

            // 1. Création de l'intervention de base
            const [newInterventionId] = await trx('interventions')
                .insert({
                    titre: interventionData.titre,
                    adresse: interventionData.adresse,
                    date: interventionData.date,
                    statut: 'prévu',
                    // On garde ta logique hybride (colonne technicien_id + table de liaison)
                    technicien_id: (technicianIds && technicianIds.length > 0) ? technicianIds[0] : null,
                    description: interventionData.description || '',
                    nomClient: interventionData.nomClient
                });
            // Note : Si tu utilises Postgres, ajoute .returning('id') à la fin de l'insert ci-dessus

            // 2. Gestion des techniciens (Multi-technique)
            if (technicianIds && technicianIds.length > 0) {
                const techsToInsert = technicianIds.map(id => ({
                    intervention_id: newInterventionId,
                    technician_id: id
                }));
                await trx('intervention_technicians').insert(techsToInsert);
            }

            // 3. Gestion du matériel et du stock
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

export const getAllInterventionsNonTermine = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const technicienIdConnecte = req.userId;

        const interventions = await db('interventions')
            // On joint la table de liaison
            .join('intervention_technicians', 'interventions.id', 'intervention_technicians.intervention_id')
            // On filtre sur l'ID du tech dans la table de liaison
            .where('intervention_technicians.technician_id', technicienIdConnecte)
            .whereNotIn('statut', ['annule', 'archiver'])
            .select('interventions.*')
            .orderBy('date', 'asc');

        res.status(200).json(interventions);
    } catch (e) {
        console.error("Erreur récup interventions :", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

export const getAllInterventionsArchived = async (req: AuthRequest, res: Response): Promise<any> => {
    const technicienIdConnecte = req.userId;

    try {
        const interventionsArchivees = await db('interventions')
            // 1. JOINTURE : On lie la table des techniciens
            .join('intervention_technicians', 'interventions.id', 'intervention_technicians.intervention_id')

            // 2. FILTRES : Statut 'archiver' ET le technicien connecté
            .where('interventions.statut', 'archiver')
            .andWhere('intervention_technicians.technician_id', technicienIdConnecte)

            // 3. SELECTION : On ne prend que les données de l'intervention (pour éviter les conflits d'ID)
            .select('interventions.*')

            // 4. TRI
            .orderBy('interventions.date', 'desc');

        // Note : Knex renvoie déjà un tableau vide [] si rien n'est trouvé,
        // donc tu peux renvoyer directement le résultat.
        res.status(200).json(interventionsArchivees);

    }
    catch (e) {
        console.error("Erreur lors de la récupération des interventions archivées :", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
}


export const getInterventionById = async (req: AuthRequest, res: Response): Promise<void> => {
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
            res.status(404).json({ message: "L'intervention est introuvable ou vous n'y êtes pas assigné" });
            return;
        }

        // Récupération du matériel lié
        const materials = await db('intervention_materials')
            .join('materials', 'intervention_materials.material_id', 'materials.id')
            .where('intervention_materials.intervention_id', intervId)
            .select(
                'materials.id',
                'materials.name',
                'intervention_materials.quantity_required',
                'intervention_materials.is_checked',
                'intervention_materials.to_bring'
            );

        res.status(200).json({
            ...interventionData,
            materials: materials
        });
    } catch (e) {
        console.error("Erreur getInterventionById:", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
}



export const terminerIntervention = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    // On type le body explicitement ici aussi
    const { statut, rapport, notes_technicien, failure_reason, signature } = req.body;
    const technicienIdConnecte = req.userId;

    if (!statut || !rapport || rapport.trim() === '') {
        res.status(400).json({ message: "Le rapport est obligatoire pour terminer l'intervention." });
        return;
    }

    if (statut === 'echec') {
        if (!failure_reason || failure_reason.trim().length < 10) {
            res.status(400).json({
                message: "La raison de l'échec est obligatoire (min 10 caractères)."
            });
            return;
        }
    }

    else if (statut === 'termine') {
        if (!signature || signature.trim() === '') {
            res.status(400).json({
                message: "La signature du client est obligatoire pour valider l'intervention."
            });
            return;
        }
    }

    // Préparation des données
    const dataToUpdate: any = {
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
            res.status(404).json({ message: "Intervention introuvable ou non attribuée." });
            return;
        }

        res.json({ message: "Intervention clôturée avec succès !" });

    } catch (e) {
        console.error("Erreur update :", e);
        res.status(500).json({ message: "Erreur serveur." });
    }
}

export const archiverIntervention = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const technicienIdConnecte = req.userId;

    try {
        const rowsAffected = await db('interventions')
            .where({ id: id }) // 1. Cible l'intervention
            .whereExists(function() {
                // 2. Vérifie la permission dans la table intermédiaire
                this.select('*')
                    .from('intervention_technicians')
                    .whereRaw('intervention_technicians.intervention_id = interventions.id')
                    // ⚠️ Vérifie le nom de ta colonne : 'user_id' ou 'technician_id' ?
                    .andWhere({ technician_id: technicienIdConnecte });
            })
            .update({ statut: 'archiver' }); // 3. L'action est ICI, en dehors du callback

        // 4. On vérifie le résultat ICI, une fois la requête finie
        if (rowsAffected === 0) {
            res.status(404).json({ message: "Intervention non trouvée ou non autorisée." });
            return;
        }

        res.status(200).json({ message: "L'intervention est archivée avec succès." });

    } catch (e) {
        console.error("Erreur archivage :", e);
        res.status(500).json({ message: "Erreur serveur." });
    }
}

export const modifierNotes = async (req: AuthRequest, res: Response): Promise<void> => {
    const idInterv = req.params.id;
    const idTech = req.userId;
    const { notes_technicien, rapport } = req.body;

    const updates: any = {};

    if (notes_technicien !== undefined && notes_technicien !== null && notes_technicien.trim() !== "") {
        updates.notes_technicien = notes_technicien;
    }

    if (rapport !== undefined && rapport !== null && rapport.trim() !== "") {
        updates.rapport = rapport;
    }

    try {
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ message: "Veuillez fournir au moins les notes ou le rapport avec un contenu valide." });
            return;
        }
        updates.updated_at = new Date();

        const updatedRows = await db('interventions')
            .where({ id: idInterv })
            .whereNot({ statut: 'archiver' })
            .whereExists(function() {
                this.select('*')
                    .from('intervention_technicians') // Ta table intermédiaire
                    .whereRaw('intervention_technicians.intervention_id = interventions.id') // Lien BDD
                    .andWhere({ technician_id: idTech }); // ⚠️ Vérifie si ta colonne s'appelle 'user_id' ou 'technician_id'
            })
            .update(updates);

        if (updatedRows === 0) {
            res.status(404).json({ message: "Intervention introuvable ou non assignée à cet utilisateur." });
            return;
        }

        res.status(200).json({ message: "L'intervention a été modifiée avec succès." });
    }
    catch (e) {
        console.error("Erreur lors de la modification :", e);
        res.status(500).json({ message: "Erreur serveur." });
    }
}