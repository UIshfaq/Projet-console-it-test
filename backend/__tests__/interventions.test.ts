import request = require('supertest');
import app from '../src/server';
import db from '../src/db/db-connection';

afterAll(async () => {
    await db.destroy();
});

describe('📅 Tests d\'Intégration : Planning Interventions', () => {
    let validToken = '';

    beforeAll(async () => {
        // Login du technicien Sohail (ID: 1)
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'tech1@example.com', password: 'Password123!' });
        validToken = response.body.token;
    });

    it('devrait récupérer le planning de Sohail (Interventions 1, 2, 3 et 5)', async () => {
        const response = await request(app)
            .get('/api/interventions')
            .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('devrait récupérer les détails de l\'intervention 2 (Dépannage Box)', async () => {
        const response = await request(app)
            .get('/api/interventions/2')
            .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.titre).toBe('Dépannage Box - Solo');
        expect(response.body.nomClient).toBe('Boulangerie Centrale');
    });

    it('devrait clôturer l\'intervention 2 avec succès', async () => {
        const response = await request(app)
            .put('/api/interventions/2')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                statut: 'termine',
                rapport: 'Box remplacée par une Wi-Fi 7.',
                signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Intervention clôturée avec succès !");
    });

    it('devrait vérifier que l\'intervention 5 est bien en échec avec sa raison', async () => {
        const response = await request(app)
            .get('/api/interventions/5')
            .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.statut).toBe('echec');
        expect(response.body.failure_reason).toContain("local technique verrouillé");
    });
});