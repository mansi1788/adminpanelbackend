import type { Knex } from "knex";
import { addTimeStamps } from "../../Utils/timestampHelper.ts";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("role_permission", (table) => {
    table.increments("id").primary();
    table.integer("roleId").unsigned().notNullable();
    table.integer("permissionId").unsigned().notNullable();

    // Foreign key for roleId referencing the role table's id
    table
      .foreign("roleId")
      .references("id")
      .inTable("role")
      .onDelete("CASCADE");

    // Foreign key for permissionId referencing the permission table's id
    table
      .foreign("permissionId")
      .references("id")
      .inTable("permission")
      .onDelete("CASCADE");

    // Add timestamps
    addTimeStamps(table, knex);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("role_permission");
}
