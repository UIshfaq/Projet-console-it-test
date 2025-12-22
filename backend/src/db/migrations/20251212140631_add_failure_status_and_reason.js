exports.up = function(knex) {
    return knex.schema.alterTable('interventions', (table) => {
        table.text('failure_reason').nullable();
        table.enum('statut', [
            'prévu',
            'en_cours',
            'termine',
            'annule',
            'archiver',
            'echec' // <- Ajout
        ]).notNullable().defaultTo('prévu').alter();
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('interventions', (table) => {
        table.dropColumn('failure_reason');
        table.enum('statut', [
            'prévu',
            'en_cours',
            'termine',
            'annule',
            'archiver'
        ]).notNullable().defaultTo('prévu').alter();
    });
};
