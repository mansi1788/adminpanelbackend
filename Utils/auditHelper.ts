// import { Audit } from "../Model/auditModel.ts";
import Knex from "knex"
import db from "../Config/db.ts";
import { object } from "yup";
export const createauditlog = async (
  userId: number | null,
  action: string,
  entity: string,
  entityId: number,
  detail?: string | object
) => {
  try {
    await db("audit").insert({
      userId,
      action,
      entity,
      entityId,
      detail: JSON.stringify(
        typeof detail === "string" ?{message:detail}:detail||{},
        
      ),
       createdAt: new Date(),
        updatedAt: new Date(),
    });
    console.log(
      "audit log created....................................................",
      action
    );
  } catch (e) {
    console.log("Audit log error", e);
  }
};
