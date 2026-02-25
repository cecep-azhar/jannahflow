import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("mutabaah-user-id")?.value;
  
  if (!userIdStr) return null;
  
  const userId = parseInt(userIdStr, 10);
  if (isNaN(userId)) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return user || null;
}

export type AuthUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export function isAyah(user: AuthUser | null) {
  return user?.role === "parent" && user?.gender === "M";
}

export function isIbu(user: AuthUser | null) {
  return user?.role === "parent" && user?.gender === "F";
}

export function isAnak(user: AuthUser | null) {
  return user?.role === "child";
}

export function canAccessSettings(user: AuthUser | null) {
  return user?.role === "parent";
}

export function canEditRecord(user: AuthUser | null) {
  return user?.role === "parent";
}

export function canDeleteRecord(user: AuthUser | null) {
  return user?.role === "parent";
}

export function canViewBounding(user: AuthUser | null) {
  return user?.role === "parent";
}
