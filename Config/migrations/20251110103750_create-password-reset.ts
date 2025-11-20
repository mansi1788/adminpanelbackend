import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
 const exists = await knex.schema.hasTable("password_resets");
  if (!exists) {
    return knex.schema.createTable("password_resets", (table) => {
      table.increments("id").primary();
      table.integer("userId").unsigned().notNullable();
      table.string("token").notNullable();
      table.datetime("expiresAt").notNullable();
      table.boolean("used").defaultTo(false);
      table.timestamp("createdAt").defaultTo(knex.fn.now());
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("password_resets");
}
