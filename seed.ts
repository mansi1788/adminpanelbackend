// import knex from "knex";
// import config from "./Config/knexfile.ts";

// export const seed = async () => {
//   try {
//     const roles = ["admin", "user", "hr", "manager"];
//     const permission = ["create_user", "delete_user", "update_user","view_user"];

//     const db=knex(config["development"]);
//     //if find or if not it will create roles
//     for (const r of roles) {
//       const existingRole = await db('role'). where({ role_name: r}).first();
      
//       if(!existingRole)
//       {
//         await db("role").insert({role_name:r, description:`${r} role`,});
//         console.log(`inserted role: ${r}`);
//       }

//       // console.log(
//       //   "roleeeeeeeeeeeeeeeeeee-----------------------------------",
//       //   role.role_name
//       // );
//     }

//     //if find or if not it will create permissions
//     for (const p of permission) {
//       const existingperm = await db("permission")
//         .where({ name: p }).first();

//         if(!existingperm)
//         {
//           await db("permission").insert({name:p});
//           console.log(`Inserted permission: ${p}`);
//         }

      
//       // Use perm.get('name') for Sequelize instance, or perm.name if raw
//      // console.log("Created or found permission:", perm.get("name"));
//     }


//     const rolePermissionMap:Record<string,string[]> ={
//       admin:["create_user","delete_user","update_user","view_user"],
//       user:["view_user"],
//       hr:["create_user","view_user","update_user"],
//       manager:["view_user","update_user"],

//     }
//       for(const[roleName,perms] of Object.entries(rolePermissionMap))
//       {
//         const role= await db("role").where({role_name : roleName}).first();
//         if(!role) continue;
      

//       for(const permName of perms)
//       {
//         const perm = await db("permission").where({name:permName}).first();
//         if(!perm) continue;

//         // await RolePermission.findOrCreate({
//         //   where:{
//         //     roleId:role.get("id"),
//         //     permissionId:perm.get("id"),
//         //   },
//         // });

//         const existingLink = await db("role_permission")
//         .where({roleId:role.id,permissionId:perm.id})
//         .first();

//         if(!existingLink)
//         {
//           await db("role_permission").insert({
//             roleId:role.id,
//             permissionId:perm.id,
//           });
//           console.log(`🔗 Linked ${roleName} → ${permName}`);
//         }
//       }
//     }
    
//     console.log(
//       "Assigned basic permissions to admin role ==================================================="
//     );
//   } catch (e) {
//     console.log(
//       "Seeding error------------------------------------------------------:",
//       e
//     );
//   }
// };


import knex from "knex";
import config from "./Config/knexfile.ts";

export const seed = async () => {
  try {
    const db = knex(config["development"]);

    // 1️⃣ Roles
    const roles = ["admin", "user", "hr", "manager"];
    for (const r of roles) {
      const existingRole = await db("role").where({ role_name: r }).first();
      if (!existingRole) {
        await db("role").insert({
          role_name: r,
          description: `${r} role`,
          isActive: true,
        });
        console.log(`Inserted role: ${r}`);
      }
    }

    // 2️⃣ Permissions
    const permissionList = [
      // User module
      { name: "user.add", action: "add", module: "user" },
      { name: "user.view", action: "view", module: "user" },
      { name: "user.edit", action: "edit", module: "user" },
      { name: "user.delete", action: "delete", module: "user" },

      // Role module
      { name: "role.add", action: "add", module: "role" },
      { name: "role.view", action: "view", module: "role" },
      { name: "role.edit", action: "edit", module: "role" },
      { name: "role.delete", action: "delete", module: "role" },

      // EmailTemplate module
      { name: "emailTemplate.add", action: "add", module: "emailTemplate" },
      { name: "emailTemplate.view", action: "view", module: "emailTemplate" },
      { name: "emailTemplate.edit", action: "edit", module: "emailTemplate" },
      { name: "emailTemplate.delete", action: "delete", module: "emailTemplate" },

      // CMS module
      { name: "cms.add", action: "add", module: "cms" },
      { name: "cms.view", action: "view", module: "cms" },
      { name: "cms.edit", action: "edit", module: "cms" },
      { name: "cms.delete", action: "delete", module: "cms" },

      // FAQ module
      { name: "faq.add", action: "add", module: "faq" },
      { name: "faq.view", action: "view", module: "faq" },
      { name: "faq.edit", action: "edit", module: "faq" },
      { name: "faq.delete", action: "delete", module: "faq" },

      // AuditLog module
      { name: "auditLog.view", action: "view", module: "auditLog" },
      { name: "auditLog.edit", action: "edit", module: "auditLog" },
      { name: "auditLog.delete", action: "delete", module: "auditLog" },

      // ApplicationConfig module
      { name: "applicationConfig.view", action: "view", module: "applicationConfig" },
      { name: "applicationConfig.edit", action: "edit", module: "applicationConfig" },
      { name: "applicationConfig.delete", action: "delete", module: "applicationConfig" },
    ];

    for (const p of permissionList) {
      const existingPerm = await db("permission").where({ name: p.name }).first();
      if (!existingPerm) {
        await db("permission").insert(p);
        console.log(`Inserted permission: ${p.name}`);
      }
    }

    // 3️⃣ Role → Permission mapping
    const rolePermissionMap: Record<string, string[]> = {
      admin: permissionList.map((p) => p.name), // admin gets all
      user: ["user.view", "faq.view", "cms.view"],
      hr: ["user.add", "user.view", "user.edit", "faq.view"],
      manager: ["user.view", "user.edit", "cms.view"],
    };

    for (const [roleName, perms] of Object.entries(rolePermissionMap)) {
      const role = await db("role").where({ role_name: roleName }).first();
      if (!role) continue;

      for (const permName of perms) {
        const perm = await db("permission").where({ name: permName }).first();
        if (!perm) continue;

        const existingLink = await db("role_permission")
          .where({ roleId: role.id, permissionId: perm.id })
          .first();

        if (!existingLink) {
          await db("role_permission").insert({
            roleId: role.id,
            permissionId: perm.id,
          });
          console.log(`🔗 Linked ${roleName} → ${permName}`);
        }
      }
    }

    console.log("✅ Seeding complete!");
  } catch (e) {
    console.error("Seeding error:", e);
  }
};
