import express  from "express";
import { createRole, deleteRole , getAllRoles, updatedrole } from "../Controller/roleControllers.ts";
import { getRoleById,getRolePermission, updateRolePermissions } from "../Controller/rolePermissionController.ts";
import { authenticate } from "../Middleware/userMiddleware.ts";


const rolerouter = express.Router();


rolerouter.post("/createrole",authenticate,createRole);
rolerouter.delete("/deleterole/:id",authenticate,deleteRole );
rolerouter.get("/getallroles",authenticate,getAllRoles);
rolerouter.put("/update-role-permissions/:id",authenticate,updateRolePermissions);
rolerouter.put("/update-role/:id",authenticate,updatedrole);
rolerouter.get("/roles/:roleId/permissions",getRolePermission);
rolerouter.get("/roles/:id",getRoleById);

export default rolerouter;
