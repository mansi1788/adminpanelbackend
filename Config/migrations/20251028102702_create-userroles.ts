import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("user_roles",(table)=>{
        table.increments("id").primary();
        table.integer("userId").unsigned().notNullable();
        table.integer("roleId").unsigned().notNullable();

        table.foreign("userId").references("userId").onDelete("CASCADE");
        table.foreign("roleId").references("roleId").onDelete("CASCADE");
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("user_roles");
}

