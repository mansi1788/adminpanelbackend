import type { Request, Response } from "express";
import { createauditlog } from "../Utils/auditHelper.ts";
import db from "../Config/db.ts";



export const createEmailController = async (req: Request, res: Response) => {
  try {
    const {key,title,subject,body,isActive } =req.body;

    if (
    ! key ||
      !title ||
      !subject ||
      !body||
      isActive === undefined
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await db("email_template").where({ key }).first();
    if (existingUser)
      return res.status(400).json({ message: "key already exists" });


    // Create user
    const [email] = await db("email_template").insert(
      {
        key,
        subject,
        title,
        body,
        isActive: Boolean(isActive),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );
    
    // Make sure user.id exists
    //const user_Id = Array.isArray(user) ? user[0] : user;
    if (!email) return res.status(500).json({ message: "email creation failed" });

  const user = (req as any).user; // Assuming middleware sets req.user
    const firstname = user?.firstname || "Unknown";
    const lastname = user?.lastname || "User";
    console.log("firstname",firstname);
      console.log("lastname",lastname);

    await createauditlog(
      
      `${firstname} ${lastname}`,
      "CREATE_Email_Template",
      "User",
      email,
      `Created Email Template. `
    );

  

    res.status(201).json({
      message: "email template registered successfully",
    });
  } catch (e) {
    console.error("Error in email template controller:", e);
    res.status(500).json({ message: "Server error", e });
  }
};




export const getAllEmail=async(req:Request,res:Response)=>{
    
  console.log("Inside get controllerssssssss");
  try {
    //not req.body beacause it is get request and res.body does not work on get req.
    //  because the client the send nothing it is taking data from get req.

    const {key,title,subject,body,isActive } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const query = db("email_template").select("*");

    query.modify((qb) => {
      if (key) qb.where("key", "like", `%${key}%`);
      if (title) qb.where("title", "like", `%${title}%`);
      if (subject) qb.where("subject", "like", `%${subject}%`);
      if(body) qb.where("body","like",`%${body}%`);
     
      if (isActive) {
    if (isActive === "Active") qb.where("isActive", true);
    else if (isActive === "Inactive") qb.where("isActive", false);
  }
    });

    const countquery = db("email_template")
      .clone()
      .modify((qb) => {
        if (key) qb.where("key", "like", `%${key}%`);
        if (title) qb.where("title", "like", `%${title}%`);
        if (subject) qb.where("subject", "like", `%${subject}%`);
        if(body) qb.where("body","like",`%${body}%`);
        if (isActive) {
  if (isActive === "Active") qb.where("isActive", true);
  else if (isActive === "Inactive") qb.where("isActive", false);
}

      });

    const totalUsersResult = await countquery.count("* as count");
    const totalUsers = totalUsersResult[0].count;

    const users = await query
      .clone()
      .limit(limit)
      .offset(offset)
      .orderBy("email_template.createdAt", "desc");

 const user =( req as any).user; // Assuming middleware sets req.user
  console.log("user",user)

    const firstname = user?.firstname || "Unknown";
    const lastname = user?.lastname || "User";


    await createauditlog(  `${firstname} ${lastname}`, "GET_ALL_EMAIL", "Email", 0, `View User List`);

    const totalPages = Math.ceil(totalUsers / limit);

    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page < totalPages ? page - 1 : null;

    console.log("Email fetched successfully: ", users.length);
    res.status(200).json({
      users,
      totalUsers,
      nextPage,
      prevPage,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (e) {
    console.error(
      " Error in getallemail----------------------------------------------------------:",
      e
    );
    res.status(500).json({ message: "Error ", e });
  }


}




export const updateemail = async (req: Request, res: Response) => {
 
  try {
    const { key,title,subject,body, isActive } = req.body;
    const id = Number(req.params.id);

    const updateData: any = { updatedAt: new Date() };

    if (key) updateData.key = key;
    if (title) updateData.title = title;
    if (subject) updateData.subject = subject;
    if(body) updateData.body = body;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    await db("email_template").where({ id }).update(updateData);
    // console.log("data",user);

 const user =( req as any).user; // Assuming middleware sets req.user
    const firstname = user?.firstname || "Unknown";
    const lastname = user?.lastname || "User";

    await createauditlog(
       `${firstname} ${lastname}`,
      "Update_User",
      "User",
      id,
      `User updated`,
      
    );
    res.status(200).json({ message: "updated successfully", updateData });
  } catch (e) {
    console.error("Error updating user:", e);
    res.status(500).json({ message: "did not update", e });
  }
};


export const deleteEmail = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    console.log("Attempting to delete email with id:", id);

    const email = await db("email_template").where({ id }).first();
    console.log("email found:", email);

    if (!email) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await db("email_template").where({ id }).delete();
    console.log("Delete result:", result);

     const user = (req as any).user; // Assuming middleware sets req.user
    const firstname = user?.firstname || "Unknown";
    const lastname = user?.lastname || "User";


    await createauditlog(
      `${firstname} ${lastname}`,
      "Delete_User",
      "Email",
      id,
      `Deleted Email Template `
    );

    return res.status(200).json({ message: "Email Template deleted successsfully" });
  } catch (e) {
    console.error("Error deleting email backend:", e);
    return res.status(500).json({
      message: "Error in deleting email backend",
      error: e instanceof Error ? e.message : e,
    });
  }
};


