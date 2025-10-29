import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("role_permission",(table)=>{
        table.increments("id").primary();
        table.integer("roleId").unsigned(),notNullable();
        table.integer("permissionId").unsigned(),notNullable();

        table.foreign("roleId").references("permissionId").onDelete("CASCADE");
        table.foreign("permissionId").reference("roleId").onDelete("CASCADE");  
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("permission_roles");
}

