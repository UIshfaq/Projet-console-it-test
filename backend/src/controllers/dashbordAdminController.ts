import { Request, Response } from 'express';
import db from "../db/db-connection";

export const getIntervToday = async (req: Request, res: Response): Promise<void> => {
    try {
        const interventions = await db('interventions')
            .select(
                'interventions.id',
                'interventions.titre',
                'interventions.adresse',
                'interventions.nomClient',
                'interventions.statut',
                db.raw('GROUP_CONCAT(technicien.nom SEPARATOR ", ") as nomsTechniciens')
            )
            .leftJoin('intervention_technicians', 'interventions.id', 'intervention_technicians.intervention_id')
            .leftJoin('users as technicien', 'intervention_technicians.technician_id', 'technicien.id')
            .whereRaw('DATE(interventions.date) = CURDATE()')


            .groupBy(
                'interventions.id',
                'interventions.titre',
                'interventions.adresse',
                'interventions.nomClient',
                'interventions.statut'
            );

        res.status(200).json(interventions);
    } catch (e) {
        console.error("Erreur SQL Dashboard :", e);
        // Astuce : On renvoie l'erreur précise au Postman pour t'aider à débugger (à retirer en prod)
        res.status(500).json({
            message: "Erreur lors de la récupération des données",
            error: e instanceof Error ? e.message : e
        });
    }
};