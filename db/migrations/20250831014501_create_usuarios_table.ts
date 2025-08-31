import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('usuarios', (table) => {
    table.increments('id').primary();
    table.string('nome').notNullable();
    table.string('email').unique().notNullable();
    table.string('senha').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('usuarios');
}
