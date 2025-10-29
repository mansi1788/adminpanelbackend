import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
// import { User } from "../Model/userModel.ts";
// import { Role } from "../Model/roleModel.ts";
// import { Permission } from "../Model/permission.ts";
import config from "../Config/knexfile.ts";
import dotenv from "dotenv";
import knex from "knex";
dotenv.config();

// export const authenticate =(req:Request,res:Response,next:NextFunction)=>{
//        try{
//     const token = req.headers.authorization?.split(' ')[1];
//     if(!token )return res.status(401).json({message:"No token provided"});

//         const decoded = jwt.verify(token,process.env.JWT_SECRET)
//         req.user=decoded;
//         next();

//     }catch(e){
//         return res.status(401).json({message:"Invaild token"});

//     }
// };

// export const authorizeRole = (allowedRoles:number[])=>{
//     return(req:Request,res:Response,next:NextFunction)=>{
//         const user =(req).user;
//         if(!allowedRoles.includes(user.role)){
//             return res.status(403).json({message:"Forbidden:Access denied"});
//         }
//         next();
//     };
// };

const db=knex(config["development"]);
export const authenticate = (req: Request,res: Response,next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    console.log("req.headers.authorization",req.headers.authorization);
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    console.log( "process.env.JWT_SECRET", process.env.JWT_SECRET);

    const decoded = jwt.verify(token, secret) as { id: number };
    (req as any).user = decoded; // now allowed by TS
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authorizePermission = (permissionName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // means u are not logged in
      if (!req.user)
        return res.status(401).json({ message: "Not authenticated" });
      const userId = req.user.id;

      // check user is in database or not
      const user = await db("roleuser").where({id:userId}).first();
      if (!user) return res.status(401).json({ message: "User not found" });

      // fetch all roles assisgned to this user
      //joinTableAttributes[] dont fetch extra data from the linking table
      const roles = await db("roles")
      .join("user_roles","roles.id","=","user_roles.role_id")
      .where("user_roles.user_id",userId)
      .select("roles.id","roles.role_name");
        // .join("role_permissions","permission.id","=","role_permissions.permission_id")
        // .whereIn("role_permissions.role_id",)
      // if user has no role assigned
      if (!roles || roles.length === 0)
        return res.status(403).json({ message: "no roles assigned" });

      // fetch all permission linked to that role


      // for (const r of roles) {
      //   const perms: Permission[] = (await r.$get("Permissions", {
      //     joinTableAttributes: [],
      //   })) as any[];
      //   // checks if permission{create , delete} matches the required permission name if yes then next() allow it to access
      //   if (perms.some((p: any) => p.name === permissionName)) return next();
      // }

      const roleIds = roles.map((r)=>r.id);

      const permissions = await db("permissions")
      .join("role_permissions","permission.id","=","role_permissions.permission_id")
      .whereIn("role_permissions.role_id",roleIds)
      .select("permissions.name");

      const hasPermission = permissions.some(
        (p)=>p.name === permissionName
      );

      if(!hasPermission)
        return res.status(403).json({message:"permission denied"});
      next();
    } catch (e: any) {
      console.error(e);
      return res.status(500).json({ message: e.message });
    }
  };
};
