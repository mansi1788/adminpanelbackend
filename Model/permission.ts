import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/db.ts";

export class Permission extends Model {
  id: unknown;
 
}
Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "permissions",
  }
);
