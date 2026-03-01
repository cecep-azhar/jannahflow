import { db } from "./src/db";
import { worships } from "./src/db/schema";
import { inArray } from "drizzle-orm";

async function run() {
    await db.delete(worships).where(inArray(worships.name, [
        "Tilawah", "Murojaah", "Ziyadah", "Setoran", "Tadabur"
    ]));
    console.log("Deleted old Quran mutabaahs");
}

run().catch(console.error);
