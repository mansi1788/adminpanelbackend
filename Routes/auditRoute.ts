import express  from "express";
import { logAction } from "../Middleware/auditMiddleware";
import { createlog } from "../Controller/auditlogController";
import { update } from "../Controller/userController";

const audit = express.Router();

audit.put("/createlog/:id", logAction("update_user","User") , update );


// audit.put("/users/:id", logAction("update_user", "User"), update);

export default audit;

