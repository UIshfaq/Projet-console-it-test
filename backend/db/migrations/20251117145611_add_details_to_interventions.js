
exports.up = function(knex) {
    return knex.schema.table('interventions', function(table) {
        // 1. La description (Type TEXT pour écrire un paragraphe)
        table.text('description').nullable();

        // 2. Les coordonnées GPS (Type FLOAT pour les nombres à virgule)
        table.float('latitude').nullable();
        table.float('longitude').nullable();
    });
  
};


exports.down = function(knex) {
    return knex.schema.table('interventions', function(table) {
        // On supprime les colonnes qu'on vient de créer
        table.dropColumn('description');
        table.dropColumn('latitude');
        table.dropColumn('longitude');
    });
};
