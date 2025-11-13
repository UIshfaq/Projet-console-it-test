

const knex = require('knex');
// On charge le knexfile.js qui est à la racine de /backend
const config = require('../knexfile.js');

// On initialise Knex avec la configuration 'development'
const db = knex(config.development);

// On exporte l'instance Knex pour toute l'app
module.exports = db;