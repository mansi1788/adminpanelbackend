import { DataTypes, Model } from "sequelize";
import { sequelize } from "../Config/db.ts";

export class Role extends Model {
  // Removed public fields to prevent shadowing Sequelize attributes
}
Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "role",
  }
);
