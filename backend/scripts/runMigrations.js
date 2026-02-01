import sequelize from "../config/database.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    console.log("Starting migrations...");

    // Get all migration files
    const migrationsPath = path.join(__dirname, "../migrations");
    const migrationFiles = fs
      .readdirSync(migrationsPath)
      .filter((file) => file.endsWith(".js"))
      .sort();

    for (const file of migrationFiles) {
      try {
        const migrationModule = await import(`../migrations/${file}`);
        console.log(`Running migration: ${file}`);
        await migrationModule.up(
          sequelize.getQueryInterface(),
          sequelize.Sequelize,
        );
        console.log(`✓ Completed: ${file}`);
      } catch (error) {
        // Check if table already exists (skip if already created)
        if (error.message.includes("already exists")) {
          console.log(`⊘ Skipped (already exists): ${file}`);
        } else {
          console.error(`✗ Failed: ${file}`, error.message);
        }
      }
    }

    console.log("\n✅ All migrations completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
}

runMigrations();
