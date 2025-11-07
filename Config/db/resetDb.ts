import knex from "knex";

const db = knex({
  client: "mysql2",
  connection: {
    host: "localhost",
    user: "root",
    password: "mansi.1788",
  },
});

async function resetDatabase() {
  try {
    console.log("Dropping database if exists...");
    await db.raw("DROP DATABASE IF EXISTS crud");
    console.log("Creating database...");
    await db.raw("CREATE DATABASE crud");
    console.log("Database reset successful!");
  } catch (error) {
    console.error("Error resetting database:", error);
  } finally {
    await db.destroy();
  }
}

resetDatabase();
