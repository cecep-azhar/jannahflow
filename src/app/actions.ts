"use server";

import { db } from "@/db";
import { users, worships } from "@/db/schema";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function login(userId: number, pin?: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return { error: "User not found" };
  }

  if (user.role === "parent") {
    if (!pin || pin !== user.pin) {
      return { error: "PIN salah" };
    }
  }

  const cookieStore = await cookies();
  cookieStore.set("mutabaah-user-id", userId.toString(), {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  
  cookieStore.set("mutabaah-user-role", user.role, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("mutabaah-user-id");
  cookieStore.delete("mutabaah-user-role");
  redirect("/auth");
}




export async function setupFamily(familyName: string, parentPin: string) {
  // Check if users exist
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    return { error: "Family already setup" };
  }

  // Create Ayah
  await db.insert(users).values({
    name: "Ayah",
    role: "parent",
    pin: parentPin,
    avatarUrl: "user-check",
  });

  // Create Ibu
  await db.insert(users).values({
    name: "Ibu",
    role: "parent",
    pin: parentPin,
    avatarUrl: "heart",
  });

  // Create Anak 1
  await db.insert(users).values({
    name: "Kakak",
    role: "child",
    avatarUrl: "star",
  });
  
  // Create Anak 2
   await db.insert(users).values({
    name: "Adik",
    role: "child",
    avatarUrl: "smile",
  });

  // Seed Worships if empty
  const existingWorships = await db.select().from(worships);
  if (existingWorships.length === 0) {
      await db.insert(worships).values([
          { name: "Sholat Subuh", type: "boolean", category: "wajib", points: 20, iconName: "Sunrise" },
          { name: "Sholat Dzuhur", type: "boolean", category: "wajib", points: 20, iconName: "Sun" },
          { name: "Sholat Ashar", type: "boolean", category: "wajib", points: 20, iconName: "CloudSun" },
          { name: "Sholat Maghrib", type: "boolean", category: "wajib", points: 20, iconName: "Sunset" },
          { name: "Sholat Isya", type: "boolean", category: "wajib", points: 20, iconName: "Moon" },
          { name: "Tilawah Quran", type: "boolean", category: "sunnah", points: 10, iconName: "BookOpen" },
          { name: "Dzikir Pagi/Petang", type: "boolean", category: "sunnah", points: 10, iconName: "HeartHandshake" },
      ]);
  }

  redirect("/auth");
}
