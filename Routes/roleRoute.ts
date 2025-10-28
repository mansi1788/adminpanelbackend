import express  from "express";
import { createRole, deleteRoles, getAllRoles } from "../Controller/roleControllers.ts";
import { updateRolePermissions } from "../Controller/rolePermissionController.ts";

const rolerouter = express.Router();


rolerouter.post("/createrole",createRole);
rolerouter.delete("/deleterole/:id",deleteRoles);
rolerouter.get("/getallroles",getAllRoles);
rolerouter.put("/update-role-permissions",updateRolePermissions);

export default rolerouter;
