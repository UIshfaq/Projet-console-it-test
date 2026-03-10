import request = require('supertest');
import app from '../src/server';
import db from '../src/db/db-connection';

// Nettoyage de la base à la fin
afterAll(async () => {
    await db.destroy();
});

describe('📅 Tests d\'Intégration : Planning Interventions', () => {
    let validToken = '';

    // 1. PRÉPARATION GLOBALE : On se connecte une fois pour récupérer le token
    beforeAll(async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'tech1@example.com', // Le compte de Sohail Tech
                password: 'Password123!' // ⚠️ Ton vrai mot de passe
            });

        validToken = response.body.token;
    });

    // --- TESTS DE LA ROUTE '/' (Planning du technicien) ---

    it('devrait récupérer le planning (interventions non terminées) du technicien connecté (Happy Path)', async () => {
        const response = await request(app)
            .get('/api/interventions') // Tape sur ta route router.get('/')
            .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('devrait bloquer l\'accès au planning si la requête n\'a pas de token (Sad Path)', async () => {
        const response = await request(app)
            .get('/api/interventions');

        expect(response.status).toBe(401);
    });

    // --- TESTS DE LA ROUTE '/:id' (Détails d'une intervention) ---

    it('devrait récupérer les détails d\'une intervention spécifique avec son ID (Happy Path)', async () => {
        const interventionId = 2;

        const response = await request(app)
            .get(`/api/interventions/${interventionId}`) // Tape sur ta route router.get('/:id')
            .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', interventionId);
        expect(response.body).toHaveProperty('materials');
    });

    it('devrait renvoyer 404 si l\'intervention n\'existe pas (Sad Path)', async () => {
        const fakeId = 0.1;

        const response = await request(app)
            .get(`/api/interventions/${fakeId}`)
            .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("L'intervention est introuvable ou vous n'y êtes pas assigné");
    });
});