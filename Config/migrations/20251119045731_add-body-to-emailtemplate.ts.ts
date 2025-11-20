import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("email_template", (table) => {
    table.text("body").notNullable(); // <-- text instead of boolean
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("email_template", (table) => {
    table.dropColumn("body");
  });
}
