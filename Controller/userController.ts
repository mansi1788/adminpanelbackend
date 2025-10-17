import { Role } from "../Model/roleModel.ts";
import { User } from "../Model/userModel.ts";
import type { Request,Response } from "express";
import { updateSchema } from "../Validation/userValidation.ts";
import { updateUser } from "../Service/updateService.ts";
import { sendEmail } from "../Utils/sendEmail.ts";
import jwt from "jsonwebtoken";
import { createauditlog } from "../Utils/auditHelper.ts";
import { Op } from "sequelize";


export const getAllUsers = async(req:Request,res:Response)=>{
  console.log("Inside get controllerssssssss")
  
  try{

    //not req.body beacause it is get request and res.body does not work on get req. because the client the send nothing it is taking data from get req.

    const {firstname,lastname, email,role,phoneno }=req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string)|| 10;
    const offset = (page-1) * limit;



    const whereclause:any={};
    if(firstname) whereclause.firstname={[Op.like]:`%${firstname}%`}
    if(lastname) whereclause.lastname={[Op.like]: `%${lastname}%`};
    if(email) whereclause.email={[Op.like]: `%${email}%`};
    if(role) whereclause.role = {[Op.like]: `%${role}%`};
    if(phoneno) whereclause.phoneno = {[Op.like]: `%${phoneno}%`};


    const totalUsers = await User.count({where:whereclause});


    const users = await User.findAll({
      where:Object.keys(whereclause).length ? whereclause:undefined,
      include:[{model:Role,as:"roles"}],
        order: [["createdAt", "DESC"]],
        limit,
        offset
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
    const totalPages= Math.ceil(totalUsers/limit);

    const nextPage = page < totalPages?page+1:null ;
    const prevPage = page < totalPages?page-1:null ; 
     
    
     console.log(" Users fetched successfully:", users.length);
    res.status(200).json({
      users,
      totalUsers,
      nextPage,
      prevPage,
      totalPages:Math.ceil(totalUsers/limit),
      currentPage:page,

    });

  }catch(e){
     console.error(" Error in getAllUsers---------------------------------------------------------:", e);
    res.status(500).json({message:"Error ",e});

  }
}



export const update = async(req:Request,res:Response)=>{

  await updateSchema.validate(req.body,{abortEarly:false})

  try{

  const{firstname,lastname, email, phoneno, photo}=req.body;
  const id = Number(req.params.id);

  const user = await updateUser(id,{firstname , lastname , email , phoneno, photo})
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
  await updateSchema.validate(req.body,{abortEarly:false});
  try{
    const {email,firstname,lastname} = req.body;
    const user = await User.findOne({where:{email}});
    if(!user)
    {
      return res.json({message:"User not found"});
    }
    const userData = user?.get() as{
      id:number,firstname:string,lastname:string,password:string,email:string
    };

    const token  = jwt.sign({id:userData.id,firstname:userData.firstname,lastname:userData.lastname,email:userData.email},process.env.JWT_SECRET!,{expiresIn:"1m"});

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
