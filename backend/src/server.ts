import express from 'express';
import cors from 'cors';
const app = express();
import db from './db/db-connection';
import rateLimit from 'express-rate-limit';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Augmenté à 50 pour le développement (réduit en production)
    message: { message: "Trop de tentatives de connexion, veuillez réessayer dans 15 minutes." },
    skip: () => {
        // Skip rate limit si vous êtes en développement (optionnel)
        return process.env.NODE_ENV === 'development';
    }
});



import authRoutes from './routes/authRoutes';
// Appliquer le rate limiter UNIQUEMENT sur la route login
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);

import interventionRoutes from './routes/interventionRoutes';
app.use('/api/interventions', interventionRoutes);

import inventairesRoutes from './routes/inventairesRoutes';
app.use('/api/inventaires', inventairesRoutes);

import userRoutes from './routes/userRoutes';
app.use('/api/users',userRoutes );

import dashboardAdminRoutes from './routes/dashboardAdminRoute';
app.use('/api/dashboard/admin', dashboardAdminRoutes);

import generatePdfRoute from './routes/generativePdfRoute'
app.use('/api', generatePdfRoute);



const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    try {
        await db.raw('SELECT 1');
        console.log('Connecté à MySQL avec Knex !');
        console.log(`Serveur lancé sur le port ${PORT}`);
    } catch (err) {
        console.error('Erreur de connexion à la DB au démarrage', err);
    }
});

export default app;