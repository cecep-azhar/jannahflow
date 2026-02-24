import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

// Priority: Turso online DB → local SQLite fallback
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

const url = tursoUrl || "file:database/jannahflow.db";
const authToken = tursoUrl ? tursoToken : undefined;

if (!url) {
  throw new Error("Database URL is not set");
}

export const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
