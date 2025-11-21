import express  from "express";
import { createEmailController, deleteEmail, getAllEmail, updateemail } from "../Controller/emailController.ts";
import { authenticate } from "../Middleware/userMiddleware.ts";

const email = express.Router();

email.post("/create-email",authenticate, createEmailController );
email.get("/getallemail",authenticate,getAllEmail);
email.put("/update-email/:id",authenticate,updateemail);
email.delete("/delete-email/:id",authenticate,deleteEmail);


// audit.put("/users/:id", logAction("update_user", "User"), update);

export default email;
