
exports.up = function(knex) {
    return knex.schema.createTable('interventions', function(table) {
        table.increments('id').primary();
        table.string('titre').notNullable();
        table.string('adresse').notNullable();
        table.date('date').notNullable();
        table.enum('statut', [
            'prévu',
            'en_cours',
            'termine',
            'annule'
        ]).notNullable().defaultTo('prévu');        table.integer('technicien_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users');
        table.timestamps(true, true);
    })
  
};


exports.down = function(knex) {
    return knex.schema.dropTable('interventions');
};
