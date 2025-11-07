import type { Request, Response } from "express";
import { createauditlog } from "../Utils/auditHelper.ts";
import db from "../Config/db.ts";



export const createfaqController = async (req: Request, res: Response) => {
  try {
    const {question,display_order ,isActive } =req.body;

    if (
    ! question ||
      !display_order ||
     
      isActive === undefined
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await db("faq").where({ question }).first();
    if (existingUser)
      return res.status(400).json({ message: "question already exists" });


    // Create user
    const [faq] = await db("faq").insert(
      {
        question,
        display_order,
        isActive: Boolean(isActive),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );

    // Make sure user.id exists
    //const user_Id = Array.isArray(user) ? user[0] : user;
    if (!faq) return res.status(500).json({ message: "faq creation failed" });

  const user = req.user; // Assuming middleware sets req.user
    const firstname = user?.firstname || "Unknown";
    const lastname = user?.lastname || "User";

    await createauditlog(
      `${firstname} ${lastname}`,
      "CREATE_faq_Template",
      "User",
      faq,
      `Created faq Template. `
    );

  

    res.status(201).json({
      message: "faq template registered successfully",
    });
  } catch (e) {
    console.error("Error in faq template controller:", e);
    res.status(500).json({ message: "Server error", e });
  }
};




export const getAllfaq=async(req:Request,res:Response)=>{
    
  console.log("Inside get controllerssssssss");

  try {
    //not req.body beacause it is get request and res.body does not work on get req. because the client the send nothing it is taking data from get req.

    const {question,display_order,isActive } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const query = db("faq").select("*");

    query.modify((qb) => {
      if (question) qb.where("question", "like", `%${question}%`);
      if (display_order) qb.where("display_order", "like", `%${display_order}%`);
   
     

      if (isActive) {
    if (isActive === "Active") qb.where("isActive", true);
    else if (isActive === "Inactive") qb.where("isActive", false);
  }
    });

    const countquery = db("faq")
      .clone()
      .modify((qb) => {
        if (question) qb.where("question", "like", `%${question}%`);
        if (display_order) qb.where("display_order", "like", `%${display_order}%`);
       
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
      .orderBy("faq.createdAt", "desc");

 const user = req.user; // Assuming middleware sets req.user
    const firstname = user?.firstname || "Unknown";
    const lastname = user?.lastname || "User";


    await createauditlog(  `${firstname} ${lastname}`, "GET_ALL_faq", "faq", 0, `View User List`);

    const totalPages = Math.ceil(totalUsers / limit);

    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page < totalPages ? page - 1 : null;

    console.log("faq fetched successfully: ", users.length);
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
      " Error in getallfaq----------------------------------------------------------:",
      e
    );
    res.status(500).json({ message: "Error ", e });
  }


}




export const updatefaq = async (req: Request, res: Response) => {
 
  try {
    const { question,display_order, isActive } = req.body;
    const id = Number(req.params.id);

    const updateData: any = { updatedAt: new Date() };

    if (question) updateData.question = question;
    if (display_order) updateData.display_order = display_order;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    await db("faq").where({ id }).update(updateData);
    // console.log("data",user);

 const user = req.user; // Assuming middleware sets req.user
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


export const deletefaq = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    console.log("Attempting to delete faq with id:", id);

    const faq = await db("faq").where({ id }).first();
    console.log("faq found:", faq);

    if (!faq) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await db("faq").where({ id }).delete();
    console.log("Delete result:", result);

     const user = req.user; // Assuming middleware sets req.user
    const firstname = user?.firstname || "Unknown";
    const lastname = user?.lastname || "User";


    await createauditlog(
      `${firstname} ${lastname}`,
      "Delete_User",
      "faq",
      id,
      `Deleted faq Template `
    );

    return res.status(200).json({ message: "Deleted faq Template Successfully" });
  } catch (e) {
    console.error("Error deleting faq backend:", e);
    return res.status(500).json({
      message: "Error in deleting faq backend",
      error: e instanceof Error ? e.message : e,
    });
  }
};


