import { db } from "./index";
import { quotes } from "./schema";
import quotesData from "./quotes.json";

export function parseQuotes() {
    return quotesData;
}

export const seedQuotes = parseQuotes();

async function seed() {
  console.log("Seeding Database...");
  await db.delete(quotes);
  
  const data = parseQuotes();
  for (let i = 0; i < data.length; i += 50) {
      const chunk = data.slice(i, i + 50);
      await db.insert(quotes).values(chunk);
  }
}
