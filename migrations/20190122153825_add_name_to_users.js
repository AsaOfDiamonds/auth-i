
exports.up = function(knex, Promise) {
  return knex.schema.table('users', users => {
      users
        .string('name', 255)
        .notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', users => {
      users.dropColumn('name');
  });
};
