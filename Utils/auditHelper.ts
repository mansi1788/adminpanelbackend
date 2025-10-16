import { Audit } from "../Model/auditModel";

export const createauditlog=async(

    userId:number|null,
    action:string,
    entity:string,
    entityId:number,
    detail?:string
)=>{
    try{
        await Audit.create({
            userId,
            action,
            entity,
            entityId,
            detail,
        });
    }catch(e)
    {
        console.log("Audit log error",e);
    }
};