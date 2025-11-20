// seeds/permissions_seed.ts
import type{ Knex } from "knex";

const PERMISSION_MODULES = [
  "user",
  "role",
  "emailTemplate",
  "cms",
  "faq",
  "auditLog",
  "applicationConfig",
] as const;

const PERMISSION_ACTIONS = ["view", "add", "edit", "delete"] as const;

export async function seed(knex: Knex): Promise<void> {
  await knex("permission").del();

  const records = PERMISSION_MODULES.flatMap((module) =>
    PERMISSION_ACTIONS.map((action) => ({
      module,
      action,
      name:`${module}.${action}`,
      created_at: new Date(),
      updated_at: new Date(),
    }))
  );

  await knex("permission").insert(records);
}
