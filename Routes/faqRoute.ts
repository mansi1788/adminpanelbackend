import express  from "express";
import { createfaqController, deletefaq, getAllfaq, updatefaq } from "../Controller/faqController.ts";
import { authenticate } from "../Middleware/userMiddleware.ts";

const faq = express.Router();

faq.post("/create-faq",authenticate, createfaqController );
faq.get("/getallfaq",authenticate,getAllfaq);
faq.put("/update-faq/:id",authenticate,updatefaq);
faq.delete("/delete-faq/:id",authenticate,deletefaq);



// audit.put("/users/:id", logAction("update_user", "User"), update);

export default faq;
