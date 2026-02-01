#!/usr/bin/env node

import sequelize from "../config/database.js";
import { defineAssociations } from "../config/init.js";
import loggerService from "../Utils/logger.js";

async function initDb() {
  try {
    loggerService.log("🔄 Starting database initialization...");

    // Test connection
    loggerService.log("Testing database connection...");
    await sequelize.authenticate();
    loggerService.log("✅ Database connection successful");

    // Define associations
    defineAssociations();

    // Sync models with database
    loggerService.log("Syncing models with database...");
    await sequelize.sync({ alter: false });
    loggerService.log("✅ Models synced");

    loggerService.log("\n✅ Database initialization complete!");
    loggerService.log("Run: npm run seed (to populate with sample data)");
    process.exit(0);
  } catch (error) {
    loggerService.error("Database initialization failed", error);
    console.error("\n❌ Error:", error.message);
    console.error("\nTroubleshooting:");
    console.error("1. Ensure PostgreSQL is running");
    console.error(
      "2. Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in config.env",
    );
    console.error("3. Create database manually:");
    console.error("   - Linux/Mac: createdb -U postgres ecommerce_db");
    console.error("   - Windows: Create via pgAdmin or psql");
    process.exit(1);
  }
}

initDb();
