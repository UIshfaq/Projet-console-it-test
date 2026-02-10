import { Request, Response } from 'express';
import db from '../db/db-connection';

// Interface pour accéder à userId (injecté par le middleware JWT)
interface AuthRequest extends Request {
    userId?: number;
}

export const getAllInventaires = async (req: Request, res: Response): Promise<void> => {
    try {
        const rows = await db('materials')
            .select('*')
            .orderBy('id', 'desc');

        res.status(200).json(rows);
    } catch (e) {
        console.error("Erreur lors de la récupération des inventaires :", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

/*
export const addInventaire = async (req: Request, res: Response): Promise<void> => {
    try {
        const {name, reference, stock_quantity} = req.body;

        const [newInventaireId] = await db('materials').insert({
            name,
            reference,
            stock_quantity: stock_quantity || 0
        });
        res.status(201).json({
            message: name + " a été ajouté avec succès",
            id: newInventaireId
        });
    } catch (e) {
        console.error("Erreur lors de l'ajout de l'inventaire :", e);
        res.status(500).json({message: "Erreur serveur"});
    }
};
*/

export const getMaterialsForIntervention = async (req: AuthRequest, res: Response): Promise<void> => {
    const interventionId = req.params.id;
    const technicien_id = req.userId;

    try {
        // Note : J'ai adapté la jointure pour qu'elle fonctionne
        // même si 'technicien_id' est NULL dans la table interventions (mode équipe)
        const query = db('intervention_materials')
            .join('materials', 'intervention_materials.material_id', 'materials.id')
            .join('interventions', 'intervention_materials.intervention_id', 'interventions.id')
            .select(
                'intervention_materials.quantity_required',
                'intervention_materials.to_bring',
                'intervention_materials.is_checked',
                'materials.id as material_id',
                'materials.name',
                'materials.reference'
            )
            .where('intervention_materials.intervention_id', interventionId)
            .whereExists(function() {
            this.select('*').from('intervention_technicians')
                .whereRaw('intervention_technicians.intervention_id = interventions.id')
                .andWhere('intervention_technicians.technician_id', technicien_id)
        })


        const rows = await query;
        res.status(200).json(rows);

    } catch (e) {
        console.error("Erreur récup matériaux :", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const toggleCheckMaterial = async (req: Request, res: Response): Promise<void> => {
    // Attention au nommage dans tes routes (:id vs :materialId)
    const interventionId = req.params.id;
    const materialId = req.params.materialId;
    const { is_checked } = req.body;

    try {
        await db('intervention_materials')
            .where({
                intervention_id: interventionId,
                material_id: materialId
            })
            // Force 1 ou 0 pour MySQL
            .update({ is_checked: is_checked ? 1 : 0 });

        res.status(200).json({ message: "Statut mis à jour" });
    } catch (e) {
        console.error("Erreur update check :", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
};