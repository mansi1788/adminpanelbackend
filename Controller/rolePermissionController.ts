import type { Request,Response } from "express";
import { Role } from "../Model/roleModel.ts";
import { RolePermission } from "../Model/rolePermission.ts";
import { Permission } from "../Model/permission.ts";


export const updateRolePermissions = async(req:Request,res:Response)=>{
    try{
        const{ roleName, permissions} =req.body;

        const role = await Role.findOne({where:{role_name:roleName}});
        if(!role) return res.status(404).json({message:"Role no found"});
        await RolePermission.destroy({where:{roleId:role.get("id")}});

        for(const permName of permissions)
        {
            const perm = await Permission.findOne({where:{name:permName}});
            if(perm)
            {
                await RolePermission.findOrCreate({
                    where:{
                        roleId:role.get("id"),
                        permissionId:perm.get("id"),
                    }
                })

            }
        }
        res.status(200).json({message:"Permissions updated successfully"});

        
    }catch(e)
    {
        console.log("Error updating permission",e)
        res.status(500).json({message:"Server error",error:e})
    }
}

