
exports.up = function(knex)
{
    return knex.schema.table('users', function(table) {
        table.string('phone_number', 15).nullable().after('email')
    });
  
};

exports.down = function(knex) {
    return knex.schema.table('users', function(table) {
        table.dropColumn('phone_number');
    });
  
};
