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
router.post("/api/forgetpassword", forgetpassword);
router.post("/api/resetpassword",resetpassword);
router.get("/test-token", authenticate, (req: any, res: any) => {
res.json({ message: "Token valid", user: req.user });
});


router.get("/generate-users", async (req, res) => {
  try {
    const users = [];

    for (let i = 1; i <= 1000000; i++) {
      users.push({
        firstname: `User${i}`,
        lastname: `Test${i}`,
        email: `user${i}@test.com`,
        phoneno: 9000000000 + (i % 999999999),
        roles: "User",
        isActive: true,
        photo:"1763127017977.png"
      });
    }

    // Chunk insert 1000 at a time so database doesn't choke
    const chunkSize = 1000;
    await db.batchInsert("roleuser", users, chunkSize);

    res.json({ message: "10,000 Users Inserted Successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error inserting users" });
  }
});

router.put("/api/update-role-permissions",authenticate, updateRolePermissions);

export default router;
