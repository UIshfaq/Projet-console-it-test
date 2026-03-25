import { Request, Response } from "express";
import db from "../db/db-connection";
import { generateInterventionPdf, PdfData } from "../services/pdf/pdfService";

interface AuthRequest extends Request {
    userId?: number;
    // Note : Si ton middleware d'auth injecte déjà le rôle (ex: req.role),
    // tu pourras l'utiliser directement au lieu de refaire une requête DB.
}

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

        // 2. Construire la requête de base (commune à tout le monde)
        let query = db('interventions')
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
                "users.nom as nomTechnicien"
            )
            .leftJoin("intervention_technicians", "interventions.id", "intervention_technicians.intervention_id")
            .leftJoin("users", "intervention_technicians.technician_id", "users.id")
            .where("interventions.id", interventionId);

        // 3. LA CORRECTION : Restreindre l'accès SI l'utilisateur est un technicien
        if (currentUser.role === 'technicien') {
            query = query.where("intervention_technicians.technician_id", userId);
        }

        // 4. Exécuter la requête
        const pdfData = await query.first();

        if (!pdfData) {
            // C'est ici que ton test unitaire s'attend à recevoir la 404 !
            res.status(404).json({ message: "Intervention introuvable ou accès refusé." });
            return;
        }

        const pdfBuffer = await generateInterventionPdf(pdfData as PdfData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="intervention_${interventionId}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.status(200).send(pdfBuffer);
    } catch (error) {
        console.error("Erreur lors de la préparation des données PDF :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}