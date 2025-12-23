
exports.up = function(knex) {
    return knex.schema
        // 1. LE STOCK DU DÉPÔT (Catalogue)
        .createTable('materials', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('reference').nullable();
            table.integer('stock_quantity').defaultTo(0);
            table.timestamps(true, true);
        })

        // 2. LA LISTE POUR L'INTERVENTION (Liaison)
        .createTable('intervention_materials', (table) => {
            table.increments('id').primary();

            // Liens
            table.integer('intervention_id').unsigned().references('id').inTable('interventions').onDelete('CASCADE');
            table.integer('material_id').unsigned().references('id').inTable('materials').onDelete('CASCADE');

            table.integer('quantity_required').defaultTo(1);
            table.boolean('to_bring').defaultTo(true); // true = à prendre au dépôt
            table.boolean('is_checked').defaultTo(false); // Pour la checkbox dans l'app

            table.timestamps(true, true);
        });
};

exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('intervention_materials')
        .dropTableIfExists('materials');
};