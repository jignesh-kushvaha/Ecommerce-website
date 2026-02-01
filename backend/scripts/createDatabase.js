import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

async function createDatabase() {
  const client = new Client({
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: "postgres", // Connect to default postgres DB to create new one
  });

  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL server");

    // Create database
    try {
      await client.query(
        `CREATE DATABASE ${process.env.DB_NAME || "ecommerce_db"};`,
      );
      console.log(
        `✅ Database created: ${process.env.DB_NAME || "ecommerce_db"}`,
      );
    } catch (err) {
      if (err.message.includes("already exists")) {
        console.log(
          `⊘ Database already exists: ${process.env.DB_NAME || "ecommerce_db"}`,
        );
      } else {
        throw err;
      }
    }

    await client.end();
    console.log("✅ Database setup complete");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("\nMake sure:");
    console.error("1. PostgreSQL is running");
    console.error("2. DB_USER and DB_PASSWORD in config.env are correct");
    console.error("3. DB_HOST and DB_PORT are correct");
    process.exit(1);
  }
}

createDatabase();
