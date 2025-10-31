import type { Request,Response } from "express";
import db from "../Config/db.ts";

export const createRole = async(req:Request,res:Response)=>{
    try{
        const{role_name,description} = req.body;

        if(!role_name)
        {
            return res.status(400).json({message:"Role name is required"});
        }

        const existing = await db('role').where({role_name}).first();
        let roles,created=false;
        if(existing)
        {
            roles=existing;
        }
        else{
            const[insertedId] = await db('role').insert({
                role_name,
                description:description||`${role_name}role`,

            })
            roles = await db('role').where({id:insertedId}).first();
            created=true;
        }

        if(!created)
        {
            return res.status(400).json({message:"Role already exists"});

        }
        return res.status(201).json({message:"Role created Successfully",roles});
    }catch(e)
    {
        console.log("Error creating role",e)
        return res.status(500).json({message:"Server error",e});
    }

};


export const getAllRoles = async(req:Request,res:Response)=>{
    try{
        const roles=await db('role').select({attributes:["id","role_name"]});
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
        const deleted = await db('role').where(id).del();

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

