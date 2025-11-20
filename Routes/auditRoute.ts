import express  from "express";
import { logAction } from "../Middleware/auditMiddleware.ts";
import { createlog, getlog } from "../Controller/auditlogController.ts";
import { update } from "../Controller/userController.ts";
import { authenticate } from "../Middleware/userMiddleware.ts";

const audit = express.Router();

audit.put("/createlog/:id",authenticate, logAction("update_user","User") , update );
audit.get("/getlog",authenticate, getlog);


// audit.put("/users/:id", logAction("update_user", "User"), update);

export default audit;

