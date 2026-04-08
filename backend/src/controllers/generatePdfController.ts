import { Response } from "express";
import db from "../db/db-connection";
import { generateInterventionPdf, PdfData } from "../services/pdf/pdfService";
import { AuthRequest } from "../middlewares/authMiddleware";  // ← importer la vraie


export const generatePdf = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const interventionId = req.params.id;
        const userId = req.userId;

        if (!userId) {
            res.status(404).json({ message: "Non assigné" });
            return;
        }

        if (!interventionId) {
            res.status(400).json({ message: "L'ID de l'intervention est requis." });
            return;
        }

        // 1. Récupérer le rôle de l'utilisateur qui fait la demande
        const currentUser = await db('users').select('role').where({ id: userId }).first();

        if (!currentUser) {
            res.status(401).json({ message: "Utilisateur introuvable." });
            return;
        }

        // 2. Récupérer l'intervention principale (sans les jointures multiples)
        let interventionQuery = db('interventions')
            .select(
                "interventions.id",
                "interventions.titre",
                "interventions.adresse",
                "interventions.date",
                "interventions.description",
                "interventions.nomClient",
                "interventions.rapport",
                "interventions.failure_reason",
                "interventions.signature",
                db.raw('GROUP_CONCAT(users.nom SEPARATOR ", ") as nomTechnicien')
            )
            .leftJoin("intervention_technicians", "interventions.id", "intervention_technicians.intervention_id")
            .leftJoin("users", "intervention_technicians.technician_id", "users.id")
            .where("interventions.id", interventionId)
            .groupBy("interventions.id");

        // 3. LA CORRECTION : Restreindre l'accès SI l'utilisateur est un technicien
        if (currentUser.role === 'technicien') {
            interventionQuery = interventionQuery.having(db.raw('GROUP_CONCAT(intervention_technicians.technician_id SEPARATOR ",")'), 'LIKE', `%${userId}%`);
        }

        // 4. Exécuter la requête intervention
        const pdfData = await interventionQuery.first();
        if (!pdfData) {
            res.status(404).json({ message: "Intervention introuvable ou accès refusé." });
            return;
        }

        // 5. Récupérer les matériels associés (optionnel, peut ne pas exister)
        let materials: any[] = [];
        try {
            materials = await db('intervention_materials')
                .join('materiel', 'intervention_materials.material_id', 'materiel.id')
                .select(
                    'materiel.name',
                    'intervention_materials.quantity_required',
                    'intervention_materials.to_bring'
                )
                .where('intervention_materials.intervention_id', interventionId);
        } catch (err) {
            // Les matériels ne sont pas disponibles, c'est normal
            console.warn(`[PDF] Matériels non disponibles : ${err}`);
        }

        // 6. Combiner les données
        const finalPdfData = {
            ...pdfData,
            materials: materials.length > 0 ? materials : undefined
        }

        if (!pdfData) {
            // C'est ici que ton test unitaire s'attend à recevoir la 404 !
            res.status(404).json({ message: "Intervention introuvable ou accès refusé." });
            return;
        }

        const pdfBuffer = await generateInterventionPdf(finalPdfData as PdfData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="intervention_${interventionId}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.status(200).send(pdfBuffer);
    } catch (error) {
        console.error("Erreur lors de la préparation des données PDF :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}