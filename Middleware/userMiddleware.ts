import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../Model/userModel.ts";
import { Role } from "../Model/roleModel.ts";
import { Permission } from "../Model/permission.ts";
import dotenv from "dotenv";
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

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    req.user = decoded; // now allowed by TS
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
      const user = await User.findByPk(userId);
      if (!user) return res.status(401).json({ message: "User not found" });

      // fetch all roles assisgned to this user
      //joinTableAttributes[] dont fetch extra data from the linking table
      const roles = (await user.getRoles("roles", {
        joinTableAttributes: [],
      })) as any[];
      // if user has no role assigned
      if (!roles || roles.length === 0)
        return res.status(403).json({ message: "no roles assigned" });

      // fetch all permission linked to that role
      for (const r of roles) {
        const perms: Permission[] = (await r.$get("Permissions", {
          joinTableAttributes: [],
        })) as any[];
        // checks if permission{create , delete} matches the required permission name if yes then next() allow it to access
        if (perms.some((p: any) => p.name === permissionName)) return next();
      }

      return res.status(403).json({ message: "Permission denied" });
    } catch (e: any) {
      console.error(e);
      return res.status(500).json({ message: e.message });
    }
  };
};
