import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("role", (table) => {
    table.text("description").notNullable(); // <-- text instead of boolean
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("role", (table) => {
    table.dropColumn("description");
  });
}
