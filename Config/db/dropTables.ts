import knex from "knex";
import config from "../knexfile.ts";

const db = knex(config.development);

async function dropAllTables() {
  try {
    // Disable foreign key checks
    await db.raw("SET FOREIGN_KEY_CHECKS = 0");

    // Get all tables
    const tables = await db.raw("SHOW TABLES");

    // Drop each table
    for (const table of tables[0]) {
      const tableName = Object.values(table)[0];
      await db.raw(`DROP TABLE IF EXISTS ${tableName}`);
    }

    // Re-enable foreign key checks
    await db.raw("SET FOREIGN_KEY_CHECKS = 1");

    console.log("All tables dropped successfully");
  } catch (error) {
    console.error("Error dropping tables:", error);
  } finally {
    await db.destroy();
  }
}

dropAllTables();
