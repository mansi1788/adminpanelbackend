import type { Request, Response } from "express";
import db from "../Config/db.ts";

export const createPermissionController = async (
  req: Request,
  res: Response
) => {
  try {
    const { name } = req.body;

    const permission = await db("permission").insert({
    
      name,
    });
    return res
      .status(200)
      .json({ message: "Permission created successfully", permission });
  } catch (e) {
    console.log("Error in creating permission", e);
    return res.status(500).json({ message: "Server error", e });
  }
};
