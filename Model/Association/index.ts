import { Permission } from "../permission.ts";
import { Role } from "../roleModel.ts";
import { RolePermission } from "../rolePermission.ts";
import { User } from "../userModel.ts";
import { UserRole } from "../userRole.ts";

User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: "userId",
  as: "roles",
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: "roleId",
  as: "users",
});

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "roleId",
  as: "permissions",
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permissionId",
  as: "roles",
});

export { User, Role, Permission, UserRole, RolePermission };
