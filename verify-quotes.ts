import { db } from "./src/db/index";
import { quotes } from "./src/db/schema";
import { sql } from "drizzle-orm";
import { ensureDb } from "./src/lib/ensure-db";

async function verify() {
  console.log("Verifying database...");
  await ensureDb();
  
  const result = await db.run(sql`SELECT COUNT(*) as count FROM \`quotes\``) as any;
  const count = Array.isArray(result) 
    ? result[0].count 
    : (result.rows ? result.rows[0].count : result.count);
    
  console.log(`Total quotes in DB: ${count}`);
  
  if (count > 0) {
    const randomQuote = await db.select().from(quotes).orderBy(sql`RANDOM()`).limit(1);
    console.log("Random quote from DB:", randomQuote[0]);
  } else {
    console.log("No quotes found in DB.");
  }
}

verify().catch(console.error);
