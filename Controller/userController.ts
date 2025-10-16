import { Role } from "../Model/roleModel.ts";
import { User } from "../Model/userModel.ts";
import type { Request,Response } from "express";
import { updateSchema } from "../Validation/userValidation.ts";
import { updateUser } from "../Service/updateService.ts";
import { sendEmail } from "../Utils/sendEmail.ts";
import jwt from "jsonwebtoken";
import { createauditlog } from "../Utils/auditHelper.ts";


export const getAllUsers = async(req:Request,res:Response)=>{
  console.log("Inside get controllerssssssss")
  try{
    const users = await User.findAll({
      include:[{model:Role,as:"roles"}],
        order: [["createdAt", "DESC"]],
      
    });

    const userId = (req as any).user?.id;
    if(!userId) return res.status(401).json({message:"Unauthorized"});

    await createauditlog(
      req.user.id,
      "GET_ALL_USERS",
      "User",
      0,
      `View User List`

    )
    
     console.log(" Users fetched successfully:", users.length);
    res.json(users);

  }catch(e){
     console.error(" Error in getAllUsers---------------------------------------------------------:", e);
    res.status(500).json({message:"Error ",e});

  }
}


export const update=async(req:Request,res:Response)=>{

  await updateSchema.validate(req.body,{abortEarly:false})

  try{
  const{username, email, phoneno, photo}=req.body;
  const id = Number(req.params.id);

  const user = await updateUser(id,{username,email,phoneno, photo})
// console.log("data",user);
  if(!user)
  {
    console.log("user not found");
  }  

  await createauditlog(
    user.id,
    "Update_User",
    "User",
    user.id,
    `Update User ${username}`


  )


  res.status(200).json({message:"updated successfully",user});
  }
  catch(e)
  {
    console.error("Error updating user:", e);
    res.status(500).json({message:"did not update",e})

  }

}


export const deleteUser = async(req:Request,res:Response)=>{
try{
  const id=Number(req.params.id);
  const {username}= req.body;

  const user = await User.findByPk(id);
  if(!user)
  {
    return res.status(404).json({message:"User not found"});
  }
  await user.destroy();

  await createauditlog(
    user.id,
    "Delete_User",
    "User",
    user.id,
    `Delete User ${username}`


  )
  res.json({message:"User deleted successsfuly"});

}catch(e)
{
  res.json({message:"Error in deleted user",e});
  console.log("Error in deleted user---------------------------------",e);
}
}

export const forgetpassword = async(req:Request,res:Response)=>{
  await updateSchema.validate(req.body,{abortEarly:false});
  try{
    const {email,username} = req.body;
    const user = await User.findOne({where:{email}});
    if(!user)
    {
      return res.json({message:"User not found"});
    }
    const userData = user?.get() as{
      id:number,username:string,password:string,email:string
    };

    const token  = jwt.sign({id:userData.id,username:userData.username,email:userData.email},process.env.JWT_SECRET!,{expiresIn:"1m"});

    const resetLink = `https://adminpanel.com/reset-password/${token}`;

    const html =`<p>Hi ${username},</p>
    <p>Click below to reset your password</p>
    <a href ="${resetLink}">${resetLink}</a>`;

    await sendEmail(email,"Reset Your Password",html);


    res.json({message:"Password reset Link send to your email"});

  }
  catch(e){
    res.status(500).json({message:"Error sending resent mail",e})
  }
}
