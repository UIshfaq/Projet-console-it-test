exports.up = function(knex) {
    return knex.schema.table('users', function(table) {
        table.boolean('isActive').notNullable().defaultTo(true);
    }
    );
  
};


exports.down = function(knex) {
    return knex.schema.table('users', function(table) {
        table.dropColumn('isActive');

    }
    );
};
