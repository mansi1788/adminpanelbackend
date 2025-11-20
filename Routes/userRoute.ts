import express from "express";
import { logincontroller, register } from "../Controller/authController.ts";
import {
  deleteUser,
  forgetpassword,
  getAllUsers,
  resetpassword,
  update,
} from "../Controller/userController.ts";
import { authenticate } from "../Middleware/userMiddleware.ts";
import { updateRolePermissions } from "../Controller/rolePermissionController.ts";
import { upload } from "../Middleware/uploadMiddleware.ts";
import db from "../Config/db.ts";

const router = express.Router();

router.post("/api/register", upload.single("photo"), register);
router.post("/api/login", logincontroller);
router.get("/user/:id",authenticate, async (req, res) => {
  try {
    const user = await db("roleuser").where({ id: req.params.id }).first();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

router.get("/api/getAllUser", authenticate, getAllUsers);
router.put("/api/update/:id",authenticate,upload.single("photo"), update);
router.delete("/api/deleteUser/:id",authenticate, deleteUser);
router.post("/api/forgetpassword",authenticate, forgetpassword);
router.post("/api/resetpassword",authenticate,resetpassword);
router.get("/test-token", authenticate, (req: any, res: any) => {
res.json({ message: "Token valid", user: req.user });
});

router.put("/api/update-role-permissions",authenticate, updateRolePermissions);

export default router;
