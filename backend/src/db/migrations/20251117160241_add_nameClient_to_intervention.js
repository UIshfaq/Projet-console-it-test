
exports.up = function(knex) {
    return knex.schema.table('interventions', function(table) {
        // 1. La description (Type TEXT pour écrire un paragraphe)
        table.text('nomClient').nullable();


    });

};


exports.down = function(knex) {
    return knex.schema.table('interventions', function(table) {
        table.dropColumn('nomClient');

    });
};
