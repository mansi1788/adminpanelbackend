import { Permission } from "./Model/permission.ts";
import { Role } from "./Model/roleModel.ts";
import { RolePermission } from "./Model/rolePermission.ts";

export const seed = async () => {
  try {
    const roles = ["admin", "user", "hr", "manager"];
    const permission = ["create_user", "delete_user", "update_user"];

    //if find or if not it will create roles
    for (const r of roles) {
      const [role] = await Role.findOrCreate({ where: { role_name: r } });
      // console.log(
      //   "roleeeeeeeeeeeeeeeeeee-----------------------------------",
      //   role.role_name
      // );
    }

    //if find or if not it will create permissions
    for (const p of permission) {
      const [perm] = await Permission.findOrCreate({ where: { name: p } });
      // Use perm.get('name') for Sequelize instance, or perm.name if raw
      console.log("Created or found permission:", perm.get("name"));
    }

    //find role= admin in role table
    const adminRole = await Role.findOne({
      where: { role_name: "admin" },
    });

    // if found then find permission ilike create user or delete user in permission table
    if (adminRole) {
      const createUser = await Permission.findOne({
        where: { name: "create_user" },
      });
      const deleteUser = await Permission.findOne({
        where: { name: "delete_user" },
      });

      // console.log(
      //   "deleteuser ---------------------------------------------==============",
      //   deleteUser
      // );

      if (adminRole && createUser)
        await RolePermission.findOrCreate({
          where: {
            roleId: adminRole.get("id"),
            permissionId: createUser.get("id"),
          },
        });
      if (adminRole && deleteUser)
        await RolePermission.findOrCreate({
          where: {
            roleId: adminRole.get("id"),
            permissionId: deleteUser.get("id"),
          },
        });
    }
    console.log(
      "Assigned basic permissions to admin role ==================================================="
    );
  } catch (e) {
    console.log(
      "Seeding error------------------------------------------------------:",
      e
    );
  }
};
