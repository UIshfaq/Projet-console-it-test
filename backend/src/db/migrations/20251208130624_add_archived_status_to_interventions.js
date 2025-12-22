exports.up = function (knex) {
    return knex.schema.alterTable('interventions', (table) => {
        table.enum('statut', [
            'prévu',
            'en_cours',
            'termine',
            'annule',
            'archiver'
        ]).notNullable().defaultTo('prévu').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('interventions', (table) => {
        table.enum('statut', [
            'prévu',
            'en_cours',
            'termine',
            'annule'
        ]).notNullable().defaultTo('prévu').alter();
    });
};