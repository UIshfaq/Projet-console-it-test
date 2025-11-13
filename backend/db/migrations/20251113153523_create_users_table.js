// db/migrations/xxxx_create_users_table.js

exports.up = function(knex) {
    // 'up' = ce qu'on fait
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
    // 'down' = ce qu'on fait si on annule
    return knex.schema.dropTable('users');
};