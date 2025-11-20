import express  from "express";
import { authenticate } from "../Middleware/userMiddleware.ts";
import { createPermissionController } from "../Controller/PermissionController.ts";
import { getAllPermissions, rolePermissionassign } from "../Controller/rolePermissionController.ts";


const permissionrouter = express.Router();


permissionrouter.post("/createpermission",authenticate,createPermissionController);
permissionrouter.post("/assignPermissionRoute",authenticate,rolePermissionassign)
permissionrouter.get("/getallpermissions",getAllPermissions);

export default permissionrouter;
