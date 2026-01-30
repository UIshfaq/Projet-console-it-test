/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('interventions', table => {
        // On modifie la colonne pour qu'elle accepte le NULL
        table.integer('technicien_id').unsigned().nullable().alter();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('interventions', table => {
        // En cas de retour en arrière, on la remet en NOT NULL
        table.integer('technicien_id').unsigned().notNullable().alter();
    });
};