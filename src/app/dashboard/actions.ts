"use server";

import { db } from "@/db";
import { mutabaahLogs, users } from "@/db/schema";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

async function verifyUser(userId: number) {
  const cookieStore = await cookies();
  const currentUserIdStr = cookieStore.get("mutabaah-user-id")?.value;
  if (!currentUserIdStr) throw new Error("Unauthorized");
  
  const currentUserId = parseInt(currentUserIdStr);
  if (currentUserId === userId) return;

  // Let parents update children
  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, currentUserId)
  });

  if (currentUser?.role === "parent") return;

  throw new Error("Unauthorized");
}

export async function toggleLog(userId: number, worshipId: number, date: string, currentValue: number) {
  await verifyUser(userId);

  // Check if log exists
  const existingLog = await db.query.mutabaahLogs.findFirst({
    where: and(
      eq(mutabaahLogs.userId, userId),
      eq(mutabaahLogs.worshipId, worshipId),
      eq(mutabaahLogs.date, date)
    ),
  });

  if (existingLog) {
    // Update
    await db
      .update(mutabaahLogs)
      .set({ value: currentValue === 1 ? 0 : 1 })
      .where(eq(mutabaahLogs.id, existingLog.id));
  } else {
    // Insert
    await db.insert(mutabaahLogs).values({
      userId,
      worshipId,
      date,
      value: 1,
    });
  }

  revalidatePath("/dashboard");
}

export async function updateCounter(userId: number, worshipId: number, date: string, newValue: number) {
  await verifyUser(userId);
  
   const existingLog = await db.query.mutabaahLogs.findFirst({
    where: and(
      eq(mutabaahLogs.userId, userId),
      eq(mutabaahLogs.worshipId, worshipId),
      eq(mutabaahLogs.date, date)
    ),
  });

  if (existingLog) {
    await db
      .update(mutabaahLogs)
      .set({ value: newValue })
      .where(eq(mutabaahLogs.id, existingLog.id));
  } else {
    await db.insert(mutabaahLogs).values({
      userId,
      worshipId,
      date,
      value: newValue,
    });
  }

  revalidatePath("/dashboard");
}

