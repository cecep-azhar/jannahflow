import { db } from "@/db";
import { users } from "@/db/schema";

async function checkTurso() {
  try {
    console.log("Querying users...");
    const allUsers = await db.select().from(users);
    console.log("Users found:", allUsers.length);
    console.log("First user:", allUsers[0]);
  } catch (error) {
    console.error("Error querying Turso:", error);
  }
}

checkTurso();
