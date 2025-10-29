import type { Request,Response } from "express";
// import { Role } from "../Model/roleModel.ts";

export const createRole = async(req:Request,res:Response)=>{
    try{
        const{role_name,description} = req.body;

        if(!role_name)
        {
            return res.status(400).json({message:"Role name is required"});

        }
        const [role,created] = await Role.findOrCreate({
            where:{role_name},
            defaults:{description:description || `${role_name} role`},

        })

          await createrole(
    user.id,
    "Create_role",
    "User",
    user.id,
    `Create role `


  )

        if(!created)
        {
            return res.status(400).json({message:"Role already exists"});

        }
        return res.status(201).json({message:"Role created Successfully",role});
    }catch(e)
    {
        console.log("Error creating role",e)
        return res.status(500).json({message:"Server error",e});
    }

};


export const getAllRoles = async(req:Request,res:Response)=>{
    try{
        const roles=await Role.findAll({attributes:["id","role_name"]});
        return res.status(200).json({roles});

    }catch(e)
    {
        console.log("Error fetching roles:",e)
        return res.status(500).json({message:"Server error",e})

    }

}

export const deleteRoles = async(req:Request,res:Response)=>{
    try{
        const {id} = req.params;
        const deleted = await Role.destroy({where:{id}});

        if(deleted === 0 )
        {
            return res.status(404).json({message:"Role not found"})
        }
        return res.status(200).json({message:"deleted successfully"})

    }catch(e)
    {
        console.log("Error deleting roles",e)
        return res.status(500).json({message:"Server error",e})

    }
     
}

