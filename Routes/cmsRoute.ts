import express  from "express";
import { createcmsController, deletecms, getAllcms, updatecms } from "../Controller/cmsController.ts";

const cms = express.Router();

cms.post("/create-cms", createcmsController );
cms.get("/getallcms",getAllcms);
cms.put("/update-cms/:id",updatecms);
cms.delete("/delete-cms/:id",deletecms);



// audit.put("/users/:id", logAction("update_user", "User"), update);

export default cms;
