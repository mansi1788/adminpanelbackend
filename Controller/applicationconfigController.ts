import type { Request, Response } from "express";
import { createauditlog } from "../Utils/auditHelper.ts";
import db from "../Config/db.ts";



export const createapplicationconfigController = async (req: Request, res: Response) => {
  try {
    const {key,value,display_order ,isActive } =req.body;

    if (
    ! key ||
      !value ||
      !display_order ||
      isActive === undefined
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await db("application_config").where({ key }).first();
    if (existingUser)
      return res.status(400).json({ message: "key already exists" });


    // Create user
    const [applicationconfig] = await db("application_config").insert(
      {
        key,
        display_order,
        value,
        isActive: Boolean(isActive),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );

    // Make sure user.id exists
    //const user_Id = Array.isArray(user) ? user[0] : user;
    if (!applicationconfig) return res.status(500).json({ message: "applicationconfig creation failed" });

  const user = req.user; // Assuming middleware sets req.user
    const firstname = user?.firstname || "Unknown";
    const lastname = user?.lastname || "User";

    await createauditlog(
      `${firstname} ${lastname}`,
      "CREATE_applicationconfig_Template",
      "User",
      applicationconfig,
      `Created applicationconfig Template. `
    );

  

    res.status(201).json({
      message: "applicationconfig template registered successfully",
    });
  } catch (e) {
    console.error("Error in applicationconfig template controller:", e);
    res.status(500).json({ message: "Server error", e });
  }
};




export const getAllapplicationconfig=async(req:Request,res:Response)=>{
    
  console.log("Inside get controllerssssssss");

  try {
    //not req.body beacause it is get request and res.body does not work on get req. because the client the send nothing it is taking data from get req.

    const {key,value,display_order,isActive } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const query = db("application_config").select("*");

    query.modify((qb) => {
      if (key) qb.where("key", "like", `%${key}%`);
      if (value) qb.where("value", "like", `%${value}%`);
      if (display_order) qb.where("display_order", "like", `%${display_order}%`);
     

      if (isActive) {
    if (isActive === "Active") qb.where("isActive", true);
    else if (isActive === "Inactive") qb.where("isActive", false);
  }
    });

    const countquery = db("application_config")
      .clone()
      .modify((qb) => {
        if (key) qb.where("key", "like", `%${key}%`);
        if (value) qb.where("value", "like", `%${value}%`);
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
      .orderBy("application_config.createdAt", "desc");

 const user = req.user; // Assuming middleware sets req.user
    const firstname = user?.firstname || "Unknown";
    const lastname = user?.lastname || "User";


    await createauditlog(  `${firstname} ${lastname}`, "GET_ALL_applicationconfig", "applicationconfig", 0, `View User List`);

    const totalPages = Math.ceil(totalUsers / limit);

    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page < totalPages ? page - 1 : null;

    console.log("applicationconfig fetched successfully: ", users.length);
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
      " Error in getallapplicationconfig----------------------------------------------------------:",
      e
    );
    res.status(500).json({ message: "Error ", e });
  }


}




export const updateapplicationconfig = async (req: Request, res: Response) => {
 
  try {
    const { key,value,display_order, isActive } = req.body;
    const id = Number(req.params.id);

    const updateData: any = { updatedAt: new Date() };

    if (key) updateData.key = key;
    if (value) updateData.value = value;
    if (display_order) updateData.display_order = display_order;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    await db("application_config").where({ id }).update(updateData);
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


export const deleteapplicationconfig = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    console.log("Attempting to delete applicationconfig with id:", id);

    const applicationconfig = await db("application_config").where({ id }).first();
    console.log("applicationconfig found:", applicationconfig);

    if (!applicationconfig) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await db("application_config").where({ id }).delete();
    console.log("Delete result:", result);

     const user = req.user; // Assuming middleware sets req.user
    const firstname = user?.firstname || "Unknown";
    const lastname = user?.lastname || "User";


    await createauditlog(
      `${firstname} ${lastname}`,
      "Delete_User",
      "applicationconfig",
      id,
      `Deleted applicationconfig Template `
    );

    return res.status(200).json({ message: "Deleted applicationconfig Template Successfully" });
  } catch (e) {
    console.error("Error deleting applicationconfig backend:", e);
    return res.status(500).json({
      message: "Error in deleting applicationconfig backend",
      error: e instanceof Error ? e.message : e,
    });
  }
};


