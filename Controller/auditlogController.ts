import type { Request, Response } from "express";
import db from "../Config/db.ts";

export const createlog = async (req: Request, res: Response) => {
  try {
    const { action, entity, entityId, userId, detail} = req.body;
const createdAt=new Date();
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
    // Get page and limit from query params
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Total records count
    const [{ count }] = await db("audit").count("id as count");

    // Fetch only the required columns with pagination
    const logs = await db("audit")
      .select("userId", "action", "detail", "createdAt")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset);

    return res.status(200).json({
      message: "Successfully fetched audit logs",
      logs,
      total: Number(count),
      page,
      limit,
      data: logs,
    });
  } catch (e) {
    console.error("Error fetching audit logs:", e);
    return res.status(500).json({
      message: "Error fetching audit logs",
      error: e instanceof Error ? e.message : e,
    });
  }
};