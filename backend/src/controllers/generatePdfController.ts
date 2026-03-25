import { Request, Response } from "express";
import db from "../db/db-connection";
import { generateInterventionPdf, PdfData } from "../services/pdf/pdfService";

interface AuthRequest extends Request {
    userId?: number;
}

export const generatePdf = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const interventionId = req.params.id;
        const userId = req.userId;

        // --- ZONE DE DEBUG ---
        console.log(`\n➡️ [DEBUG PDF] Requête reçue pour l'intervention ID :`, interventionId);
        console.log(`➡️ [DEBUG PDF] Utilisateur connecté (ID extrait du token) :`, userId);

        if (!userId) {
            res.status(401).json({ message: "Non autorisé" });
            return;
        }

        if (!interventionId) {
            res.status(400).json({ message: "L'ID de l'intervention est requis." });
            return;
        }

        const pdfData = await db('interventions')
            .select(
                "interventions.id",
                "interventions.titre",
                "interventions.adresse",
                "interventions.description",
                "interventions.date",
                "interventions.nomClient",
                "interventions.rapport",
                "interventions.failure_reason",
                "interventions.signature",
                "users.nom as nomTechnicien"
            )
            .leftJoin("intervention_technicians", "interventions.id", "intervention_technicians.intervention_id")
            .leftJoin("users", "intervention_technicians.technician_id", "users.id")
            .where("interventions.id", interventionId)
            // .where("intervention_technicians.technician_id", userId) <-- ON ENLÈVE CETTE LIGNE
            .first();

        console.log(`➡️ [DEBUG PDF] Résultat SQL :`, pdfData ? "Trouvé !" : "UNDEFINED (La requête n'a rien trouvé !)\n");
        // ---------------------

        if (!pdfData) {
            res.status(404).json({ message: "Intervention introuvable ou accès refusé." });
            return;
        }

        const pdfBuffer = await generateInterventionPdf(pdfData as PdfData);

        // 2. On prévient le navigateur ou l'application mobile de ce qu'on lui envoie (les Headers)
        res.setHeader('Content-Type', 'application/pdf');
        // L'option attachment permet de forcer le téléchargement avec un nom propre
        res.setHeader('Content-Disposition', `attachment; filename="intervention_${interventionId}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // 3. On envoie le fichier brut ! (On utilise .send et pas .json)
        res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error("Erreur lors de la préparation des données PDF :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}