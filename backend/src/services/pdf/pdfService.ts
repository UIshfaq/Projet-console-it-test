import PDFDocument = require('pdfkit');
import * as fs from 'fs';
import * as path from 'path';

export interface PdfData {
    id: number;
    titre: string;
    adresse: string;
    description: string | null;
    nomClient: string;
    rapport: string | null;
    created_at?: string;
    notes_technicien?: string | null;
    failure_reason?: string | null;
    nomTechnicien: string;
    materials?: {
        name: string;
        quantity_required: number;
        to_bring: number;
    }[];
}

export const generateInterventionPdf = async (data: PdfData): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            bufferPages: true
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        const margin = 50;
        const footerHeight = 60;
        let yPosition = 170;

        const checkSpaceAndAddPage = (requiredHeight: number) => {
            const safeThreshold = doc.page.height - footerHeight - margin - 15;
            if (yPosition + requiredHeight > safeThreshold) {
                doc.addPage();
                yPosition = margin + 15;
            }
        };

        const logoPath = path.join(process.cwd(), 'asset', 'console-it-logo.jpeg');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 45, { width: 100 });
        } else {
            console.warn(`[PDF Warn] Logo introuvable : ${logoPath}`);
        }

        doc.fillColor("#1f2937").font('Helvetica-Bold').fontSize(16).text("RAPPORT D'INTERVENTION", doc.page.width - 300, 50, { align: 'right' });
        doc.font('Helvetica-Bold').fontSize(13).text(`#${data.id}`, doc.page.width - 300, 70, { align: 'right' });

        doc.fillColor("#000000").font('Helvetica-Bold').fontSize(11).text("Client:", 50, 110);
        doc.font('Helvetica').text(data.nomClient, 110, 110);

        doc.font('Helvetica-Bold').text("Adresse:", 50, 125);
        doc.font('Helvetica').text(data.adresse, 110, 125);

        doc.font('Helvetica-Bold').text("Date:", 50, 140);
        const dateStr = data.created_at ? new Date(data.created_at).toLocaleDateString() : 'N/A';
        doc.font('Helvetica').text(dateStr, 110, 140);

        doc.moveTo(margin, 155).lineTo(doc.page.width - margin, 155).strokeColor("#e5e7eb").stroke();

        doc.fillColor("#4b5563").font('Helvetica-Bold').fontSize(12).text("Description de l'intervention", 50, yPosition);
        yPosition += 20;
        doc.fillColor("#1f2937").font('Helvetica').fontSize(10).text(data.description || "Aucune description fournie.", 55, yPosition, { width: 500 });
        yPosition += (doc.heightOfString(data.description || "", { width: 500 }) || 20) + 20;

        checkSpaceAndAddPage(30);
        doc.fillColor("#374151").font('Helvetica-Bold').fontSize(12).text("Technicien référent", 50, yPosition);
        yPosition += 18;
        doc.fillColor("#eff6ff").rect(50, yPosition - 5, doc.page.width - 100, 20).fill();
        doc.fillColor("#1e40af").font('Helvetica-Bold').fontSize(10).text(`  - ${data.nomTechnicien}`, 55, yPosition);
        yPosition += 25;

        if (data.notes_technicien) {
            checkSpaceAndAddPage(40);
            doc.fillColor("#4b5563").font('Helvetica-BoldOblique').fontSize(11).text("Notes internes du technicien", 50, yPosition);
            yPosition += 18;
            doc.fillColor("#1f2937").font('Helvetica-Oblique').fontSize(10).text(data.notes_technicien, 55, yPosition, { width: 500 });
            yPosition += (doc.heightOfString(data.notes_technicien, { width: 500 }) || 20) + 10;
        }

        if (data.failure_reason) {
            checkSpaceAndAddPage(50);
            yPosition += 10;
            doc.fillColor("#b91c1c").font('Helvetica-Bold').fontSize(11).text("Raison de l'échec", 50, yPosition);
            yPosition += 18;
            doc.fillColor("#fef2f2").rect(50, yPosition - 8, doc.page.width - 100, 30).fill();
            doc.fillColor("#991b1b").font('Helvetica').fontSize(10).text(` ${data.failure_reason}`, 55, yPosition);
            yPosition += 35;
        }

        if (data.materials && data.materials.length > 0) {
            checkSpaceAndAddPage(40);
            yPosition += 15;
            doc.fillColor("#374151").font('Helvetica-Bold').fontSize(12).text("Matériels utilisés", 50, yPosition);
            yPosition += 20;

            data.materials.forEach((mat) => {
                checkSpaceAndAddPage(30);

                doc.fillColor("#eff6ff").rect(50, yPosition - 5, doc.page.width - 100, 20).fill();
                doc.fillColor("#1f2937").font('Helvetica-Bold').fontSize(10).text(mat.name, 55, yPosition);

                doc.font('Helvetica').fontSize(9);
                if (mat.to_bring === 1) {
                    doc.fillColor("#166534").text("  (🚀 À emporter)", 170, yPosition);
                } else {
                    doc.fillColor("#4b5563").text("  (📍 Sur place)", 170, yPosition);
                }

                doc.fillColor("#2563eb").font('Helvetica-Bold').fontSize(11).text(`x${mat.quantity_required}`, doc.page.width - 90, yPosition, { align: 'right' });

                yPosition += 25;
            });
        }

        const totalPages = doc.bufferedPageRange().count;
        for (let i = 0; i < totalPages; i++) {
            doc.switchToPage(i);
            const footerY = doc.page.height - footerHeight - margin / 2;
            doc.moveTo(margin, footerY - 5).lineTo(doc.page.width - margin, footerY - 5).strokeColor("#e5e7eb").stroke();
            doc.fillColor("#6b7280").font('Helvetica').fontSize(8);
            doc.text("Console IT - SASU au capital de 1000€ - RCS Meaux 902 123 456", margin, footerY, { align: 'center' });
            doc.text(`Page ${i + 1} sur ${totalPages}`, margin, footerY + 12, { align: 'center' });
        }

        doc.end();
    });
};