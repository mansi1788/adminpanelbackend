import express  from "express";
import { createapplicationconfigController, deleteapplicationconfig, getAllapplicationconfig, updateapplicationconfig } from "../Controller/applicationconfigController.ts";
import { authenticate } from "../Middleware/userMiddleware.ts";

const applicationconfig = express.Router();

applicationconfig.post("/create-applicationconfig",authenticate, createapplicationconfigController );
applicationconfig.get("/getallapplicationconfig",authenticate,getAllapplicationconfig);
applicationconfig.put("/update-applicationconfig/:id",authenticate,updateapplicationconfig);
applicationconfig.delete("/delete-applicationconfig/:id",authenticate,deleteapplicationconfig);



// audit.put("/users/:id", logAction("update_user", "User"), update);

export default applicationconfig;
