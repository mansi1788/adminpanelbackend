import type { Request,Response } from "express";
import { updateSchema } from "../Validation/userValidation.ts";
import { sendEmail } from "../Utils/sendEmail.ts";
import jwt from "jsonwebtoken";
import { createauditlog } from "../Utils/auditHelper.ts";
import db from "../Config/db.ts"; 

export const getAllUsers = async(req:Request,res:Response)=>{
  console.log("Inside get controllerssssssss");

  try{
    //not req.body beacause it is get request and res.body does not work on get req. because the client the send nothing it is taking data from get req.

    const {firstname,lastname, email,role,phoneno }=req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string)|| 10;
    const offset = (page-1) * limit;

    const query = db('roleuser').select("*");

    query.modify((qb)=>{
      if(firstname) qb.where("firstname","like",`%${firstname}%`);
      if(lastname) qb.where("lastname","like",`%${lastname}`);
      if(email) qb.where("role","like",`%${email}`);
      if(role) qb.where("role","like",`%${role}%`);
      if(phoneno) qb.where("phoneno","like",`%${phoneno}`);
    })

    const countquery = db("roleuser").clone().modify((qb)=>{
      if(firstname) qb.where("firstname","like",`%${firstname}%`);
      if(lastname) qb.where("lastname","like",`%${lastname}`);
      if(email) qb.where("email","like",`%${email}%`);
      if(role) qb.where("role","like",`%${role}$`);
      if(phoneno) qb.where("phoneno","like",`%${phoneno}%`);
    })

    const totalUsersResult = await countquery.count('* as count');
    const totalUsers = totalUsersResult[0].count;

    const users = await query.clone()
    .limit(limit)
    .offset(offset)
    .orderBy("roleuser.createdAt","desc");


    const userId = (req as any).user?.id;
    if(!userId) return res.status(401).json({message:"Unauthorized"});

    await createauditlog(
      userId,
      "GET_ALL_USERS",
      "User",
      0,
      `View User List`
    )

    const totalPages= Math.ceil(totalUsers/limit);

    const nextPage = page < totalPages?page+1:null ;
    const prevPage = page < totalPages?page-1:null ; 


    console.log("Users fetched successfully: ", users.length);
    res.status(200).json({
      users,
      totalUsers,
      nextPage,
      prevPage,
      totalPages:Math.ceil(totalUsers/limit),
      currentPage:page,
    });
  }catch(e){
     console.error(" Error in getAllUsers----------------------------------------------------------:", e);
    res.status(500).json({message:"Error ",e});
  }
}


export const update = async(req:Request,res:Response)=>{

  await updateSchema.validate(req.body,{abortEarly:false})
  try{
  const{firstname,lastname, email, phoneno, photo}=req.body;
  const id = Number(req.params.id);

  const user = await db("roleuser")
  .where({id})
  .update({firstname , lastname , email , phoneno, photo})
// console.log("data",user);

  if(!user)
  {
    console.log("user not found");
  }
  await createauditlog(
    user,
    "Update_User",
    "User",
    user,
    `Update User ${firstname} ${lastname}`


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
  const {firstname, lastname}= req.body;

  const user = await db("roleuser").where({id}).first();
  if(!user)
  {
    return res.status(404).json({message:"User not found"});
  }
  await db("roleuser").where({id}).delete();

  await createauditlog(
    user.id,
    "Delete_User",
    "User",
    user.id,
    `Delete User ${firstname} ${lastname}`


  )
  res.json({message:"User deleted successsfuly"});

}catch(e)
{
  res.json({message:"Error in deleted user",e});
  console.log("Error in deleted user---------------------------------",e);
}
}

export const forgetpassword = async(req:Request,res:Response)=>{
  //await updateSchema.validate(req.body,{abortEarly:false});
  try{
    const {email,firstname,lastname} = req.body;
    const user = await db("roleuser").where({email}).first();
    if(!user)
    {
      return res.json({message:"User not found"});
    }
    const userData =user as {
      id:number;
      firstname:string;
      lastname:string;
      password:string;
      email:string
    };

    const token  = jwt.sign({id:userData.id,
      firstname:userData.firstname,
      lastname:userData.lastname,
      email:userData.email},
      process.env.JWT_SECRET!,{expiresIn:"1m"});

    const resetLink = `https://adminpanel.com/reset-password/${token}`;

    const html =`<p>Hi ${firstname}${lastname},</p>
    <p>Click below to reset your password</p>
    <a href ="${resetLink}">${resetLink}</a>`;

    await sendEmail(email,"Reset Your Password",html);


    res.json({message:"Password reset Link send to your email"});
  }
  catch(e){
    res.status(500).json({message:"Error sending resent mail",e})
  }
}