import db from "../Config/db.ts";

export const logAction = (action: string, entity?: string) => {
  return async (
    req: { user: { id: any }; params: { id: any }; body: any },
    res: any,
    next: () => void
  ) => {
    console.log("🟡 Inside logAction middleware");
    try {
      await db("audit").insert({
        userId: req.user.id || null,
        action,
        entity,
        entityId: req.params.id || null,
        detail: { body: req.body },
      });
      console.log("✅ Audit log created successfully");
    } catch (e) {
      console.error("❌ Failed to log action:", e);
    }
    next();
  };
};