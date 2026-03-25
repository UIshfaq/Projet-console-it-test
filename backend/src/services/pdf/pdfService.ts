import PDFDocument = require('pdfkit');
import * as path from 'path';
import * as fs from 'fs';

export interface PdfData {
    id: number;
    titre: string;
    adresse: string;
    description?: string;
    nomClient: string;
    rapport: string;
    failure_reason?: string;
    signature: string;
    nomTechnicien: string;
}

export const buildInterventionPdf = (data: PdfData): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ 
            margin: 50,
            size: 'A4',
            info: {
                Title: `Intervention_${data.id}`,
                Author: 'Console IT',
            }
        });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // --- EN-TÊTE ---
        // ESPACE RÉSERVÉ POUR LE LOGO (Top Gauche)
        // Vous pourrez insérer votre logo ici plus tard avec : doc.image('chemin/logo.png', 50, 45, { width: 100 });
        const logoPath = path.join(process.cwd(), 'asset', 'console-it-logo.jpeg');

        try {
            // On vérifie explicitement si le fichier existe avant d'essayer de l'insérer
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, 45, { width: 100 });
            } else {
                // Si le fichier n'est pas là, on log le chemin absolu pour débugger
                console.warn(`[PDF Warn] Logo introuvable au chemin absolu : ${logoPath}`);
            }
        }
        catch (e) {
            console.error("[PDF Error] Erreur inattendue lors de l'insertion du logo :", e);
        }
        // Titre principal à droite
        doc.fillColor('#333333')
           .fontSize(22)
           .text(`RAPPORT D'INTERVENTION`, 200, 50, { align: 'right' });
        
        doc.fontSize(12)
           .text(`N° #${data.id}`, { align: 'right' });

        doc.moveDown(2);
        
        // Ligne de séparation
        doc.moveTo(50, 110).lineTo(545, 110).strokeColor('#eeeeee').stroke();
        doc.moveDown(2);

        // --- INFORMATIONS CLIENT & TECHNICIEN ---
        const startY = 130;
        doc.fillColor('#444444').fontSize(10).text("CLIENT", 50, startY);
        doc.fillColor('#000000').fontSize(12).text(data.nomClient || 'Non renseigné', 50, startY + 15);
        doc.fontSize(10).fillColor('#666666').text(data.adresse || 'Adresse non renseignée', 50, startY + 32, { width: 220 });

        doc.fillColor('#444444').fontSize(10).text("TECHNICIEN", 300, startY);
        doc.fillColor('#000000').fontSize(12).text(data.nomTechnicien || 'Non assigné', 300, startY + 15);
        doc.fontSize(10).fillColor('#666666').text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 300, startY + 32);

        doc.moveDown(4);

        // --- DÉTAILS DE L'INTERVENTION ---
        doc.fillColor('#333333').fontSize(14).text("Détails de l'intervention", 50, doc.y, { underline: true });
        doc.moveDown(0.5);
        
        doc.fillColor('#000000').fontSize(12).text(`Sujet : ${data.titre || 'Sans titre'}`, { oblique: true });
        doc.moveDown();

        if (data.description) {
            doc.fillColor('#444444').fontSize(10).text("DESCRIPTION INITIALE", { characterSpacing: 1 });
            doc.fillColor('#000000').fontSize(11).text(data.description);
            doc.moveDown();
        }

        if (data.rapport) {
            doc.fillColor('#444444').fontSize(10).text("COMPTE-RENDU TECHNIQUE", { characterSpacing: 1 });
            doc.fillColor('#000000').fontSize(11).text(data.rapport);
            doc.moveDown();
        }

        if (data.failure_reason) {
            doc.rect(50, doc.y, 495, 40).fill('#fff5f5');
            doc.fillColor('#c53030').fontSize(10).text("RAISON DE L'ÉCHEC / BLOCAGE", 60, doc.y - 32);
            doc.fontSize(11).text(data.failure_reason, 60, doc.y + 5);
            doc.moveDown(2);
        }

        // --- SIGNATURE ---
        if (data.signature) {
            const currentY = doc.y;
            // On vérifie s'il reste assez de place sur la page, sinon on change de page
            if (currentY > 600) doc.addPage();

            doc.moveDown(2);
            doc.fillColor('#444444').fontSize(10).text("SIGNATURE DU CLIENT", { align: 'center' });
            
            try {
                const base64Data = data.signature.replace(/^data:image\/\w+;base64,/, "");
                const imageBuffer = Buffer.from(base64Data, 'base64');

                doc.image(imageBuffer, (doc.page.width - 200) / 2, doc.y + 10, { fit: [200, 80] });
            } catch (error) {
                doc.fontSize(10).text("(Signature non disponible)", { align: 'center' });
            }
        }

        // Bas de page (Footer)
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).fillColor('#999999').text(
                `Document généré par Console IT - Page ${i + 1} sur ${range.count}`,
                50,
                doc.page.height - 50,
                { align: 'center' }
            );
        }

        doc.end();
    });
};