exports.up = function(knex) {
    return knex.schema.createTable('intervention_technicians', function(table) {
        table.increments('id').primary();
        table.integer('intervention_id').unsigned().notNullable();
        table.integer('technician_id').unsigned().notNullable();

        table.foreign('intervention_id').references('id').inTable('interventions').onDelete('CASCADE');

        table.foreign('technician_id').references('id').inTable('users').onDelete('CASCADE');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('intervention_technicians');
};