import type { Knex } from "knex";

// Update with your config settings.

interface KnexConfig{
  [key:string]:Knex.Config;

}


const config:KnexConfig = {
  development: {
    client: "mysql2",
    connection: {
      host:"localhost",
      user:"root",
      password:"mansi.1788",
      database:"crud",
     // filename: "C:\\Users\\Evince\\Desktop\\backend\\rolebasedloginsignup\\Config\\dev.sqlite3"
    },
    // debug:true,
    // useNullAsDefault:true,
    pool:{min:2,max:10},
    migrations:{
      tableName:"knex_migrations",
      directory:"./migrations"
     },
     seeds:{
      directory:"./seed"

     }
  },
};

export default config;
