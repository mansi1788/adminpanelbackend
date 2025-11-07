import type { Knex } from "knex";
import { addTimeStamps } from "../../Utils/timestampHelper.ts";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user_roles", (table) => {
    table.increments("id").primary();
    table.integer("userId").unsigned().notNullable();
    table.integer("roleId").unsigned().notNullable();

    table
      .foreign("userId")
      .references("id")
      .inTable("roleuser")
      .onDelete("CASCADE");
    table
      .foreign("roleId")
      .references("id")
      .inTable("role")
      .onDelete("CASCADE");

    addTimeStamps(table, knex);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("user_roles");
}
