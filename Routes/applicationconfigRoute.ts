import express  from "express";
import { createapplicationconfigController, deleteapplicationconfig, getAllapplicationconfig, updateapplicationconfig } from "../Controller/applicationconfigController.ts";

const applicationconfig = express.Router();

applicationconfig.post("/create-applicationconfig", createapplicationconfigController );
applicationconfig.get("/getallapplicationconfig",getAllapplicationconfig);
applicationconfig.put("/update-applicationconfig/:id",updateapplicationconfig);
applicationconfig.delete("/delete-applicationconfig/:id",deleteapplicationconfig);



// audit.put("/users/:id", logAction("update_user", "User"), update);

export default applicationconfig;
