import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("audit",(table)=>{
        table.increments("id").primary();
        table.integer("userId").notNullable();
        table.string("action").notNullable();
        table.string("entity").notNullable();
        table.integer("entityId").notNullable();
        table.string("detail").notNullable();
    })
}


export async function down(knex: Knex): Promise<void> {

    await knex.schema.dropTableIfExists("audit");
    
}

