exports.up = function(knex) {
    return knex.schema.alterTable('interventions', (table) => {
        table.text('rapport').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('interventions', (table) => {
        table.dropColumn('rapport');
    });
};