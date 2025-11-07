import type { Request,Response } from "express";
import db from "../Config/db.ts";
import { createauditlog } from "../Utils/auditHelper.ts";
import { updateroleSchema } from "../Validation/roleValidation.ts";

export const createRole = async(req:Request,res:Response)=>{
    try{
        const{role_name,description} = req.body;

        if(!role_name)
        {
            return res.status(400).json({message:"Role name is required"});
        }

        const existing = await db('role').where({role_name}).first();
        let roles,created=false;
        if(existing)
        {
            roles=existing;
        }
        else{
            const[insertedId] = await db('role').insert({
                role_name,
                description:description||`${role_name}role`,

            })
            roles = await db('role').where({id:insertedId}).first();
            created=true;
        }

        if(!created)
        {
            return res.status(400).json({message:"Role already exists"});

        }
        return res.status(201).json({message:"Role created Successfully",roles});
    }catch(e)
    {
        console.log("Error creating role",e)
        return res.status(500).json({message:"Server error",e});
    }

};


export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const { role_name, isActive,description } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Main query with filters
    const query = db("role").select("*");
    query.modify((qb) => {
      if (role_name) qb.where("role_name", "like", `%${role_name}%`);
       if (description) qb.where("description", "like", `%${description}%`);
      if (isActive) {
        if (isActive === "Active") qb.where("isActive", true);
        else if (isActive === "Inactive") qb.where("isActive", false);
      }
    });

    // Count query for pagination
    const countQuery = db("role")
      .clone()
      .modify((qb) => {
        if (role_name) qb.where("role_name", "like", `%${role_name}%`);
          if (description) qb.where("description", "like", `%${description}%`);
        if (isActive) {
          if (isActive === "Active") qb.where("isActive", true);
          else if (isActive === "Inactive") qb.where("isActive", false);
        }
      });

    const totalRolesResult = await countQuery.count("* as count");
    const totalRoles = totalRolesResult[0].count;

    const roles = await query
      .limit(limit)
      .offset(offset)
      .orderBy("createdAt", "desc");

    const totalPages = Math.ceil(totalRoles / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    return res.status(200).json({
      roles,
      totalRoles,
      nextPage,
      prevPage,
      totalPages,
      currentPage: page,
    });
  } catch (e) {
    console.error("Error fetching roles:", e);
    return res.status(500).json({ message: "Server error", e });
  }
};


// export const deleteRoles = async(req:Request,res:Response)=>{
//     try{
//         const {id} = req.params;
//         const deleted = await db('role').where(id).del();

//         if(deleted === 0 )
//         {
//             return res.status(404).json({message:"Role not found"})
//         }
//         await createauditlog(
//       .id,
//       "Delete_User",
//       "User",
//       user.id,
//       `Deleted User ${user.firstname} ${user.lastname}`
//     );
//         return res.status(200).json({message:"deleted successfully"})

//     }catch(e)
//     {
//         console.log("Error deleting roles",e)
//         return res.status(500).json({message:"Server error",e})

//     }
     
// }

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    console.log("Attempting to delete role with id:", id);

    const role = await db("role").where({ id }).first();
    console.log("User found:", role);

    if (!role) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await db("role").where({ id }).delete();
    console.log("Delete result:", result);

      const user = req.user; // Assuming middleware sets req.user
    const firstname = user?.firstname || "Unknown";
    const lastname = user?.lastname || "User";

    await createauditlog(
      `${firstname} ${lastname}`,
      "Delete_User",
      "User",
      role.id,
      `Deleted User ${role.firstname} ${role.lastname}`
    );

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (e) {
    console.error("Error deleting user backend:", e);
    return res.status(500).json({
      message: "Error in deleting user backend",
      error: e instanceof Error ? e.message : e,
    });
  }
};



export const updatedrole = async (req: Request, res: Response) => {
  await updateroleSchema.validate(req.body, { abortEarly: false });
  try {
    const {role_name,description, isActive } = req.body;
    const id = Number(req.params.id);

    const updateData: any = { updatedAt: new Date() };

    
    if (role_name) updateData.role_name = role_name;
    if (description) updateData.description = description;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    await db("role").where({ id }).update(updateData);
    
    // console.log("data",user);
const user = req.user; // Assuming middleware sets req.user
    const firstname = user?.firstname || "Unknown";
    const lastname = user?.lastname || "User";
    await createauditlog(
       `${firstname} ${lastname}`,
      "Update_User",
      "User",
      id,
      `User updated: ${[
        role_name && role_name,
        description && "description",
        typeof isActive === "boolean" && "isActive",
      ]
        .filter(Boolean)
        .join(", ")}`
    );
    res.status(200).json({ message: "roles updated successfully", updateData });
  } catch (e) {
    console.error("Error updating user:", e);
    res.status(500).json({ message: "roles did not update", e });
  }
};