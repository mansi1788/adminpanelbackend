import express from "express";
import {logincontroller,register} from "../Controller/authController.ts";
import { deleteUser, forgetpassword, getAllUsers, update } from "../Controller/userController.ts";
import { logAction } from "../Middleware/auditMiddleware.ts";

const router = express.Router();

// router.get("/profile",authenticate,async(req,res)=>{
//     res.json({message:"Your profile",user:req.user});
// });

// router.post("/admin/create-user",authenticate,authorizePermission("create_user"),(req,res)=>{
//     res.json({message:"You are allowed to create users"});
// });

// router.get("/api/getAllUser",getAllUsers);

router.post("/api/register", register);
router.post("/api/login", logincontroller);
router.get("/api/getAllUser", getAllUsers);
router.put("/api/update/:id",logAction, update);
router.delete("/api/delete/:id", deleteUser);
router.post("/api/forgetpassword", forgetpassword);

export default router;
