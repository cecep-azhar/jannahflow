"use server";

import { db } from "@/db";
import { quotes } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function getRandomQuote() {
  try {
    // SQLite doesn't have an efficient built-in RANDOM() that scales well, 
    // but for our size (360 rows) ORDER BY RANDOM() LIMIT 1 is perfectly fine.
    const randomRows = await db.select().from(quotes).orderBy(sql`RANDOM()`).limit(1);
    
    if (randomRows.length > 0) {
      return randomRows[0];
    }
  } catch (error) {
    console.error("Error fetching random quote:", error);
  }
  
  // Fallback if DB query fails or table is empty
  return {
    text: "Keluarga adalah anugerah terindah. Jaga dan rawatlah dengan iman.",
    source: "Founder JannahFlow",
    category: "Pondasi Keluarga"
  };
}
