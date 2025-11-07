import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("email_template", (table) => {
    table.increments("id").primary();
    table.string("key").notNullable();
    table.string("title").notNullable();
    table.string("subject").notNullable();
    table.boolean("isActive").notNullable();
    // table.timestamps(true,true);
    table
      .timestamp("createdAt")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP"))
      .notNullable();
    table
      .timestamp("updatedAt")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
      .notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("email_template");
}
