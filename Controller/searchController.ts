import type { Request,Response } from "express";
import { User } from "../Model/userModel.ts";
import { Op } from "sequelize";
import { Role } from "../Model/roleModel.ts";
import { UserRole } from "../Model/userRole.ts";


export const searchcontroller=async(req:Request,res:Response)=>{
    try{
    const {username}=req.body;

    const user = await User.findAll({
        where:{username:{[Op.like]:`%${username}%`}}
    })
    if(user.length === 0)
        return res.status(404).json({message:"No users found"});

    res.status(200).json({result:user});
}
catch(e)
{
    res.status(500).json({message:"Error in username searching", error: e})   
}
}

export const emailcontroller = async(req:Request,res:Response)=>{
    try{
        const {email}=req.body;

        const useremail = await User.findOne({where:{email:{[Op.like]:`%${email}%`} }})
        if(!email)
        {
            return res.status(404).json({message:"No email found"});
        }
        return res.status(200).json({result:useremail});

    }catch(e)
    {
        res.status(500).json({message:"Error in email searching",error:e});

    }
}

export const phonenoconroller = async(req:Request,res:Response)=>{
    try{
    const {phoneno} = req.body;

    const phonenosearch = await User.findOne({where:{phoneno:{[Op.like]:`%${phoneno}%`}}})

    if(!phonenosearch)
    {
        return res.status(404).json({message:"Phone number not found"})
    }
    return res.status(200).json({result:phonenosearch})
}
catch(e)
{
    res.status(500).json({message:"Error in phone number searching",error:e});
}
}


export const rolecontroller = async(req:Request,res:Response)=>{
    
    try{
    const{ roleName }=req.body;

    const role = await User.findAll({
        include:[{model:Role,as:'roles',
        where:{role_name:roleName}}],
        //attributes: ["id", "role_name"],//user,hr,etce tec..........
    })
    

    if(!role || role.length === 0)
    {
        return res.status(404).json({message:"No role found"})
    }

    return res.status(200).json({result:role});

}
catch(e)
{
    res.status(500).json({message:"Error in finding role",error:e})
    
}
}

export const isActivecontroller = async(req:Request,res:Response)=>{
    try{
    const{isActive} = req.body;
    const active = await User.findAll({where:{isActive}})

    if(!active)
    {
        return res.status(404).json({message:"No one is active"});
    }
    return res.status(200).json({result:active})
}
catch(e)
{
    res.status(500).json({message:"Error in finding active users"})
}

}