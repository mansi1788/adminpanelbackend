import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("roleuser",(table)=>{
        table.string("roles").defaultTo("user");
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("roleuser",(table)=>{
        table.dropColumn("roles");
    })
}

