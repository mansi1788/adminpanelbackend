import type { Request, Response } from "express";
import db from "../Config/db.ts";

export const createlog = async (req: Request, res: Response) => {
  try {
    const { action, entity, entityId, userId, detail } = req.body;
    const createdAt = new Date();
    const audit = await db("audit").insert({
      userId,
      detail,
      action,
      entity,
      entityId,
      createdAt,
    });
    res.status(200).json({ message: "log created successfully", audit });
  } catch (e) {
    res.status(500).json({ message: "Error in creating log", e });
  }
};

export const getlog = async (req: Request, res: Response) => {
  try {
    const { userId, action, detail, sortBy, sortOrder } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Base query
    const query = db("audit").select("userId", "action", "detail", "createdAt");

    // Filters
    query.modify((qb) => {
      if (userId) qb.where("userId", "like", `%${userId}%`);
      if (action) qb.where("action", "like", `%${action}%`);
      if (detail) qb.where("detail", "like", `%${detail}%`);
    });

    // Count query
    const countQuery = db("audit").clone();
    countQuery.modify((qb) => {
      if (userId) qb.where("userId", "like", `%${userId}%`);
      if (action) qb.where("action", "like", `%${action}%`);
      if (detail) qb.where("detail", "like", `%${detail}%`);
    });
    const totalResult = await countQuery.count("id as count");
    const total = Number(totalResult[0].count);

    // Sorting
    const orderColumn = sortBy ? String(sortBy) : "createdAt";
    const orderDirection = sortOrder === "asc" ? "asc" : "desc";

    // Fetch paginated data
    const logs = await query
      .limit(limit)
      .offset(offset)
      .orderBy(orderColumn, orderDirection);
    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    return res.status(200).json({
      message: "Successfully fetched audit logs",
      logs,
      total,
      page,
      limit,
      totalPages,
      nextPage,
      prevPage,
    });
  } catch (e) {
    console.error("Error fetching audit logs:", e);
    return res.status(500).json({
      message: "Error fetching audit logs",
      error: e instanceof Error ? e.message : e,
    });
  }
};
