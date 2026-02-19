import { db } from "@/db";
import { worships } from "@/db/schema";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function seed() {
  const existingWorships = await db.select().from(worships);
  
  if (existingWorships.length === 0) {
      console.log("Seeding worships...");
      await db.insert(worships).values([
          { name: "Sholat Subuh", type: "boolean", category: "wajib", points: 20, iconName: "Sunrise" },
          { name: "Sholat Dzuhur", type: "boolean", category: "wajib", points: 20, iconName: "Sun" },
          { name: "Sholat Ashar", type: "boolean", category: "wajib", points: 20, iconName: "CloudSun" },
          { name: "Sholat Maghrib", type: "boolean", category: "wajib", points: 20, iconName: "Sunset" },
          { name: "Sholat Isya", type: "boolean", category: "wajib", points: 20, iconName: "Moon" },
          { name: "Tilawah Quran", type: "boolean", category: "sunnah", points: 10, iconName: "BookOpen" },
          { name: "Dzikir Pagi/Petang", type: "boolean", category: "sunnah", points: 10, iconName: "HeartHandshake" },
      ]);
      console.log("Seeding complete!");
  } else {
      console.log("Worships already exist. Skipping.");
  }
}

seed();
