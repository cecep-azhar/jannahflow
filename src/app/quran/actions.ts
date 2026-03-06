"use server";

import { db } from "@/db";
import { quranLogs, ziyadahProgress } from "@/db/schema";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and, desc, lt } from "drizzle-orm";
import { calculateTilawahProgress, getSurahName } from "@/lib/quran-data";
import { getLocalTodayStr } from "@/lib/date-utils";

// ─────────────────────────────────────────────
// Auth helper
// ─────────────────────────────────────────────
async function getVerifiedUserId(userId: number) {
  const cookieStore = await cookies();
  const currentUserIdStr = cookieStore.get("mutabaah-user-id")?.value;
  if (!currentUserIdStr || parseInt(currentUserIdStr) !== userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

// ─────────────────────────────────────────────
// TILAWAH
// ─────────────────────────────────────────────

export async function addTilawahSession(
  userId: number,
  data: {
    date: string;
    sessionTime?: string;
    startSurah: number;
    startAyat: number;
    endSurah: number;
    endAyat: number;
    notes?: string;
  }
) {
  await getVerifiedUserId(userId);
  const { totalAyat } = calculateTilawahProgress(
    data.startSurah,
    data.startAyat,
    data.endSurah,
    data.endAyat,
  );

  await db.insert(quranLogs).values({
    userId,
    type: "tilawah",
    date: data.date,
    sessionTime: data.sessionTime,
    startSurah: data.startSurah,
    startAyat: data.startAyat,
    endSurah: data.endSurah,
    endAyat: data.endAyat,
    totalAyat,
    notes: data.notes,
  });

  revalidatePath("/quran");
  revalidatePath("/quran/tilawah");
  revalidatePath("/dashboard");
}

export async function getTilawahSessions(userId: number, date: string) {
  return db.query.quranLogs.findMany({
    where: and(
      eq(quranLogs.userId, userId),
      eq(quranLogs.type, "tilawah"),
      eq(quranLogs.date, date),
    ),
    orderBy: [desc(quranLogs.createdAt)],
  });
}

export async function deleteTilawahSession(sessionId: number, userId: number) {
  await getVerifiedUserId(userId);
  await db
    .delete(quranLogs)
    .where(and(eq(quranLogs.id, sessionId), eq(quranLogs.userId, userId)));
  revalidatePath("/quran");
  revalidatePath("/quran/tilawah");
  revalidatePath("/dashboard");
}

export async function getDailyTilawahSummary(userId: number, date: string) {
  const sessions = await getTilawahSessions(userId, date);
  const total = sessions.reduce((acc, s) => acc + (s.totalAyat ?? 0), 0);
  return { totalAyat: total, sessionCount: sessions.length };
}

/** Sesi terakhir untuk menyarankan titik mulai sesi berikutnya */
export async function getLastTilawahPosition(userId: number) {
  return db.query.quranLogs.findFirst({
    where: and(eq(quranLogs.userId, userId), eq(quranLogs.type, "tilawah")),
    orderBy: [desc(quranLogs.createdAt)],
  });
}

// ─────────────────────────────────────────────
// ZIYADAH
// ─────────────────────────────────────────────

export async function saveZiyadah(
  userId: number,
  data: {
    surahNumber: number;
    memorizedAyat: number;
    totalAyat: number;
    status: "hafalan" | "mutqin";
  }
) {
  await getVerifiedUserId(userId);
  const percent = Math.round((data.memorizedAyat / data.totalAyat) * 100);

  const existing = await db.query.ziyadahProgress.findFirst({
    where: and(
      eq(ziyadahProgress.userId, userId),
      eq(ziyadahProgress.surahNumber, data.surahNumber),
    ),
  });

  if (existing) {
    await db
      .update(ziyadahProgress)
      .set({
        memorizedAyat: data.memorizedAyat,
        totalAyat: data.totalAyat,
        percentComplete: percent,
        status: data.status,
      })
      .where(eq(ziyadahProgress.id, existing.id));
  } else {
    await db.insert(ziyadahProgress).values({
      userId,
      surahNumber: data.surahNumber,
      memorizedAyat: data.memorizedAyat,
      totalAyat: data.totalAyat,
      percentComplete: percent,
      status: data.status,
    });
  }

  revalidatePath("/quran");
  revalidatePath("/quran/ziyadah");
}

export async function getZiyadahList(userId: number) {
  return db.query.ziyadahProgress.findMany({
    where: eq(ziyadahProgress.userId, userId),
    orderBy: [desc(ziyadahProgress.createdAt)],
  });
}

export async function deleteZiyadah(id: number, userId: number) {
  await getVerifiedUserId(userId);
  await db
    .delete(ziyadahProgress)
    .where(and(eq(ziyadahProgress.id, id), eq(ziyadahProgress.userId, userId)));
  revalidatePath("/quran/ziyadah");
}

// ─────────────────────────────────────────────
// MUROJAAH
// ─────────────────────────────────────────────

export async function addMurojaahLog(
  userId: number,
  data: {
    surahNumber: number;
    quality: "lancar" | "cukup" | "perlu_diulang";
    notes?: string;
  }
) {
  await getVerifiedUserId(userId);
  const today = await getLocalTodayStr();

  await db.insert(quranLogs).values({
    userId,
    type: "murojaah",
    date: today,
    surahNumber: data.surahNumber,
    quality: data.quality,
    notes: data.notes,
  });

  // Update lastMurojaahAt on ziyadah record if exists
  const ziyadah = await db.query.ziyadahProgress.findFirst({
    where: and(
      eq(ziyadahProgress.userId, userId),
      eq(ziyadahProgress.surahNumber, data.surahNumber),
    ),
  });
  if (ziyadah) {
    await db
      .update(ziyadahProgress)
      .set({ lastMurojaahAt: today })
      .where(eq(ziyadahProgress.id, ziyadah.id));
  }

  revalidatePath("/quran");
  revalidatePath("/quran/murojaah");
}

export async function getMurojaahLogs(userId: number, limit = 20) {
  return db.query.quranLogs.findMany({
    where: and(eq(quranLogs.userId, userId), eq(quranLogs.type, "murojaah")),
    orderBy: [desc(quranLogs.createdAt)],
    limit,
  });
}

/** Surah hafalan yang lebih dari 7 hari tidak di-murojaah */
export async function getMurojaahReminders(userId: number) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoff = sevenDaysAgo.toISOString().slice(0, 10);

  return db.query.ziyadahProgress.findMany({
    where: and(
      eq(ziyadahProgress.userId, userId),
      lt(ziyadahProgress.lastMurojaahAt, cutoff),
    ),
    orderBy: [desc(ziyadahProgress.lastMurojaahAt)],
  });
}

// ─────────────────────────────────────────────
// TADABUR
// ─────────────────────────────────────────────

export async function saveTadabur(
  userId: number,
  data: {
    surahNumber: number;
    ayatRef: string;
    notes: string;
  }
) {
  await getVerifiedUserId(userId);
  const today = await getLocalTodayStr();

  await db.insert(quranLogs).values({
    userId,
    type: "tadabur",
    date: today,
    surahNumber: data.surahNumber,
    ayatRef: data.ayatRef,
    notes: data.notes,
  });

  revalidatePath("/quran/tadabur");
}

export async function getTadaburList(userId: number, limit = 20) {
  return db.query.quranLogs.findMany({
    where: and(eq(quranLogs.userId, userId), eq(quranLogs.type, "tadabur")),
    orderBy: [desc(quranLogs.createdAt)],
    limit,
  });
}

export async function deleteTadabur(id: number, userId: number) {
  await getVerifiedUserId(userId);
  await db
    .delete(quranLogs)
    .where(and(eq(quranLogs.id, id), eq(quranLogs.userId, userId)));
  revalidatePath("/quran/tadabur");
}

// ─────────────────────────────────────────────
// SETORAN
// ─────────────────────────────────────────────

export async function saveSetoran(
  userId: number,
  data: {
    teacherName: string;
    material: string;
    notes?: string;
  }
) {
  await getVerifiedUserId(userId);
  const today = await getLocalTodayStr();

  await db.insert(quranLogs).values({
    userId,
    type: "setoran",
    date: today,
    teacherName: data.teacherName,
    material: data.material,
    notes: data.notes,
  });

  revalidatePath("/quran/setoran");
}

export async function getSetoranList(userId: number, limit = 20) {
  return db.query.quranLogs.findMany({
    where: and(eq(quranLogs.userId, userId), eq(quranLogs.type, "setoran")),
    orderBy: [desc(quranLogs.createdAt)],
    limit,
  });
}

export async function deleteSetoran(id: number, userId: number) {
  await getVerifiedUserId(userId);
  await db
    .delete(quranLogs)
    .where(and(eq(quranLogs.id, id), eq(quranLogs.userId, userId)));
  revalidatePath("/quran/setoran");
}

// Utility re-export for client usage
export { getSurahName };
