import { db } from "./index";
import { users, worships } from "./schema";

async function seed() {
  console.log("Seeding database...");

  // Seed Users
  await db.insert(users).values([
    { name: "Ayah", role: "admin", targetPoints: 100 },
    { name: "Ibu", role: "admin", targetPoints: 100 },
    { name: "Kakak", role: "member", targetPoints: 80 },
    { name: "Adik", role: "member", targetPoints: 50 },
  ]);

  // Seed Worships
  await db.insert(worships).values([
    { name: "Shalat Subuh", type: "boolean", category: "wajib", points: 20, iconName: "Sunrise" },
    { name: "Shalat Dzuhur", type: "boolean", category: "wajib", points: 10, iconName: "Sun" },
    { name: "Shalat Ashar", type: "boolean", category: "wajib", points: 10, iconName: "Sunset" },
    { name: "Shalat Maghrib", type: "boolean", category: "wajib", points: 10, iconName: "Moon" },
    { name: "Shalat Isya", type: "boolean", category: "wajib", points: 10, iconName: "MoonStar" },
    { name: "Tilawah (Halaman)", type: "counter", category: "sunnah", points: 5, targetUnit: 1, iconName: "BookOpen" },
    { name: "Dzikir Pagi/Petang", type: "boolean", category: "sunnah", points: 15, iconName: "HeartHandshake" },
    { name: "Sedekah Subuh", type: "boolean", category: "sunnah", points: 15, iconName: "Coins" },
  ]);

  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seeding failed", err);
  process.exit(1);
});
