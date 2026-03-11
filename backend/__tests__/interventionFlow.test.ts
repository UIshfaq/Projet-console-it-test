import request = require('supertest');
import app from '../src/server';
import db from '../src/db/db-connection';

describe('Flux d\'Intervention : Admin vers Technicien', () => {
    let adminToken: string;
    let techToken: string;
    let technicienId: number;
    let createdInterventionId: number;

    beforeAll(async () => {
        // Réinitialisation de la base de données de test pour la CI
        await db('intervention_materials').del();
        await db('intervention_technicians').del();
        await db('interventions').del();

        // Réinitialisation de la base de données de test pour la CI
        await db.migrate.rollback(undefined, true);
        await db.migrate.latest();
        await db.seed.run();

        // 1. Simulation : Connexion depuis le Dashboard d'administration
        const adminRes = await request(app)
            .post('/auth/login')
            .send({ email: 'admin@example.com', password: 'Password123!' });
        adminToken = adminRes.body.token;

        // 2. Simulation : Connexion depuis l'application React Native
        const techRes = await request(app)
            .post('/auth/login')
            .send({ email: 'tech1@example.com', password: 'Password123!' });
        techToken = techRes.body.token;
        technicienId = techRes.body.user.id;
    });

    afterAll(async () => {
        // Fermeture propre de la connexion SQL
        await db.destroy();
    });

    it('devrait permettre à un admin de créer une intervention qui apparait dans la FlatList du technicien', async () => {
        // 3. L'Admin crée l'intervention via le panel web
        const payloadIntervention = {
            // On regroupe les infos de base dans interventionData
            interventionData: {
                titre: 'Installation Fibre',
                description: 'Tirage de câble et raccordement optique',
                adresse: '123 Rue de la Fibre, Paris',
                date: new Date().toISOString(),
                nomClient: 'Jean Dupont'
            },
            // On sépare les techniciens
            technicianIds: [technicienId],
            // On structure correctement le matériel
            materials: [
                { id: 1, quantity: 1 },
                { id: 2, quantity: 2 }
            ]
        };

        const creationRes = await request(app)
            .post('/api/interventions/addInterv')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(payloadIntervention);

        expect(creationRes.status).toBe(201);

        createdInterventionId = creationRes.body.id;

        // Typage strict de la réponse attendue
        type InterventionResponse = {
            id: number;
            titre: string;
            description : string,
            adresse : string,
            statut : string,
            date : string,
            nomClient : string,
            materialIds: number[],
            quantity_required: number,
            to_bring: number,
            is_checked: number };
        const nouvelleIntervention = creationRes.body as InterventionResponse;

        // 4. Le Technicien actualise sa FlatList sur le mobile
        const listeRes = await request(app)
            .get(`/api/interventions`)
            .set('Authorization', `Bearer ${techToken}`);

        expect(listeRes.status).toBe(200);

        // Vérification que la mission assignée est bien redescendue sur le compte tech
        const interventionTrouvee = listeRes.body.find(
            (interv: InterventionResponse) => interv.titre === 'Installation Fibre'
        );

        expect(interventionTrouvee).toBeDefined();
        expect(interventionTrouvee.statut).toBe('prévu');
    });

    it('devrait interdire à un technicien (non-admin) de créer une intervention', async () => {
        const payloadIntervention = {
            interventionData: {
                titre: 'Tentative de Hack',
                adresse: '123 Rue du Pirate',
                date: new Date().toISOString()
            }
        };

        const failRes = await request(app)
            .post('/api/interventions/addInterv')
            .set('Authorization', `Bearer ${techToken}`) // ❌ On utilise le token du Tech !
            .send(payloadIntervention);

        // Le middleware isAdmin devrait bloquer la requête (souvent code 403 Forbidden ou 401 Unauthorized)
        expect([401, 403]).toContain(failRes.status);
    });

    it('devrait permettre au technicien assigné de clôturer l\'intervention', async () => {
        // D'après ton contrôleur, il faut un statut, un rapport et une signature pour clôturer
        const payloadCloture = {
            statut: 'termine',
            rapport: 'Fibre soudée et box configurée. Test de débit OK.',
            signature: 'data:image/png;base64,iVBORw0KGgo...' // Fausses données de signature
        };

        const clotureRes = await request(app)
            .put(`/api/interventions/${createdInterventionId}`) // ✅ On utilise l'ID sauvegardé au test 1
            .set('Authorization', `Bearer ${techToken}`)
            .send(payloadCloture);

        expect(clotureRes.status).toBe(200);
        expect(clotureRes.body.message).toBe("Intervention clôturée avec succès !");
    });
});