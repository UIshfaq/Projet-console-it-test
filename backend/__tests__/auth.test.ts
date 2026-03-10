import request = require('supertest');
import app from '../src/server';
import db from '../src/db/db-connection';

// Nettoyage : On ferme la connexion à la base de données à la fin pour que Jest s'arrête proprement
afterAll(async () => {
    await db.destroy();
});

describe('🔑 Tests d\'Intégration : Authentification', () => {

    it('devrait connecter un utilisateur valide et renvoyer un token (Happy Path)', async () => {
        // 1. ARRANGE : On prépare nos données avec l'email de l'Admin issu de ton dump SQL
        const credentials = {
            email: 'tech1@example.com',
            password: 'Password123!' // ⚠️ Remplace ceci par le vrai mot de passe que tu as configuré pour cet utilisateur en base
        };

        // 2. ACT : Supertest simule l'envoi d'une requête POST
        const response = await request(app)
            .post('/auth/login')
            .send(credentials);

        // 3. ASSERT : On vérifie les promesses de ton contrôleur
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Connexion réussie");
        expect(response.body).toHaveProperty('token');
        expect(response.body.user).toHaveProperty('email', 'tech1@example.com');
        expect(response.body.user).toHaveProperty('role', 'technicien');
    });

    it('devrait refuser la connexion avec un mauvais mot de passe (Sad Path)', async () => {
        // 1. ARRANGE : On utilise le bon email mais un mot de passe bidon
        const badCredentials = {
            email: 'tech1@example.com',
            password: 'mot_de_passe_totalement_faux'
        };

        // 2. ACT : On simule la requête
        const response = await request(app)
            .post('/auth/login')
            .send(badCredentials);

        // 3. ASSERT : On vérifie que ton serveur se défend bien (Code 401)
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Email ou mot de passe incorrect.");
    });

    it('devrait bloquer la requête si un champ est manquant (Sad Path)', async () => {
        // 1. ARRANGE : On simule un utilisateur qui a oublié de taper son mot de passe
        const incompleteCredentials = {
            email: 'admin@example.com',
            password: ''
        };

        // 2. ACT
        const response = await request(app)
            .post('/auth/login')
            .send(incompleteCredentials);

        // 3. ASSERT : On attend ton code 400 (Bad Request)
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Veuillez remplir tous les champs");
    });

});