// //import { Audit } from "../Model/auditModel.ts";

// export const createauditlog = async (
//   userId: number | null,
//   action: string,
//   entity: string,
//   entityId: number,
//   detail?: string
// ) => {
//   try {
//     await Audit.create({
//       userId,
//       action,
//       entity,
//       entityId,
//       detail,
//     });
//     console.log(
//       "audit log created....................................................",
//       action
//     );
//   } catch (e) {
//     console.log("Audit log error", e);
//   }
// };


// import { Audit } from "../Model/auditModel.ts";
import Knex from "knex"
import db from "../Config/db.ts";

export const createauditlog = async (
  userId: number | null,
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
      detail: JSON.stringify(detail||""), 
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
  }
};
