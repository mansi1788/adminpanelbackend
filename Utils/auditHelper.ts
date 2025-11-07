import Knex from "knex"
import db from "../Config/db.ts";

export const createauditlog = async (
  userId: string,
  action: string,
  entity: string,
  entityId: number,
  detail?: string | object,
) => {
  try {
    await db("audit").insert({
      userId,
      action,
      entity,
      entityId,
      detail: JSON.stringify(detail),
      // typeof detail === "object" ? JSON.stringify(detail):detail||"",
      createdAt: new Date(),
      updatedAt: new Date(),
      
    });
    console.log(
      "audit log created....................................................",
      action
    );
  } catch (e) {
    console.log("Audit log error", e);
     throw e;
  }
 
};
