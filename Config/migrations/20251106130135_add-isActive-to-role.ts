import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("role", (table) => {
    table.boolean("isActive").notNullable().defaultTo(true); // default active
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("role", (table) => {
    table.dropColumn("isActive");
  });
}
