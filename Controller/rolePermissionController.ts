// import { Role } from "../Model/roleModel.ts";
// import { RolePermission } from "../Model/rolePermission.ts";
// import { Permission } from "../Model/permission.ts";

import type { Request, Response } from "express";
import db from "../Config/db.ts"; // your knex instance

export const updateRolePermissions = async (req:Request, res:Response) => {
  try {
    const { role_name, description, isActive, permissions } = req.body;
    const { id } = req.params;

    // Update role info
    await db('role').where({ id }).update({ role_name, description, isActive });

    // Delete old permissions
    await db('role_permission').where({ roleId: id }).del();

    // Insert new permissions
    if (permissions && permissions.length > 0) {
      const rolePermissions = permissions.map((permId: number) => ({
        roleId: id,
        permissionId: permId
      }));
      await db('role_permission').insert(rolePermissions);
    }

    res.json({ message: "Role updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating role" });
  }
};

export const getRolePermission = async (req: Request, res: Response) => {
   console.log("🔥 API HIT /roles/:roleId/permissions");
  console.log("Role ID:", req.params.roleId);
  try {
    const { roleId } = req.params;
    const roleIdNum = Number(roleId);

    // Get ALL permissions
    const allPermissions = await db("permission");
 console.log("allPermissions:", allPermissions);
    // Get assigned permissions (via join table)
    const assignedPermissions = await db("role_permission")
  .where({ roleId: roleIdNum })
  .pluck("permissionId");
 // returns array of IDs
    console.log("assignedPermissions:", assignedPermissions);
console.log(
  db("role_permission")
    .where({ roleId: roleIdNum })
    .toSQL()
    .toNative()
);

    res.json({
      allPermissions,
      assignedPermissions,
    });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e });
  }
};



// GET /roles/:id
export const getRoleById = async (req: Request, res: Response) => {
  const { id } = req.params; // <- expects `id` param

  if (!id) return res.status(400).json({ success: false, message: "Role ID is required" });

  try {
    const role = await db("role").where({ id: Number(id) }).first();
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });

    const assignedPermissions = await db("role_permission as rp")
      .join("permission as p", "rp.permissionId", "p.id")
      .select("p.id", "p.module", "p.action")
      .where("rp.roleId", Number(id));

    res.status(200).json({ success: true, role, permissions: assignedPermissions });
  } catch (err) {
    console.error("Error fetching role:", err);
    res.status(500).json({ success: false, message: "Failed to fetch role" });
  }
};



export const rolePermissionassign=async(req:Request,res:Response)=>{
  try{
    const {roleId, permissionId}=req.body;
    if(!roleId || !Array.isArray(permissionId))
    {
      return res.status(400).json({message:"Invaild data"});
    }

    const bulkData = permissionId.map(permissionId=>({
      roleId,
      permissionId,
    }));
    if(bulkData.length>0)
    {
      await db("role_permission").insert(bulkData);
    }

    return res.status(200).json({
      message:"Permission assigned",
      assigned:bulkData,
    })
  }
catch(e)
{
  console.log("Assign Error:",e);
  return res.status(500).json({message:"Something went wrong"});
}
}

export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await db("permission").select("id", "module", "action");

    res.status(200).json({
      success: true,
      permissions,
    });
  } catch (err) {
    console.error("Error fetching permissions:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch permissions",
    });
  }
};