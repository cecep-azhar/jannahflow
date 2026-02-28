"use server";

import { db } from "@/db";
import { journals, journalLikes, journalComments } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, desc, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getCurrentUser, canDeleteRecord } from "@/lib/auth-utils";

export async function addJournal(content: string, mood?: string, mediaUrls?: string) {
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
            createdAt: new Date().toISOString(),
        });

        revalidatePath("/dashboard");
        revalidatePath("/journal");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to fetch journal entries" };
    }
}

export async function toggleLike(journalId: string) {
    const user = await getCurrentUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const existingLike = await db.query.journalLikes.findFirst({
            where: and(eq(journalLikes.journalId, journalId), eq(journalLikes.userId, user.id))
        });

        if (existingLike) {
            await db.delete(journalLikes).where(eq(journalLikes.id, existingLike.id));
        } else {
            await db.insert(journalLikes).values({
                journalId,
                userId: user.id,
            });
        }
        revalidatePath("/journal");
        return { success: true };
    } catch (e) {
        console.error("Like error:", e);
        return { error: "Failed to toggle like" };
    }
}

export async function addComment(journalId: string, content: string) {
    const user = await getCurrentUser();
    if (!user) return { error: "Unauthorized" };

    try {
        await db.insert(journalComments).values({
            journalId,
            userId: user.id,
            content: content.trim(),
            createdAt: new Date().toISOString(),
        });
        revalidatePath("/journal");
        return { success: true };
    } catch (e) {
        console.error("Comment error:", e);
        return { error: "Failed to add comment" };
    }
}

export async function deleteJournal(id: string) {
    const user = await getCurrentUser();
    if (!canDeleteRecord(user)) throw new Error("Unauthorized to delete");

    await db.delete(journals).where(eq(journals.id, id));
    revalidatePath("/dashboard");
    revalidatePath("/journal");
    return { success: true };
}

export async function getJournals() {
    try {
        const rows = await db.query.journals.findMany({
            with: {
                user: true,
                likes: {
                    columns: {
                        id: true,
                        userId: true
                    }
                },
                comments: {
                    with: {
                        user: true
                    },
                    orderBy: [desc(journalComments.createdAt)]
                }
            },
            orderBy: [desc(journals.createdAt)]
        });

        return rows.map((row) => ({
            id: row.id,
            userId: row.userId,
            content: row.content,
            mediaUrls: row.mediaUrls,
            mood: row.mood,
            createdAt: row.createdAt,
            user: {
                name: row.user?.name ?? "Unknown",
                role: row.user?.role ?? "child",
                avatarUrl: row.user?.avatarUrl ?? null,
                avatarColor: row.user?.avatarColor ?? null,
            },
            likes: row.likes || [],
            comments: (row.comments || []).map(c => ({
                id: c.id,
                userId: c.userId,
                content: c.content,
                createdAt: c.createdAt,
                user: {
                    name: c.user?.name ?? "Unknown",
                    role: c.user?.role ?? "child",
                    avatarUrl: c.user?.avatarUrl ?? null,
                    avatarColor: c.user?.avatarColor ?? null,
                }
            }))
        }));
    } catch (e) {
        console.error("Error fetching journals:", e);
        return [];
    }
}
