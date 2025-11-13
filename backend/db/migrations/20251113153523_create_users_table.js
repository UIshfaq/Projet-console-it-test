
exports.up = function(knex) {

    return knex.schema.createTable('users', function(table) {
        table.increments('id').primary();
        table.string('nom').notNullable();
        table.string('email').notNullable().unique();
        table.string('password_hash').notNullable();
        table.string('role').defaultTo('technicien');
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {

    return knex.schema.dropTable('users');
};