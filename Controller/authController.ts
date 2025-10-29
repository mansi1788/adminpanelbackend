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

    const { firstname,lastname, email, password, phoneno, photo, isActive } = req.body;
    // let{roles} = req.body;
    let { roles, role } = req.body;
if (!roles && role) roles = [role];


    // Check required fields
    if (!firstname ||!lastname || !email || !password || !phoneno || !photo || isActive === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await db('roleuser').where({ email }).first();
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [user] = await db("roleuser").insert({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      phoneno,
      photo,
      isActive: Boolean(isActive),
    }
  ,["id"]);
// Make sure user.id exists
if (!user.id) return res.status(500).json({ message: "User creation failed" });

// Ensure roles exist
let roleRecords;
if (roles && roles.length > 0) {
  roleRecords = await db("roles").where({ role_name: roles });
} else {
  const defaultRole = await db("roles").where({ role_name: "user" }).first();
  if (!defaultRole) return res.status(500).json({ message: "Default role 'user' not found" });
  roleRecords = [defaultRole];
}

if (!roleRecords || roleRecords.length === 0) {
  return res.status(400).json({ message: "No valid roles found" });
}
// Assign roles safely
await user.addRoles(roleRecords.map(r => r.id)); // safer than setRoles for new users

    // Fetch user with roles
    // const userWithRoles = await db().findByPk(user.id, {
    //   include: [{ model: Role, as: "roles" }],
    // });

   // roles is in string thats why roles.join(", ") will return in array that why we have chnaged it roles in array 
   if(!Array.isArray(roles))
   {
    roles = roles ? [roles] : [];
   }
  
  
  
    await createauditlog(
      user.id,
      "CREATE_USER",
      "User",
      user.id,
      `User '${firstname} ${lastname}' registered with roles. `
    )

      const userData = user?.get() as {
      id: number,firstname: string,lastname:string,password: string,email:string,phoneno:string,photo:string,isActive:string
    };
    const token = jwt.sign(
      {
        id: userData.id,
        firstname:userData.firstname,
        lastname:userData.lastname,
        email: userData.email,
        phoneno: userData.phoneno,
        photo: userData.photo,
        isActive: userData.isActive,
        roles:roleRecords.map((r)=>r.role_name),
      },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" }
    );

    res.status(201).json({ message: "User registered successfully", token, 
    user: { ...user, roles: roleRecords.map((r) => r.role_name) },
 });
  } catch (e) {
    console.error("Error in register controller:", e);
    res.status(500).json({ message: "Server error", e });
  }
};




export const logincontroller = async (req: Request, res: Response) => {

  try {
    const { firstname, lastname, password }: { firstname: string; lastname: string; password: string } = req.body;

    const user = await db("roleuser")
      .where({ firstname, lastname })
      .select(["id", "firstname", "lastname", "password"])
      .first();

    if (!user)
      return res
        .status(404)
        .json({ message: "Name and password not found" });

    const userData = user?.get() as {
      id: number;
      firstname: string;
      lastname:string;
      password: string;
    };

    // it will tell that user mansi is linked with how many user like admin, hr, so,
    // tell the user is linkd with how mnay user - [admin, he, manager]
    //fetch roles
    // const roles = await user.$get()as any[];
    // const rolesNames = roles.map(r=>r.name);
 
    // const roles = user.roles || [];
  
    const rolesNames =
      user.roles?.map((r: { role_name: any }) => r.role_name) || [];
    const permissions: string[] = [];

    user.roles?.forEach((r: { permissions: any[] }) => {
      r.permissions?.forEach((p: { name: string }) => permissions.push(p.name));
    });

    console.log(user.roles);

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Name and password was incorrect" });

    const token = jwt.sign(
      { id: userData.id, firstname: userData.firstname, lastname:userData.lastname },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // await createauditlog({
    //   userId:user.id,
    //   action:"User logged in",
    //   entity:"User",
    //   entityId:user.id,
    //   detail: `User ${username} logged in`
    // }
    // )
    await createauditlog(
      user.id,
      "User logged in",
      "User",
      user.id,
      `User ${firstname} ${lastname} logged in`
    )
   

    return res.status(200).json({
      message: "Login successfully",
      token,
      user: {
        id: userData.id,
        firstname: userData.firstname,
        lastname:userData.lastname,
        roles: rolesNames,
      },
    });
  } catch (e) {
    res.status(500).json({ message: "Error in loging", e });
    console.log("error", e);
  }
};




// export const getAllUsers = async(req:Request,res:Response)=>{
//   console.log("Inside get controllerssssssss")
//   try{
//     const users = await User.findAll({
//       include:[{model:Role,as:"roles"}]
//     });
//      console.log("📤 Users fetched successfully:", users.length);
//     res.json(users);

//   }catch(e){
//      console.error(" Error in getAllUsers---------------------------------------------------------:", e);
//     res.status(500).json({message:"Error ",e});

//   }
// }


// export const update=async(req:Request,res:Response)=>{

//   await updateSchema.validate(req.body,{abortEarly:false})

//   try{
//   const{username, email, phoneno, photo}=req.body;
//   const id = Number(req.params.id);

//   const user = await updateUser(id,{username,email,phoneno, photo})
//  console.log("data",user);
//   if(!user)
//   {
//     console.log("user not found");
//   }
//   res.json({message:"updated successfully",user});
//   }
//   catch(e)
//   {
//     res.json({message:"did not update",e})

//   }

// }


// export const deleteUser = async(req:Request,res:Response)=>{
// try{
//   const id=Number(req.params.id);

//   const user = await User.findByPk(id);
//   if(!user)
//   {
//     return res.status(404).json({message:"User not found"});
//   }
//   await user.destroy();
//   res.json({message:"User deleted successsfuly"});

// }catch(e)
// {
//   res.json({message:"Error in deleted user",e});
//   console.log("Error in deleted user---------------------------------",e);
// }
// }

// export const forgetpassword = async(req:Request,res:Response)=>{
//   await updateSchema.validate(req.body,{abortEarly:false});
//   try{
//     const {email,username} = req.body;
//     const user = await User.findOne({where:{email}});
//     if(!user)
//     {
//       return res.json({message:"User not found"});
//     }
//     const userData = user?.get() as{
//       id:number,username:string,password:string,email:string
//     };

//     // }
//     //  const userData = user?.get() as { 
//     //   id: number, username: string, password: string,phoneno:number, email:string,photo:string,isActive:string
//     // };

    

//     const token  = jwt.sign({id:userData.id,username:userData.username,email:userData.email},process.env.SECRET_KEY!,{expiresIn:"1m"});

//     const resetLink = `https://adminpanel.com/reset-password/${token}`;

//     const html =`<p>Hi ${username},</p>
//     <p>Click below to reset your password</p>
//     <a href ="${resetLink}">${resetLink}</a>`;

//     await sendEmail(email,"Reset Your Password",html);


//     res.json({message:"Password reset Link send to your email"});

//   }
//   catch(e){
//     res.status(500).json({message:"Error sending resent mail",e})
//   }
// }