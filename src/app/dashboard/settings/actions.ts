"use server";

import { db } from "@/db";
import { users, worships } from "@/db/schema";
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
    const pin = formData.get("pin") as string;
    
    // Only update allowed fields
    await db.update(users).set({ 
        name,
        pin: pin || undefined 
    }).where(eq(users.id, id));

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
}

// --- Worship Management ---

export async function addWorshipItem(formData: FormData) {
  const name = formData.get("name") as string;
  const points = parseInt(formData.get("points") as string);
  const category = formData.get("category") as "wajib" | "sunnah";
  
  // Auto-detect if it's a penalty based on negative points
  // But user might want to set category manually? 
  // For now let's stick to the form structure.

  await db.insert(worships).values({
    name,
    points,
    category,
    type: "boolean", // Default to boolean for simplicity for now
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
    
    await db.update(worships).set({
        name,
        points
    }).where(eq(worships.id, id));

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
}
