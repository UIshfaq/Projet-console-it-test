exports.up = function(knex) {
    return knex.schema.alterTable('interventions', table => {
        // On supprime d'abord la contrainte de clé étrangère
        table.dropForeign('technicien_id');
        // Puis on supprime la colonne
        table.dropColumn('technicien_id');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('interventions', table => {
        // En cas de rollback, on recrée la colonne (nullable par défaut pour éviter les crashs)
        table.integer('technicien_id').unsigned();
        table.foreign('technicien_id').references('id').inTable('users');
    });
};