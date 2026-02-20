"use server";

import { db } from "@/db";
import { journals, users } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import { cookies } from "next/headers";

export async function createJournalEntry(content: string, mood?: string, mediaUrls?: string) {
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get("mutabaah-user-id")?.value;

    if (!userIdStr) {
        return { error: "Unauthenticated" };
    }

    try {
        await db.insert(journals).values({
            id: crypto.randomUUID(),
            userId: parseInt(userIdStr),
            content,
            mood: mood || null,
            mediaUrls: mediaUrls || null,
        });

        revalidatePath("/dashboard");
        revalidatePath("/journal");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to create journal entry" };
    }
}

export async function deleteJournalEntry(id: string) {
     try {
        await db.delete(journals).where(eq(journals.id, id));
        revalidatePath("/dashboard");
        revalidatePath("/journal");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to delete journal entry" };
    }
}

export async function getJournals() {
    try {
        const rows = await db
            .select({
                id: journals.id,
                userId: journals.userId,
                content: journals.content,
                mediaUrls: journals.mediaUrls,
                mood: journals.mood,
                createdAt: journals.createdAt,
                userName: users.name,
                userRole: users.role,
                userAvatarUrl: users.avatarUrl,
            })
            .from(journals)
            .leftJoin(users, eq(journals.userId, users.id))
            .orderBy(desc(journals.createdAt));

        return rows.map((row) => ({
            id: row.id,
            userId: row.userId,
            content: row.content,
            mediaUrls: row.mediaUrls,
            mood: row.mood,
            createdAt: row.createdAt,
            user: {
                name: row.userName ?? "Unknown",
                role: row.userRole ?? "child",
                avatarUrl: row.userAvatarUrl ?? null,
            },
        }));
    } catch (e) {
        console.error("Error fetching journals:", e);
        return [];
    }
}
