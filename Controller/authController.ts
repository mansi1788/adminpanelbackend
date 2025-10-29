import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { updateSchema } from "../Validation/userValidation.ts";
import { createauditlog } from "../Utils/auditHelper.ts";
import db from "../Config/db.ts";

export const register = async (req: Request, res: Response) => {
  try {
    // Validate input
    await updateSchema.validate(req.body, { abortEarly: false });

    const { firstname, lastname, email, password, phoneno, photo, isActive } =
      req.body;
    // let{roles} = req.body;
    let { roles, role } = req.body;
    if (!roles && role) roles = [role];

    // Check required fields
    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !phoneno ||
      !photo ||
      isActive === undefined
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await db("roleuser").where({ email }).first();
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [user] = await db("roleuser").insert(
      {
        firstname,
        lastname,
        email,
        password: hashedPassword,
        phoneno,
        photo,
        isActive: Boolean(isActive),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ["id"]
    );
    console.log([user]);
    // Make sure user.id exists
    //const user_Id = Array.isArray(user) ? user[0] : user;
    if (!user)
      return res.status(500).json({ message: "User creation failed" });

    // Ensure roles exist
    let roleRecords;
    if (roles && roles.length > 0) {
      roleRecords = await db("role").where({ role_name: roles });
    } else {
      const defaultRole = await db("role")
        .where({ role_name: "user" })
        .first();
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
    await db('user_roles').insert(
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
    }

    console.log(user.id)
    await createauditlog(
      user,
      "CREATE_USER",
      "User",
      user,
      `User '${firstname} ${lastname}' registered with roles. `
    );

    const userData = {
      id: user,
      firstname,
      lastname,
      password,
      email,
      phoneno,
      photo,
      isActive
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

    res
      .status(201)
      .json({
        message: "User registered successfully",
        token,
        user: { ...user, roles: roleRecords.map((r) => r.role_name) },
      });
  } catch (e) {
    console.error("Error in register controller:", e);
    res.status(500).json({ message: "Server error", e });
  }
};

export const logincontroller = async (req: Request, res: Response) => {
  try {
    const {
      firstname,
      lastname,
      password,
    }: { firstname: string; lastname: string; password: string } = req.body;

     const user = await db("roleuser as u")
      .leftJoin("user_roles as ur", "u.id", "ur.userId")
      .leftJoin("role as r", "ur.roleId", "r.id")
      .where({ "u.firstname": firstname, "u.lastname": lastname })
      .select(
        "u.id",
        "u.firstname",
        "u.lastname",
        "u.password",
        db.raw("JSON_ARRAYAGG(JSON_QUOTE(r.role_name)) as roles")

      )
      .groupBy("u.id")
      .first();


    if (!user)
      return res.status(404).json({ message: "Name and not found" });

    const userData =  {
      id:user.id,
      firstname,
      lastname,
      password,
    };

    const rolesNames =
      user.roles?.map((r: { role_name: any }) => r.role_name) || [];
    const permissions: string[] = [];

    user.roles?.forEach((r: { permissions: any[] }) => {
      r.permissions?.forEach((p: { name: string }) => permissions.push(p.name));
    });


    console.log("roleName",rolesNames)
    console.log(user.roles);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("password111111111111111111111111111111111111111111111111111111",password);
    console.log("userData",userData.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "password was incorrect" });
        console.log("isMatch------------------------------------------------------",isMatch)

    const token = jwt.sign(
      {
        id: userData.id,
        firstname: userData.firstname,
        lastname: userData.lastname,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    await createauditlog(
      user.id,
      "User logged in",
      "User",
      user.id,
      `User ${firstname} ${lastname} logged in`
    );

    return res.status(200).json({
      message: "Login successfully",
      token,
      user: {
        id: userData.id,
        firstname: userData.firstname,
        lastname: userData.lastname,
        roles: JSON.parse(user.roles || "[]"),
      },
    });
  } catch (e) {
    res.status(500).json({ message: "Error in loging", e });
    console.log("error", e);
  }
};