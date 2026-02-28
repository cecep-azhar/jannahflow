"use server";

import { db } from "@/db";
import { mutabaahLogs } from "@/db/schema";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

async function verifyUser(userId: number) {
  const cookieStore = await cookies();
  const currentUserIdStr = cookieStore.get("mutabaah-user-id")?.value;
  if (!currentUserIdStr || parseInt(currentUserIdStr) !== userId) {
    throw new Error("Unauthorized");
  }
}

export async function updateQuranLog(userId: number, worshipId: number, date: string, value: number) {
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
      .set({ value })
      .where(eq(mutabaahLogs.id, existingLog.id));
  } else {
    await db.insert(mutabaahLogs).values({
      userId,
      worshipId,
      date,
      value,
    });
  }

  revalidatePath("/quran");
  revalidatePath("/dashboard");
}
