import express  from "express";
import { createcmsController, deletecms, getAllcms, updatecms } from "../Controller/cmsController.ts";
import { authenticate } from "../Middleware/userMiddleware.ts";

const cms = express.Router();

cms.post("/create-cms",authenticate, createcmsController );
cms.get("/getallcms",authenticate,getAllcms);
cms.put("/update-cms/:id",authenticate,updatecms);
cms.delete("/delete-cms/:id",authenticate,deletecms);



// audit.put("/users/:id", logAction("update_user", "User"), update);

export default cms;
