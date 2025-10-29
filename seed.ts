// import { Permission } from "./Model/permission.ts";
// import { Role } from "./Model/roleModel.ts";
// import { RolePermission } from "./Model/rolePermission.ts";
import knex from "knex";
import config from "./Config/knexfile.ts";

export const seed = async () => {
  try {
    const roles = ["admin", "user", "hr", "manager"];
    const permission = ["create_user", "delete_user", "update_user","view_user"];

    const db=knex(config["development"]);
    //if find or if not it will create roles
    for (const r of roles) {
      const existingRole = await db('role'). where({ role_name: r}).first();
      
      if(!existingRole)
      {
        await db("roles").insert({role_name:r, description:`${r}role`});
        console.log(`inserted role: ${r}`);
      }

      // console.log(
      //   "roleeeeeeeeeeeeeeeeeee-----------------------------------",
      //   role.role_name
      // );
    }

    //if find or if not it will create permissions
    for (const p of permission) {
      const existingperm = await db("permissions")
        .where({ name: p }).first();

        if(!existingperm)
        {
          await db("permissions").insert({name:p,description:`${p} permission`});
          console.log(`Inserted permission: ${p}`);
        }

      
      // Use perm.get('name') for Sequelize instance, or perm.name if raw
     // console.log("Created or found permission:", perm.get("name"));
    }


    const rolePermissionMap:Record<string,string[]> ={
      admin:["create_user","delete_user","update_user","view_user"],
      user:["view_user"],
      hr:["create_user","view_user","update_user"],
      manager:["view_user","update_user"],

    }

    //find role= admin in role table
    // const adminRole = await Role.findOne({
    //   where: { role_name: "admin" },
    // });

    // if found then find permission like create user or delete user in permission table
    // if (adminRole) {
    //   const createUser = await Permission.findOne({
    //     where: { name: "create_user" },
    //   });
    //   const deleteUser = await Permission.findOne({
    //     where: { name: "delete_user" },
        
    //   });
    //   const updateUser = await Permission.findOne({
    //     where: { name:"update_user" }
    //   })
    //   const viewUser = await Permission.findOne({
    //     where:{name:"view_user"}
    //   })

      // console.log(
      //   "deleteuser ---------------------------------------------==============",
      //   deleteUser
      // );

      for(const[roleName,perms] of Object.entries(rolePermissionMap))
      {
        const role= await db("role").where({role_name : roleName}).first();
        if(!role) continue;
      

      for(const permName of perms)
      {
        const perm = await db("permissions").where({name:permName}).first();
        if(!perm) continue;

        // await RolePermission.findOrCreate({
        //   where:{
        //     roleId:role.get("id"),
        //     permissionId:perm.get("id"),
        //   },
        // });

        const existingLink = await db("role_permission")
        .where({roleId:role.id,permissionId:perm.id})
        .first();

        if(!existingLink)
        {
          await db("role_permission").insert({
            roleId:role.id,
            permissionId:perm.id,
          });
          console.log(`🔗 Linked ${roleName} → ${permName}`);
        }
      }
    }

      // if (adminRole && createUser)
      //   await RolePermission.findOrCreate({
      //     where: {
      //       roleId: adminRole.get("id"),
      //       permissionId: createUser.get("id"),
      //     },
      //   });
      // if (adminRole && deleteUser)
      //   await RolePermission.findOrCreate({
      //     where: {
      //       roleId: adminRole.get("id"),
      //       permissionId: deleteUser.get("id"),
      //     },
      //   });
      //   if(adminRole && updateUser)
      //   {
      //     await RolePermission.findOrCreate({
      //       where:{
      //         roleId:adminRole.get("id"),
      //         permissionId:updateUser.get("id"),
      //       }
      //     })
      //   }
      //   if(adminRole && viewUser)
      //   {
      //     await RolePermission.findOrCreate({
      //       where:{
      //         roleId:adminRole.get("id"),
      //         permissionId:viewUser.get("id"),

      //       }
      //     })
      //   }
    
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
