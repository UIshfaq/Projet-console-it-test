exports.up = function(knex) {
    return knex.schema.alterTable('interventions', function(table) {
        table.text('signature').nullable();
    });
};


exports.down = function(knex) {
    return knex.schema.alterTable('interventions', function(table) {
        table.dropColumn('signature');
    });
};