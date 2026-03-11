import request = require('supertest');
import app from '../src/server';
import db from '../src/db/db-connection';

afterAll(async () => {
    await db.destroy();
});

describe('📄 Tests d\'Intégration : Génération PDF', () => {
    let validToken = '';

    beforeAll(async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'tech1@example.com', password: 'Password123!' });
        validToken = response.body.token;
    });

    it('devrait générer le PDF de l\'intervention 3 (Raccordement Immeuble)', async () => {
        // L'ID 3 est déjà terminée dans le seed, parfait pour un PDF
        const response = await request(app)
            .get('/api/generate-pdf/3')
            .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/pdf');
    });

    it('devrait générer le PDF même pour une intervention en échec (ID 5)', async () => {
        const response = await request(app)
            .get('/api/generate-pdf/5')
            .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/pdf');
    });

    it('devrait refuser le PDF pour l\'intervention 4 (assignée à tech2 uniquement)', async () => {
        const response = await request(app)
            .get('/api/generate-pdf/4')
            .set('Authorization', `Bearer ${validToken}`);

        // Sohail n'a pas accès à l'intervention de Thomas (ID 4)
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Intervention introuvable ou accès refusé.");
    });
});