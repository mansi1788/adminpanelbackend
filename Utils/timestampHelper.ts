import {Knex} from "knex";

export const addTimeStamps = (table:Knex.CreateTableBuilder,knex:Knex)=>{
    table
    .timestamp("createdAt")
    .defaultTo(knex.fn.now())
    .notNullable();
    table
    .timestamp("updatedAt")
    .defaultTo(knex.fn.now())
    .notNullable();

};
