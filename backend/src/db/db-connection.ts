// src/db-connection.ts
import knex from 'knex';

// 1. On dit à TypeScript d'ignorer la ligne suivante (pour l'erreur rootDir)
// @ts-ignore
const config = require('../../knexfile');
// Note : Si tu déplaces ce fichier dans le dossier 'db', remets '../../knexfile'

const environment = process.env.NODE_ENV || 'development';
const activeEnv = environment === 'test' ? 'development' : environment;

// On utilise bien activeEnv !
const dbConfig = config[activeEnv];
const db = knex(dbConfig);

export default db;