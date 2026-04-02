const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

const useSsl =
  process.env.NODE_ENV === "production" ||
  process.env.DATABASE_URL.includes("render.com") ||
  process.env.DATABASE_URL.includes("railway.app") ||
  process.env.DATABASE_URL.includes("neon.tech");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false
});

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err);
});

module.exports = pool;
