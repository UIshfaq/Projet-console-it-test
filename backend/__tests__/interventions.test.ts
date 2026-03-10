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

    it('devrait clôturer une intervention avec succès (Happy Path)', async () => {
        const response = await request(app)
            .put('/api/interventions/2') // On utilise l'ID 2 de tes données de test
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                statut: 'termine',
                rapport: 'Installation de la fibre effectuée. Tout fonctionne.',
                notes_technicien: 'Client très satisfait.',
                signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' // Simulation d'une image
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Intervention clôturée avec succès !");
    });

    it('devrait refuser la clôture si la signature est manquante (Sad Path)', async () => {
        const response = await request(app)
            .put('/api/interventions/2')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                statut: 'termine',
                rapport: 'J’ai fini mais j’ai oublié de faire signer.',
                signature: '' // Vide alors que le statut est 'termine'
            });

        // Ton contrôleur renvoie 400 si la signature manque pour ce statut
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("La signature du client est obligatoire pour valider l'intervention.");
    });

    it('devrait refuser la cloture car rapport manquant', async () => {
        const response = await request(app)
            .put('/api/interventions/2') // On utilise l'ID 2 de tes données de test
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                statut: 'termine',
                rapport: '',
                notes_technicien: 'Client très satisfait.',
                signature: '' // Simulation d'une image
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Le rapport est obligatoire pour terminer l'intervention.");
    });

    it('devrait enregistrer un échec d\'intervention avec une raison (Happy Path)', async () => {
        const response = await request(app)
            .put('/api/interventions/2')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                statut: 'echec',
                rapport: 'Impossible d\'accéder au boîtier électrique.',
                failure_reason: 'Le client était absent et le local est verrouillé.' // > 10 caractères
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Intervention clôturée avec succès !");
    });

    it('Ne devrait pas enregistrer un échec d\'intervention avec une raison (Happy Path)', async () => {
        const response = await request(app)
            .put('/api/interventions/2')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                statut: 'echec',
                rapport: 'Impossible d\'accéder au boîtier électrique.',
                failure_reason: '' // > 10 caractères
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("La raison de l'échec est obligatoire (min 10 caractères).");
    });
});