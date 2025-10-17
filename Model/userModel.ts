import { DataTypes, Model } from "sequelize";
import { sequelize } from "../Config/db.ts";

export class User extends Model {
  // Removed public fields to prevent shadowing Sequelize attributes
}
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstname: { type: DataTypes.STRING, allowNull: false },
    lastname: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    phoneno: { type: DataTypes.STRING, allowNull: false },
    photo: { type: DataTypes.STRING, allowNull: false },
    isActive: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    tableName: "roleuser",
    timestamps: true,
  }
);
