import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/db.ts";

export class UserRole extends Model {
  // Removed public fields to prevent shadowing Sequelize attributes
}

UserRole.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "user_roles",
  }
);
