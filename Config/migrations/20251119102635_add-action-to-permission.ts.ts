import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("permission", (table) => {
    table.string("action").notNullable();
    table.string("module").notNullable();
     // <-- text instead of boolean
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("permission", (table) => {
    table.dropColumn("action");
    table.dropColumn("module");
  });
}

