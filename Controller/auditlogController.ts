import type { Request,Response } from "express";
import { Audit } from "../Model/auditModel";

export const createlog = async(req:Request,res:Response)=>{
    try{
    const {action,entity,entityId,userId,detail} = req.body;

    const audit = await Audit.create({
        userId,
        detail,
        action,
        entity,
        entityId
    })
    res.status(200).json({message:"log created successfully",audit})
}
catch(e)
{
    res.status(500).json({message:"Error in creating log",e})
}
}

export const getlog = async(req:Request,res:Response)=>{
    try{
       const log = await Audit.findAll({ 
        order: [['createdAt', 'Desc']] })
        return res.status(200).json({message:"Successfully get all users",log})

    }catch(e){
        return res.status(500).json({message:"Error in geting all users",e})

    }

}