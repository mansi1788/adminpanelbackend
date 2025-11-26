import type { Request, Response } from "express";
import { createauditlog } from "../Utils/auditHelper.ts";
import db from "../Config/db.ts";

export const createfaqController = async (req: Request, res: Response) => {
  try {
    const { question, display_order, body, isActive } = req.body;

    if (!question || !display_order || !body || isActive === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await db("faq").where({ question }).first();
    if (existingUser)
      return res.status(400).json({ message: "Question already exists" });

    const exists = await db("faq")
  .where({ display_order })
  .first();

if (exists) {
  // shift down all >= display_order
  await db("faq")
    .where("display_order", ">=", display_order)
    .increment("display_order", 1);
}
    // Create user
    const [faq] = await db("faq").insert({
      question,
      display_order,
      body,
      isActive: Boolean(isActive),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Make sure user.id exists
    //const user_Id = Array.isArray(user) ? user[0] : user;
    if (!faq) return res.status(500).json({ message: "faq creation failed" });

    const user = (req as any).user; // Assuming middleware sets req.user
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

export const getAllfaq = async (req: Request, res: Response) => {
  console.log("Inside getAllfaq controller");

  try {
    const { question, display_order, body, isActive, sortBy, sortOrder } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const query = db("faq").select("*");

    // Filters
    query.modify((qb) => {
      if (question) qb.where("question", "like", `%${question}%`);
      if (display_order) qb.where("display_order", "like", `%${display_order}%`);
      if (body) qb.where("body", "like", `%${body}%`);
      if (isActive) {
        if (isActive === "Active") qb.where("isActive", true);
        else if (isActive === "Inactive") qb.where("isActive", false);
      }
    });

    // Count query for pagination
    const countQuery = db("faq")
      .clone()
      .modify((qb) => {
        if (question) qb.where("question", "like", `%${question}%`);
        if (display_order) qb.where("display_order", "like", `%${display_order}%`);
        if (body) qb.where("body", "like", `%${body}%`);
        if (isActive) {
          if (isActive === "Active") qb.where("isActive", true);
          else if (isActive === "Inactive") qb.where("isActive", false);
        }
      });

    const totalUsersResult = await countQuery.count("* as count");
    const totalUsers = totalUsersResult[0].count;

    // Dynamic sorting
    const orderColumn = sortBy ? String(sortBy) : "createdAt"; // default column
    const orderDirection = sortOrder === "asc" ? "asc" : "desc"; // default desc

    const users = await query
      .clone()
      .limit(limit)
      .offset(offset)
      .orderBy(orderColumn, orderDirection); // ✅ dynamic sorting

    const user = (req as any).user; // Assuming middleware sets req.user
    const firstname = user?.firstname || "Unknown";
    const lastname = user?.lastname || "User";

    await createauditlog(
      `${firstname} ${lastname}`,
      "GET_ALL_FAQ",
      "FAQ",
      0,
      "View FAQ list"
    );

    const totalPages = Math.ceil(totalUsers / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    console.log("FAQ fetched successfully: ", users.length);
    res.status(200).json({
      users,
      totalUsers,
      nextPage,
      prevPage,
      totalPages,
      currentPage: page,
    });
  } catch (e) {
    console.error("Error in getAllfaq:", e);
    res.status(500).json({ message: "Server error", e });
  }
};

export const updatefaq = async (req: Request, res: Response) => {
  try {
    const { question, display_order,body, isActive } = req.body;
    const id = Number(req.params.id);

    const updateData: any = { updatedAt: new Date() };

    if (question) updateData.question = question;
    if (display_order) updateData.display_order = display_order;
    if(body) updateData.body = body;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    await db("faq").where({ id }).update(updateData);
    // console.log("data",user);

    const user =( req as any).user; // Assuming middleware sets req.user
    const firstname = user?.firstname || "Unknown";
    const lastname = user?.lastname || "User";

    await createauditlog(
      `${firstname} ${lastname}`,
      "Update_User",
      "User",
      id,
      `User updated`
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

    const user =( req as any).user; // Assuming middleware sets req.user
    const firstname = user?.firstname || "Unknown";
    const lastname = user?.lastname || "User";

    await createauditlog(
      `${firstname} ${lastname}`,
      "Delete_User",
      "faq",
      id,
      `Deleted faq Template `
    );

    return res.status(200).json({ message: "FAQ deleted successsfully" });
  } catch (e) {
    console.error("Error deleting faq backend:", e);
    return res.status(500).json({
      message: "Error in deleting faq backend",
      error: e instanceof Error ? e.message : e,
    });
  }
};
