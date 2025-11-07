import express  from "express";
import { createfaqController, deletefaq, getAllfaq, updatefaq } from "../Controller/faqController.ts";

const faq = express.Router();

faq.post("/create-faq", createfaqController );
faq.get("/getallfaq",getAllfaq);
faq.put("/update-faq/:id",updatefaq);
faq.delete("/delete-faq/:id",deletefaq);



// audit.put("/users/:id", logAction("update_user", "User"), update);

export default faq;
