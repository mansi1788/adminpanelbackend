import express  from "express";
import { createRole, deleteRole , getAllRoles, updatedrole } from "../Controller/roleControllers.ts";
import { updateRolePermissions } from "../Controller/rolePermissionController.ts";

const rolerouter = express.Router();


rolerouter.post("/createrole",createRole);
rolerouter.delete("/deleterole/:id",deleteRole );
rolerouter.get("/getallroles",getAllRoles);
rolerouter.put("/update-role-permissions",updateRolePermissions);
rolerouter.put("/update-role/:id",updatedrole);

export default rolerouter;
