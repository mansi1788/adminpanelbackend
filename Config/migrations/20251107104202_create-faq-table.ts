import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("faq", (table) => {
    table.increments("id").primary();
    table.string("question").notNullable();
    table.integer("display_order").notNullable();
    table.boolean("isActive").notNullable();
    
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
  return knex.schema.dropTableIfExists("faq");
}
