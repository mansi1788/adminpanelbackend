import express from "express";
import { logincontroller, register } from "../Controller/authController.ts";
import {
  deleteUser,
  forgetpassword,
  getAllUsers,
  update,
} from "../Controller/userController.ts";
import { authenticate } from "../Middleware/userMiddleware.ts";
import { updateRolePermissions } from "../Controller/rolePermissionController.ts";

const router = express.Router();

router.post("/api/register", register);
router.post("/api/login", logincontroller);

router.get("/api/getAllUser", authenticate, getAllUsers);
router.put("/api/update/:id", update);
router.delete("/api/deleteUser/:id", deleteUser);
router.post("/api/forgetpassword", forgetpassword);
router.get("/test-token", authenticate, (req: any, res: any) => {
  res.json({ message: "Token valid", user: req.user });
});

router.put("/api/update-role-permissions", updateRolePermissions);

export default router;
