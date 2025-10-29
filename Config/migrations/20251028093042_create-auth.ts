import type { Knex } from "knex";
import { INTEGER } from "sequelize";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("roleuser",(table)=> {
        table.increments("id").primary();
        table.string("firstname").notNullable();
        table.string("lastname").notNullable();
        table.string("email").notNullable();
        table.string("password").notNullable();
        table.string("phoneno").notNullable();
        table.string("photo").notNullable();
        table.boolean("isActive").notNullable();
        // table.timestamps(true,true);
         table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
    table
      .timestamp("updatedAt")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
      .notNullable();
    });
}
export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("roleuser");
}

