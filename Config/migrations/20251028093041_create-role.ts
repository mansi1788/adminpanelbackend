import type { Knex } from "knex";
import { addTimeStamps } from "../../Utils/timestampHelper.ts";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("role", (table) => {
    table.increments("id").primary();
    table.string("role_name").notNullable();
    addTimeStamps(table, knex);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("role");
}

// import type { Knex } from "knex";


// export async function up(knex: Knex): Promise<void> {
//     return knex.schema.createTable("role",(table)=>{
//         table.increments("id").primary();
//         table.string("role_name").notNullable();
//         table.timestamps(true,true);
//     });

// }


// export async function down(knex: Knex): Promise<void> {
//     return knex.schema.dropTableIfExists("role");
// }


