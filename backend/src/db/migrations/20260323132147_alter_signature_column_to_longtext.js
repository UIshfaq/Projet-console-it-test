/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    return knex.schema.alterTable('interventions', (table) => {
        // Le type 'longtext' permet de stocker des chaînes Base64 massives
        table.text('signature', 'longtext').alter();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    return knex.schema.alterTable('interventions', (table) => {
        // Retour au type text classique en cas d'annulation (rollback)
        table.text('signature').alter();
    });
};