import PDFDocument = require('pdfkit');

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
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));

        doc.on('end', () => {
            resolve(Buffer.concat(buffers));
        });

        doc.on('error', reject);

        // --- 1. EN-TÊTE ---
        doc.fontSize(20).text(`Intervention #${data.id}: ${data.titre || 'Sans titre'}`, { underline: true });
        doc.moveDown();

        // --- 2. INFORMATIONS GÉNÉRALES ---
        doc.fontSize(14).text(`Client : ${data.nomClient || 'Non renseigné'}`);
        doc.text(`Technicien : ${data.nomTechnicien || 'Non assigné'}`);
        doc.text(`Adresse : ${data.adresse || 'Non renseignée'}`);
        doc.moveDown();

        // --- 3. DÉTAILS DE LA MISSION ---
        if (data.description) {
            doc.fontSize(12).text(`Description : ${data.description}`);
            doc.moveDown();
        }

        if (data.rapport) {
            doc.fontSize(12).text(`Rapport d'intervention : ${data.rapport}`);
            doc.moveDown();
        }

        if (data.failure_reason) {
            // Petit bonus : on met la raison de l'échec en rouge pour que ça ressorte bien
            doc.fillColor('red');
            doc.fontSize(12).text(`Raison de l'échec : ${data.failure_reason}`);
            doc.fillColor('black'); // On n'oublie pas de repasser en noir pour la suite !
            doc.moveDown();
        }

        // --- 4. SIGNATURE (Image) ---
        if (data.signature) {
            doc.moveDown();
            doc.fontSize(12).text(`Signature du client :`);
            doc.moveDown();

            try {
                // Nettoyage et conversion du Base64 en Buffer binaire
                const base64Data = data.signature.replace(/^data:image\/\w+;base64,/, "");
                const imageBuffer = Buffer.from(base64Data, 'base64');

                // Insertion de l'image (fit permet de redimensionner sans déformer)
                doc.image(imageBuffer, { fit: [250, 100] });
            } catch (error) {
                console.error("Erreur lors de l'intégration de la signature", error);
                doc.text("(Erreur d'affichage de la signature)");
            }
        }

        doc.end();
    });
};