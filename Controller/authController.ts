import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  loginSchema,
  registerSchema,
  updateSchema,
} from "../Validation/userValidation.ts";
import { createauditlog } from "../Utils/auditHelper.ts";
import db from "../Config/db.ts";

export const register = async (req: Request, res: Response) => {
  try {
    await registerSchema.validate(req.body, { abortEarly: false });
    // Validate input
    console.log("Incoming form-data", req.body);
    console.log("uploaded file", req.file);

    if (req.body.isActive === 1) req.body.isActive = true;
    else if (req.body.isActive === 0) req.body.isActive = false;

    await registerSchema.validate(req.body, { abortEarly: false });

    const { firstname, lastname, email, phoneno, isActive } = req.body;

    // let{roles} = req.body;
    let { roles, role } = req.body;
    if (!roles && role) roles = [role];

    let photo: string | null = null;
    if (req.file) {
      photo = `/upload/${req.file.filename}`;
    } else {
      return res.status(400).json({ message: "Photo is required" });
    }
    console.log("File saved at:", req.file?.path);

    // Check required fields
    if (
      !firstname ||
      !lastname ||
      !email ||
      !phoneno ||
      isActive === undefined
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await db("roleuser").where({ email }).first();
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });


    // Create user
    const [user] = await db("roleuser").insert(
      {
        firstname,
        lastname,
        email,
        phoneno,
        photo,
        roles: roles || "user",
        isActive: Boolean(isActive),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ["id"]
    );
    console.log([user]);
    // Make sure user.id exists
    //const user_Id = Array.isArray(user) ? user[0] : user;
    if (!user) return res.status(500).json({ message: "User creation failed" });

    // Ensure roles exist
    let roleRecords;
    if (roles && roles.length > 0) {
      roleRecords = await db("role").where({ role_name: roles });
    } else {
      const defaultRole = await db("role").where({ role_name: "user" }).first();
      if (!defaultRole)
        return res
          .status(500)
          .json({ message: "Default role 'user' not found" });
      roleRecords = [defaultRole];
    }

    if (!roleRecords || roleRecords.length === 0) {
      return res.status(400).json({ message: "No valid roles found" });
    }

    // Assign roles by inserting into junction table
    await db("user_roles").insert(
      roleRecords.map((role) => ({
        userId: user,
        roleId: role.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    // Fetch user with roles
    // const userWithRoles = await db().findByPk(user.id, {
    //   include: [{ model: Role, as: "roles" }],
    // });
    // roles is in string thats why roles.join(", ") will return in array that why we have chnaged it roles in array
    if (!Array.isArray(roles)) {
      roles = roles ? [roles] : [];

      // roles = roles.join(","); //this convert the array to comma-seprated string
    }

    console.log(user.id);

    await createauditlog(
      `${firstname} ${lastname}`,
      "CREATE_USER",
      "User",
      user,
      `User '${firstname} ${lastname}' registered. `
    );

    const userData = {
      id: user,
      firstname,
      lastname,
      email,
      phoneno,
      photo,
      isActive,
    };
    const token = jwt.sign(
      {
        id: userData.id,
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        phoneno: userData.phoneno,
        photo: userData.photo,
        isActive: userData.isActive,
        roles: roleRecords.map((r) => r.role_name),
      },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { ...user, roles: roleRecords.map((r) => r.role_name) },
    });
  } catch (e: any) {
    console.error("Error in register controller:", e);
    res.status(500).json({ message: "Server error", e });
    const errors: { [key: string]: string } = {};
    if (e.inner) {
      e.inner.forEach((e: any) => {
        if (e.path) errors[e.path] = e.message;
      });
    }
    res.status(400).json({ errors });
  }
};




export const logincontroller = async (req: Request, res: Response) => {
  try {
    await loginSchema.validate(req.body, { abortEarly: false });

    const { email, password}: { email: string; password: string; } = req.body;

    const user = await db("roleuser as u")
      .leftJoin("user_roles as ur", "u.id", "ur.userId")
      .leftJoin("role as r", "ur.roleId", "r.id")
      .where({ "u.email": email })
      .select(
        "u.id",
        "u.email",
        "u.password",
        "u.firstname",
         "u.lastname",
          "u.email",
          "u.phoneno",
          "u.photo",
          "u.isActive",
        // Remove JSON_QUOTE, just aggregate role_name
        db.raw("COALESCE(JSON_ARRAYAGG(r.role_name), JSON_ARRAY()) as roles")
      )
      .groupBy("u.id")
      .first();

    if (!user) return res.status(404).json({ message: "Name and Email not found" });

   let parsedRoles: string[] = [];

if (Array.isArray(user.roles)) {
  parsedRoles = user.roles.filter(r  => r && r.trim() !== "");
} else if (typeof user.roles === "string") {
  try {
    const parsed = JSON.parse(user.roles);
    if (Array.isArray(parsed)) parsedRoles = parsed.filter(r => r && r.trim() !== "");
  } catch (err) {
    console.error("Error parsing roles JSON:", user.roles, err);
  }
}

console.log("parsedRoles after processing:", parsedRoles);


    const rolesNames = parsedRoles;

    // const userData = {
    //   id: user.id,
    //   email,
    //   password,
    //   firstname,
    //   lastname,
    // };

    // const rolesNames =
    //   user.roles?.map((r: { role_name: any }) => r.role_name) || [];
    // const permissions: string[] = [];

    // user.roles?.forEach((r: { permissions: any[] }) => {
    //   r.permissions?.forEach((p: { name: string }) => permissions.push(p.name));
    // });

    console.log("roleName", rolesNames);
    console.log(user.roles);

    const isMatch = await bcrypt.compare(
      String(password),
      String(user.password)
    );
    console.log(
      "password111111111111111111111111111111111111111111111111111111",
      password
    );
    console.log("userData", user.password);
    if (!isMatch)
      return res.status(400).json({ message: "password was incorrect" });
    console.log(
      "isMatch------------------------------------------------------",
      isMatch
    );
    console.log("user.roles raw from DB:", user.roles);
console.log("parsedRoles after processing:", parsedRoles);


    const token = jwt.sign(
      {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" }
    );
   
    await createauditlog(
      `${user.firstname} ${user.lastname}`,
      "User logged in",
      "User",
      user.id,
      `User ${user.firstname} ${user.lastname} logged in`
    );

    return res.status(200).json({
      message: "Login successfully",
      token,
      user:{
      id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    phoneno: user.phoneno,
    photo: user.photo,
    isActive: user.isActive,
    roles: parsedRoles, 
      }
    });
  } catch (e) {
    res.status(500).json({ message: "Error in loging", e });
    console.log("error", e);
  }
};
