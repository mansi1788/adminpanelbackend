import express  from "express";
import { createEmailController, deleteEmail, getAllEmail, updateemail } from "../Controller/emailController.ts";

const email = express.Router();

email.post("/create-email", createEmailController );
email.get("/getallemail",getAllEmail);
email.put("/update-email/:id",updateemail);
email.delete("/delete-email/:id",deleteEmail);



// audit.put("/users/:id", logAction("update_user", "User"), update);

export default email;
