import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool } = pg;
import * as schema from "./schema.ts";

declare global {
  var _postgresPool: pg.Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (connectionString) {
      global._postgresPool = new Pool({
        connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl:
          connectionString.includes("sslmode=require") || process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : undefined,
      });
    } else {
      let host = process.env.SQL_HOST || process.env.PGHOST || "localhost";
      // If host contains the socket file name .s.PGSQL.5432, strip it to directory only
      if (host.includes("/.s.PGSQL.")) {
        host = host.substring(0, host.indexOf("/.s.PGSQL."));
      }

      global._postgresPool = new Pool({
        host,
        port: process.env.SQL_PORT
          ? parseInt(process.env.SQL_PORT, 10)
          : process.env.PGPORT
          ? parseInt(process.env.PGPORT, 10)
          : 5432,
        user: process.env.SQL_USER || process.env.PGUSER || "ai_studio_app_user",
        password: process.env.SQL_PASSWORD || process.env.PGPASSWORD,
        database: process.env.SQL_DB_NAME || process.env.PGDATABASE || "cloud_sql_development_database",
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
    }

    global._postgresPool.on("error", (err: Error) => {
      console.error("Unexpected error on idle SQL pool client:", err.message);
    });
  }
  return global._postgresPool;
};

export const pool = createPool();

export const db = drizzle(pool, { schema });

export async function testDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
      return { connected: true };
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Database connection check failed:", err.message);
    return { connected: false, error: err.message };
  }
}
