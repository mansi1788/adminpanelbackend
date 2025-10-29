// import { Sequelize } from "sequelize";
// //import { seed } from "../seed.ts";

// export const sequelize = new Sequelize("crud","root","mansi.1788",{

// host:'localhost',
// dialect:'mysql',
// logging: false,
// });

// export const connectionDB = async()=>{
//     try{
//         await sequelize.authenticate();
//         console.log('Database Connected')
//     }
//     catch(e){
//         console.log('unable to connect to DB:',e);
//     }
// }
// (async()=>{
//     try{
//         await sequelize.authenticate();  //testing the connection to a database.
//         console.log("Database connected successfully");

//         await sequelize.sync();
       

//         console.log("ALL MODELS ARE SYNCHRONIZED AND TABLES ARE CREATED")
//     }
//     catch(error){
//         console.error("Error connecting db",error);
//     }
// })();


// // () it runs automatically after call if u don't put it , it means 
// // u have to defined function again and again 



import knex from "knex";
import config from "./knexfile.ts";

const db = knex(config.development);

(async()=>{
    try{
        await db.raw("Select 1+1 As result");
        console.log("Database connected successfully");

    }catch(e)
    {
        console.error('Unable to connect:',e)
    }
})();
export default db;