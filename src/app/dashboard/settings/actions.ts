"use server";

import { db } from "@/db";
import { users, worships, systemStats } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// --- Family Management ---


export async function addFamilyMember(formData: FormData) {
  const name = formData.get("name") as string;
  const role = formData.get("role") as "parent" | "child";
  const pin = formData.get("pin") as string;
  const avatarUrl = formData.get("avatarUrl") as string;

  await db.insert(users).values({
    name,
    role,
    pin: role === "parent" ? pin : undefined,
    avatarUrl,
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}

export async function deleteFamilyMember(id: number) {
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}

export async function updateFamilyMember(id: number, formData: FormData) {
    const name = formData.get("name") as string;
    const role = formData.get("role") as "parent" | "child";
    const pin = formData.get("pin") as string;
    const avatarUrl = formData.get("avatarUrl") as string;
    
    await db.update(users).set({ 
        name,
        role,
        pin: pin || undefined,
        avatarUrl
    }).where(eq(users.id, id));

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
}

// --- Worship Management ---

export async function addWorshipItem(formData: FormData) {
  const name = formData.get("name") as string;
  const points = parseInt(formData.get("points") as string);
  const category = formData.get("category") as "wajib" | "sunnah";
  
  await db.insert(worships).values({
    name,
    points,
    category,
    type: "boolean", 
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}

export async function deleteWorshipItem(id: number) {
  await db.delete(worships).where(eq(worships.id, id));
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}

export async function updateWorshipItem(id: number, formData: FormData) {
    const name = formData.get("name") as string;
    const points = parseInt(formData.get("points") as string);
    const category = formData.get("category") as "wajib" | "sunnah";
    
    await db.update(worships).set({
        name,
        points,
        category
    }).where(eq(worships.id, id));

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
}

// --- System Settings ---

export async function saveProToken(formData: FormData) {
  const token = formData.get("token") as string;
  
  // Insert or update
  await db.insert(systemStats)
    .values({ key: "pro_token", value: token })
    .onConflictDoUpdate({
      target: systemStats.key,
      set: { value: token, lastUpdated: new Date().toISOString() }
    });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}

export async function saveFamilyName(formData: FormData) {
  const name = formData.get("familyName") as string;
  
  if (name && name.trim().length > 0) {
      await db.insert(systemStats)
        .values({ key: "family_name", value: name.trim() })
        .onConflictDoUpdate({
          target: systemStats.key,
          set: { value: name.trim(), lastUpdated: new Date().toISOString() }
        });
  }

  revalidatePath("/");
  revalidatePath("/auth");
  revalidatePath("/dashboard/settings");
}
