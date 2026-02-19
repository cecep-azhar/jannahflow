import { db } from "./index";
import { users, worships, mutabaahLogs } from "./schema";

async function seed() {
  console.log("Cleaning up old data...");
  // Delete all data
  await db.delete(mutabaahLogs);
  await db.delete(users);
  await db.delete(worships);

  console.log("Seeding Family...");
  const familyMembers = [
    { name: "Abi Cecep", role: "parent", pin: "123456", avatarUrl: "user-check" },
    { name: "Umi Rini", role: "parent", pin: "123456", avatarUrl: "heart" },
    { name: "Kakak Fatih", role: "child", avatarUrl: "star" },
    { name: "Kakak Harun", role: "child", avatarUrl: "smile" },
    { name: "Kakak Ibrahim", role: "child", avatarUrl: "sun" },
    { name: "Teteh Khadijah", role: "child", avatarUrl: "moon" },
  ];

  for (const member of familyMembers) {
      await db.insert(users).values(member as any);
  }

  console.log("Seeding Worships...");
  const worshipList = [
    { name: "Sahur", points: 5, category: "sunnah", type: "boolean" },
    { name: "Puasa", points: 20, category: "wajib", type: "boolean" },
    { name: "Dzikir Pagi", points: 5, category: "sunnah", type: "boolean" },
    { name: "Sedekah", points: 5, category: "sunnah", type: "boolean" },
    { name: "Tilawah 1 Juz", points: 15, category: "sunnah", type: "boolean" },
    { name: "Subuh Berjamaah Di Masjid", points: 10, category: "wajib", type: "boolean" },
    { name: "Duha", points: 5, category: "sunnah", type: "boolean" },
    { name: "Dzuhur Berjamaah Di Masjid", points: 10, category: "wajib", type: "boolean" },
    { name: "Ashar Berjamaah Di Masjid", points: 10, category: "wajib", type: "boolean" },
    { name: "Murajaah", points: 5, category: "sunnah", type: "boolean" },
    { name: "Magrib Berjamaah Di Masjid", points: 10, category: "wajib", type: "boolean" },
    { name: "Isya Berjamaah Di Masjid", points: 10, category: "wajib", type: "boolean" },
    { name: "Tarawih", points: 10, category: "sunnah", type: "boolean" },
    { name: "Tulis Agenda Besok", points: 2, category: "sunnah", type: "boolean" },
    { name: "Belajar & Membaca Buku", points: 10, category: "sunnah", type: "boolean" },
    { name: "Istigfar 100x", points: 5, category: "sunnah", type: "boolean" },
    { name: "Bantu Orang Tua Banyak", points: 20, category: "sunnah", type: "boolean" },
    { name: "Bantu Orang Tua Sedang", points: 10, category: "sunnah", type: "boolean" },
    { name: "Bantu Orang Tua Sedikit", points: 5, category: "sunnah", type: "boolean" },
  ];

  await db.insert(worships).values(worshipList as any);

  console.log("Seeding V2 Complete!");
}

seed().catch((err) => {
  console.error("Seeding failed", err);
  process.exit(1);
});
