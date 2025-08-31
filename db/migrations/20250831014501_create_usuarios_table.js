"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    return knex.schema.createTable('usuarios', (table) => {
        table.increments('id').primary();
        table.string('nome').notNullable();
        table.string('email').unique().notNullable();
        table.string('senha').notNullable();
        table.timestamps(true, true);
    });
}
async function down(knex) {
    return knex.schema.dropTable('usuarios');
}
