import { db } from "./src/db";
import { users, worships } from "./src/db/schema";

async function check() {
  const allUsers = await db.select().from(users);
  const allWorships = await db.select().from(worships);

  console.log("Users:", allUsers.length);
  console.log("Worships:", allWorships.length);
}

check();
