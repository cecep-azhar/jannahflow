"use server";

import { db } from "@/db";
import { journals } from "@/db/schema";
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
        const entries = await db.query.journals.findMany({
            with: {
                user: {
                    columns: {
                        name: true,
                        role: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: [desc(journals.createdAt)]
        });
        return entries;
    } catch (e) {
        console.error("Error fetching journals (did you run drizzle push?)", e);
        return [];
    }
}
