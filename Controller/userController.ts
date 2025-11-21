import type { Request, Response } from "express";
import { updateSchema } from "../Validation/userValidation.ts";
import { sendEmail } from "../Utils/sendEmail.ts";
import jwt from "jsonwebtoken";
import { createauditlog } from "../Utils/auditHelper.ts";
import db from "../Config/db.ts";
import { updateroleSchema } from "../Validation/roleValidation.ts";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const {
      firstname,
      lastname,
      email,
      roles,
      phoneno,
      isActive,
      sortBy,
      sortOrder,
    } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const query = db("roleuser").select("*");

    // Filters
    query.modify((qb) => {
      if (firstname) qb.where("firstname", firstname);
      if (lastname) qb.where("lastname", lastname);
      if (email) qb.where("email", email);
      if (roles) qb.where("roles", roles);
      if (phoneno) qb.where("phoneno", phoneno);
      if (isActive) qb.where("isActive", isActive === "Active");
    });

    // Count for pagination
    const countquery = db("roleuser")
      .clone()
      .modify((qb) => {
        if (firstname) qb.where("firstname", firstname);
        if (lastname) qb.where("lastname", lastname);
        if (email) qb.where("email", email);
        if (roles) qb.where("roles", roles);
        if (phoneno) qb.where("phoneno", phoneno);
        if (isActive) qb.where("isActive", isActive === "Active");
      });

    const totalUsersResult = await countquery.count("* as count");
    const totalUsers = totalUsersResult[0].count;

    // Sorting
    const orderColumn = sortBy ? String(sortBy) : "createdAt"; // default
    const orderDirection = sortOrder === "asc" ? "asc" : "desc"; // default desc

    const users = await query
      .clone()
      .limit(limit)
      .offset(offset)
      .orderBy(orderColumn, orderDirection);

    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    await createauditlog(
      `${user.firstname} ${user.lastname}`,
      "GET_ALL_USERS",
      "User",
      0,
      `View User List`
    );

    res.status(200).json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      nextPage: page < Math.ceil(totalUsers / limit) ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    });
  } catch (e) {
    console.error("Error in getAllUsers:", e);
    res.status(500).json({ message: "Error fetching users", e });
  }
};

export const update = async (req: Request, res: Response) => {
  await updateSchema.validate(req.body, { abortEarly: false });

  try {
    const { firstname, lastname, email, phoneno } = req.body;
    const id = Number(req.params.id);

    let isActive;
    if (req.body.isActive !== undefined) {
      isActive = String(req.body.isActive).toLowerCase() === "true";
    }

    const photo = req.file ? req.file.filename : undefined;

    const updateData: any = { updatedAt: new Date() };

    if (firstname) updateData.firstname = firstname;
    if (lastname) updateData.lastname = lastname;
    if (email) updateData.email = email;
    if (phoneno) updateData.phoneno = phoneno;
    if (photo) updateData.photo = photo;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db("roleuser").where({ id }).update(updateData);
    const oldUser = await db("roleuser").where({ id }).first();
    const first = req.body.firstname || oldUser.firstname;
    const last = req.body.lastname || oldUser.lastname;

    await createauditlog(
      `${first} ${last}`,
      "Update_User",
      "User",
      id,
      `User updated: ${[
        firstname && "name",
        email && "email",
        phoneno && "phoneno",
        photo && "photo",
        isActive !== undefined && "isActive",
      ]
        .filter(Boolean)
        .join(", ")}`
    );

    res.status(200).json({ message: "updated successfully", updateData });
  } catch (e) {
    console.error("Error updating user:", e);
    res.status(500).json({ message: "did not update", e });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    console.log("Attempting to delete user with id:", id);

    const user = await db("roleuser").where({ id }).first();
    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await db("roleuser").where({ id }).delete();
    console.log("Delete result:", result);

    await createauditlog(
      `${user.firstname} ${user.lastname}`,
      "Delete_User",
      "User",
      user.id,
      `Deleted User ${user.firstname} ${user.lastname}`
    );

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (e) {
    console.error("Error deleting user backend:", e);
    return res.status(500).json({
      message: "Error in deleting user backend",
      error: e instanceof Error ? e.message : e,
    });
  }
};

export const forgetpassword = async (req: Request, res: Response) => {
  //await updateSchema.validate(req.body,{abortEarly:false});
  try {
    const { email, firstname, lastname } = req.body;
    const user = await db("roleuser").where({ email }).first();
    if (!user) {
      return res.json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const userData = user as {
      id: number;
      firstname: string;
      lastname: string;
      password: string;
      email: string;
    };
    await db("password_resets").insert({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      used: false,
    });

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    console.log(user.firstname)
    const html = `<p>Hi ${user.firstname} ${user.lastname},</p>
    <p>Click below to reset your password</p>
    <a href ="${resetLink}">${resetLink}</a>`;

    await sendEmail(email, "Reset Your Password", html);
    res.json({ message: "Password reset Link send to your email" });
  } catch (e) {
    res.status(500).json({ message: "Error sending resent mail", e });
    console.log(e);
  }
};

export const resetpassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  try {
    // Find token in DB
    const resetRecord = await db("password_resets").where({ token }).first();

    if (!resetRecord) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Check if token expired
    if (new Date(resetRecord.expiresAt) < new Date()) {
      await db("password_resets").where({ token }).del();
      return res.status(400).json({ message: "Token expired" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await db("roleuser")
      .where({ id: resetRecord.userId })
      .update({ password: hashedPassword });

    // Delete token after use
    await db("password_resets").where({ token }).del();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
