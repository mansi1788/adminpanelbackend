import {sequelize} from "../Config/db.ts";
import { Model, DataTypes } from "sequelize";


export class Audit extends Model{
}

Audit.init(
    {
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true,
            allowNull:false   
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        action:{
            type:DataTypes.STRING,
            allowNull:false
        },
        createdAt:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        entity:{
            type:DataTypes.STRING,
            allowNull:false
        },
        entityId:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        detail:{
            type:DataTypes.JSON,
            allowNull:false
        }
    },
{
    sequelize,
    tableName:"audit",

})