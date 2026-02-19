import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log("URL:", url);
console.log("Token Length:", authToken?.length);

const client = createClient({
  url: url!,
  authToken: authToken,
});

async function test() {
  try {
      await client.execute("SELECT 1");
      console.log("Connection successful!");
  } catch (e) {
      console.error("Connection failed:", e);
  }
}

test();
