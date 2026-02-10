// src/db-connection.ts
import knex from 'knex';

// 1. On dit à TypeScript d'ignorer la ligne suivante (pour l'erreur rootDir)
// @ts-ignore
const config = require('../../knexfile');
// Note : Si tu déplaces ce fichier dans le dossier 'db', remets '../../knexfile'

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

const db = knex(dbConfig);

export default db;