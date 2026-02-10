import express from 'express';
import cors from 'cors';
const app = express();
import db from './db/db-connection';


app.use(cors());

app.use(express.json());


import authRoutes from './routes/authRoutes';
app.use('/auth', authRoutes);

import interventionRoutes from './routes/interventionRoutes';
app.use('/api/interventions', interventionRoutes);

import inventairesRoutes from './routes/inventairesRoutes';
app.use('/api/inventaires', inventairesRoutes);

import userRoutes from './routes/userRoutes';
app.use('/api/users',userRoutes );

import dashboardAdminRoutes from './routes/dashboardAdminRoute';
app.use('/api/dashboard/admin', dashboardAdminRoutes);



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