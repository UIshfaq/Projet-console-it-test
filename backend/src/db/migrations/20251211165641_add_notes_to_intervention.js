exports.up = function(knex) {
    return knex.schema.table('interventions', function(table) {
        table.text('notes_technicien').nullable();
    });
}

exports.down = function(knex) {
    return knex.schema.table('interventions', function(table) {
        table.dropColumn('notes_technicien');
    });
}