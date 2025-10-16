import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../Model/userModel.ts";
import { Role } from "../Model/roleModel.ts";
import { UserRole } from "../Model/userRole.ts";
import jwt from "jsonwebtoken";
import { updateUser } from "../Service/updateService.ts";
import { updateSchema } from "../Validation/userValidation.ts";
import { sendEmail } from "../Utils/sendEmail.ts";


// export const register = async (req: Request, res: Response) => {
//   try {

//     await updateSchema.validate(req.body,{abortEarly:false});
//     // user or client is passing asking
//     const { username, email, password, roles ,phoneno,photo,isActive } = req.body;
//  //console.log("phoneno-----------------------",phoneno);
//     // All fields are required

//     if (!username || !email || !password|| !phoneno|| !photo || isActive === undefined)
//       return res.status(400).json({ message: "All fields are required" });


//     //USER ALREADY EXIST
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exist" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

// //create user
//     const user = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//      phoneno ,
//      photo,
//      isActive:Boolean(isActive)
     
//     });
//    // console.log("req.body:", req.body);


// // console.log("photo:", req.body.photo);
//    // console.log("phoneno--------------------------------------------------",user);


//   //  const userId: any = user.id; 
//   //   const userWithRoles = await User.findByPk(userId, {
//   //     include: [{ model: Role, as: "roles" }],
//   //   });


//   //   if (roles.length) {
//   //     const foundRoles = await Role.findAll({
//   //       where: { role_name: roles },
//   //     });


//   //     await Promise.all(
//   //       foundRoles.map((r) =>
//   //         UserRole.create({ userId: user.id, roleId: r.id })
//   //       )
//   //     );
//   //   } 
//   //   else 
//   //   {

//   //     const defaultRoles = await Role.findOne({ where: { role_name: "user" } });
//   //     if (defaultRoles && defaultRoles.id) {
//   //       await UserRole.create({ userId: user.id, roleId: defaultRoles.id });
//   //       console.log("roleId",defaultRoles.id );
       
//   //     }
//       // else{

//         let roleRecords;
//         if(roles && roles.length >0)
//         {
//           roleRecords = await Role.findAll({where:{role_name:roles}});

//         }else{
//           const defaultRole = await Role.findOne({where:{role_name:"user"}})
//           if(!defaultRole) return res.status(500).json({message:"default role user not found"});
//           roleRecords = [defaultRole];
//         }

//         await user.setRoles(roleRecords.map(r=>r.id));

//         const userWithRoles = await User.findAndCountAll(user.id,{
//           include:[{model:Role, as:"roles"}],
//         });



//           return res.status(500).json({ message: "Default role 'user' not found" });
//      // }
       
    
   



//     const userData = user?.get() as { 
//       id: number, username: string, password: string,phoneno:number, email:string,photo:string,isActive:string
//     };

    
//     const token = jwt.sign(
//       { id: userData.id, username: userData.username,email: userData.email,
//         phoneno: userData.phoneno,
//         photo: userData.photo,
//         isActive: userData.isActive,
//         roles: []  },process.env.SECRET_KEY!,{ expiresIn: "8h" }
//     );
//  console.log("phoneno--------------------------------------------------",user);
//      //console.log("phoneno-----------------------",phoneno);
    
//     res.status(201).json({ message: "User registered successfully",token,user: userWithRoles});
//   } catch (e) {
//     res.status(500).json({ message: "Server error", e });
//     console.log(e);
//   }
// };




export const register = async (req: Request, res: Response) => {
  try {
    // Validate input
    await updateSchema.validate(req.body, { abortEarly: false });

    const { username, email, password, roles, phoneno, photo, isActive } = req.body;

    // Check required fields
    if (!username || !email || !password || !phoneno || !photo || isActive === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      phoneno,
      photo,
      isActive: Boolean(isActive),
    });
// Make sure user.id exists
if (!user.id) return res.status(500).json({ message: "User creation failed" });

// Ensure roles exist
let roleRecords;
if (roles && roles.length > 0) {
  roleRecords = await Role.findAll({ where: { role_name: roles } });
} else {
  const defaultRole = await Role.findOne({ where: { role_name: "user" } });
  if (!defaultRole) return res.status(500).json({ message: "Default role 'user' not found" });
  roleRecords = [defaultRole];
}

if (!roleRecords || roleRecords.length === 0) {
  return res.status(400).json({ message: "No valid roles found" });
}

// Assign roles safely
await user.addRoles(roleRecords.map(r => r.id)); // safer than setRoles for new users

    // Fetch user with roles
    const userWithRoles = await User.findByPk(user.id, {
      include: [{ model: Role, as: "roles" }],
    });

      const userData = user?.get() as {
      id: number,username: string,password: string,email:string,phoneno:string,photo:string,isActive:string
    };
    const token = jwt.sign(
      {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        phoneno: userData.phoneno,
        photo: userData.photo,
        isActive: userData.isActive,
        roles: userWithRoles?.roles.map(r => r.role_name) || [],
      },
      process.env.SECRET_KEY!,
      { expiresIn: "8h" }
    );

    res.status(201).json({ message: "User registered successfully", token, user: userWithRoles });
  } catch (e) {
    console.error("Error in register controller:", e);
    res.status(500).json({ message: "Server error", e });
  }
};



export const logincontroller = async (req: Request, res: Response) => {

  await updateSchema.validate(req.body,{abortEarly:false})

  try {

    const { username, password } = req.body;

    const user = await User.findOne({
      where: { username },
      attributes: ["id", "username", "password"],
      include: [
        {
          model: Role,
          as: "roles",
        },
      ],
    });
    if (!user)
      return res
        .status(404)
        .json({ message: "Username and password not found" });

    const userData = user?.get() as {
      id: number;
      username: string;
      password: string;
    };

    // it will tell that user mansi is linkd with how mnay user like admin, hr, so,
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
        .json({ message: "Username and password was incorrect" });

    const token = jwt.sign(
      { id: userData.id, username: userData.username },
      process.env.SECRET_KEY!,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successfully",
      token,
      user: {
        id: userData.id,
        username: userData.username,
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