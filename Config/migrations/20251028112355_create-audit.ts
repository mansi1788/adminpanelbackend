import type { Knex } from "knex";
import { addTimeStamps } from "../../Utils/timestampHelper.ts";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("audit",(table)=>{
        table.increments("id").primary();
        table.string("userId").notNullable();  //username
        table.string("action").notNullable(); //type
        table.string("entity").notNullable();
        table.integer("entityId").notNullable(); //npx knex migrate:rollback --all
        table.string("detail").notNullable();  // activity
        addTimeStamps(table,knex);   // timestamp
    })
}
export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("audit");
}

