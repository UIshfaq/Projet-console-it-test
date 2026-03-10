import request = require('supertest');
import app from '../src/server';
import db from '../src/db/db-connection';

// Nettoyage de la base
afterAll(async () => {
    await db.destroy();
});

describe('📄 Tests d\'Intégration : Génération PDF', () => {
    let validToken = '';

    // 1. PRÉPARATION GLOBALE : Récupération du token
    beforeAll(async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'tech1@example.com',
                password: 'Password123!' // ⚠️ Ton vrai mot de passe
            });

        validToken = response.body.token;
    });

    it('devrait générer et renvoyer un fichier PDF pour une intervention valide (Happy Path)', async () => {
        const interventionId = 2; // L'intervention où ton technicien est assigné

        const response = await request(app)
            // ⚠️ Vérifie que c'est bien la bonne route définie dans ton fichier generativePdfRoute.ts !
            .get(`/api/generate-pdf/${interventionId}`)
            .set('Authorization', `Bearer ${validToken}`);

        // 3. ASSERT : On vérifie le succès et le type de fichier
        expect(response.status).toBe(200);
        // On vérifie que tes headers (Content-Type) indiquent bien un PDF
        expect(response.headers['content-type']).toBe('application/pdf');
        // On vérifie qu'on a bien reçu des données binaires (le Buffer)
        expect(response.body).toBeInstanceOf(Buffer);
    });

    it('devrait bloquer la génération si l\'intervention est introuvable ou non assignée (Sad Path)', async () => {
        const fakeId = 99999;

        const response = await request(app)
            .get(`/api/generate-pdf/${fakeId}`)
            .set('Authorization', `Bearer ${validToken}`);

        // 3. ASSERT : Ton contrôleur doit renvoyer ton code 404
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Intervention introuvable ou accès refusé.");
    });
});