import express  from "express";
import { logAction } from "../Middleware/auditMiddleware.ts";
import { createlog, getlog } from "../Controller/auditlogController.ts";
import { update } from "../Controller/userController.ts";

const audit = express.Router();

audit.put("/createlog/:id", logAction("update_user","User") , update );
audit.get("/getlog", getlog);


// audit.put("/users/:id", logAction("update_user", "User"), update);

export default audit;

