"use server";

import { db } from "@/db";
import { users, worships, mutabaahLogs } from "@/db/schema";
import { redirect } from "next/navigation";
import { ensureDb } from "@/lib/ensure-db";

export async function checkDatabaseEmpty() {
  await ensureDb();
  const existingUsers = await db.select().from(users).limit(1);
  return existingUsers.length === 0;
}

export async function setupFamily(formData: FormData) {
  const fatherName = formData.get("fatherName") as string;
  const motherName = formData.get("motherName") as string;
  const pin = formData.get("pin") as string;
  const useTemplate = formData.get("useTemplate") === "on";
  
  // Extract children names (child-0, child-1, etc.)
  const childrenNames: string[] = [];
  let i = 0;
  while (formData.has(`child-${i}`)) {
    const name = formData.get(`child-${i}`) as string;
    if (name.trim()) childrenNames.push(name.trim());
    i++;
  }

  // Clear existing data (just to be safe, though normally this runs on empty DB)
  await db.delete(mutabaahLogs);
  await db.delete(users);
  await db.delete(worships);

  // Insert Parents
  await db.insert(users).values([
    { name: fatherName, role: "parent", pin, avatarUrl: "user-check" },
    { name: motherName, role: "parent", pin, avatarUrl: "heart" },
  ]);

  // Insert Children
  const avatars = ["star", "smile", "sun", "moon", "cloud", "zap"];
  for (let j = 0; j < childrenNames.length; j++) {
    await db.insert(users).values({
      name: childrenNames[j],
      role: "child",
      avatarUrl: avatars[j % avatars.length],
    });
  }

  // Insert Default Worships & Penalties if requested
  if (useTemplate) {
    const defaultWorships = [
      // Wajib & Sunnah
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

      // Penalties
      { name: "Kesalahan Ringan", points: -5, category: "wajib", type: "boolean", iconName: "AlertCircle" },
      { name: "Kesalahan Sedang", points: -10, category: "wajib", type: "boolean", iconName: "AlertTriangle" },
      { name: "Kesalahan Tinggi", points: -20, category: "wajib", type: "boolean", iconName: "XCircle" },
    ];
    
    await db.insert(worships).values(defaultWorships as any);
  }

  redirect("/auth");
}
